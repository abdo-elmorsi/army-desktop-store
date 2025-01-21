import path from "node:path";
import betterSqlite3 from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { app } from "electron";
import { format } from "date-fns";

function sum(arr: [], prop: string) {
    return arr.reduce((accumulator, object) => {
        return accumulator + (prop ? +object[prop] : object);
    }, 0);
}

interface User {
    id?: number;
    username: string;
    password: string;
    role: string | null;
}
interface Product {
    id?: number;
    name: string;
    storeId: number | null;
    unitId: number | null;
    createdDate: string | null;
    expiryDate: string | null;
    description: string;
    balance?: number;
}

interface Transaction {
    id?: number;
    productId: number;
    increase: number;
    decrease: number;
    description: string;
    createdAt: string;
}

interface Store {
    id?: number;
    name: string;
    description: string | null;
}
interface Unit {
    id?: number;
    name: string;
    description: string | null;
}

interface Result {
    lastInsertRowid: number;
}

interface TotalResult {
    totalCount: number;
}

class DatabaseManager {
    private static db: betterSqlite3.Database | null = null;

    private static getDatabasePath(): string {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return app.isPackaged
            ? path.join(app.getPath("userData"), "databases/database.db")
            : path.join(__dirname, "../../src/db/database.db");
    }

    public static initializeDatabase(): void {
        const dbPath = this.getDatabasePath();
        try {
            this.db = betterSqlite3(dbPath);
            console.log("Connected to the database.");

            // Create tables if they do not exist
            this.createTables();
        } catch (err) {
            console.error("Could not open database:", err);
        }
    }

