"""
Reset database - drop all tables and recreate them
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import SQLModel
from db import engine
# Import all models to ensure they're registered with SQLModel metadata
from models import (
    User, Contact, Product, 
    SaleOrder, SaleOrderLine,
    Invoice, InvoiceLine,
    PurchaseOrder, PurchaseOrderLine,
    VendorBill, VendorBillLine,
    Payment, PaymentTerm
)

async def reset_database():
    print("🗑️  Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    print("✅ All tables dropped")
    
    print("🏗️  Creating all tables with new schema...")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("✅ All tables created")
    print("\n✨ Database reset complete! You can now run seed.py")

if __name__ == "__main__":
    try:
        asyncio.run(reset_database())
    except Exception as e:
        print(f"❌ Error during reset: {e}")
        import traceback
        traceback.print_exc()
