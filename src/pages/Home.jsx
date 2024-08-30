import React, { useState, useEffect, useMemo } from 'react';
import { useSavedState, useIndexedDB } from '@/hooks';
import { Button } from '@/components';
import { formatComma, getLabel, getDateDifference } from '@/utils';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { BiArrowFromRight } from 'react-icons/bi';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
// Import necessary date functions from date-fns
import { differenceInDays, parseISO } from 'date-fns';

const Home = ({ view = false }) => {
  const { data: stores } = useIndexedDB('stores');
  const [selectedStore, setSelectedStore] = useState(null);
  const { data: products } = useIndexedDB('products');
  const { data: units } = useIndexedDB('units');
  const [timer, setTimer] = useSavedState(5, "timer");

  // Custom function to check if the expiry date is less than a month away
  const isExpiringSoon = (expiryDate) => {
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    return daysUntilExpiry < 30;
  };

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
      setSelectedStore(stores[0].id);
      const intervalId = setInterval(swipeStores, (timer || 5) * 1000);
      return () => clearInterval(intervalId);
    }
  }, [stores, timer]);

  const filteredProducts = useMemo(() => {
    if (selectedStore) {
      return products?.filter(product => product.storeId == selectedStore);
    }
    return products;
  }, [products, selectedStore]);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <div className='flex justify-between items-center'>
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-primary dark:text-white">
            {view ? "مديرية أمن كفر الشيخ" : "القائمة الرئيسيه"}
          </h1>
          {view && <>
            <p className='text-md m-2 font-bold text-gray-800 dark:text-white'>أدارة قوات ألامن</p>
            <p className='text-sm m-3 font-bold text-gray-800 dark:text-white'>وحدة التعينات</p>
          </>}
        </div>
        {!view ? (
          <Link to={"/view"}>
            <Button className="btn--primary flex items-center gap-4">
              <span>العرض</span>
              <FaEye className="cursor-pointer text-white" size={22} />
            </Button>
          </Link>
        ) : (
          <Link to={"/"}>
            <Button className="btn--primary flex items-center gap-4">
              <span>الاعدادات</span>
              <BiArrowFromRight className="cursor-pointer text-white" size={22} />
            </Button>
          </Link>
        )}
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
        <thead className="bg-gray-300 dark:bg-gray-800">
          <tr>
            <th className="max-w-10 p-4 text-gray-950 dark:text-gray-50">الرقم التسلسلي</th>
            <th className="p-4 text-gray-950 dark:text-gray-50">اسم الصنف</th>
            <th className="p-4 text-gray-950 dark:text-gray-50">الرصيد</th>
            {/* <th className="p-4 text-gray-950 dark:text-gray-50">المخزن</th> */}
            <th className="p-4 text-gray-950 dark:text-gray-50">تاريخ الانتاج</th>
            <th className="p-4 text-gray-950 dark:text-gray-50">تاريخ الانتهاء</th>
            <th className="p-4 text-gray-950 dark:text-gray-50">الصلاحيه</th>
            <th className="p-4 text-gray-950 dark:text-gray-50">الوصف</th>
          </tr>
        </thead>
        <TransitionGroup component="tbody">
          {filteredProducts.map((store, i) => {
            return (
              <CSSTransition key={store.id} timeout={(i + 1) * 100} classNames="slide">
                <tr className={`border-t ${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
                  <td className="font-bold text-center p-4 text-gray-950 dark:text-gray-50">{store.name}</td>
                  <td className="text-center p-4 text-gray-950 dark:text-gray-50">
                    {formatComma(store.qty)} ({getLabel(store.unitId, units)})
                  </td>
                  {/* <td className="text-center p-4 text-gray-800 dark:text-gray-200">{getLabel(store.storeId, stores)}</td> */}
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{store.createdDate}</td>
                  <td className={`text-center p-4 ${isExpiringSoon(store.expiryDate) ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                    {store.expiryDate}
                  </td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{getDateDifference(store.createdDate, store.expiryDate)}</td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{store.description}</td>
                </tr>
              </CSSTransition>
            )
          })}
        </TransitionGroup>
      </table>
    </div>
  );
};

export default Home;
