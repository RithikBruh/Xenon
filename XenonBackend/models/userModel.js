import pool from "../config/db.js";

export async function getUser(username){
  const users = await pool.query(
    "SELECT username, password FROM users WHERE username = $1",
    [username]
  );
  return users.rows[0];
} 

export async function createTableIfnotExists(){
  await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
}

export async function createUser(username,password){
  await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]);
}