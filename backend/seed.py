import asyncio
import sys
from pathlib import Path
from datetime import datetime, date, timedelta
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.db import engine
from backend.models import (
    Product, ProductType, Contact, ContactType,
    SaleOrder, SaleOrderLine, OrderStatus,
    Invoice, InvoiceLine, InvoiceStatus,
    PurchaseOrder, PurchaseOrderLine,
    VendorBill, VendorBillLine,
    Payment, PaymentStatus, PaymentTerm
)

async def seed_database():
    print("🌱 Seeding database...")
    
    async with AsyncSession(engine) as session:
        # Check if data already exists
        result = await session.exec(select(Product))
        if result.first():
            print("⚠️  Database already has data. Skipping seed.")
            return

        # ============= PRODUCTS =============
        print("📦 Seeding products...")
        products_data = [
            {
                "name": "Premium Men's Formal Shirt",
                "description": "Classic cotton dress shirt with modern slim fit design. Perfect for office wear and formal events. Made from 100% premium cotton fabric.",
                "price": 1899.0,
                "current_stock": 45,
                "category": "Men's Shirts",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-mens-shirt.jpg"
            },
            {
                "name": "Elegant Silk Kurta",
                "description": "Traditional silk kurta with intricate embroidery work. Perfect for festivals and special occasions. Available in multiple colors.",
                "price": 3999.0,
                "current_stock": 30,
                "category": "Ethnic Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-kurta.jpg"
            },
            {
                "name": "Designer Women's Dress",
                "description": "Stunning evening dress with elegant design. Perfect for parties and formal gatherings. Premium fabric with comfortable fit.",
                "price": 4999.0,
                "current_stock": 25,
                "category": "Women's Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-womens-dress.jpg"
            },
            {
                "name": "Classic Leather Jacket",
                "description": "Timeless leather jacket with modern styling. Perfect for casual outings and cool weather. Premium quality leather.",
                "price": 8999.0,
                "current_stock": 20,
                "category": "Jackets & Coats",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-jacket.jpg"
            },
            {
                "name": "Cotton Casual Shirt - Blue",
                "description": "Comfortable cotton casual shirt for everyday wear. Breathable fabric with easy care.",
                "price": 1499.0,
                "current_stock": 60,
                "category": "Men's Shirts",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-mens-shirt.jpg"
            },
            {
                "name": "Festive Kurta Set",
                "description": "Complete kurta set with matching bottom. Ideal for weddings and celebrations.",
                "price": 5499.0,
                "current_stock": 35,
                "category": "Ethnic Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-kurta.jpg"
            },
            {
                "name": "Summer Floral Dress",
                "description": "Light and breezy summer dress with beautiful floral patterns. Perfect for warm weather.",
                "price": 2999.0,
                "current_stock": 50,
                "category": "Women's Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-womens-dress.jpg"
            },
            {
                "name": "Denim Jacket - Classic Blue",
                "description": "Timeless denim jacket in classic blue wash. A wardrobe essential for all seasons.",
                "price": 3499.0,
                "current_stock": 40,
                "category": "Jackets & Coats",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-jacket.jpg"
            },
            {
                "name": "Linen Blend Shirt - White",
                "description": "Premium linen blend shirt for summer comfort. Crisp white color for versatile styling.",
                "price": 2299.0,
                "current_stock": 55,
                "category": "Men's Shirts",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-mens-shirt.jpg"
            },
            {
                "name": "Wedding Kurta - Gold",
                "description": "Luxurious kurta with gold embellishments. Perfect for wedding ceremonies and grand celebrations.",
                "price": 7999.0,
                "current_stock": 15,
                "category": "Ethnic Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-kurta.jpg"
            },
            {
                "name": "Evening Cocktail Dress",
                "description": "Sophisticated cocktail dress for evening events. Elegant design with modern silhouette.",
                "price": 6499.0,
                "current_stock": 20,
                "category": "Women's Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-womens-dress.jpg"
            },
            {
                "name": "Winter Wool Coat",
                "description": "Warm wool coat for cold winter days. Classic design with superior insulation.",
                "price": 12999.0,
                "current_stock": 18,
                "category": "Jackets & Coats",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-jacket.jpg"
            },
            {
                "name": "Casual Polo Shirt",
                "description": "Classic polo shirt for casual occasions. Comfortable cotton pique fabric.",
                "price": 1299.0,
                "current_stock": 70,
                "category": "Men's Shirts",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-mens-shirt.jpg"
            },
            {
                "name": "Party Wear Kurta",
                "description": "Stylish kurta for parties and gatherings. Modern design with traditional touch.",
                "price": 3299.0,
                "current_stock": 28,
                "category": "Ethnic Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-kurta.jpg"
            },
            {
                "name": "Casual Maxi Dress",
                "description": "Comfortable maxi dress for casual day outs. Flowy and stylish.",
                "price": 2499.0,
                "current_stock": 42,
                "category": "Women's Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-womens-dress.jpg"
            },
            {
                "name": "Bomber Jacket",
                "description": "Trendy bomber jacket with modern fit. Perfect for casual styling.",
                "price": 4999.0,
                "current_stock": 32,
                "category": "Jackets & Coats",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-jacket.jpg"
            },
            {
                "name": "Oxford Shirt - Navy",
                "description": "Classic Oxford shirt in navy blue. Perfect for business casual.",
                "price": 1999.0,
                "current_stock": 48,
                "category": "Men's Shirts",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-mens-shirt.jpg"
            },
            {
                "name": "Pathani Kurta Set",
                "description": "Traditional Pathani kurta with salwar. Comfortable and elegant.",
                "price": 4499.0,
                "current_stock": 22,
                "category": "Ethnic Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-kurta.jpg"
            },
            {
                "name": "Office Formal Dress",
                "description": "Professional dress for office wear. Sophisticated and comfortable.",
                "price": 3999.0,
                "current_stock": 35,
                "category": "Women's Wear",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-womens-dress.jpg"
            },
            {
                "name": "Trench Coat - Beige",
                "description": "Classic trench coat in beige. Timeless style for any season.",
                "price": 9999.0,
                "current_stock": 15,
                "category": "Jackets & Coats",
                "product_type": ProductType.STORABLE,
                "image_url": "/src/assets/product-jacket.jpg"
            }
        ]
        
        products = []
        for item in products_data:
            product = Product(**item)
            session.add(product)
            products.append(product)
            print(f"   ✓ Added: {item['name']}")
        
        await session.flush()

        # ============= CONTACTS =============
        print("\n👥 Seeding contacts...")
        contacts_data = [
            {
                "name": "Rajesh Kumar",
                "email": "rajesh.kumar@example.com",
                "phone": "+91 98765 43210",
                "address": "123 MG Road, Bangalore, Karnataka 560001",
                "contact_type": ContactType.CUSTOMER
            },
            {
                "name": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "phone": "+91 98765 43211",
                "address": "456 Connaught Place, Delhi 110001",
                "contact_type": ContactType.CUSTOMER
            },
            {
                "name": "Amit Patel",
                "email": "amit.patel@example.com",
                "phone": "+91 98765 43212",
                "address": "789 Marine Drive, Mumbai, Maharashtra 400002",
                "contact_type": ContactType.CUSTOMER
            },
            {
                "name": "Fabric Suppliers Ltd",
                "email": "sales@fabricsuppliers.com",
                "phone": "+91 98765 43213",
                "address": "22 Industrial Area, Surat, Gujarat 395003",
                "contact_type": ContactType.VENDOR
            },
            {
                "name": "Textile Imports Co",
                "email": "info@textileimports.com",
                "phone": "+91 98765 43214",
                "address": "88 Garment District, Tirupur, Tamil Nadu 641604",
                "contact_type": ContactType.VENDOR
            },
            {
                "name": "Premium Fabrics Inc",
                "email": "contact@premiumfabrics.com",
                "phone": "+91 98765 43215",
                "address": "45 Silk Market, Varanasi, Uttar Pradesh 221001",
                "contact_type": ContactType.VENDOR
            }
        ]
        
        contacts = []
        for item in contacts_data:
            contact = Contact(**item)
            session.add(contact)
            contacts.append(contact)
            print(f"   ✓ Added: {item['name']} ({item['contact_type']})")
        
        await session.flush()

        # ============= PAYMENT TERMS =============
        print("\n💳 Seeding payment terms...")
        terms_data = [
            {
                "name": "Immediate Payment",
                "days": 0,
                "discount_percentage": 0,
                "early_payment_days": 0,
                "early_payment_discount": 0,
                "description": "Payment due immediately upon receipt"
            },
            {
                "name": "Net 15",
                "days": 15,
                "discount_percentage": 0,
                "early_payment_days": 7,
                "early_payment_discount": 2.0,
                "description": "Payment due in 15 days, 2% discount if paid within 7 days"
            },
            {
                "name": "Net 30",
                "days": 30,
                "discount_percentage": 0,
                "early_payment_days": 10,
                "early_payment_discount": 2.5,
                "description": "Payment due in 30 days, 2.5% discount if paid within 10 days"
            },
            {
                "name": "Net 45",
                "days": 45,
                "discount_percentage": 0,
                "early_payment_days": 15,
                "early_payment_discount": 3.0,
                "description": "Payment due in 45 days, 3% discount if paid within 15 days"
            }
        ]
        
        for item in terms_data:
            term = PaymentTerm(**item)
            session.add(term)
            print(f"   ✓ Added: {item['name']}")
        
        await session.flush()

        # ============= SALES ORDERS =============
        print("\n📋 Seeding sales orders...")
        
        # Sales Order 1
        so1 = SaleOrder(
            order_number="SO-2024-001",
            customer_id=contacts[0].id,  # Rajesh Kumar
            order_date=date.today() - timedelta(days=10),
            delivery_date=date.today() + timedelta(days=5),
            total_amount=12497.0,
            tax_amount=1124.73,
            discount_amount=0,
            status=OrderStatus.CONFIRMED,
            notes="Urgent delivery required"
        )
        session.add(so1)
        await session.flush()
        
        # Sales Order 1 Lines
        sol1_1 = SaleOrderLine(
            order_id=so1.id,
            product_id=products[0].id,  # Classic Cotton Shirt
            quantity=2,
            unit_price=products[0].price,
            tax_rate=9.0
        )
        sol1_2 = SaleOrderLine(
            order_id=so1.id,
            product_id=products[3].id,  # Cotton Chinos
            quantity=3,
            unit_price=products[3].price,
            tax_rate=9.0
        )
        session.add(sol1_1)
        session.add(sol1_2)
        print(f"   ✓ Added: {so1.order_number}")
        
        # Sales Order 2
        so2 = SaleOrder(
            order_number="SO-2024-002",
            customer_id=contacts[1].id,  # Priya Sharma
            order_date=date.today() - timedelta(days=5),
            delivery_date=date.today() + timedelta(days=10),
            total_amount=8498.0,
            tax_amount=764.82,
            discount_amount=0,
            status=OrderStatus.CONFIRMED
        )
        session.add(so2)
        await session.flush()
        
        sol2_1 = SaleOrderLine(
            order_id=so2.id,
            product_id=products[1].id,  # Silk Blend Kurta
            quantity=1,
            unit_price=products[1].price,
            tax_rate=9.0
        )
        sol2_2 = SaleOrderLine(
            order_id=so2.id,
            product_id=products[2].id,  # Linen Summer Dress
            quantity=1,
            unit_price=products[2].price,
            tax_rate=9.0
        )
        session.add(sol2_1)
        session.add(sol2_2)
        print(f"   ✓ Added: {so2.order_number}")
        
        # Sales Order 3 (Draft)
        so3 = SaleOrder(
            order_number="SO-2024-003",
            customer_id=contacts[2].id,  # Amit Patel
            order_date=date.today(),
            delivery_date=date.today() + timedelta(days=15),
            total_amount=7999.0,
            tax_amount=719.91,
            discount_amount=0,
            status=OrderStatus.DRAFT
        )
        session.add(so3)
        await session.flush()
        
        sol3_1 = SaleOrderLine(
            order_id=so3.id,
            product_id=products[4].id,  # Wool Blend Jacket
            quantity=1,
            unit_price=products[4].price,
            tax_rate=9.0
        )
        session.add(sol3_1)
        print(f"   ✓ Added: {so3.order_number} (Draft)")

        # ============= INVOICES =============
        print("\n🧾 Seeding invoices...")
        
        # Invoice 1 (from SO1)
        inv1 = Invoice(
            invoice_number="INV-2024-001",
            sale_order_id=so1.id,
            customer_id=contacts[0].id,
            invoice_date=date.today() - timedelta(days=8),
            due_date=date.today() + timedelta(days=22),
            total_amount=13621.73,
            tax_amount=1124.73,
            amount_paid=0,
            status=InvoiceStatus.CONFIRMED,
            notes="Payment terms: Net 30"
        )
        session.add(inv1)
        await session.flush()
        
        invl1_1 = InvoiceLine(
            invoice_id=inv1.id,
            product_id=products[0].id,
            description="Classic Cotton Shirt - Size L",
            quantity=2,
            unit_price=products[0].price,
            tax_rate=9.0
        )
        invl1_2 = InvoiceLine(
            invoice_id=inv1.id,
            product_id=products[3].id,
            description="Cotton Chinos - Navy Blue",
            quantity=3,
            unit_price=products[3].price,
            tax_rate=9.0
        )
        session.add(invl1_1)
        session.add(invl1_2)
        print(f"   ✓ Added: {inv1.invoice_number}")
        
        # Invoice 2 (from SO2) - Partially Paid
        inv2 = Invoice(
            invoice_number="INV-2024-002",
            sale_order_id=so2.id,
            customer_id=contacts[1].id,
            invoice_date=date.today() - timedelta(days=3),
            due_date=date.today() + timedelta(days=27),
            total_amount=9262.82,
            tax_amount=764.82,
            amount_paid=5000.0,
            status=InvoiceStatus.CONFIRMED
        )
        session.add(inv2)
        await session.flush()
        
        invl2_1 = InvoiceLine(
            invoice_id=inv2.id,
            product_id=products[1].id,
            description="Silk Blend Kurta - Gold",
            quantity=1,
            unit_price=products[1].price,
            tax_rate=9.0
        )
        invl2_2 = InvoiceLine(
            invoice_id=inv2.id,
            product_id=products[2].id,
            description="Linen Summer Dress - White",
            quantity=1,
            unit_price=products[2].price,
            tax_rate=9.0
        )
        session.add(invl2_1)
        session.add(invl2_2)
        print(f"   ✓ Added: {inv2.invoice_number} (Partially Paid)")
        
        # Invoice 3 (Standalone) - Paid
        inv3 = Invoice(
            invoice_number="INV-2024-003",
            customer_id=contacts[0].id,
            invoice_date=date.today() - timedelta(days=20),
            due_date=date.today() - timedelta(days=5),
            total_amount=3268.50,
            tax_amount=268.50,
            amount_paid=3268.50,
            status=InvoiceStatus.PAID
        )
        session.add(inv3)
        await session.flush()
        
        invl3_1 = InvoiceLine(
            invoice_id=inv3.id,
            product_id=products[6].id,
            description="Kids Cotton T-Shirt - Pack of 3",
            quantity=3,
            unit_price=products[6].price,
            tax_rate=9.0
        )
        invl3_2 = InvoiceLine(
            invoice_id=inv3.id,
            product_id=products[8].id,
            description="Alteration Service",
            quantity=1,
            unit_price=products[8].price,
            tax_rate=18.0
        )
        session.add(invl3_1)
        session.add(invl3_2)
        print(f"   ✓ Added: {inv3.invoice_number} (Paid)")

        # ============= PURCHASE ORDERS =============
        print("\n🛒 Seeding purchase orders...")
        
        # PO 1
        po1 = PurchaseOrder(
            order_number="PO-2024-001",
            vendor_id=contacts[3].id,  # Fabric Suppliers Ltd
            order_date=date.today() - timedelta(days=15),
            expected_delivery=date.today() + timedelta(days=10),
            total_amount=50000.0,
            tax_amount=4500.0,
            status=OrderStatus.CONFIRMED,
            notes="Bulk order for cotton fabric"
        )
        session.add(po1)
        await session.flush()
        
        pol1_1 = PurchaseOrderLine(
            purchase_order_id=po1.id,
            product_id=products[0].id,
            quantity=20,
            unit_price=2000.0,
            tax_rate=9.0
        )
        pol1_2 = PurchaseOrderLine(
            purchase_order_id=po1.id,
            product_id=products[3].id,
            quantity=15,
            unit_price=2200.0,
            tax_rate=9.0
        )
        session.add(pol1_1)
        session.add(pol1_2)
        print(f"   ✓ Added: {po1.order_number}")
        
        # PO 2
        po2 = PurchaseOrder(
            order_number="PO-2024-002",
            vendor_id=contacts[4].id,  # Textile Imports Co
            order_date=date.today() - timedelta(days=7),
            expected_delivery=date.today() + timedelta(days=20),
            total_amount=35000.0,
            tax_amount=3150.0,
            status=OrderStatus.CONFIRMED
        )
        session.add(po2)
        await session.flush()
        
        pol2_1 = PurchaseOrderLine(
            purchase_order_id=po2.id,
            product_id=products[1].id,
            quantity=10,
            unit_price=3500.0,
            tax_rate=9.0
        )
        session.add(pol2_1)
        print(f"   ✓ Added: {po2.order_number}")
        
        # PO 3 (Draft)
        po3 = PurchaseOrder(
            order_number="PO-2024-003",
            vendor_id=contacts[5].id,  # Premium Fabrics Inc
            order_date=date.today(),
            expected_delivery=date.today() + timedelta(days=30),
            total_amount=45000.0,
            tax_amount=4050.0,
            status=OrderStatus.DRAFT
        )
        session.add(po3)
        await session.flush()
        
        pol3_1 = PurchaseOrderLine(
            purchase_order_id=po3.id,
            product_id=products[4].id,
            quantity=8,
            unit_price=5625.0,
            tax_rate=9.0
        )
        session.add(pol3_1)
        print(f"   ✓ Added: {po3.order_number} (Draft)")

        # ============= VENDOR BILLS =============
        print("\n📄 Seeding vendor bills...")
        
        # Bill 1 (from PO1)
        bill1 = VendorBill(
            bill_number="BILL-2024-001",
            purchase_order_id=po1.id,
            vendor_id=contacts[3].id,
            bill_date=date.today() - timedelta(days=10),
            due_date=date.today() + timedelta(days=20),
            total_amount=54500.0,
            tax_amount=4500.0,
            amount_paid=0,
            status=InvoiceStatus.CONFIRMED,
            notes="Payment terms: Net 30"
        )
        session.add(bill1)
        await session.flush()
        
        billl1_1 = VendorBillLine(
            bill_id=bill1.id,
            product_id=products[0].id,
            description="Cotton fabric for shirts - Premium quality",
            quantity=20,
            unit_price=2000.0,
            tax_rate=9.0
        )
        billl1_2 = VendorBillLine(
            bill_id=bill1.id,
            product_id=products[3].id,
            description="Cotton fabric for chinos - Heavy duty",
            quantity=15,
            unit_price=2200.0,
            tax_rate=9.0
        )
        session.add(billl1_1)
        session.add(billl1_2)
        print(f"   ✓ Added: {bill1.bill_number}")
        
        # Bill 2 (from PO2) - Partially Paid
        bill2 = VendorBill(
            bill_number="BILL-2024-002",
            purchase_order_id=po2.id,
            vendor_id=contacts[4].id,
            bill_date=date.today() - timedelta(days=5),
            due_date=date.today() + timedelta(days=25),
            total_amount=38150.0,
            tax_amount=3150.0,
            amount_paid=20000.0,
            status=InvoiceStatus.CONFIRMED
        )
        session.add(bill2)
        await session.flush()
        
        billl2_1 = VendorBillLine(
            bill_id=bill2.id,
            product_id=products[1].id,
            description="Silk blend fabric - Premium grade",
            quantity=10,
            unit_price=3500.0,
            tax_rate=9.0
        )
        session.add(billl2_1)
        print(f"   ✓ Added: {bill2.bill_number} (Partially Paid)")
        
        # Bill 3 (Standalone) - Paid
        bill3 = VendorBill(
            bill_number="BILL-2024-003",
            vendor_id=contacts[5].id,
            bill_date=date.today() - timedelta(days=25),
            due_date=date.today() - timedelta(days=10),
            total_amount=21800.0,
            tax_amount=1800.0,
            amount_paid=21800.0,
            status=InvoiceStatus.PAID
        )
        session.add(bill3)
        await session.flush()
        
        billl3_1 = VendorBillLine(
            bill_id=bill3.id,
            product_id=products[7].id,
            description="Linen fabric - Summer collection",
            quantity=10,
            unit_price=2000.0,
            tax_rate=9.0
        )
        session.add(billl3_1)
        print(f"   ✓ Added: {bill3.bill_number} (Paid)")

        # ============= PAYMENTS =============
        print("\n💰 Seeding payments...")
        
        # Payment 1 (for Invoice 2)
        pay1 = Payment(
            payment_number="PAY-2024-001",
            payment_date=date.today() - timedelta(days=2),
            amount=5000.0,
            payment_method="Bank Transfer",
            reference="TXN123456789",
            invoice_id=inv2.id,
            status=PaymentStatus.CONFIRMED,
            notes="Partial payment received"
        )
        session.add(pay1)
        print(f"   ✓ Added: {pay1.payment_number} (Invoice)")
        
        # Payment 2 (for Invoice 3)
        pay2 = Payment(
            payment_number="PAY-2024-002",
            payment_date=date.today() - timedelta(days=15),
            amount=3268.50,
            payment_method="UPI",
            reference="UPI987654321",
            invoice_id=inv3.id,
            status=PaymentStatus.CONFIRMED,
            notes="Full payment - Early settlement"
        )
        session.add(pay2)
        print(f"   ✓ Added: {pay2.payment_number} (Invoice - Full)")
        
        # Payment 3 (for Bill 2)
        pay3 = Payment(
            payment_number="PAY-2024-003",
            payment_date=date.today() - timedelta(days=3),
            amount=20000.0,
            payment_method="Bank Transfer",
            reference="TXN456789123",
            vendor_bill_id=bill2.id,
            status=PaymentStatus.CONFIRMED,
            notes="Advance payment to vendor"
        )
        session.add(pay3)
        print(f"   ✓ Added: {pay3.payment_number} (Bill)")
        
        # Payment 4 (for Bill 3)
        pay4 = Payment(
            payment_number="PAY-2024-004",
            payment_date=date.today() - timedelta(days=11),
            amount=21800.0,
            payment_method="Cheque",
            reference="CHQ5678912",
            vendor_bill_id=bill3.id,
            status=PaymentStatus.CONFIRMED,
            notes="Full payment for bill"
        )
        session.add(pay4)
        print(f"   ✓ Added: {pay4.payment_number} (Bill - Full)")

        # Commit all changes
        await session.commit()
        print("\n✅ Database seeding complete!")
        print(f"""
📊 Summary:
   • Products: {len(products_data)}
   • Contacts: {len(contacts_data)} (Customers: 3, Vendors: 3)
   • Payment Terms: {len(terms_data)}
   • Sales Orders: 3 (2 confirmed, 1 draft)
   • Invoices: 3 (1 confirmed, 1 partially paid, 1 paid)
   • Purchase Orders: 3 (2 confirmed, 1 draft)
   • Vendor Bills: 3 (1 confirmed, 1 partially paid, 1 paid)
   • Payments: 4
        """)

if __name__ == "__main__":
    try:
        asyncio.run(seed_database())
    except Exception as e:
        print(f"❌ Error during seeding: {e}")