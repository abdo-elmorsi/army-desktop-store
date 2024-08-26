import React, { useState, useEffect, useMemo } from 'react';
import { useIndexedDB } from '@/hooks';
import { Button } from '@/components';
import { formatComma, getLabel } from '@/utils';

const Home = () => {
  const { data: stores } = useIndexedDB('stores');
  const [selectedStore, setSelectedStore] = useState(null);
  const { data: products } = useIndexedDB('products');
  const { data: units } = useIndexedDB('units');

  // Function to swipe through stores
  const swipeStores = () => {
    if (stores?.length) {
      setSelectedStore((prevStoreId) => {
        const currentIndex = stores.findIndex(store => store.id === prevStoreId);
        const nextIndex = (currentIndex + 1) % stores.length;
        return stores[nextIndex].id;
      });
    }
  };

  useEffect(() => {
    if (stores?.length) {
      // Set the first store as the selected store by default
      setSelectedStore(stores[0].id);

      // Start the interval to navigate between stores every 5 seconds
      const intervalId = setInterval(swipeStores, 5 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [stores]);

  const filteredProducts = useMemo(() => {
    if (selectedStore) {
      return products?.filter(product => product.storeId == selectedStore)

    } else {
      return products
    }
  }, [products, selectedStore])

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">القائمة الرئيسيه</h1>

      <ul className="flex gap-4 justify-start items-center mb-3">
        {stores.map((store) => (
          <li key={store.id}>
            <Button
              onClick={() => setSelectedStore(store.id)}
              className={`${selectedStore === store.id ? "btn--primary" : "btn--secondary"}`}
            >
              {store.name}
            </Button>
          </li>
        ))}
      </ul>

      <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-4 text-gray-800 dark:text-gray-300">الرقم التسلسلي</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">ألاسم</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">المخزن</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الرصيد</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الانتاج</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الانتهاء</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الوصف</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((store, i) => (
            <tr key={store.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.name}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{getLabel(store.storeId, stores)}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{formatComma(store.qty)} ({getLabel(store.unitId, units)})</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.createdDate}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.expiryDate}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.description}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
