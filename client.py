# client.py
import asyncio
import json
import websockets

SERVER = "ws://127.0.0.1:8000/ws"  # local server address
SERVER = "ws://100.115.241.16:8000/ws"  # local server address

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
        payload = {"sender": name, "recipient": None, "message": text}
        await ws.send(json.dumps(payload))

async def main():
    name = input("Your name: ").strip() or "anon"
    async with websockets.connect(SERVER) as ws:
        # start receiver in background
        recv_task = asyncio.create_task(receiver(ws))
        send_task = asyncio.create_task(sender(ws, name))
        done, pending = await asyncio.wait(
            [recv_task, send_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for p in pending:
            p.cancel()

if __name__ == "__main__":
    asyncio.run(main())
