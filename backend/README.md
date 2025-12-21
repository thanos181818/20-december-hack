# ApparelDesk Backend API

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.125+-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)](https://postgresql.org)

> RESTful API backend for ApparelDesk e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL 15+

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn main:app --reload --port 8000
```

### Access API Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 📁 Structure

```
backend/
├── main.py              # FastAPI app entry point
├── db.py                # Database configuration
├── models.py            # SQLModel database models
├── auth.py              # Authentication & authorization
├── orders.py            # Order & invoice endpoints
├── admin_api.py         # Admin dashboard API
├── visual_search.py     # AI-powered image search
├── stock_alerts.py      # Low stock email notifications
├── websocket_manager.py # Real-time WebSocket handler
├── seed.py              # Database seeding script
├── reset_db.py          # Database reset utility
└── requirements.txt     # Python dependencies
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@localhost:5432/appareldesk` |
| `SECRET_KEY` | JWT signing key | Random 32+ char string |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourapp.vercel.app` |
| `ADMINS_JSON` | Admin credentials | `{"admins":[...]}` |
| `SMTP_SERVER` | Email server (optional) | `smtp.gmail.com` |
| `SENDER_EMAIL` | Alert sender email | `alerts@example.com` |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register customer |
| POST | `/auth/login` | Customer login |
| POST | `/auth/admin/login` | Admin login |
| GET | `/auth/me` | Get current user |

### Orders (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/create` | Create order |
| GET | `/orders/my-orders` | List user orders |
| GET | `/orders/order/{id}` | Get order detail |
| GET | `/orders/my-invoices` | List user invoices |
| GET | `/orders/invoice/{id}` | Get invoice detail |

### Admin - Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List products |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/{id}` | Update product |
| DELETE | `/admin/products/{id}` | Delete product |

### Admin - Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/sales-orders` | List sales orders |
| POST | `/admin/sales-orders` | Create sales order |
| GET | `/admin/purchase-orders` | List purchase orders |
| POST | `/admin/purchase-orders` | Create purchase order |

### Admin - Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/invoices` | List invoices |
| POST | `/admin/invoices` | Create invoice |
| GET | `/admin/vendor-bills` | List vendor bills |
| POST | `/admin/vendor-bills` | Create vendor bill |
| GET | `/admin/payments` | List payments |
| POST | `/admin/payments` | Record payment |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/visual-search` | Search by image |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stock-alerts/check` | Check low stock |
| POST | `/admin/stock-alerts/send-notification` | Send alert email |
| WS | `/ws/admin` | Real-time updates |

## 🗄️ Database Models

- **User** - Customer accounts
- **Contact** - Customers & vendors
- **Product** - Inventory items
- **SaleOrder** - Customer orders
- **PurchaseOrder** - Vendor orders
- **Invoice** - Customer invoices
- **VendorBill** - Vendor bills
- **Payment** - Payment records
- **PaymentTerm** - Payment terms/offers

## 🚀 Deployment (Render)

1. Create Web Service on Render
2. Connect GitHub repository
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

## 📝 License

MIT License - see [LICENSE](../LICENSE)
