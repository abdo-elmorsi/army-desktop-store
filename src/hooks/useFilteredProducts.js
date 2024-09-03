import { useState, useEffect, useMemo } from "react";

const useFilteredProducts = (
    selectedStore,
    products,
    loadingProducts,
    getProductHistoryForYesterday
) => {
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (loadingProducts || !products) return;

        const fetchFilteredProducts = async () => {
            // Filter products based on selectedStore
            const filtered = selectedStore
                ? products.filter(
                      (product) => product.storeId === selectedStore
                  )
                : products;

            // Get quantities for each product
            const productsWithQty = await Promise.all(
                filtered.map(async (product) => {
                    const lastItemBalance = await getProductHistoryForYesterday(
                        product.id
                    );
                    const qty =
                        (lastItemBalance?.qty || 0) +
                        (lastItemBalance?.increase || 0) -
                        (lastItemBalance?.decrease || 0);

                    return { ...product, qty };
                })
            );

            // Sort products by storeId
            const sortedProducts = productsWithQty.sort(
                (a, b) => a.storeId - b.storeId
            );
            setFilteredProducts(sortedProducts);
        };

        fetchFilteredProducts();
    }, [
        loadingProducts,
        selectedStore,
        products,
        getProductHistoryForYesterday,
    ]);

    // Memoize the filtered products
    return useMemo(() => filteredProducts, [filteredProducts]);
};

export default useFilteredProducts;
