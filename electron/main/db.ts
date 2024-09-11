import path from "node:path";
import betterSqlite3 from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { app } from "electron";

interface Result {
    lastInsertRowid: number;
}
class DatabaseManager {
    private static db: betterSqlite3.Database | null = null;

    private static getDatabasePath(): string {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        if (app.isPackaged) {
            // In production, use userData directory
            return path.join(app.getPath("userData"), "databases/database.db");
        } else {
            // In development, use the current directory
            return path.join(__dirname, "database.db");
        }
    }

    public static initializeDatabase(): void {
        const dbPath = this.getDatabasePath();
        try {
            this.db = betterSqlite3(dbPath);
            console.log("Connected to the database.");

            // Create tables if they do not exist
            this.db.exec(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )`);

            this.db.exec(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                storeId INTEGER,
                qty INTEGER NOT NULL DEFAULT 0,
                increase INTEGER NOT NULL DEFAULT 0,
                decrease INTEGER NOT NULL DEFAULT 0,
                unitId INTEGER,
                createdDate TEXT,
                expiryDate TEXT,
                description TEXT,
                FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`);

            this.db.exec(`CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL
            )`);

            this.db.exec(`CREATE TABLE IF NOT EXISTS units (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL
            )`);
        } catch (err) {
            console.error("Could not open database", err);
        }
    }

    // ********************Users********************
    public static getUsers(): any[] {
        try {
            // Start with the base query
            let query = "SELECT * FROM users";

            // Execute the query
            const rows = this.db?.prepare(query).all();
            return rows || [];
        } catch (err) {
            console.error("Error retrieving users:", err);
            throw err;
        }
    }

    public static addUser(
        username: string,
        password: string,
        role: string
    ): { id?: number; username: string; role: string } {
        try {
            const stmt = this.db?.prepare(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
            );
            const result = stmt?.run(username, password, role) as Result;
            return {
                id: result?.lastInsertRowid,
                username,
                role,
            };
        } catch (err) {
            console.error("Error adding user:", err);
            throw err;
        }
    }

    public static updateUser(
        id: number,
        username: string,
        password: string,
        role: string
    ): { id: number; username: string; role: string } {
        try {
            const stmt = this.db?.prepare(
                "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?"
            );
            stmt?.run(username, password, role, id);
            return { id, username, role };
        } catch (err) {
            console.error("Error updating user:", err);
            throw err;
        }
    }

    public static deleteUser(id: number): { success: boolean } {
        try {
            const stmt = this.db?.prepare("DELETE FROM users WHERE id = ?");
            stmt?.run(id);
            return { success: true };
        } catch (err) {
            console.error("Error deleting user:", err);
            throw err;
        }
    }

    // ********************Products********************
    public static getProducts(): any[] {
        try {
            // Base query with joins
            let query = `
                SELECT 
                    products.*, 
                    stores.name AS storeName, 
                    units.name AS unitName
                FROM 
                    products
                LEFT JOIN 
                    stores ON products.storeId = stores.id
                LEFT JOIN 
                    units ON products.unitId = units.id
            `;

            // Prepare and execute the query
            const statement = this.db?.prepare(query);
            if (!statement) {
                throw new Error("Database statement preparation failed");
            }

            const rows = statement.all();
            return rows || [];
        } catch (err) {
            console.error("Error retrieving products:", err);
            throw err;
        }
    }

    public static addProduct(
        name: string,
        storeId: number | null,
        qty: number,
        increase: number,
        decrease: number,
        unitId: number | null,
        createdDate: string | null,
        expiryDate: string | null,
        description: string
    ): {
        id?: number;
        name: string;
        storeId: number | null;
        qty: number;
        increase: number;
        decrease: number;
        unitId: number | null;
        createdDate: string | null;
        expiryDate: string | null;
        description: string;
    } {
        try {
            const stmt = this.db?.prepare(
                `INSERT INTO products (name, storeId, qty, increase, decrease, unitId, createdDate, expiryDate, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );
            const result = stmt?.run(
                name,
                storeId ?? null,
                qty,
                increase,
                decrease,
                unitId ?? null,
                createdDate ?? null,
                expiryDate ?? null,
                description
            ) as Result;

            const productId = result?.lastInsertRowid;

            return {
                id: productId,
                name,
                storeId,
                qty,
                increase,
                decrease,
                unitId,
                createdDate,
                expiryDate,
                description,
            };
        } catch (err) {
            console.error("Error adding product:", err);
            throw err;
        }
    }

    public static updateProduct(
        id: number,
        name: string,
        storeId: number | null,
        qty: number,
        increase: number,
        decrease: number,
        unitId: number | null,
        createdDate: string | null,
        expiryDate: string | null,
        description: string
    ): {
        id: number;
        name: string;
        storeId: number | null;
        qty: number;
        increase: number;
        decrease: number;
        unitId: number | null;
        createdDate: string | null;
        expiryDate: string | null;
        description: string;
    } {
        try {
            const stmt = this.db?.prepare(
                `UPDATE products SET name = ?, storeId = ?, qty = ?, increase = ?, decrease = ?, unitId = ?, createdDate = ?, expiryDate = ?, description = ?
                 WHERE id = ?`
            );
            stmt?.run(
                name,
                storeId ?? null,
                qty,
                increase,
                decrease,
                unitId ?? null,
                createdDate ?? null,
                expiryDate ?? null,
                description,
                id
            );

            return {
                id,
                name,
                storeId,
                qty,
                increase,
                decrease,
                unitId,
                createdDate,
                expiryDate,
                description,
            };
        } catch (err) {
            console.error("Error updating product:", err);
            throw err;
        }
    }

    public static deleteProduct(id: number): { success: boolean } {
        try {
            // First, delete the product from the products table
            const deleteProductStmt = this.db?.prepare(
                "DELETE FROM products WHERE id = ?"
            );
            deleteProductStmt?.run(id);

            return { success: true };
        } catch (err) {
            console.error("Error deleting product:", err);
            throw err;
        }
    }

    // ********************Stores********************
    public static getStores(): any[] {
        try {
            const rows = this.db?.prepare("SELECT * FROM stores").all();
            return rows || [];
        } catch (err) {
            console.error("Error retrieving stores:", err);
            throw err;
        }
    }

    public static addStore(
        name: string,
        description: string
    ): { id?: number; name: string; description: string } {
        try {
            const stmt = this.db?.prepare(
                "INSERT INTO stores (name, description) VALUES (?, ?)"
            );
            const result = stmt?.run(name, description);
            return {
                id:
                    result?.lastInsertRowid !== undefined
                        ? Number(result.lastInsertRowid)
                        : 0,
                name,
                description,
            };
        } catch (err) {
            console.error("Error adding store:", err);
            throw err;
        }
    }

    public static updateStore(
        id: number,
        name: string,
        description: string
    ): { id: number; name: string; description: string } {
        try {
            const stmt = this.db?.prepare(
                "UPDATE stores SET name = ?, description = ? WHERE id = ?"
            );
            stmt?.run(name, description, id);
            return { id, name, description };
        } catch (err) {
            console.error("Error updating store:", err);
            throw err;
        }
    }

    public static deleteStore(id: number): { success: boolean } {
        try {
            // Ensure the database is initialized before running queries
            if (!this.db) {
                throw new Error("Database not initialized");
            }

            // Prepare statement to check the count of products associated with the store
            const countStmt = this.db.prepare(
                "SELECT COUNT(*) as count FROM products WHERE storeId = ?"
            );

            // Run the query and get the count of associated products
            const result = countStmt.get(id) as { count: number };

            // Check if there are any products associated with the store
            if (result.count > 0) {
                throw new Error(
                    "Cannot delete store because it has associated products."
                );
            }

            // Prepare and run the delete statement for the store
            const stmt = this.db.prepare("DELETE FROM stores WHERE id = ?");
            stmt.run(id);

            // Return success if deletion is successful
            return { success: true };
        } catch (err) {
            console.error("Error deleting store:", err);
            throw err;
        }
    }

    // ********************Units********************
    public static getUnits(): any[] {
        try {
            const rows = this.db?.prepare("SELECT * FROM units").all();
            return rows || [];
        } catch (err) {
            console.error("Error retrieving units:", err);
            throw err;
        }
    }

    public static addUnit(
        name: string,
        description: string
    ): { id?: number; name: string; description: string } {
        try {
            const stmt = this.db?.prepare(
                "INSERT INTO units (name, description) VALUES (?, ?)"
            );
            const result = stmt?.run(name, description);
            return {
                id:
                    result?.lastInsertRowid !== undefined
                        ? Number(result.lastInsertRowid)
                        : 0,
                name,
                description,
            };
        } catch (err) {
            console.error("Error adding unit:", err);
            throw err;
        }
    }

    public static updateUnit(
        id: number,
        name: string,
        description: string
    ): { id: number; name: string; description: string } {
        try {
            const stmt = this.db?.prepare(
                "UPDATE units SET name = ?, description = ? WHERE id = ?"
            );
            stmt?.run(name, description, id);
            return { id, name, description };
        } catch (err) {
            console.error("Error updating unit:", err);
            throw err;
        }
    }

    public static deleteUnit(id: number): { success: boolean } {
        try {
            // Ensure the database is initialized before running queries
            if (!this.db) {
                throw new Error("Database not initialized");
            }

            // Prepare statement to check the count of products associated with the store
            const countStmt = this.db.prepare(
                "SELECT COUNT(*) as count FROM products WHERE unitId = ?"
            );

            // Run the query and get the count of associated products
            const result = countStmt.get(id) as { count: number };

            // Check if there are any products associated with the store
            if (result.count > 0) {
                throw new Error(
                    "Cannot delete unit because it has associated products."
                );
            }

            // Prepare and run the delete statement for the store
            const stmt = this.db.prepare("DELETE FROM units WHERE id = ?");
            stmt.run(id);

            // Return success if deletion is successful
            return { success: true };
        } catch (err) {
            console.error("Error deleting store:", err);
            throw err;
        }
    }

    public static closeDatabase(): void {
        // No explicit close needed for better-sqlite3
        console.log("Database connection is closed.");
    }
}

export default DatabaseManager;
