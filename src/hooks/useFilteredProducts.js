import { useState, useEffect, useMemo } from "react";
import { useIndexedDB } from "@/hooks";

const useFilteredProducts = (selectedStore) => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const { data: products, loading: loadingProducts } =
        useIndexedDB("products");
    const { getProductHistoryForYesterday } = useIndexedDB();

    useEffect(() => {
        if (loadingProducts) return;

        const fetchFilteredProducts = async () => {
            const new_filtered_products = selectedStore
                ? products?.filter(
                      (product) => product.storeId === selectedStore
                  )
                : products;

            const productsWithQty = await Promise.all(
                new_filtered_products.map(async (pro) => {
                    const lastItemBalance = await getProductHistoryForYesterday(
                        pro?.id
                    );
                    const qty =
                        (+lastItemBalance?.qty || 0) +
                        (+lastItemBalance?.increase || 0) -
                        (+lastItemBalance?.decrease || 0);

                    return { ...pro, qty };
                })
            );

            // Sort the products by storeId after all quantities have been calculated
            const sortedProducts = productsWithQty.sort(
                (a, b) => a.storeId - b.storeId
            );

            setFilteredProducts(sortedProducts);
        };

        fetchFilteredProducts();
    }, [loadingProducts, selectedStore, products]);

    // Memoize the filtered products to prevent unnecessary re-renders
    return useMemo(() => filteredProducts, [filteredProducts]);
};

export default useFilteredProducts;
