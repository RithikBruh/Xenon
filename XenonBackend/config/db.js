import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

if (typeof process.env.DB_PASSWORD !== "string") {
  throw new Error("DB_PASSWORD is missing in .env. Set it to your PostgreSQL password.");
}

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "xenon",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export default pool;

