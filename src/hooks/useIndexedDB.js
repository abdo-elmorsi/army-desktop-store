import { useState, useEffect, useCallback, useMemo } from "react";
import Dexie from "dexie";

const db = new Dexie("myDatabase");
db.version(1).stores({
    users: "++id,username",
    stores: "++id",
    products: "++id",
    productsHistory: "++id",
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
                setState({ data: result, error: null, loading: false });
            } catch (err) {
                setState({
                    data: [],
                    error: err.message || "Error fetching data",
                    loading: false,
                });
            }
        };

        fetchData();
    }, [storeName]);

    const addItem = useCallback(
        async (item) => {
            try {
                setState((prev) => ({ ...prev, loading: true }));
                const id = await db[storeName].add(item);
                setState((prev) => ({
                    ...prev,
                    data: [...prev.data, { ...item, id }],
                    loading: false,
                }));
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    error: err.message || "Error adding item",
                    loading: false,
                }));
            }
        },
        [storeName]
    );

    const updateItem = useCallback(
        async (id, item) => {
            try {
                setState((prev) => ({ ...prev, loading: true }));
                await db[storeName].update(id, item);
                setState((prev) => ({
                    ...prev,
                    data: prev.data.map((i) =>
                        i.id === id ? { ...item, id } : i
                    ),
                    loading: false,
                }));
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    error: err.message || "Error updating item",
                    loading: false,
                }));
            }
        },
        [storeName]
    );

    const deleteItem = useCallback(
        async (id) => {
            try {
                setState((prev) => ({ ...prev, loading: true }));
                await db[storeName].delete(id);
                setState((prev) => ({
                    ...prev,
                    data: prev.data.filter((i) => i.id !== id),
                    loading: false,
                }));
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    error: err.message || "Error deleting item",
                    loading: false,
                }));
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

    const getUserRole = useCallback(async (username) => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            const user = await db.users
                .where("username")
                .equals(username)
                .first();
            setState((prev) => ({ ...prev, loading: false }));
            return user ? user.role : null;
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err.message || "Error fetching user role",
                loading: false,
            }));
            throw err;
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
            getUserRole,
        }),
        [
            state,
            addItem,
            updateItem,
            deleteItem,
            registerUser,
            loginUser,
            getUserRole,
        ]
    );

    return value;
};

export default useIndexedDB;
