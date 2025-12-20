import asyncio
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from db import engine
from models import Product

async def seed_products():
    print("🌱 Connecting to database...")
    
    # Data taken directly from your Frontend assets
    products_data = [
        {"name": "Classic Cotton Shirt", "price": 2499.0, "current_stock": 50},
        {"name": "Silk Blend Kurta", "price": 4999.0, "current_stock": 30},
        {"name": "Linen Summer Dress", "price": 3499.0, "current_stock": 40},
        {"name": "Cotton Chinos", "price": 2999.0, "current_stock": 60},
        {"name": "Wool Blend Jacket", "price": 7999.0, "current_stock": 25},
        {"name": "Silk Saree Blouse", "price": 1999.0, "current_stock": 45},
        {"name": "Kids Cotton T-Shirt", "price": 799.0, "current_stock": 100},
        {"name": "Women's Linen Pants", "price": 2799.0, "current_stock": 55},
    ]

    # FIXED: Use AsyncSession instead of Session
    async with AsyncSession(engine) as session:
        # 1. Check if data already exists to avoid duplicates
        result = await session.exec(select(Product))
        if result.first():
            print("⚠️  Database already has products. Skipping seed.")
            return

        print("🚀 Seeding products...")
        
        # 2. Add products
        for item in products_data:
            product = Product(
                name=item["name"],
                price=item["price"],
                current_stock=item["current_stock"]
            )
            session.add(product)
            print(f"   - Added: {item['name']}")
        
        # 3. Commit changes
        await session.commit()
        print("✅ Seeding complete!")

if __name__ == "__main__":
    try:
        # Use uvloop if available, otherwise standard asyncio
        asyncio.run(seed_products())
    except Exception as e:
        print(f"❌ Error during seeding: {e}")