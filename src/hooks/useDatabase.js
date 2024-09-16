import { useState, useEffect, useCallback, useMemo } from "react";

const useDatabase = (storeName, id = null, queryParams = []) => {
    const [state, setState] = useState({
        data: [],
        error: null,
        loading: true,
    });

    // Fetch data with optional query parameters
    const fetchData = useCallback(
        async (id = null, queryParams = []) => {
            setState({ data: [], error: null, loading: true });

            const method = id ? `get-${storeName}-by-id` : `get-${storeName}`;
            const args = id ? [id] : queryParams;

            try {
                const result = await window.ipcRenderer.invoke(method, ...args);
                setState({ data: result, error: null, loading: false });
            } catch (err) {
                setState({
                    data: [],
                    error: err.message || "Error fetching data",
                    loading: false,
                });
            }
        },
        [storeName]
    );

    // Fetch data when component mounts, ID changes, or queryParams change
    useEffect(() => {
        fetchData(id, queryParams);
    }, [fetchData, id]);

    // Handle add, update, and delete actions
    const handleAction = useCallback(
        async (action, ...args) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                await window.ipcRenderer.invoke(
                    `${action}-${storeName}`,
                    ...args
                );
                if (action === "delete") {
                    await fetchData(id, queryParams); // Refresh data after delete action with current parameters
                }
            } catch (err) {
                setState({
                    ...state,
                    loading: false,
                    error: err.message || `Error performing action: ${action}`,
                });
            } finally {
                setState((prev) => ({ ...prev, loading: false }));
            }
        },
        [fetchData, storeName, id, queryParams]
    );

    const addItem = useCallback(
        (item) => handleAction("add", ...item),
        [handleAction]
    );
    const updateItem = useCallback(
        (itemId, item) => handleAction("update", itemId, ...item),
        [handleAction]
    );
    const deleteItem = useCallback(
        (itemId) => handleAction("delete", itemId),
        [handleAction]
    );

    // Memoized value to avoid unnecessary re-renders
    const value = useMemo(
        () => ({
            data: state.data,
            error: state.error,
            loading: state.loading,
            fetchData,
            addItem,
            updateItem,
            deleteItem,
        }),
        [state, fetchData, addItem, updateItem, deleteItem]
    );

    return value;
};

export default useDatabase;
