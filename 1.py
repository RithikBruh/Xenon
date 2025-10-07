import aiosqlite
import asyncio

DB_PATH = "./data/chat.db"

async def get_message_id():
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "SELECT id FROM messages ORDER BY id DESC LIMIT 1",
        )
        row = await cur.fetchone()
        return row[0]

async def main():
    id = await get_message_id()
    print(id)

if __name__ == "__main__":
    asyncio.run(main())