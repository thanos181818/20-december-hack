# backend/orders.py

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
    affected_products = [] 

    try:
        # --- 1. Create Order Header ---
        order_num = f"SO-{int(datetime.utcnow().timestamp())}"
        
        if not current_user.contact_id:
             raise HTTPException(status_code=400, detail="User has no linked Contact profile")

        new_order = SaleOrder(
            order_number=order_num,
            contact_id=current_user.contact_id, 
            total_amount=0,
            status="confirmed"
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
        if order_data.auto_invoice:
            invoice = Invoice(
                invoice_number=f"INV-{order_num}",
                order_id=new_order.id,
                amount_due=total_amount,
                is_paid=False 
            )
            session.add(invoice)

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