"""
Low Stock Email Notifier for Admin
Sends email notifications when product stock falls below threshold
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/admin/stock-alerts", tags=["stock-alerts"])

# Default low stock threshold
DEFAULT_LOW_STOCK_THRESHOLD = 10

# SMTP Configuration (loaded from environment or defaults)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL", "")

class LowStockProduct(BaseModel):
    id: int
    name: str
    current_stock: int
    threshold: int
    category: Optional[str] = None

class LowStockReport(BaseModel):
    products: List[LowStockProduct]
    total_count: int
    report_date: str
    email_sent: bool = False

class EmailConfig(BaseModel):
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    sender_email: str
    sender_password: str
    receiver_email: str

class SendEmailRequest(BaseModel):
    receiver_email: Optional[str] = None
    threshold: int = DEFAULT_LOW_STOCK_THRESHOLD

def create_low_stock_email_html(products: List[LowStockProduct]) -> str:
    """Generate HTML content for low stock email"""
    html_body = """
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Low Stock Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">ApparelDesk Inventory System</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
            <p style="color: #495057; font-size: 14px;">
                The following products have fallen below their stock threshold and require attention:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #343a40; color: white;">
                        <th style="padding: 12px; text-align: left;">Product ID</th>
                        <th style="padding: 12px; text-align: left;">Name</th>
                        <th style="padding: 12px; text-align: left;">Category</th>
                        <th style="padding: 12px; text-align: center;">Current Stock</th>
                        <th style="padding: 12px; text-align: center;">Threshold</th>
                        <th style="padding: 12px; text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    for i, product in enumerate(products):
        row_bg = "#fff" if i % 2 == 0 else "#f8f9fa"
        status_color = "#dc3545" if product.current_stock == 0 else "#ffc107"
        status_text = "OUT OF STOCK" if product.current_stock == 0 else "LOW STOCK"
        
        html_body += f"""
            <tr style="background: {row_bg};">
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">#{product.id}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; font-weight: 500;">{product.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">{product.category or 'N/A'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center; font-weight: bold; color: {status_color};">{product.current_stock}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">{product.threshold}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">
                    <span style="background: {status_color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                        {status_text}
                    </span>
                </td>
            </tr>
        """
    
    html_body += """
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px; border-left: 4px solid #0066cc;">
                <p style="margin: 0; color: #004085; font-size: 13px;">
                    <strong>💡 Recommended Action:</strong> Review your purchase orders and consider restocking these items soon to avoid stockouts.
                </p>
            </div>
        </div>
        
        <div style="background: #343a40; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
                This is an automated message from ApparelDesk Inventory System.<br>
                Generated on """ + datetime.now().strftime("%B %d, %Y at %I:%M %p") + """
            </p>
        </div>
    </div>
    """
    
    return html_body

async def send_low_stock_email(
    products: List[LowStockProduct],
    receiver_email: str,
    sender_email: str = SENDER_EMAIL,
    sender_password: str = SENDER_PASSWORD
) -> bool:
    """Send low stock notification email"""
    if not sender_email or not sender_password:
        print("Email credentials not configured")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = f"⚠️ Low Stock Alert - {len(products)} Products Need Attention | ApparelDesk"
        
        html_content = create_low_stock_email_html(products)
        msg.attach(MIMEText(html_content, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Low stock email sent successfully to {receiver_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

@router.get("/check", response_model=LowStockReport)
async def check_low_stock(threshold: int = DEFAULT_LOW_STOCK_THRESHOLD):
    """Check for products with low stock (below threshold)"""
    from backend.db import engine
    from backend.models import Product
    
    async with AsyncSession(engine) as session:
        result = await session.execute(
            select(Product).where(Product.current_stock <= threshold)
        )
        products = result.scalars().all()
    
    low_stock_products = [
        LowStockProduct(
            id=p.id,
            name=p.name,
            current_stock=p.current_stock,
            threshold=threshold,
            category=p.category
        )
        for p in products
    ]
    
    return LowStockReport(
        products=low_stock_products,
        total_count=len(low_stock_products),
        report_date=datetime.now().isoformat(),
        email_sent=False
    )

@router.post("/send-notification", response_model=LowStockReport)
async def send_low_stock_notification(
    request: SendEmailRequest,
    background_tasks: BackgroundTasks
):
    """Check low stock and send email notification"""
    from backend.db import engine
    from backend.models import Product
    
    # Get receiver email
    receiver = request.receiver_email or RECEIVER_EMAIL
    if not receiver:
        raise HTTPException(
            status_code=400, 
            detail="No receiver email provided. Set RECEIVER_EMAIL environment variable or provide in request."
        )
    
    # Check SMTP credentials
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Email credentials not configured. Set SENDER_EMAIL and SENDER_PASSWORD environment variables."
        )
    
    # Get low stock products
    async with AsyncSession(engine) as session:
        result = await session.execute(
            select(Product).where(Product.current_stock <= request.threshold)
        )
        products = result.scalars().all()
    
    if not products:
        return LowStockReport(
            products=[],
            total_count=0,
            report_date=datetime.now().isoformat(),
            email_sent=False
        )
    
    low_stock_products = [
        LowStockProduct(
            id=p.id,
            name=p.name,
            current_stock=p.current_stock,
            threshold=request.threshold,
            category=p.category
        )
        for p in products
    ]
    
    # Send email
    email_sent = await send_low_stock_email(low_stock_products, receiver)
    
    return LowStockReport(
        products=low_stock_products,
        total_count=len(low_stock_products),
        report_date=datetime.now().isoformat(),
        email_sent=email_sent
    )

@router.get("/config")
async def get_email_config():
    """Get current email configuration status (without sensitive data)"""
    return {
        "smtp_server": SMTP_SERVER,
        "smtp_port": SMTP_PORT,
        "sender_configured": bool(SENDER_EMAIL),
        "receiver_configured": bool(RECEIVER_EMAIL),
        "default_threshold": DEFAULT_LOW_STOCK_THRESHOLD
    }
