import { useState, useEffect, useCallback, useMemo } from "react";
import Dexie from "dexie";
import { format, subDays } from "date-fns";

const db = new Dexie("myDatabase");
db.version(1).stores({
    users: "++id,username",
    stores: "++id",
    products: "++id",
    productsHistory: "++id,productId,createdAt",
    units: "++id",
});

const useIndexedDB = (storeName) => {
    const [state, setState] = useState({
        data: [],
        error: null,
        loading: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            setState({ data: [], error: null, loading: true });
            try {
                const result = await db[storeName].toArray();
                // create delay for loading
                await new Promise((resolve) => setTimeout(resolve, 200)); // simulate delay of 1 second

                setState({ data: result, error: null, loading: false });
            } catch (err) {
                setState({
                    data: [],
                    error: err.message || "Error fetching data",
                    loading: false,
                });
            }
        };

        storeName && fetchData();
    }, [storeName]);

    const addItem = useCallback(
        async (item) => {
            try {
                const id = await db[storeName].add(item);
                setState((prev) => ({
                    ...prev,
                    data: [...prev.data, { ...item, id }],
                }));
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    error: err.message || "Error adding item",
                }));
            }
        },
        [storeName]
    );

    const updateItem = useCallback(
        async (id, item) => {
            try {
                await db[storeName].update(id, item);
                setState((prev) => ({
                    ...prev,
                    data: prev.data.map((i) =>
                        i.id === id ? { ...item, id } : i
                    ),
                }));
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    error: err.message || "Error updating item",
                }));
            }
        },
        [storeName]
    );

    const deleteItem = useCallback(
        async (id) => {
            try {
                await db[storeName].delete(id);
                setState((prev) => ({
                    ...prev,
                    data: prev.data.filter((i) => i.id !== id),
                }));
            } catch (err) {
                console.log(err?.message);
            }
        },
        [storeName]
    );

    const registerUser = useCallback(async (username, password, role) => {
        try {
            setState((prev) => ({ ...prev, loading: true }));
            await db.users.add({ username, password, role });
            setState((prev) => ({ ...prev, loading: false }));
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err.message || "Error registering user",
                loading: false,
            }));
        }
    }, []);

    const loginUser = useCallback(async (username, password) => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            const user = await db.users
                .where("username")
                .equals(username)
                .first();
            if (user && user.password === password) {
                setState((prev) => ({ ...prev, loading: false }));
                return user;
            } else {
                throw new Error("Invalid login credentials");
            }
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err.message || "Error logging in",
                loading: false,
            }));
            throw err;
        }
    }, []);

    const getProductHistoryForYesterday = useCallback(async (productId) => {
        try {
            const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
            const productHistory = await db.productsHistory
                .where("productId")
                .equals(parseInt(productId))
                .and(
                    (ph) =>
                        format(new Date(ph.createdAt), "yyyy-MM-dd") ===
                        yesterday
                )
                .first();
            return productHistory || null;
        } catch (err) {
            console.log(err?.message);
        }
    }, []);

    const value = useMemo(
        () => ({
            data: state.data,
            error: state.error,
            loading: state.loading,
            addItem,
            updateItem,
            deleteItem,
            registerUser,
            loginUser,
            getProductHistoryForYesterday,
        }),
        [
            state,
            addItem,
            updateItem,
            deleteItem,
            registerUser,
            loginUser,
            getProductHistoryForYesterday,
        ]
    );

    return value;
};

export default useIndexedDB;
