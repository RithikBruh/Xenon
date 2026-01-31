# client.py
import asyncio
import json
import websockets
from datetime import datetime

def get_timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

SERVER = "ws://127.0.0.1:8000/ws"  # local server address
SERVER = "ws://100.100.154.45:8000/ws"  # tail scale ip of *server

token = None

# For Tailscale later, replace with: ws://<tailscale-ip>:8000/ws

async def receiver(ws):
    async for msg in ws:
        try:
            data = json.loads(msg)
        except:
            print("raw:", msg)
            continue

        t = data.get("type")
        if t == "history":
            print("--- Chat history ---")
            for m in data.get("messages", []):
                print(f"[{m['timestamp']}] {m['sender']}: {m['message']}")
            print("--------------------")
        elif t == "message":
            sender = data.get("sender")
            message = data.get("message")
            print(f"\n{sender}: {message}")
        else:
            print("unknown envelope:", data)

async def sender(ws, name):
    loop = asyncio.get_event_loop()
    while True:
        # run blocking input in executor so it doesn't block the event loop
        text = await loop.run_in_executor(None, input, "")
        if not text:
            continue

        timestamp = get_timestamp()
        #TODO : recipient custom
        payload = {"sender": name, "recipient": None, "message": text,"token":token,"timestamp":timestamp}
        await ws.send(json.dumps(payload))

async def main():
    name = username
    async with websockets.connect(SERVER) as ws:

        # 🔑 Send login packet first
        login_payload = {
            "type": "login",
            "username": username,
            "password": password
        }

        await ws.send(json.dumps(login_payload))


        # wai for response
        response = json.loads(await ws.recv())
        if response.get("type") == "login_failed":
            print("❌ Login failed:", response.get("message"))
            return #TODO : Do not close the program
        elif response.get("type") == "login_success":
            print("✅ Login successful!")
            global token
            token = response.get("token")

        # start receiver in background (login success)
        recv_task = asyncio.create_task(receiver(ws))
        send_task = asyncio.create_task(sender(ws, name))
        
        done, pending = await asyncio.wait(
            [recv_task, send_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for p in pending:
            p.cancel()



if __name__ == "__main__":
    username = input("Username : ")
    password = input("Passoword : ")

    
    asyncio.run(main())
