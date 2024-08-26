import React, { useState, useEffect, useMemo } from 'react';
import { useSavedState, useIndexedDB } from '@/hooks';
import { Button } from '@/components';
import { formatComma, getLabel } from '@/utils';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { BiArrowFromRight } from 'react-icons/bi';

const Home = ({ view = false }) => {
  const { data: stores } = useIndexedDB('stores');
  const [selectedStore, setSelectedStore] = useState(null);
  const { data: products } = useIndexedDB('products');
  const { data: units } = useIndexedDB('units');
  const [timer, setTimer] = useSavedState(5, "timer")


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
      const intervalId = setInterval(swipeStores, (timer || 5) * 1000);

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
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className='flex justify-between items-center'>

        <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
          {view ? "المخازن" : "القائمة الرئيسيه"}

        </h1>
        {!view ? <Link to={"/view"}>
          <Button className="btn--primary flex items-center gap-4">
            <span>العرض</span>
            <FaEye className="cursor-pointer text-white" size={22} />
          </Button>
        </Link> : <Link to={"/"}>
          <Button className="btn--primary flex items-center gap-4">
            <span>الاعدادات</span>
            <BiArrowFromRight className="cursor-pointer text-white" size={22} />
          </Button>
        </Link>}
      </div>

      <ul className="flex gap-4 justify-start items-center mb-3">
        {stores.map((store) => (
          <li key={store.id}>
            <Button
              onClick={() => setSelectedStore(store.id)}
              className={`px-10 text-xl ${selectedStore === store.id ? "btn--primary" : "btn--secondary"}`}
            >
              {store.name}
            </Button>
          </li>
        ))}
      </ul>

      <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="max-w-16 p-4 font-extrabold text-gray-950 dark:text-gray-50">الرقم التسلسلي</th>
            <th className="p-4 font-extrabold text-gray-950 dark:text-gray-50">اسم الصنف</th>
            <th className="p-4 font-extrabold text-gray-950 dark:text-gray-50">الرصيد</th>
            <th className="p-4 font-extrabold text-gray-950 dark:text-gray-50">المخزن</th>
            <th className="p-4 font-extrabold text-gray-950 dark:text-gray-50">تاريخ الانتاج</th>
            <th className="p-4 font-extrabold text-gray-950 dark:text-gray-50">تاريخ الانتهاء</th>
            <th className="p-4 font-extrabold text-gray-950 dark:text-gray-50">الوصف</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((store, i) => (
            <tr key={store.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
              <td className=" text-center p-4 text-gray-950 dark:text-gray-50">{store.name}</td>
              <td className=" text-center p-4 text-gray-950 dark:text-gray-50">{formatComma(store.qty)} ({getLabel(store.unitId, units)})</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{getLabel(store.storeId, stores)}</td>
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
