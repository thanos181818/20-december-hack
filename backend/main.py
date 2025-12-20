from fastapi import FastAPI, WebSocket
from db import init_db
from auth import router as auth_router
from orders import router as orders_router
from websocket_manager import manager

app = FastAPI(title="ApparelDesk API")

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