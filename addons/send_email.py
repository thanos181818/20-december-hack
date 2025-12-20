import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- 1. CONFIGURATION ---
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")


# --- 2. SAMPLE DATA (Mocking the Odoo Database) ---
MOCK_PRODUCTS = [
    {
        "default_code": "TSHIRT-01",
        "name": "ApparelDesk Cotton Shirt",
        "qty_available": 5,
        "incoming_qty": 20,
        "qty_low_stock_notify": 80,
        "active": True,
        "sale_ok": True
    },
    {
        "default_code": "HOODIE-99",
        "name": "Heavy Winter Hoodie",
        "qty_available": 150,
        "incoming_qty": 0,
        "qty_low_stock_notify": 80,
        "active": True,
        "sale_ok": True
    }
]

# --- 3. LOGIC ---
def simulate_low_stock_email():
    header_label_list = ["SKU", "Name", "Qty On Hand", "Qty Incoming", "Low Stock Qty"]

    html_body = """
    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #222;">
        <h1>Low Stock Report for Today:</h1>
        <table border="1" cellpadding="5" style="border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;">
                <th>{}</th><th>{}</th><th>{}</th><th>{}</th><th>{}</th>
            </tr>
    """.format(*header_label_list)

    low_stock_found = False

    for product in MOCK_PRODUCTS:
        if product["qty_available"] <= product["qty_low_stock_notify"]:
            low_stock_found = True
            html_body += f"""
                <tr>
                    <td>{product['default_code']}</td>
                    <td>{product['name']}</td>
                    <td align="center">{product['qty_available']}</td>
                    <td align="center">{product['incoming_qty']}</td>
                    <td align="center">{product['qty_low_stock_notify']}</td>
                </tr>
            """

    html_body += "</table></div>"

    if not low_stock_found:
        print("No low stock items found.")
        return

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECEIVER_EMAIL
    msg['Subject'] = "Low Stock Report - ApparelDesk AI"
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("✅ Email sent successfully!")
    except Exception as e:
        print("❌ Error:", e)


if __name__ == "__main__":
    simulate_low_stock_email()
