import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";
import {getPages} from "../models/pageModel.js";

const router = express.Router();

async function createFilesTableIfNotExists() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS files (
      id UUID PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

createFilesTableIfNotExists();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      uuidv4() + "-" + file.originalname;

    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// TODO : PROTECTION middleware
router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
    console.log("Received file upload request:", file);
      if (!file) {
        return res.status(400).json({
          message: "No file uploaded. Use form-data with field name 'file'."
        });
      }

      // Save metadata in PostgreSQL
      await db.query(`
        INSERT INTO files
        (id, file_name, file_path, file_size)
        VALUES ($1,$2,$3,$4)
      `,[
        uuidv4(),
        file.originalname,
        file.filename,
        file.size
      ]);

      res.json({
        message: "Uploaded successfully"
      });
      console.log(`File uploaded: ${file.originalname} (${file.size} bytes)`);
    } catch (error) {
      console.error("File upload failed:", error);
      res.status(500).json({ message: "File upload failed" });
    }
});


router.get("/", async (req, res) => {

  const files = await db.query(`
      SELECT * FROM files
  `);

  console.log("Fetched files from DB: " + JSON.stringify(files.rows));
  res.json(files.rows);
});


router.get("/download/:id", async (req, res) => {

  const file = await db.query(
    "SELECT * FROM files WHERE id=$1",
    [req.params.id]
  );

  const filePath =
    "uploads/" + file.rows[0].file_path;

  res.download(filePath);
});


router.get("/pages", async (req, res) => {

})
export default router;

