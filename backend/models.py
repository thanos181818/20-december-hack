from datetime import datetime
from typing import List, Optional
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer

class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class ContactType(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    BOTH = "both"

# --- Core Models ---

class Contact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    contact_type: ContactType = Field(default=ContactType.CUSTOMER)
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="contact")
    orders: List["SaleOrder"] = Relationship(back_populates="contact")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: UserRole = Field(default=UserRole.CUSTOMER)
    contact_id: Optional[int] = Field(default=None, foreign_key="contact.id")
    
    # Relationships
    contact: Optional[Contact] = Relationship(back_populates="user")

# --- PRODUCT MODEL FIX ---
# We define the column object explicitly here so we can refer to it twice below.
# This satisfies both SQLModel (Pydantic) and SQLAlchemy's versioning requirements.
product_version_col = Column(Integer, nullable=False, default=1)

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    current_stock: int
    
    # 1. Pass the explicit column object to the Field
    version_id: Optional[int] = Field(default=None, sa_column=product_version_col)

    # 2. Pass the SAME object to mapper_args
    __mapper_args__ = {
        "version_id_col": product_version_col
    }

class SaleOrder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str
    contact_id: int = Field(foreign_key="contact.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    total_amount: float
    status: str = "confirmed"
    
    contact: Contact = Relationship(back_populates="orders")
    lines: List["SaleOrderLine"] = Relationship(back_populates="order")
    invoice: Optional["Invoice"] = Relationship(back_populates="order")

class SaleOrderLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="saleorder.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    unit_price: float
    
    order: SaleOrder = Relationship(back_populates="lines")

class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_number: str
    order_id: int = Field(foreign_key="saleorder.id")
    amount_due: float
    is_paid: bool = False
    
    order: SaleOrder = Relationship(back_populates="invoice")