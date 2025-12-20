from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm.exc import StaleDataError
from sqlmodel import select
from models import Product

# Internal imports
from db import get_session
from models import Product, SaleOrder, SaleOrderLine, Invoice, User
from auth import get_current_user
from websocket_manager import manager

# --- Pydantic Schemas (Data Validation) ---
# These define what JSON the Frontend sends to us
class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int

class OrderCreateSchema(BaseModel):
    items: List[OrderItemSchema]
    auto_invoice: bool = True

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
    affected_products = [] # List to track what changed for WebSockets

    try:
        # --- 1. Create Order Header ---
        # Generate a simple order number
        order_num = f"SO-{int(datetime.utcnow().timestamp())}"
        
        # Link to the user's Contact ID (Assuming User is linked to a Contact)
        if not current_user.contact_id:
             raise HTTPException(status_code=400, detail="User has no linked Contact profile")

        new_order = SaleOrder(
            order_number=order_num,
            contact_id=current_user.contact_id, 
            total_amount=0,
            status="confirmed"
        )
        session.add(new_order)
        await session.flush() # Flush to generate the new_order.id

        # --- 2. Process Items & Deduct Stock ---
        for item in order_data.items:
            # Fetch Product
            product = await session.get(Product, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
            
            # Check Stock
            if product.current_stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'. Available: {product.current_stock}")

            # DEDUCT STOCK
            # SQLAlchemy handles the version_id check automatically upon commit
            product.current_stock -= item.quantity
            session.add(product) 
            
            # Create Line Item
            line = SaleOrderLine(
                order_id=new_order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price
            )
            session.add(line)
            
            # Calculate totals
            total_amount += (product.price * item.quantity)
            
            # Record change for WebSocket broadcast
            affected_products.append({
                "id": product.id, 
                "new_stock": product.current_stock
            })

        # Update Order Total
        new_order.total_amount = total_amount
        session.add(new_order)

        # --- 3. Auto Invoice Logic ---
        if order_data.auto_invoice:
            invoice = Invoice(
                invoice_number=f"INV-{order_num}",
                order_id=new_order.id,
                amount_due=total_amount,
                is_paid=False 
            )
            session.add(invoice)

        # --- 4. COMMIT TRANSACTION ---
        # This is where the database actually saves. 
        # If version_id mismatch (concurrency issue), it throws StaleDataError.
        await session.commit() 
        await session.refresh(new_order)

    except StaleDataError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Stock changed while processing. Please retry.")
    except Exception as e:
        await session.rollback()
        # In production, log the actual error 'e' to console/file
        raise HTTPException(status_code=500, detail=str(e))

    # --- 5. BROADCAST TO ADMIN (Post-Commit) ---
    # We do this AFTER commit to ensure the DB is definitely updated
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
    result = await session.exec(select(Product))
    return result.all()