    private static createTables(): void {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                storeId INTEGER,
                unitId INTEGER,
                createdDate TEXT,
                expiryDate TEXT,
                description TEXT,
                FOREIGN KEY (storeId) REFERENCES stores(id),
                FOREIGN KEY (unitId) REFERENCES units(id)
            )`,
            `CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                productId INTEGER NOT NULL,
                increase INTEGER NOT NULL DEFAULT 0,
                decrease INTEGER NOT NULL DEFAULT 0,
                createdAt TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (productId) REFERENCES products(id)
            )`,
            `CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description
            )`,
            `CREATE TABLE IF NOT EXISTS units (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description
            )`,
        ];

        queries.forEach((query) => {
            this.db?.exec(query);
        });

        // // Check and add missing columns
        // const columnCheck = this.db
        //     ?.prepare(`PRAGMA table_info(transactions);`)
        //     .all();
        // console.log({ columnCheck });

        // const descriptionColumnExists = columnCheck?.some(
        //     (column: any) => column.name === "description"
        // );
        // console.log({ descriptionColumnExists });

        // if (!descriptionColumnExists) {
        //     this.db?.exec(
        //         `ALTER TABLE transactions ADD COLUMN description TEXT;`
        //     );
        // }
    }

    private static prepareStatement(
        query: string
    ): betterSqlite3.Statement | undefined {
        try {
            return this.db?.prepare(query);
        } catch (err) {
            console.error("Error preparing statement:", err);
            return undefined;
        }
    }

    public static async getTransactionsForProduct(
        productId: number,
        endDate: string | undefined
    ): Promise<{
        increase: number;
        decrease: number;
        balance: number;
        lastTransaction: any | null;
    } | null> {
        const transactions = await this.getTransactions(productId, endDate);
        if (!transactions) return null;
        const data = (transactions.data as []) || [];
        const totalIncrease = sum(data, "increase");
        const totalDecrease = sum(data, "decrease");

        // Assuming transactions are sorted by date (oldest to newest), get the last transaction

        const lastTransactions =
            (transactions?.data?.filter(
                (tx) =>
                    tx.createdAt ===
                    format(new Date(endDate ?? new Date()), "yyyy-MM-dd")
            ) as []) || [];

        return {
            increase: totalIncrease,
            decrease: totalDecrease,
            balance: totalIncrease - totalDecrease,
            lastTransaction: {
                increase: sum(lastTransactions, "increase"),
                decrease: sum(lastTransactions, "decrease"),
            },
        };
    }

    // ******************** Users ********************
    public static getUsers(): User[] {
        const query = "SELECT * FROM users";
        return this.executeQuery(query);
    }

    public static addUser(
        username: string,
        password: string,
        role: string
    ): { id?: number; username: string; role: string } {
        const stmt = this.prepareStatement(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
        );
        const result = stmt?.run(username, password, role) as Result;
        return { id: result?.lastInsertRowid, username, role };
    }

    public static updateUser(
        id: number,
        username: string,
        password: string,
        role: string
    ): { id: number; username: string; role: string } {
        const stmt = this.prepareStatement(
            "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?"
        );
        stmt?.run(username, password, role, id);
        return { id, username, role };
    }

    public static deleteUser(id: number): { success: boolean } {
        const stmt = this.prepareStatement("DELETE FROM users WHERE id = ?");
        stmt?.run(id);
        return { success: true };
    }

    // ******************** Products ********************
    public static async getProducts(endDate?: string): Promise<Product[]> {
        const baseQuery = `
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

        const statement = this.prepareStatement(baseQuery);
        if (!statement) return [];

        let rows = statement.all();

        const productsWithBalances = await Promise.all(
            rows.map(async (product: any) => {
                const balance = await this.getTransactionsForProduct(
                    product.id,
                    endDate
                );
                return { ...product, ...balance };
            })
        );

        return productsWithBalances;
    }

    public static async getProductById(
        productId: number
    ): Promise<Product | null> {
        const query = `
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
            WHERE 
                products.id = ?
        `;
        const stmt = this.prepareStatement(query);
        const product = stmt?.get(productId) as Product | null;

        if (!product) return null;

        const balance = await this.getTransactionsForProduct(
            product.id!,
            format(new Date(), "yyyy-MM-dd")
        );

        return { ...product, ...balance };
    }

    public static addProduct(
        name: string,
        storeId: number | null,
        unitId: number | null,
        createdDate: string | null,
        expiryDate: string | null,
        description: string
    ): Product {
        const stmt = this.prepareStatement(
            `INSERT INTO products (name, storeId, unitId, createdDate, expiryDate, description) VALUES (?, ?, ?, ?, ?, ?)`
        );
        const result = stmt?.run(
            name,
            storeId ?? null,
            unitId ?? null,
            createdDate ?? null,
            expiryDate ?? null,
            description
        ) as Result;

        return {
            id: result?.lastInsertRowid,
            name,
            storeId,
            unitId,
            createdDate,
            expiryDate,
            description,
        };
    }

    public static updateProduct(
        id: number,
        name: string,
        storeId: number | null,
        unitId: number | null,
        createdDate: string | null,
        expiryDate: string | null,
        description: string
    ): Product {
        const stmt = this.prepareStatement(
            `UPDATE products SET name = ?, storeId = ?, unitId = ?, createdDate = ?, expiryDate = ?, description = ? WHERE id = ?`
        );
        stmt?.run(
            name,
            storeId ?? null,
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
            unitId,
            createdDate,
            expiryDate,
            description,
        };
    }

    public static deleteProduct(id: number): { success: boolean } {
        // First, delete transactions associated with the product
        const deleteTransactionsStmt = this.prepareStatement(
            "DELETE FROM transactions WHERE productId = ?"
        );
        deleteTransactionsStmt?.run(id);

        // Now, delete the product
        const stmt = this.prepareStatement("DELETE FROM products WHERE id = ?");
        stmt?.run(id);

        return { success: true };
    }

    // ******************** Transactions ********************

    public static async getTransactions(
        productId?: number,
        endDate?: string,
        searchDate?: string,
        limit?: number,
        offset?: number
    ): Promise<{
        data: Transaction[];
        pagination: { totalRecords: number; totalPages: number };
    }> {
        // Format endDate if provided
        endDate = endDate ? format(new Date(endDate), "yyyy-MM-dd") : undefined;

        // Base query to fetch transactions and join with product names
        let query = `
            SELECT 
                transactions.*, 
                products.name AS productName 
            FROM 
                transactions
            LEFT JOIN 
                products ON transactions.productId = products.id
        `;
        const conditions: string[] = [];
        const params: (number | string)[] = [];

        // Add productId filter if provided
        if (productId) {
            conditions.push("transactions.productId = ?");
            params.push(productId);
        }

        // If endDate is provided, fetch all transactions until this date
        if (endDate) {
            conditions.push("transactions.createdAt <= ?");
            params.push(endDate);
        }

        // Add searchDate filter if provided
        if (searchDate) {
            // Search for dates that contain the searchDate substring
            conditions.push("transactions.createdAt LIKE ?");
            params.push(`%${searchDate}%`);
        }

        // Append conditions to the query if there are any
        if (conditions.length) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        // Order by createdAt date
        query += ` ORDER BY transactions.createdAt DESC`; // Use ASC for ascending order

        // Get total count of records
        const countQuery = `SELECT COUNT(*) AS totalCount FROM (${query}) AS subquery`;
        const countStmt = this.prepareStatement(countQuery);
        const totalResult = countStmt?.get(...params) as TotalResult;
        const totalRecords = totalResult?.totalCount || 0;

        // Calculate total pages
        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;

        // Add pagination if limit is provided
        if (limit !== undefined) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset || 0);
        }

        // Prepare and execute the main SQL statement
        const stmt = this.prepareStatement(query);
        const data = stmt?.all(...params) as Transaction[];

        // Return data and pagination info
        return {
            data,
            pagination: {
                totalRecords,
                totalPages,
            },
        };
    }

    public static async getTransactionById(
        transactionId: number
    ): Promise<Transaction | null> {
        const query = `
            SELECT * FROM transactions WHERE id = ?`;
        const stmt = this.prepareStatement(query);
        const transaction = stmt?.get(transactionId) as Transaction | null;

        // Check if transaction is null before proceeding
        if (!transaction) {
            return null; // Or handle error case as per your needs
        }

        return transaction || null;
    }

    public static getFirstTransactionDate(): string | null {
        const query = `SELECT MIN(createdAt) as firstDate FROM transactions`;
        const stmt = this.prepareStatement(query);
        const result = stmt?.get() as { firstDate: string | null };
        return result?.firstDate || null;
    }
    public static deleteAllTransactions(productId: number): boolean {
        const query = `DELETE FROM transactions WHERE productId = ?`;
        const stmt = this.prepareStatement(query);

        try {
            const result = stmt?.run(productId);
            // Use optional chaining and default value for changes
            return (result?.changes ?? 0) > 0;
        } catch (err) {
            console.error("Error deleting transactions:", err);
            return false; // Return false in case of an error
        }
    }

    public static addTransaction(
        productId: number,
        increase: number,
        decrease: number,
        description: string,
        createdAt: string
    ): Transaction {
        // const createdAt = format(new Date(), "yyyy-MM-dd");

        const stmt = this.prepareStatement(
            "INSERT INTO transactions (productId, increase, decrease, description, createdAt) VALUES (?, ?, ?, ?, ?)"
        );
        const result = stmt?.run(
            productId,
            increase,
            decrease,
            description,
            format(createdAt, "yyyy-MM-dd")
        ) as Result;
        return {
            id: result?.lastInsertRowid,
            productId,
            increase,
            decrease,
            description,
            createdAt,
        };
    }

    public static updateTransaction(
        id: number,
        increase: number,
        decrease: number,
        description: string
    ): {
        id: number;
        increase: number;
        decrease: number;
        description: string;
    } {
        const stmt = this.prepareStatement(
            "UPDATE transactions SET  increase = ?, decrease = ?, description = ? WHERE id = ?"
        );
        stmt?.run(increase, decrease, description, id);
        return { id, increase, decrease, description };
    }

    public static deleteTransaction(id: number): { success: boolean } {
        const stmt = this.prepareStatement(
            "DELETE FROM transactions WHERE id = ?"
        );
        stmt?.run(id);
        return { success: true };
    }

    // ******************** Stores ********************
    public static getStores(): Store[] {
        const query = "SELECT * FROM stores";
        return this.executeQuery(query);
    }

    public static addStore(name: string, description: string): Store {
        const stmt = this.prepareStatement(
            "INSERT INTO stores (name, description) VALUES (?, ?)"
        );
        const result = stmt?.run(name, description) as Result;
        return { id: result?.lastInsertRowid, name, description };
    }

    public static updateStore(
        id: number,
        name: string,
        description: string
    ): Store {
        const stmt = this.prepareStatement(
            "UPDATE stores SET name = ?, description = ? WHERE id = ?"
        );
        stmt?.run(name, description, id);
        return { id, name, description };
    }

    public static deleteStore(id: number): { success: boolean } {
        const stmt = this.prepareStatement("DELETE FROM stores WHERE id = ?");
        stmt?.run(id);
        return { success: true };
    }

    // ******************** Units ********************
    public static getUnits(): Unit[] {
        const query = "SELECT * FROM units";
        return this.executeQuery(query);
    }

    public static addUnit(name: string, description: string): Unit {
        const stmt = this.prepareStatement(
            "INSERT INTO units (name, description) VALUES (?, ?)"
        );
        const result = stmt?.run(name, description) as Result;
        return { id: result?.lastInsertRowid, name, description };
    }

    public static updateUnit(
        id: number,
        name: string,
        description: string
    ): Unit {
        const stmt = this.prepareStatement(
            "UPDATE units SET name = ?, description = ? WHERE id = ?"
        );
        stmt?.run(name, description, id);
        return { id, name, description };
    }

    public static deleteUnit(id: number): { success: boolean } {
        const stmt = this.prepareStatement("DELETE FROM units WHERE id = ?");
        stmt?.run(id);
        return { success: true };
    }

    private static executeQuery(query: string): any[] {
        try {
            const rows = this.db?.prepare(query).all();
            return rows || [];
        } catch (err) {
            console.error("Error executing query:", err);
            throw err;
        }
    }

    public static closeDatabase(): void {
        // No explicit close needed for better-sqlite3
        console.log("Database connection is closed.");
    }
}

export default DatabaseManager;
