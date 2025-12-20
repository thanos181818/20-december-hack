"""
Admin API endpoints for billing and inventory management
"""
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from backend.db import get_session
from backend.models import (
    User, Contact, ContactType, Product, ProductType,
    SaleOrder, SaleOrderLine, OrderStatus,
    Invoice, InvoiceLine, InvoiceStatus,
    PurchaseOrder, PurchaseOrderLine,
    VendorBill, VendorBillLine,
    Payment, PaymentStatus, PaymentTerm
)
from backend.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

# ============= SCHEMAS =============

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    current_stock: int
    category: Optional[str] = None
    product_type: ProductType = ProductType.STORABLE
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    current_stock: Optional[int] = None
    category: Optional[str] = None
    product_type: Optional[ProductType] = None
    image_url: Optional[str] = None

# Contact Schemas
class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_type: ContactType

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_type: Optional[ContactType] = None

# Sales Order Schemas
class SaleOrderLineCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    tax_rate: float = 0.0
    discount: float = 0.0

class SaleOrderCreate(BaseModel):
    customer_id: int
    order_date: date
    delivery_date: Optional[date] = None
    lines: List[SaleOrderLineCreate]
    notes: Optional[str] = None

class SaleOrderUpdate(BaseModel):
    customer_id: Optional[int] = None
    order_date: Optional[date] = None
    delivery_date: Optional[date] = None
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None

# Invoice Schemas
class InvoiceLineCreate(BaseModel):
    product_id: int
    description: Optional[str] = None
    quantity: int
    unit_price: float
    tax_rate: float = 0.0

class InvoiceCreate(BaseModel):
    customer_id: int
    sale_order_id: Optional[int] = None
    invoice_date: date
    due_date: Optional[date] = None
    lines: List[InvoiceLineCreate]
    notes: Optional[str] = None

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    amount_paid: Optional[float] = None
    notes: Optional[str] = None

# Purchase Order Schemas
class PurchaseOrderLineCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    tax_rate: float = 0.0

class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    order_date: date
    expected_delivery: Optional[date] = None
    lines: List[PurchaseOrderLineCreate]
    notes: Optional[str] = None

class PurchaseOrderUpdate(BaseModel):
    vendor_id: Optional[int] = None
    order_date: Optional[date] = None
    expected_delivery: Optional[date] = None
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None

# Vendor Bill Schemas
class VendorBillLineCreate(BaseModel):
    product_id: int
    description: Optional[str] = None
    quantity: int
    unit_price: float
    tax_rate: float = 0.0

class VendorBillCreate(BaseModel):
    vendor_id: int
    purchase_order_id: Optional[int] = None
    bill_date: date
    due_date: Optional[date] = None
    lines: List[VendorBillLineCreate]
    notes: Optional[str] = None

class VendorBillUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    amount_paid: Optional[float] = None
    notes: Optional[str] = None

# Payment Schemas
class PaymentCreate(BaseModel):
    payment_date: date
    amount: float
    payment_method: str = "Bank Transfer"
    reference: Optional[str] = None
    invoice_id: Optional[int] = None
    vendor_bill_id: Optional[int] = None
    notes: Optional[str] = None

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    notes: Optional[str] = None

# Payment Term Schemas
class PaymentTermCreate(BaseModel):
    name: str
    days: int
    discount_percentage: float = 0.0
    early_payment_days: int = 0
    early_payment_discount: float = 0.0
    description: Optional[str] = None

class PaymentTermUpdate(BaseModel):
    name: Optional[str] = None
    days: Optional[int] = None
    discount_percentage: Optional[float] = None
    early_payment_days: Optional[int] = None
    early_payment_discount: Optional[float] = None
    description: Optional[str] = None

# ============= HELPER FUNCTIONS =============

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def calculate_order_totals(lines: List[SaleOrderLineCreate]) -> tuple:
    """Calculate total amount and tax for order lines"""
    subtotal = sum(line.unit_price * line.quantity - line.discount for line in lines)
    tax_amount = sum((line.unit_price * line.quantity - line.discount) * (line.tax_rate / 100) for line in lines)
    total = subtotal + tax_amount
    return total, tax_amount

