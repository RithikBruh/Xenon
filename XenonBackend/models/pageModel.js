import pool from "../config/db.js";

async function createTablesIfNotExists() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS pages (
            page_id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cells (
            cell_id SERIAL PRIMARY KEY,
            page_id INTEGER REFERENCES pages(page_id) ON DELETE CASCADE,
            title TEXT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS images (
            image_id SERIAL PRIMARY KEY,
            cell_id INTEGER REFERENCES cells(cell_id) ON DELETE CASCADE,
            image_path TEXT NOT NULL
        )
    `);
}
createTablesIfNotExists();

export async function createPage(name) {
    try {
        await pool.query(`INSERT INTO pages (name) VALUES ($1)`, [name]);
        return true ;
        
    } catch (error) {
        console.error("Error creating page :", error);
        return false ;
    }
}

export async function getPages() {
    return await pool.query(`SELECT name FROM pages`);
}

export async function createCell(page_name,title,content,image_paths) {
    const page_id = await pool.query(`SELECT page_id FROM pages WHERE name = $1`, [page_name]);
    const result =await pool.query(`INSERT INTO cells (page_id, title, content) VALUES ($1, $2, $3) RETURNING cell_id`, [page_id.rows[0].page_id, title, content]);
    const cell_id = result.rows[0].cell_id ;

    for (const image_path of image_paths){
        await pool.query(`INSERT INTO images (cell_id, image_path) VALUES ($1, $2)`, [cell_id, image_path]);
    }
}

// createPage("4doorsmorewhores")
// createCell("4doorsmorewhores","test title","test content",["path1","path2"])
