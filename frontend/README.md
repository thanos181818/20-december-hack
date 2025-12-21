# ApparelDesk Frontend

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwindcss)](https://tailwindcss.com)

> Modern React frontend for the ApparelDesk e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your backend URL

# Run development server
npm run dev
```

### Access
- **Development:** http://localhost:8080

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Vite + React | Fast development & UI |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Beautiful components |
| Lucide React | Icons |
| React Query | Data fetching |
| Axios | HTTP client |

## 📁 Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/       # Admin dashboard components
│   │   ├── home/        # Homepage components
│   │   ├── layout/      # Layout components
│   │   ├── products/    # Product components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Authentication
│   │   ├── CartContext.tsx      # Shopping cart
│   │   └── AdminDataContext.tsx # Admin data
│   ├── pages/           # Page components
│   ├── lib/             # API & utilities
│   └── hooks/           # Custom hooks
├── public/
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── vercel.json
```

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com` |

## 🚀 Deployment (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set root directory: `frontend`
3. Framework: Vite
4. Add environment variable: `VITE_API_URL`
5. Deploy!

## 📝 License

MIT License - see [LICENSE](../LICENSE)