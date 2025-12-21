# backend/orders.py

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm.exc import StaleDataError
from sqlmodel import select

# Internal imports
from db import get_session
from models import Product, SaleOrder, SaleOrderLine, Invoice, InvoiceLine, User, PaymentTerm
from auth import get_current_user
from websocket_manager import manager

# --- Pydantic Schemas (Data Validation) ---
class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int

class ShippingAddressSchema(BaseModel):
    name: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    phone: str = ""

class OrderCreateSchema(BaseModel):
    items: List[OrderItemSchema]
    auto_invoice: bool = True
    shipping_address: Optional[ShippingAddressSchema] = None

# --- Router Setup ---
router = APIRouter(prefix="/orders", tags=["orders"])

# --- The Place Order Endpoint ---
@router.post("/", status_code=201)
async def place_order(
    order_data: OrderCreateSchema,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    ATOMIC TRANSACTION:
    1. Validate Stock
    2. Deduct Stock (with optimistic locking)
    3. Create Order & Lines
    4. Create Invoice (optional)
    5. Broadcast WebSocket update
    """
    total_amount = 0.0
    affected_products = [] 

    try:
        # --- 1. Create Order Header ---
        order_num = f"SO-{int(datetime.utcnow().timestamp())}"
        
        if not current_user.contact_id:
             raise HTTPException(status_code=400, detail="User has no linked Contact profile")

        # Extract shipping address if provided
        shipping = order_data.shipping_address
        new_order = SaleOrder(
            order_number=order_num,
            customer_id=current_user.contact_id,
            total_amount=0,
            tax_amount=0,
            discount_amount=0,
            status="confirmed",
            shipping_name=shipping.name if shipping else None,
            shipping_address=shipping.address if shipping else None,
            shipping_city=shipping.city if shipping else None,
            shipping_state=shipping.state if shipping else None,
            shipping_pincode=shipping.pincode if shipping else None,
            shipping_phone=shipping.phone if shipping else None,
        )
        session.add(new_order)
        await session.flush()

        # --- 2. Process Items & Deduct Stock ---
        for item in order_data.items:
            product = await session.get(Product, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
            
            if product.current_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'. Available: {product.current_stock}")

            product.current_stock -= item.quantity
            session.add(product) 
            
            line = SaleOrderLine(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price
            )
            session.add(line)
            
            total_amount += (product.price * item.quantity)
            
            affected_products.append({
                "id": product.id, 
                "new_stock": product.current_stock
            })

        new_order.total_amount = total_amount
        session.add(new_order)

        # --- 3. Auto Invoice Logic ---
        invoice = None
        if order_data.auto_invoice:
            from datetime import date
            invoice = Invoice(
                invoice_number=f"INV-{order_num}",
                sale_order_id=new_order.id,
                customer_id=new_order.customer_id,
                invoice_date=date.today(),
                total_amount=total_amount,
                tax_amount=0,
                amount_paid=total_amount,  # Mark as paid since user already paid during checkout
                status="paid",  # Set status to paid
                shipping_name=shipping.name if shipping else None,
                shipping_address=shipping.address if shipping else None,
                shipping_city=shipping.city if shipping else None,
                shipping_state=shipping.state if shipping else None,
                shipping_pincode=shipping.pincode if shipping else None,
                shipping_phone=shipping.phone if shipping else None,
            )
            session.add(invoice)
            await session.flush()  # Flush to get invoice.id
            
            # Create invoice lines from order items
            for item in order_data.items:
                product = await session.get(Product, item.product_id)
                if product:
                    invoice_line = InvoiceLine(
                        invoice_id=invoice.id,
                        product_id=product.id,
                        description=product.name,
                        quantity=item.quantity,
                        unit_price=product.price,
                        tax_rate=0.0
                    )
                    session.add(invoice_line)

        await session.commit() 
        await session.refresh(new_order)

    except StaleDataError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Stock changed while processing. Please retry.")
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    for prod in affected_products:
        await manager.broadcast_stock_update(prod["id"], prod["new_stock"])

    return {
        "status": "success", 
        "order_id": new_order.id, 
        "order_number": new_order.order_number,
        "total": total_amount
    }

@router.get("/products")
async def get_products(session: AsyncSession = Depends(get_session)):
    # --- FIX: Use session.execute and scalars().all() ---
    result = await session.execute(select(Product))
    return result.scalars().all()


# --- User Orders & Invoices ---
@router.get("/my-orders")
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get all orders for the current logged-in user."""
    if not current_user.contact_id:
        return []
    
    result = await session.execute(
        select(SaleOrder).where(SaleOrder.customer_id == current_user.contact_id).order_by(SaleOrder.id.desc())
    )
    orders = result.scalars().all()
    
    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "total_amount": order.total_amount,
            "status": order.status,
            "order_date": order.order_date.isoformat() if order.order_date else None,
        }
        for order in orders
    ]


