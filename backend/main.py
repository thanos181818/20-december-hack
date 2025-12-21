import os
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from backend.db import init_db
from backend.auth import router as auth_router
from backend.orders import router as orders_router
from backend.admin_api import router as admin_router
from backend.websocket_manager import manager
from backend.visual_search import router as visual_search_router
from backend.stock_alerts import router as stock_alerts_router

app = FastAPI(title="ApparelDesk API")

# --- CORS Middleware ---
# Get frontend URL from environment variable for production
frontend_url = os.getenv("FRONTEND_URL", "")

origins = [
    "http://localhost:8080",  # Your Vite frontend
    "http://127.0.0.1:8080",
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
]

# Add production frontend URL if set
if frontend_url:
    origins.append(frontend_url)
    # Also add without trailing slash
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(admin_router)
app.include_router(visual_search_router)
app.include_router(stock_alerts_router)

# --- WebSocket Endpoint for Admin ---
@app.websocket("/ws/admin")
async def websocket_endpoint(websocket: WebSocket):
    # In a real app, validate Admin Token in query param here
    # token = websocket.query_params.get("token")
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, maybe listen for admin pings
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)