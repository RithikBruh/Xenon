import aiosqlite

DB_PATH = "chat.db"

async def run_sql(query: str, params: tuple = ()):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(query, params)
        await db.commit()



async def admin_command(msg, sender):
    msg_list  = msg.lower()[1:].split(" ")
    print(msg_list)

    if msg.strip() == "clear all":
        print("Clearing all messages...")
        await run_sql("DELETE FROM messages")

    elif msg_list[0]== "delete" and "-" not in msg_list[1]:
        index = msg_list[1]
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
        id= msg_list[2]
        await run_sql(
        """
        DELETE FROM messages
        WHERE id = ?
        """,
        (id,))
        print(f"Deleted message with id {id}.")

    else :
        print("error command")