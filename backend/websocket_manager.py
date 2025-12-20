from fastapi import WebSocket
from typing import List
import json

class ConnectionManager:
    def __init__(self):
        # We store list of active admin sockets
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_stock_update(self, product_id: int, new_stock: int):
        """
        Push state change to Electron Admin App.
        Frontend should listen to this and update React Context immediately.
        """
        payload = {
            "type": "STOCK_UPDATE",
            "product_id": product_id,
            "new_stock": new_stock,
            "timestamp": str(datetime.now())
        }
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(payload))
            except:
                # Handle disconnected clients gracefully
                pass

manager = ConnectionManager()