def calculate_invoice_totals(lines: List[InvoiceLineCreate]) -> tuple:
    """Calculate total amount and tax for invoice lines"""
    subtotal = sum(line.unit_price * line.quantity for line in lines)
    tax_amount = sum((line.unit_price * line.quantity) * (line.tax_rate / 100) for line in lines)
    total = subtotal + tax_amount
    return total, tax_amount

# ============= PRODUCT ENDPOINTS =============

@router.get("/products")
async def get_products(
    session: AsyncSession = Depends(get_session)
):
    """Get all products"""
    result = await session.execute(select(Product).order_by(Product.id))
    products = result.scalars().all()
    return products

@router.get("/products/{product_id}")
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single product"""
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", status_code=201)
async def create_product(
    product_data: ProductCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new product"""
    product = Product(**product_data.model_dump())
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product

@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a product"""
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a product"""
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Prevent deleting products that are referenced by transactional data
    reference_checks = [
        ("sales orders", select(SaleOrderLine.id).where(SaleOrderLine.product_id == product_id).limit(1)),
        ("purchase orders", select(PurchaseOrderLine.id).where(PurchaseOrderLine.product_id == product_id).limit(1)),
        ("vendor bills", select(VendorBillLine.id).where(VendorBillLine.product_id == product_id).limit(1)),
        ("invoices", select(InvoiceLine.id).where(InvoiceLine.product_id == product_id).limit(1)),
    ]

    for label, query in reference_checks:
        result = await session.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=409,
                detail=f"Product cannot be deleted because it is used in existing {label}. Remove those references first.",
            )

    await session.delete(product)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=409,
            detail="Product cannot be deleted because it is referenced by other records. Remove dependent rows first.",
        )

    return {"message": "Product deleted successfully"}

# ============= CONTACT ENDPOINTS =============

@router.get("/contacts")
async def get_contacts(
    contact_type: Optional[ContactType] = None,
    session: AsyncSession = Depends(get_session),
):
    """Get all contacts, optionally filtered by type"""
    query = select(Contact)
    if contact_type:
        query = query.where(or_(Contact.contact_type == contact_type, Contact.contact_type == ContactType.BOTH))
    query = query.order_by(Contact.id)
    result = await session.execute(query)
    return result.scalars().all()

