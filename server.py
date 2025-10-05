# server.py
import json
import asyncio
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import aiosqlite
import uvicorn
import jwt
import datetime
import auth

# --- Admin Command Func ---
from admin_commands import admin_command
# --------------------------

DB_PATH = "./data/chat.db"
# Secret key for JWT
SECRET = "a_very_long_random_string_with_letters_numbers_and_symbols_123!@#"
# TODO : use env variable for SECRET and update secret 
auth_data = auth.get_auth_data()
app = FastAPI()



# --- General SQL execution function ---
async def run_sql(query: str, params: tuple = (),inputs=None):
    """Run a SQL query."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(query, params)
        await db.commit()


# --- Connection manager to track connected websockets ---
class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()

        try:
            # Step 1: Wait for login message
            raw = await ws.receive_text()
            data = json.loads(raw)
            if data.get("type") != "login":
                print("Login Failed")
                await ws.send_text(json.dumps({
                    "type": "login_failed",
                    "message": "You must login first."
                }))

                await ws.close()
                return
            
            elif data.get("type") == "login" :
                username_entered = data.get("username")
                password_entered =  data.get("password").strip()



                # TODO : fetch from DB and hash

                if username_entered in auth_data.keys() and auth.verify_password( auth_data[username_entered],password_entered):

                    token = jwt.encode({
                        'username': username_entered,
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
                    }
                    , SECRET, algorithm='HS256'
                    )



                    await ws.send_text(json.dumps({
                    "type": "login_success",
                    "message": "GODD BOI.",
                    "token" : token
                }))
                    print(f"{username_entered} connected")
                    self.connections.append(ws)
                

                else :
                    # TODO : send reports to server console and store
                    print("login failed")
                    await ws.send_text(json.dumps({
                    "type": "login_failed",
                    "message": "Incorrect Cred Bitch!"
                }))
                    
                    await ws.close()


            
        except WebSocketDisconnect:
            print(f"{username_entered} disconnected")
        finally:
            if username_entered in self.connections:
                del self.connections[username_entered]

        
        

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, message: dict):
        text = json.dumps(message)
        to_remove = []
        # TODO : sending to a specific user only (just add an if statement)
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
            status TEXT ,
            token TEXT ,
            timestamp TEXT 
        )
    """)

    # async with aiosqlite.connect(DB_PATH) as db:
    #     data = await db.execute(
    #         "SELECT username,password FROM login_auth;"
    #     )
    #     rows = await data.fetchall()


            

async def save_message(sender: str, recipient: str, message: str,status :str,timestamp :str):
    """Saves a message to the database."""
    if message[:5] == "$sudo":
        # Handle admin command
        await admin_command(message[5:],sender)


    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (sender, recipient, message,status,timestamp) VALUES (?, ?, ?, ?, ?)",
            (sender, recipient, message,status ,timestamp)
        )
        await db.commit()

async def fetch_last_messages():
    """Fetch the last N messages from the database."""
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "SELECT id, sender, recipient, message, status, timestamp FROM messages ORDER BY id DESC",
        )
        rows = await cur.fetchall()
        # return in chronological order
        return [
            {"id": r[0], "sender": r[1], "recipient": r[2], "message": r[3],"status" : r[4], "timestamp": r[5]}
            for r in reversed(rows)
        ]

# --- FastAPI startup event to init DB ---
@app.on_event("startup")
async def startup_event():
    await init_db()
    print("DB initialized.")

# --- HTTP endpoint to fetch last messages ---
@app.get("/messages")
async def get_messages():
    msgs = await fetch_last_messages()
    return {"messages": msgs}



# -- Updating the status --
async def update_status(users_online) :
    recent = await fetch_last_messages()
    for msgs in recent :
        if  msgs['status'] == "unread" :
            rest_users = [user for user in users_online if user != msgs['sender']]
            if len(rest_users) > 0 :
                    # if any user except the sender himself is online
                    msgs['status'] = "read"
                    run_sql("UPDATE messages SET status = ? WHERE id = ?", ("read", msgs['id']))


    

# --- WebSocket endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # connect and keep receiving
    await manager.connect(websocket)
    try:
        # optional: when a client connects you could send recent history
    
        update_status(manager.connections)
        recent = await fetch_last_messages()

        await websocket.send_text(json.dumps({"type": "history", "messages": recent}))

        while True:
            text = await websocket.receive_text()  # expects JSON string
            # expected payload: {"sender":"alice","recipient":"bob","message":"hi",timestamp :  "yy-mm-dd hh:mm:ss"}
            try:
                
                data = json.loads(text)
                sender = data.get("sender", "unknown")
                recipient = data.get("recipient")  # can be None for broadcast
                message = data.get("message", "")
                status = data.get("status", "unread")
                timestamp = data.get("timestamp", "")
                token_sent = data.get("token")


                # verify token----------------------------
                try:
                    decoded = jwt.decode(token_sent, SECRET, algorithms=['HS256'])
                    token_username = decoded.get('username')
                    if token_username != sender:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Token username does not match sender."
                        }))
                        continue
                
                except jwt.ExpiredSignatureError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Token has expired. Please login again."
                    }))
                    continue
                except jwt.InvalidTokenError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid token. Please login again."
                    }))
                    continue
                #---------------------------------------------

                
            except json.JSONDecodeError:
                # ignore malformed messages
                continue

            # 1) persist in DB
            await save_message(sender, recipient, message,status,timestamp)


            #TODO : change
            # 2) broadcast to all connected clients (simple approach)
            envelope = {
                "type": "message",
                "sender": sender,
                "recipient": recipient,
                "message": message,
                "status" : "unread",
                "timestamp": timestamp
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
    # TODO : use TLS
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