@router.get("/my-invoices")
async def get_my_invoices(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get all invoices for the current logged-in user."""
    if not current_user.contact_id:
        return []
    
    result = await session.execute(
        select(Invoice).where(Invoice.customer_id == current_user.contact_id).order_by(Invoice.id.desc())
    )
    invoices = result.scalars().all()
    
    return [
        {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "total_amount": invoice.total_amount,
            "status": invoice.status,
            "invoice_date": invoice.invoice_date.isoformat() if invoice.invoice_date else None,
            "sale_order_id": invoice.sale_order_id,
        }
        for invoice in invoices
    ]


@router.get("/invoice/{invoice_id}")
async def get_invoice_detail(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get a specific invoice by ID."""
    from models import Contact, InvoiceLine
    
    invoice = await session.get(Invoice, invoice_id)
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Verify the invoice belongs to the current user
    if invoice.customer_id != current_user.contact_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get customer info
    customer = await session.get(Contact, invoice.customer_id)
    
    # Get invoice lines
    result = await session.execute(
        select(InvoiceLine).where(InvoiceLine.invoice_id == invoice_id)
    )
    lines = result.scalars().all()
    
    # Build items list with product details
    items = []
    for line in lines:
        product = await session.get(Product, line.product_id)
        items.append({
            "product_id": line.product_id,
            "product_name": product.name if product else line.description or "Product",
            "description": line.description or (product.name if product else "Product"),
            "quantity": line.quantity,
            "unit_price": line.unit_price,
            "tax_rate": line.tax_rate,
            "total": line.quantity * line.unit_price,
        })
    
    # Build shipping address from invoice if available, otherwise from customer
    shipping_address = ""
    shipping_name = ""
    shipping_phone = ""
    
    if invoice.shipping_address:
        # Use shipping address from invoice
        shipping_name = invoice.shipping_name or (customer.name if customer else "Customer")
        shipping_parts = [invoice.shipping_address]
        if invoice.shipping_city:
            shipping_parts.append(invoice.shipping_city)
        if invoice.shipping_state:
            shipping_parts.append(invoice.shipping_state)
        if invoice.shipping_pincode:
            shipping_parts.append(invoice.shipping_pincode)
        shipping_address = ", ".join(filter(None, shipping_parts))
        shipping_phone = invoice.shipping_phone or (customer.phone if customer else "")
    else:
        # Fallback to customer address
        shipping_name = customer.name if customer else "Customer"
        shipping_address = customer.address if customer else ""
        shipping_phone = customer.phone if customer else ""
    
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "sale_order_id": invoice.sale_order_id,
        "invoice_date": invoice.invoice_date.isoformat() if invoice.invoice_date else None,
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
        "total_amount": invoice.total_amount,
        "tax_amount": invoice.tax_amount,
        "amount_paid": invoice.amount_paid,
        "status": invoice.status,
        "customer_name": shipping_name,
        "customer_email": customer.email if customer else "",
        "customer_phone": shipping_phone,
        "customer_address": shipping_address,
        "items": items,
    }


@router.get("/order/{order_id}")
async def get_order_detail(
    order_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get a specific order by ID."""
    order = await session.get(SaleOrder, order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify the order belongs to the current user
    if order.customer_id != current_user.contact_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get order lines
    result = await session.execute(
        select(SaleOrderLine).where(SaleOrderLine.order_id == order_id)
    )
    lines = result.scalars().all()
    
    # Get customer info
    from models import Contact
    customer = await session.get(Contact, order.customer_id)
    
    # Get associated invoice
    invoice_result = await session.execute(
        select(Invoice).where(Invoice.sale_order_id == order_id)
    )
    invoice = invoice_result.scalars().first()
    
    items = []
    for line in lines:
        product = await session.get(Product, line.product_id)
        items.append({
            "product_id": line.product_id,
            "product_name": product.name if product else "Unknown Product",
            "quantity": line.quantity,
            "unit_price": line.unit_price,
            "total": line.quantity * line.unit_price,
        })
    
    # Build shipping address from order if available, otherwise from customer
    shipping_address = ""
    shipping_name = ""
    shipping_phone = ""
    
    if order.shipping_address:
        # Use shipping address from order
        shipping_name = order.shipping_name or (customer.name if customer else "Customer")
        shipping_parts = [order.shipping_address]
        if order.shipping_city:
            shipping_parts.append(order.shipping_city)
        if order.shipping_state:
            shipping_parts.append(order.shipping_state)
        if order.shipping_pincode:
            shipping_parts.append(order.shipping_pincode)
        shipping_address = ", ".join(filter(None, shipping_parts))
        shipping_phone = order.shipping_phone or (customer.phone if customer else "")
    else:
        # Fallback to customer address
        shipping_name = customer.name if customer else "Customer"
        shipping_address = customer.address if customer else ""
        shipping_phone = customer.phone if customer else ""
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "order_date": order.order_date.isoformat() if order.order_date else None,
        "total_amount": order.total_amount,
        "tax_amount": order.tax_amount,
        "discount_amount": order.discount_amount,
        "status": order.status,
        "customer_name": shipping_name,
        "customer_email": customer.email if customer else "",
        "customer_phone": shipping_phone,
        "customer_address": shipping_address,
        "invoice_id": invoice.id if invoice else None,
        "items": items,
    }


# --- PUBLIC: Get Current Offers/Promos ---
@router.get("/offers")
async def get_offers(session: AsyncSession = Depends(get_session)):
    """
    Get all active payment terms/offers that have discounts.
    This is a public endpoint for displaying promos on the homepage.
    """
    result = await session.execute(select(PaymentTerm))
    terms = result.scalars().all()
    
    offers = []
    for term in terms:
        # Include terms that have any discount
        if term.discount_percentage > 0 or term.early_payment_discount > 0:
            offers.append({
                "id": term.id,
                "name": term.name,
                "discount_percentage": term.discount_percentage,
                "early_payment_discount": term.early_payment_discount,
                "early_payment_days": term.early_payment_days,
                "days": term.days,
                "description": term.description,
            })
    
    # If no discount-based offers, return all payment terms as general info
    if not offers:
        for term in terms:
            offers.append({
                "id": term.id,
                "name": term.name,
                "discount_percentage": term.discount_percentage,
                "early_payment_discount": term.early_payment_discount,
                "early_payment_days": term.early_payment_days,
                "days": term.days,
                "description": term.description,
            })
    
    return offers