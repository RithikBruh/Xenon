import pool from "../config/db.js";

async function createTableIfnotExists(){
  await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        pinned BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created messages table if not exists")
}

createTableIfnotExists(); 

async function saveMessage(username,message){
  const result = await pool.query(
    "INSERT INTO messages (sender, content) VALUES ($1, $2) RETURNING id, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp",
    [username, message]
  );

  return {"id": result.rows[0].id, "timestamp": result.rows[0].timestamp};
}

async function getMessages(ids=null){
    if (ids) {
      const result = await pool.query(
        "SELECT sender, id, content, pinned, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp FROM messages WHERE id = ANY($1::int[]) ORDER BY timestamp ASC",
        [ids]
      );
      return result.rows;
    }

    const result = await pool.query(
    "SELECT sender, id, content, pinned, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp FROM messages ORDER BY timestamp ASC"
    );
    // console.log("Fetched messages from DB: " + JSON.stringify(result.rows));
    return result.rows;

}

async function deleteMessage(ids){
  const result = await pool.query(
    "DELETE FROM messages WHERE id = ANY($1::int[])",
    [ids]
  );
  return result.rowCount; // Number of rows deleted
}

async function deleteRange(idStart, idEnd){
  const result = await pool.query(
    "DELETE FROM messages WHERE id >= $1 AND id <= $2",
    [idStart, idEnd]
  );
  return result.rowCount; // Number of rows deleted
}

async function pinMessages(ids){
  const result = await pool.query(
    "UPDATE messages SET pinned = TRUE WHERE id = ANY($1)",
    [ids]
  );
  return result.rowCount;
}

async function getPinnedMessages(){
  const result = await pool.query(
    "SELECT sender, id, content, pinned, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp FROM messages WHERE pinned = TRUE ORDER BY timestamp ASC"
  );
  return result.rows;
}
export {
  saveMessage,
  getMessages,
  deleteMessage,
  deleteRange,
  pinMessages,
  getPinnedMessages
};

