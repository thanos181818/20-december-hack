# ApparelDesk 👗

[![Backend Deployment](https://img.shields.io/badge/Backend-Live-brightgreen?logo=render)](https://appareldesk-api.onrender.com)
[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)

> A modern, full-stack fashion e-commerce platform with AI-powered visual search, virtual try-on, and complete inventory management.

![ApparelDesk Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop)

## ✨ Features

### 🛒 Customer Features
- **Product Catalog** - Browse fashion items with beautiful UI
- **Visual Search** - Upload an image to find similar products using AI
- **Virtual Try-On** - 3D virtual fitting room experience
- **Shopping Cart** - Full cart management with checkout
- **Order Tracking** - Track order status and history
- **User Authentication** - Secure login/registration

### 📊 Admin Dashboard
- **Inventory Management** - Full CRUD for products
- **Sales Orders** - Create and manage customer orders
- **Purchase Orders** - Manage vendor purchases
- **Invoicing** - Generate and track invoices
- **Vendor Bills** - Track payables
- **Payment Management** - Record payments with terms
- **Low Stock Alerts** - Email notifications for low inventory
- **Real-time Updates** - WebSocket-powered live updates

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Modern Python web framework |
| SQLModel | SQL database ORM with Pydantic |
| PostgreSQL | Production database |
| AsyncPG | Async PostgreSQL driver |
| JWT | Secure authentication |
| WebSockets | Real-time updates |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| TypeScript | Type-safe JavaScript |
| Vite | Fast build tool |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Beautiful component library |
| React Query | Data fetching & caching |

### AI Features
| Technology | Purpose |
|------------|---------|
| Transformers | Hugging Face models |
| PyTorch | Deep learning |
| Three.js | 3D virtual try-on |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

### Local Development

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/appareldesk.git
cd appareldesk
```

#### 2. Start the Database
```bash
docker-compose up -d
```

#### 3. Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn main:app --reload --port 8000
```

#### 4. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

#### 5. Access the Application
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🌐 Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `SECRET_KEY` | JWT secret key |
   | `FRONTEND_URL` | Your Vercel frontend URL |
   | `ADMINS_JSON` | Admin credentials JSON |

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   | Variable | Description |
   |----------|-------------|
   | `VITE_API_URL` | Your Render backend URL |

## 📁 Project Structure

```
appareldesk/
├── backend/
│   ├── main.py           # FastAPI app entry
│   ├── db.py             # Database configuration
│   ├── models.py         # SQLModel database models
│   ├── auth.py           # Authentication routes
│   ├── orders.py         # Order & invoice routes
│   ├── admin_api.py      # Admin dashboard API
│   ├── visual_search.py  # AI visual search
│   ├── stock_alerts.py   # Low stock email alerts
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── lib/          # API & utilities
│   │   └── hooks/        # Custom hooks
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml    # Local PostgreSQL
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
SECRET_KEY=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
ADMINS_JSON={"admins":[{"email":"admin@example.com","password":"secure","name":"Admin"}]}
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## 📝 API Documentation

Once the backend is running, access interactive API docs at:
- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new customer |
| POST | `/auth/login` | Customer login |
| POST | `/auth/admin/login` | Admin login |
| GET | `/admin/products` | List all products |
| POST | `/orders/create` | Create new order |
| GET | `/orders/my-orders` | Get user's orders |
| POST | `/visual-search` | AI image search |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Hugging Face](https://huggingface.co/) - AI models

---

<p align="center">Made with ❤️ for the fashion industry</p>
