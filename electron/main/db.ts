import path from "node:path";
import sqlite3, { Database } from "sqlite3";
import { fileURLToPath } from "node:url";
// to rebuild db when needed
// npm rebuild sqlite3
let db: Database | null = null;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function initializeDatabase() {
    const dbPath = path.join(__dirname, "database.db");
    db = new sqlite3.Database(
        dbPath,
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        (err) => {
            if (err) {
                console.error("Could not open database", err);
            } else {
                console.log("Connected to the database.");
                db?.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )`);
            }
        }
    );
}

export function getUsers() {
    return new Promise((resolve, reject) => {
        db?.all("SELECT * FROM users", [], (err: Error | null, rows: any[]) => {
            if (err) {
                console.error("Error retrieving users:", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export function addUser(username: string, password: string, role: string) {
    return new Promise((resolve, reject) => {
        db?.run(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [username, password, role],
            function (err: Error | null) {
                if (err) {
                    console.error("Error adding user:", err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username, role });
                }
            }
        );
    });
}

export function updateUser(
    id: number,
    username: string,
    password: string,
    role: string
) {
    return new Promise((resolve, reject) => {
        db?.run(
            "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
            [username, password, role, id],
            (err: Error | null) => {
                if (err) {
                    console.error("Error updating user:", err);
                    reject(err);
                } else {
                    resolve({ id, username, role });
                }
            }
        );
    });
}

export function deleteUser(id: number) {
    return new Promise((resolve, reject) => {
        db?.run("DELETE FROM users WHERE id = ?", [id], (err: Error | null) => {
            if (err) {
                console.error("Error deleting user:", err);
                reject(err);
            } else {
                resolve({ success: true });
            }
        });
    });
}

export function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error("Error closing the database:", err);
            } else {
                console.log("Database closed.");
            }
        });
    }
}
