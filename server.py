# server.py
import json
import asyncio
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import aiosqlite
import uvicorn

DB_PATH = "chat.db"

app = FastAPI()

# --- General SQL execution function ---
async def run_sql(query: str, params: tuple = ()):
    """Run a SQL query."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(query, params)
        await db.commit()


# --- Admin Command Func ---
async def admin_command(msg,sender):
    """Handle admin commands."""
    msg_list  = msg.lower()[1:].split(" ")
    print(msg_list)

    #TODO : help command



    if msg.strip() == "clear all":
        print("Clearing all messages...")
        await run_sql("DELETE FROM messages")

    elif msg_list[0]== "delete" and "-" not in msg_list[1]:
        #deletes everyones msgs # delete <index>
        index =msg_list[1]
        await run_sql(
        """
        DELETE FROM messages
        WHERE id IN (
            SELECT id FROM messages
            ORDER BY id DESC
            LIMIT ?
        )
        """,
        (index,))

    elif msg_list[0] == "delete" and msg_list[1] == "-me":
        # deletes senders msgs # delete -me <index>
        index = msg_list[2]
        await run_sql(
        """
        DELETE FROM messages
        WHERE id IN (
            SELECT id FROM messages
            WHERE sender = ?
            ORDER BY id DESC
            LIMIT ?
        )
        """,
        (sender, index))

        print(f"Deleted last {index} messages of {sender}.")

    elif msg_list[0] == "delete" and msg_list[1] == '-id':
        # delete a specific id message
        # delete -id <id>
        id= msg_list[2]
        await run_sql(
        """
        DELETE FROM messages
        WHERE id = ?
        """,
        (id,))
        print(f"Deleted message with id {id}.")

    else :
        print("error command") #TODO : admin msg

# --- Connection manager to track connected websockets ---
class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, message: dict):
        text = json.dumps(message)
        to_remove = []
        for conn in self.connections:
            try:
                await conn.send_text(text)
            except Exception:
                to_remove.append(conn)
        for r in to_remove:
            self.disconnect(r)

manager = ConnectionManager()

# --- Database helpers ---
async def init_db():
    """Initialize the database and create tables if they don't exist."""
    await run_sql("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            recipient TEXT,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

async def save_message(sender: str, recipient: str, message: str):

    if message[:5] == "$sudo":
        # Handle admin command
        await admin_command(message[5:],sender)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (sender, recipient, message) VALUES (?, ?, ?)",
            (sender, recipient, message)
        )
        await db.commit()

async def fetch_last_messages(limit: int = 50):
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "SELECT id, sender, recipient, message, timestamp FROM messages ORDER BY id DESC LIMIT ?",
            (limit,)
        )
        rows = await cur.fetchall()
        # return in chronological order
        return [
            {"id": r[0], "sender": r[1], "recipient": r[2], "message": r[3], "timestamp": r[4]}
            for r in reversed(rows)
        ]

# --- FastAPI startup event to init DB ---
@app.on_event("startup")
async def startup_event():
    await init_db()
    print("DB initialized.")

# --- HTTP endpoint to fetch last messages ---
@app.get("/messages")
async def get_messages(limit: int = 50):
    msgs = await fetch_last_messages(limit)
    return {"messages": msgs}

# --- WebSocket endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # connect and keep receiving
    await manager.connect(websocket)
    try:
        # optional: when a client connects you could send recent history
        recent = await fetch_last_messages(50)
        await websocket.send_text(json.dumps({"type": "history", "messages": recent}))

        while True:
            text = await websocket.receive_text()  # expects JSON string
            # expected payload: {"sender":"alice","recipient":"bob","message":"hi"}
            try:
                data = json.loads(text)
                sender = data.get("sender", "unknown")
                recipient = data.get("recipient")  # can be None for broadcast
                message = data.get("message", "")
            except json.JSONDecodeError:
                # ignore malformed messages
                continue

            # 1) persist in DB
            await save_message(sender, recipient, message)


            #TODO : change
            # 2) broadcast to all connected clients (simple approach)
            envelope = {
                "type": "message",
                "sender": sender,
                "recipient": recipient,
                "message": message
            }
            await manager.broadcast(envelope)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        # ensure connection is cleaned up on any error
        manager.disconnect(websocket)
        print("WebSocket error:", e)

# Run with: uvicorn server:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
