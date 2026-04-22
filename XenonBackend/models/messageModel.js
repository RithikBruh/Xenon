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
    "INSERT INTO messages (sender, content) VALUES ($1, $2) RETURNING TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp",
    [username, message]
  );

  return result.rows[0].timestamp;
}

async function getMessages(){
    const result = await pool.query(
    "SELECT sender, id, content, pinned, TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp FROM messages ORDER BY timestamp ASC"
    );
    // console.log("Fetched messages from DB: " + JSON.stringify(result.rows));
    return result.rows;

}

export {
  saveMessage,
  getMessages,
};

