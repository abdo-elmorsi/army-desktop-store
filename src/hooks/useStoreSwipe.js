import { useState, useEffect, useRef, useCallback } from "react";

const useStoreSwipe = (stores, timer) => {
    const [selectedStore, setSelectedStore] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (stores?.length) {
            setSelectedStore(stores[0].id);
            startInterval();
        }
        return () => clearInterval(intervalRef.current);
    }, [stores, timer]);

    const swipeStores = useCallback(() => {
        if (stores?.length) {
            setSelectedStore((prevStoreId) => {
                const currentIndex = stores.findIndex(
                    (store) => store.id === prevStoreId
                );
                return stores[(currentIndex + 1) % stores.length].id;
            });
        }
    }, [stores]);

    const startInterval = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(swipeStores, (timer || 5) * 1000);
    }, [timer, swipeStores]);

    const handleStoreClick = useCallback(
        (storeId) => {
            setSelectedStore(storeId);
            startInterval();
        },
        [startInterval]
    );

    return { selectedStore, handleStoreClick };
};
export default useStoreSwipe;