@router.get("/contacts/{contact_id}")
async def get_contact(
    contact_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single contact"""
    contact = await session.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.post("/contacts", status_code=201)
async def create_contact(
    contact_data: ContactCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new contact"""
    # Check if email already exists
    result = await session.execute(select(Contact).where(Contact.email == contact_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Contact with this email already exists")
    
    contact = Contact(**contact_data.model_dump())
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    return contact

@router.put("/contacts/{contact_id}")
async def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a contact"""
    contact = await session.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    for key, value in contact_data.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    return contact

@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a contact"""
    contact = await session.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    await session.delete(contact)
    await session.commit()
    return {"message": "Contact deleted successfully"}

# ============= SALES ORDER ENDPOINTS =============

@router.get("/sales-orders")
async def get_sales_orders(
    session: AsyncSession = Depends(get_session),
):
    """Get all sales orders with customer and lines"""
    result = await session.execute(
        select(SaleOrder)
        .options(selectinload(SaleOrder.customer), selectinload(SaleOrder.lines))
        .order_by(SaleOrder.id.desc())
    )
    return result.scalars().all()

@router.get("/sales-orders/{order_id}")
async def get_sales_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single sales order"""
    result = await session.execute(
        select(SaleOrder)
        .options(selectinload(SaleOrder.customer), selectinload(SaleOrder.lines))
        .where(SaleOrder.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Sales order not found")
    return order

@router.post("/sales-orders", status_code=201)
async def create_sales_order(
    order_data: SaleOrderCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new sales order"""
    # Generate order number
    order_number = f"SO-{int(datetime.utcnow().timestamp())}"
    
    # Calculate totals
    total_amount, tax_amount = calculate_order_totals(order_data.lines)
    discount_amount = sum(line.discount for line in order_data.lines)
    
    # Create order
    order = SaleOrder(
        order_number=order_number,
        customer_id=order_data.customer_id,
        order_date=order_data.order_date,
        delivery_date=order_data.delivery_date,
        total_amount=total_amount,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        notes=order_data.notes,
        status=OrderStatus.DRAFT
    )
    session.add(order)
    await session.flush()
    
    # Create order lines
    for line_data in order_data.lines:
        line = SaleOrderLine(
            order_id=order.id,
            **line_data.model_dump()
        )
        session.add(line)
    
    await session.commit()
    await session.refresh(order)
    return order

@router.put("/sales-orders/{order_id}")
async def update_sales_order(
    order_id: int,
    order_data: SaleOrderUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a sales order"""
    order = await session.get(SaleOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sales order not found")
    
    for key, value in order_data.model_dump(exclude_unset=True).items():
        setattr(order, key, value)
    
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order

@router.delete("/sales-orders/{order_id}")
async def delete_sales_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a sales order"""
    order = await session.get(SaleOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sales order not found")
    
    await session.delete(order)
    await session.commit()
    return {"message": "Sales order deleted successfully"}

# ============= INVOICE ENDPOINTS =============

@router.get("/invoices")
async def get_invoices(
    session: AsyncSession = Depends(get_session),
):
    """Get all invoices with customer and lines"""
    result = await session.execute(
        select(Invoice)
        .options(selectinload(Invoice.customer), selectinload(Invoice.lines))
        .order_by(Invoice.id.desc())
    )
    return result.scalars().all()

@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single invoice"""
    result = await session.execute(
        select(Invoice)
        .options(selectinload(Invoice.customer), selectinload(Invoice.lines))
        .where(Invoice.id == invoice_id)
    )
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("/invoices", status_code=201)
async def create_invoice(
    invoice_data: InvoiceCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new invoice"""
    # Generate invoice number
    invoice_number = f"INV-{int(datetime.utcnow().timestamp())}"
    
    # Calculate totals
    total_amount, tax_amount = calculate_invoice_totals(invoice_data.lines)
    
    # Create invoice
    invoice = Invoice(
        invoice_number=invoice_number,
        customer_id=invoice_data.customer_id,
        sale_order_id=invoice_data.sale_order_id,
        invoice_date=invoice_data.invoice_date,
        due_date=invoice_data.due_date,
        total_amount=total_amount,
        tax_amount=tax_amount,
        notes=invoice_data.notes,
        status=InvoiceStatus.DRAFT
    )
    session.add(invoice)
    await session.flush()
    
    # Create invoice lines
    for line_data in invoice_data.lines:
        line = InvoiceLine(
            invoice_id=invoice.id,
            **line_data.model_dump()
        )
        session.add(line)
    
    await session.commit()
    await session.refresh(invoice)
    return invoice

@router.put("/invoices/{invoice_id}")
async def update_invoice(
    invoice_id: int,
    invoice_data: InvoiceUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update an invoice"""
    invoice = await session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    for key, value in invoice_data.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    
    session.add(invoice)
    await session.commit()
    await session.refresh(invoice)
    return invoice

@router.delete("/invoices/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete an invoice"""
    invoice = await session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await session.delete(invoice)
    await session.commit()
    return {"message": "Invoice deleted successfully"}

# ============= PURCHASE ORDER ENDPOINTS =============

@router.get("/purchase-orders")
async def get_purchase_orders(
    session: AsyncSession = Depends(get_session),
):
    """Get all purchase orders"""
    result = await session.execute(
        select(PurchaseOrder)
        .options(selectinload(PurchaseOrder.vendor), selectinload(PurchaseOrder.lines))
        .order_by(PurchaseOrder.id.desc())
    )
    return result.scalars().all()

@router.get("/purchase-orders/{order_id}")
async def get_purchase_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single purchase order"""
    result = await session.execute(
        select(PurchaseOrder)
        .options(selectinload(PurchaseOrder.vendor), selectinload(PurchaseOrder.lines))
        .where(PurchaseOrder.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return order

@router.post("/purchase-orders", status_code=201)
async def create_purchase_order(
    order_data: PurchaseOrderCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new purchase order"""
    # Generate order number
    order_number = f"PO-{int(datetime.utcnow().timestamp())}"
    
    # Calculate totals
    subtotal = sum(line.unit_price * line.quantity for line in order_data.lines)
    tax_amount = sum((line.unit_price * line.quantity) * (line.tax_rate / 100) for line in order_data.lines)
    total_amount = subtotal + tax_amount
    
    # Create order
    order = PurchaseOrder(
        order_number=order_number,
        vendor_id=order_data.vendor_id,
        order_date=order_data.order_date,
        expected_delivery=order_data.expected_delivery,
        total_amount=total_amount,
        tax_amount=tax_amount,
        notes=order_data.notes,
        status=OrderStatus.DRAFT
    )
    session.add(order)
    await session.flush()
    
    # Create order lines
    for line_data in order_data.lines:
        line = PurchaseOrderLine(
            purchase_order_id=order.id,
            **line_data.model_dump()
        )
        session.add(line)
    
    await session.commit()
    await session.refresh(order)
    return order

@router.put("/purchase-orders/{order_id}")
async def update_purchase_order(
    order_id: int,
    order_data: PurchaseOrderUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a purchase order"""
    order = await session.get(PurchaseOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    for key, value in order_data.model_dump(exclude_unset=True).items():
        setattr(order, key, value)
    
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order

@router.delete("/purchase-orders/{order_id}")
async def delete_purchase_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a purchase order"""
    order = await session.get(PurchaseOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    await session.delete(order)
    await session.commit()
    return {"message": "Purchase order deleted successfully"}

# ============= VENDOR BILL ENDPOINTS =============

@router.get("/vendor-bills")
async def get_vendor_bills(
    session: AsyncSession = Depends(get_session),
):
    """Get all vendor bills"""
    result = await session.execute(
        select(VendorBill)
        .options(selectinload(VendorBill.vendor), selectinload(VendorBill.lines))
        .order_by(VendorBill.id.desc())
    )
    return result.scalars().all()

@router.get("/vendor-bills/{bill_id}")
async def get_vendor_bill(
    bill_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single vendor bill"""
    result = await session.execute(
        select(VendorBill)
        .options(selectinload(VendorBill.vendor), selectinload(VendorBill.lines))
        .where(VendorBill.id == bill_id)
    )
    bill = result.scalars().first()
    if not bill:
        raise HTTPException(status_code=404, detail="Vendor bill not found")
    return bill

@router.post("/vendor-bills", status_code=201)
async def create_vendor_bill(
    bill_data: VendorBillCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new vendor bill"""
    # Generate bill number
    bill_number = f"BILL-{int(datetime.utcnow().timestamp())}"
    
    # Calculate totals
    total_amount, tax_amount = calculate_invoice_totals(bill_data.lines)
    
    # Create bill
    bill = VendorBill(
        bill_number=bill_number,
        vendor_id=bill_data.vendor_id,
        purchase_order_id=bill_data.purchase_order_id,
        bill_date=bill_data.bill_date,
        due_date=bill_data.due_date,
        total_amount=total_amount,
        tax_amount=tax_amount,
        notes=bill_data.notes,
        status=InvoiceStatus.DRAFT
    )
    session.add(bill)
    await session.flush()
    
    # Create bill lines
    for line_data in bill_data.lines:
        line = VendorBillLine(
            bill_id=bill.id,
            **line_data.model_dump()
        )
        session.add(line)
    
    await session.commit()
    await session.refresh(bill)
    return bill

@router.put("/vendor-bills/{bill_id}")
async def update_vendor_bill(
    bill_id: int,
    bill_data: VendorBillUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a vendor bill"""
    bill = await session.get(VendorBill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Vendor bill not found")
    
    for key, value in bill_data.model_dump(exclude_unset=True).items():
        setattr(bill, key, value)
    
    session.add(bill)
    await session.commit()
    await session.refresh(bill)
    return bill

@router.delete("/vendor-bills/{bill_id}")
async def delete_vendor_bill(
    bill_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a vendor bill"""
    bill = await session.get(VendorBill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Vendor bill not found")
    
    await session.delete(bill)
    await session.commit()
    return {"message": "Vendor bill deleted successfully"}

# ============= PAYMENT ENDPOINTS =============

@router.get("/payments")
async def get_payments(
    session: AsyncSession = Depends(get_session),
):
    """Get all payments"""
    result = await session.execute(select(Payment).order_by(Payment.id.desc()))
    return result.scalars().all()

@router.get("/payments/{payment_id}")
async def get_payment(
    payment_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single payment"""
    payment = await session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.post("/payments", status_code=201)
async def create_payment(
    payment_data: PaymentCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new payment"""
    # Generate payment number
    payment_number = f"PAY-{int(datetime.utcnow().timestamp())}"
    
    # Create payment
    payment = Payment(
        payment_number=payment_number,
        **payment_data.model_dump(),
        status=PaymentStatus.DRAFT
    )
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    
    # Update invoice/bill if linked
    if payment.invoice_id:
        invoice = await session.get(Invoice, payment.invoice_id)
        if invoice:
            invoice.amount_paid += payment.amount
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = InvoiceStatus.PAID
            session.add(invoice)
            await session.commit()
    
    if payment.vendor_bill_id:
        bill = await session.get(VendorBill, payment.vendor_bill_id)
        if bill:
            bill.amount_paid += payment.amount
            if bill.amount_paid >= bill.total_amount:
                bill.status = InvoiceStatus.PAID
            session.add(bill)
            await session.commit()
    
    return payment

@router.put("/payments/{payment_id}")
async def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a payment"""
    payment = await session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    for key, value in payment_data.model_dump(exclude_unset=True).items():
        setattr(payment, key, value)
    
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment

# ============= PAYMENT TERMS ENDPOINTS =============

@router.get("/payment-terms")
async def get_payment_terms(
    session: AsyncSession = Depends(get_session),
):
    """Get all payment terms"""
    result = await session.execute(select(PaymentTerm).order_by(PaymentTerm.id))
    return result.scalars().all()

@router.get("/payment-terms/{term_id}")
async def get_payment_term(
    term_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a single payment term"""
    term = await session.get(PaymentTerm, term_id)
    if not term:
        raise HTTPException(status_code=404, detail="Payment term not found")
    return term

@router.post("/payment-terms", status_code=201)
async def create_payment_term(
    term_data: PaymentTermCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new payment term"""
    term = PaymentTerm(**term_data.model_dump())
    session.add(term)
    await session.commit()
    await session.refresh(term)
    return term

@router.put("/payment-terms/{term_id}")
async def update_payment_term(
    term_id: int,
    term_data: PaymentTermUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a payment term"""
    term = await session.get(PaymentTerm, term_id)
    if not term:
        raise HTTPException(status_code=404, detail="Payment term not found")
    
    for key, value in term_data.model_dump(exclude_unset=True).items():
        setattr(term, key, value)
    
    session.add(term)
    await session.commit()
    await session.refresh(term)
    return term

@router.delete("/payment-terms/{term_id}")
async def delete_payment_term(
    term_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a payment term"""
    term = await session.get(PaymentTerm, term_id)
    if not term:
        raise HTTPException(status_code=404, detail="Payment term not found")
    
    await session.delete(term)
    await session.commit()
    return {"message": "Payment term deleted successfully"}
