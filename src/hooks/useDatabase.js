import { useState, useEffect, useCallback, useMemo } from "react";

const useDatabase = (storeName) => {
    const [state, setState] = useState({
        data: [],
        error: null,
        loading: true,
    });

    const fetchData = async () => {
        setState({ data: [], error: null, loading: true });
        try {
            const result = await window.ipcRenderer.invoke(`get-${storeName}`);
            setState({ data: result, error: null, loading: false });
        } catch (err) {
            setState({
                data: [],
                error: err.message || "Error fetching data",
                loading: false,
            });
        }
    };
    useEffect(() => {
        fetchData();
    }, [storeName]);

    const addItem = useCallback(
        async (item) => {
            setState((prev) => ({ ...prev, loading: true }));
            try {
                await window.ipcRenderer.invoke(`add-${storeName}`, ...item);
                await fetchData(); // Fetch updated data
            } catch (err) {
                console.log(err?.message);
                setState((prev) => ({ ...prev, error: err?.message }));
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [fetchData, storeName]
    );

    const updateItem = useCallback(
        async (id, item) => {
            setState((prev) => ({ ...prev, loading: true }));
            try {
                await window.ipcRenderer.invoke(
                    `update-${storeName}`,
                    id,
                    ...item
                );
                await fetchData(); // Fetch updated data
            } catch (err) {
                console.log(err?.message);
                setState((prev) => ({ ...prev, error: err?.message }));
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [fetchData, storeName]
    );

    const deleteItem = useCallback(
        async (id) => {
            setState((prev) => ({ ...prev, loading: true }));
            try {
                await window.ipcRenderer.invoke(`delete-${storeName}`, id);
                await fetchData(); // Fetch updated data
            } catch (err) {
                console.log(err?.message);
                setState((prev) => ({ ...prev, error: err?.message }));
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [fetchData, storeName]
    );

    const value = useMemo(
        () => ({
            data: state.data,
            error: state.error,
            loading: state.loading,
            addItem,
            updateItem,
            deleteItem,
        }),
        [state, addItem, updateItem, deleteItem]
    );

    return value;
};

export default useDatabase;
