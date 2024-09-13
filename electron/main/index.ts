import { app, BrowserWindow, shell, ipcMain, Menu, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import DatabaseManager from "./db"; // Import the DatabaseManager class

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId(app.getName());
if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const isProduction = true;

async function createWindow() {
    win = new BrowserWindow({
        title: "ادارة المخازن",
        icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
        fullscreen: false,
        frame: true,
        webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(indexHtml);
    }

    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString()
        );
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("https:")) shell.openExternal(url);
        return { action: "deny" };
    });
}

function createMenu() {
    if (!isProduction) {
        const menu = Menu.buildFromTemplate([
            {
                label: "Edit",
                submenu: [
                    { role: "undo" },
                    { role: "redo" },
                    { type: "separator" },
                    { role: "cut" },
                    { role: "copy" },
                    { role: "paste" },
                    { role: "selectAll" },
                ],
            },
            {
                label: "View",
                submenu: [
                    { role: "reload" },
                    { role: "toggleDevTools" },
                    { type: "separator" },
                    { role: "resetZoom" },
                    { role: "zoomIn" },
                    { role: "zoomOut" },
                ],
            },
        ]);
        Menu.setApplicationMenu(menu);
    } else {
        Menu.setApplicationMenu(null);
    }
}

app.whenReady().then(() => {
    DatabaseManager.initializeDatabase(); // Initialize the database
    createWindow();
    createMenu();

    // ********************Users********************
    ipcMain.handle("get-users", async () => {
        return DatabaseManager.getUsers();
    });

    ipcMain.handle("add-users", async (_, username, password, role) => {
        return DatabaseManager.addUser(username, password, role);
    });

    ipcMain.handle("update-users", async (_, id, username, password, role) => {
        return DatabaseManager.updateUser(id, username, password, role);
    });

    ipcMain.handle("delete-users", async (_, id) => {
        return DatabaseManager.deleteUser(id);
    });

    // ********************Products********************

    ipcMain.handle("get-products", async (_, endDate?: string) => {
        return DatabaseManager.getProducts(endDate);
    });
    ipcMain.handle("get-products-by-id", async (_, productId) => {
        return DatabaseManager.getProductById(productId);
    });

    ipcMain.handle(
        "add-products",
        async (
            _,
            name,
            storeId,
            unitId,
            createdDate,
            expiryDate,
            description
        ) => {
            return DatabaseManager.addProduct(
                name,
                storeId,
                unitId,
                createdDate,
                expiryDate,
                description
            );
        }
    );

    ipcMain.handle(
        "update-products",
        async (
            _,
            id,
            name,
            storeId,
            unitId,
            createdDate,
            expiryDate,
            description
        ) => {
            return DatabaseManager.updateProduct(
                id,
                name,
                storeId,
                unitId,
                createdDate,
                expiryDate,
                description
            );
        }
    );

    ipcMain.handle("delete-products", async (_, id) => {
        return DatabaseManager.deleteProduct(id);
    });

    // ********************Transactions********************
    ipcMain.handle(
        "get-transactions",
        async (_, productId?: number, startDate?: string) => {
            return DatabaseManager.getTransactions(productId, startDate);
        }
    );

    ipcMain.handle(
        "add-transactions",
        async (_, productId: number, increase: number, decrease: number) => {
            return DatabaseManager.addTransaction(
                productId,
                increase,
                decrease
            );
        }
    );

    ipcMain.handle(
        "update-transactions",
        async (_, id: number, increase: number, decrease: number) => {
            return DatabaseManager.updateTransaction(id, increase, decrease);
        }
    );

    ipcMain.handle("delete-transactions", async (_, id: number) => {
        return DatabaseManager.deleteTransaction(id);
    });

    // ********************Stores********************

    ipcMain.handle("get-stores", async () => {
        return DatabaseManager.getStores();
    });

    ipcMain.handle("add-stores", async (_, name, description) => {
        return DatabaseManager.addStore(name, description);
    });

    ipcMain.handle("update-stores", async (_, id, name, description) => {
        return DatabaseManager.updateStore(id, name, description);
    });

    ipcMain.handle("delete-stores", async (_, id) => {
        return DatabaseManager.deleteStore(id);
    });

    // ********************Units********************

    ipcMain.handle("get-units", async () => {
        return DatabaseManager.getUnits();
    });

    ipcMain.handle("add-units", async (_, name, description) => {
        return DatabaseManager.addUnit(name, description);
    });

    ipcMain.handle("update-units", async (_, id, name, description) => {
        return DatabaseManager.updateUnit(id, name, description);
    });

    ipcMain.handle("delete-units", async (_, id) => {
        return DatabaseManager.deleteUnit(id);
    });

    ipcMain.handle("show-prompt", async (_, message) => {
        const { response, checkboxChecked } = await dialog.showMessageBox({
            type: "question",
            buttons: ["Cancel", "OK"],
            defaultId: 1,
            title: "تحذير",
            message: message,
        });

        return response === 1
            ? checkboxChecked
                ? "Remembered Value"
                : "OK Value"
            : null;
    });
});

app.on("window-all-closed", () => {
    win = null;
    if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

ipcMain.handle("open-win", (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            contextIsolation: true,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});

app.on("before-quit", () => {
    DatabaseManager.closeDatabase(); // Close the database
});
