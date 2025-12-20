import os
import torch
import smtplib
from flask import Flask, request, jsonify
from PIL import Image
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from transformers import CLIPProcessor, CLIPModel
from torch.nn.functional import cosine_similarity
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

app = Flask(__name__)

# --- CONFIGURATION ---
PORT = 9999
UPLOAD_FOLDER = 'uploads'
CATALOG_FOLDER = 'catalog_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# SMTP Config from your .env
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT")) if os.getenv("SMTP_PORT") else 587
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")

# --- DATA FROM YOUR LOW STOCK MODEL ---
MOCK_PRODUCTS = [
    {
        "default_code": "TSHIRT-01",
        "name": "ApparelDesk Cotton Shirt",
        "qty_available": 5,
        "incoming_qty": 20,
        "qty_low_stock_notify": 80,
    },
    {
        "default_code": "HOODIE-99",
        "name": "Heavy Winter Hoodie",
        "qty_available": 75,
        "incoming_qty": 0,
        "qty_low_stock_notify": 80,
    }
]

# --- INITIALIZE VISION ENGINE ---
print("🚀 Loading Vision Engine (CLIP)...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# --- HELPER FUNCTIONS ---

def get_image_embedding(image_path):
    """Converts an image into a mathematical vector using CLIP"""
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embeddings = model.get_image_features(**inputs)
    return embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)

def send_low_stock_email(html_content):
    """Sends the generated report via SMTP"""
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECEIVER_EMAIL
    msg['Subject'] = "Low Stock Report - ApparelDesk AI"
    msg.attach(MIMEText(html_content, 'html'))

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.send_message(msg)
    server.quit()

# --- API ROUTES ---

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "service": "ApparelDesk AI Agentic Middleware",
        "status": "Online",
        "port": PORT,
        "vision_model": "CLIP-ViT-B/32"
    })

@app.route('/visual-search', methods=['POST'])
def visual_search():
    """Endpoint for Visual Search matching"""
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # 1. Get embedding for query
    query_vec = get_image_embedding(filepath)
    
    best_match = None
    highest_similarity = -1
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')

    # 2. Search Catalog folder
    if not os.path.exists(CATALOG_FOLDER):
        return jsonify({"error": "Catalog folder not found"}), 500

    for filename in os.listdir(CATALOG_FOLDER):
        if filename.lower().endswith(valid_extensions):
            db_path = os.path.join(CATALOG_FOLDER, filename)
            db_vec = get_image_embedding(db_path)
            sim = cosine_similarity(query_vec, db_vec).item()
            
            if sim > highest_similarity:
                highest_similarity = sim
                best_match = filename

    return jsonify({
        "best_match": best_match,
        "similarity_score": round(highest_similarity, 4),
        "input_processed": filename
    })

@app.route('/notify-low-stock', methods=['GET'])
def notify_low_stock():
    """Endpoint to trigger your Low Stock Email logic"""
    header_label_list = ["SKU", "Name", "Qty On Hand", "Qty Incoming", "Low Stock Qty"]
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
        <h2 style="color: #d9534f;">⚠️ ApparelDesk Low Stock Report</h2>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
                {''.join([f'<th>{h}</th>' for h in header_label_list])}
            </tr>
    """

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

    html_body += "</table><p><i>Report generated autonomously by ApparelDesk AI Agent.</i></p></div>"

    if not low_stock_found:
        return jsonify({"status": "Idle", "message": "All stock levels normal."})

    try:
        send_low_stock_email(html_body)
        return jsonify({
            "status": "Success", 
            "message": "Low stock email dispatched.",
            "items_reported": len(MOCK_PRODUCTS)
        })
    except Exception as e:
        return jsonify({"status": "Error", "details": str(e)}), 500

if __name__ == '__main__':
    print(f"✅ Service running on http://127.0.0.1:{PORT}")
    app.run(port=PORT, debug=False)