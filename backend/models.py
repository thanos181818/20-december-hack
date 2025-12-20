from datetime import datetime, date
from typing import List, Optional
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer, Text

class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class ContactType(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    BOTH = "both"

class OrderStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    PAID = "paid"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class ProductType(str, Enum):
    STORABLE = "storable"
    CONSUMABLE = "consumable"
    SERVICE = "service"

# --- Core Models ---

class Contact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    phone: Optional[str] = None
    address: Optional[str] = None
    contact_type: ContactType = Field(default=ContactType.CUSTOMER)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="contact")
    customer_orders: List["SaleOrder"] = Relationship(back_populates="customer")
    customer_invoices: List["Invoice"] = Relationship(back_populates="customer")
    vendor_purchase_orders: List["PurchaseOrder"] = Relationship(back_populates="vendor")
    vendor_bills: List["VendorBill"] = Relationship(back_populates="vendor")

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
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    price: float
    current_stock: int
    category: Optional[str] = None
    product_type: ProductType = Field(default=ProductType.STORABLE)
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 1. Pass the explicit column object to the Field
    version_id: Optional[int] = Field(default=None, sa_column=product_version_col)

    # 2. Pass the SAME object to mapper_args
    __mapper_args__ = {
        "version_id_col": product_version_col
    }

class SaleOrder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str = Field(unique=True, index=True)
    customer_id: int = Field(foreign_key="contact.id")
    order_date: date = Field(default_factory=lambda: datetime.utcnow().date())
    delivery_date: Optional[date] = None
    total_amount: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    status: OrderStatus = Field(default=OrderStatus.DRAFT)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    customer: Contact = Relationship(back_populates="customer_orders")
    lines: List["SaleOrderLine"] = Relationship(back_populates="order", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    invoices: List["Invoice"] = Relationship(back_populates="sale_order")

class SaleOrderLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="saleorder.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    unit_price: float
    tax_rate: float = 0.0
    discount: float = 0.0
    
    order: SaleOrder = Relationship(back_populates="lines")

class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_number: str = Field(unique=True, index=True)
    sale_order_id: Optional[int] = Field(default=None, foreign_key="saleorder.id")
    customer_id: int = Field(foreign_key="contact.id")
    invoice_date: date = Field(default_factory=lambda: datetime.utcnow().date())
    due_date: Optional[date] = None
    total_amount: float
    tax_amount: float = 0.0
    amount_paid: float = 0.0
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    sale_order: Optional[SaleOrder] = Relationship(back_populates="invoices")
    customer: Contact = Relationship(back_populates="customer_invoices")
    lines: List["InvoiceLine"] = Relationship(back_populates="invoice", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    payments: List["Payment"] = Relationship(back_populates="invoice")

class InvoiceLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_id: int = Field(foreign_key="invoice.id")
    product_id: int = Field(foreign_key="product.id")
    description: Optional[str] = None
    quantity: int
    unit_price: float
    tax_rate: float = 0.0
    
    invoice: Invoice = Relationship(back_populates="lines")

# --- PURCHASE ORDERS ---

class PurchaseOrder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str = Field(unique=True, index=True)
    vendor_id: int = Field(foreign_key="contact.id")
    order_date: date = Field(default_factory=lambda: datetime.utcnow().date())
    expected_delivery: Optional[date] = None
    total_amount: float
    tax_amount: float = 0.0
    status: OrderStatus = Field(default=OrderStatus.DRAFT)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    vendor: Contact = Relationship(back_populates="vendor_purchase_orders")
    lines: List["PurchaseOrderLine"] = Relationship(back_populates="purchase_order", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    bills: List["VendorBill"] = Relationship(back_populates="purchase_order")

class PurchaseOrderLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    purchase_order_id: int = Field(foreign_key="purchaseorder.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    unit_price: float
    tax_rate: float = 0.0
    
    purchase_order: PurchaseOrder = Relationship(back_populates="lines")

# --- VENDOR BILLS ---

class VendorBill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bill_number: str = Field(unique=True, index=True)
    purchase_order_id: Optional[int] = Field(default=None, foreign_key="purchaseorder.id")
    vendor_id: int = Field(foreign_key="contact.id")
    bill_date: date = Field(default_factory=lambda: datetime.utcnow().date())
    due_date: Optional[date] = None
    total_amount: float
    tax_amount: float = 0.0
    amount_paid: float = 0.0
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    purchase_order: Optional[PurchaseOrder] = Relationship(back_populates="bills")
    vendor: Contact = Relationship(back_populates="vendor_bills")
    lines: List["VendorBillLine"] = Relationship(back_populates="bill", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    payments: List["Payment"] = Relationship(back_populates="vendor_bill")

class VendorBillLine(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bill_id: int = Field(foreign_key="vendorbill.id")
    product_id: int = Field(foreign_key="product.id")
    description: Optional[str] = None
    quantity: int
    unit_price: float
    tax_rate: float = 0.0
    
    bill: VendorBill = Relationship(back_populates="lines")

# --- PAYMENT TERMS ---

class PaymentTerm(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    days: int
    discount_percentage: float = 0.0
    early_payment_days: int = 0
    early_payment_discount: float = 0.0
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- PAYMENTS ---

class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    payment_number: str = Field(unique=True, index=True)
    payment_date: date = Field(default_factory=lambda: datetime.utcnow().date())
    amount: float
    payment_method: str = "Bank Transfer"
    reference: Optional[str] = None
    invoice_id: Optional[int] = Field(default=None, foreign_key="invoice.id")
    vendor_bill_id: Optional[int] = Field(default=None, foreign_key="vendorbill.id")
    status: PaymentStatus = Field(default=PaymentStatus.DRAFT)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    invoice: Optional[Invoice] = Relationship(back_populates="payments")
    vendor_bill: Optional[VendorBill] = Relationship(back_populates="payments")