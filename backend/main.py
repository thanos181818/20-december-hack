from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from db import init_db
from auth import router as auth_router
from orders import router as orders_router
from websocket_manager import manager

app = FastAPI(title="ApparelDesk API")

# --- FIX: Add CORS Middleware ---
# Origins that are allowed to make requests to this backend
origins = [
    "http://localhost:8080",  # Your Vite frontend
    "http://127.0.0.1:8080",
]

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