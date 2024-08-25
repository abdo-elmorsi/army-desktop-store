import { useState, useEffect } from "react";

const DB_NAME = "myDatabase";
const DB_VERSION = 2;

const openDb = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("users")) {
                const userStore = db.createObjectStore("users", {
                    keyPath: "id",
                    autoIncrement: true,
                });
                userStore.createIndex("username", "username", { unique: true });
            }
            if (!db.objectStoreNames.contains("categories")) {
                db.createObjectStore("categories", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
            if (!db.objectStoreNames.contains("products")) {
                db.createObjectStore("products", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

const transactionWrapper = async (storeName, mode, callback) => {
    try {
        const db = await openDb();
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        return callback(store);
    } catch (err) {
        throw new Error(err);
    }
};

const useIndexedDB = (storeName) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading
            try {
                const result = await transactionWrapper(storeName, "readonly", (store) => {
                    return new Promise((resolve, reject) => {
                        const request = store.getAll();
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => reject(request.error);
                    });
                });
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchData();
    }, [storeName]);

    const addItem = async (item) => {
        setLoading(true); // Start loading
        try {
            await transactionWrapper(storeName, "readwrite", (store) => {
                return new Promise((resolve, reject) => {
                    const request = store.add(item);
                    request.onsuccess = () => {
                        setData((prev) => [
                            ...prev,
                            { ...item, id: request.result },
                        ]);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // End loading
        }
    };

    const updateItem = async (id, item) => {
        setLoading(true); // Start loading
        try {
            await transactionWrapper(storeName, "readwrite", (store) => {
                return new Promise((resolve, reject) => {
                    const request = store.put({ ...item, id });
                    request.onsuccess = () => {
                        setData((prev) =>
                            prev.map((i) => (i.id === id ? { ...item, id } : i))
                        );
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // End loading
        }
    };

    const deleteItem = async (id) => {
        setLoading(true); // Start loading
        try {
            await transactionWrapper(storeName, "readwrite", (store) => {
                return new Promise((resolve, reject) => {
                    const request = store.delete(id);
                    request.onsuccess = () => {
                        setData((prev) => prev.filter((i) => i.id !== id));
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // End loading
        }
    };

    // Authentication Methods
    const registerUser = async (username, password, role) => {
        setLoading(true); // Start loading
        try {
            await addItem({ username, password, role });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // End loading
        }
    };

    const loginUser = async (username, password) => {
        setLoading(true); // Start loading
        try {
            return await transactionWrapper("users", "readonly", (store) => {
                return new Promise((resolve, reject) => {
                    const index = store.index("username");
                    const request = index.get(username);

                    request.onsuccess = () => {
                        const user = request.result;
                        if (user && user.password === password) {
                            resolve(user);
                        } else {
                            reject("بيانات اعتماد تسجيل الدخول غير صالحة");
                        }
                    };
                    request.onerror = () => reject(request.error);
                });
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // End loading
        }
    };

    const getUserRole = async (username) => {
        setLoading(true); // Start loading
        try {
            return await transactionWrapper("users", "readonly", (store) => {
                return new Promise((resolve, reject) => {
                    const index = store.index("username");
                    const request = index.get(username);

                    request.onsuccess = () => {
                        const user = request.result;
                        resolve(user ? user.role : null);
                    };
                    request.onerror = () => reject(request.error);
                });
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // End loading
        }
    };

    return {
        data,
        error,
        loading, // Return loading state
        addItem,
        updateItem,
        deleteItem,
        registerUser,
        loginUser,
        getUserRole,
    };
};

export default useIndexedDB;
