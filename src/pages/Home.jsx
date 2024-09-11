import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSavedState, useIndexedDB, useLocalStorageUser } from '@/hooks';
import { Button, CustomDatePicker } from '@/components';
import { formatComma, getLabel, getDateDifference, getMinDateInArray, isExpiringSoon } from '@/utils';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { BiArrowFromRight } from 'react-icons/bi';
import { format } from 'date-fns';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';

const Home = ({ view = false }) => {
  const { user } = useLocalStorageUser();

  const { data: stores, loading: loadingStores } = useIndexedDB('stores');
  const { data: productsHistory, loading: loadingProductsHistory } = useIndexedDB('productsHistory');
  const { data: units } = useIndexedDB('units');
  const [selectedStore, setSelectedStore] = useState(null);
  const [timer, setTimer] = useSavedState(20, "timer");
  const [selectedDate, setSelectedDate] = useSavedState(format(new Date(), "yyyy-MM-dd"), 'selected-date');
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
        const currentIndex = stores.findIndex(store => store.id === prevStoreId);
        return stores[(currentIndex + 1) % stores.length].id;
      });
    }
  }, [stores]);

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(swipeStores, (timer || 5) * 1000);
  }, [timer, swipeStores]);


  const handleStoreClick = useCallback((storeId) => {
    setSelectedStore(storeId);
    startInterval();
  }, [startInterval]);

  const filteredProducts = useMemo(() => {
    return (productsHistory?.filter(product =>
      product.storeId === selectedStore && product.createdAt === format(selectedDate || new Date(), 'yyyy-MM-dd')
    ) || []).map(new_product => ({
      ...new_product,
      qty: (+new_product?.qty + (+new_product?.increase || 0) - (+new_product?.decrease || 0)) || 0,
    }));
  }, [productsHistory, selectedDate, selectedStore]);


  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-primary dark:text-white">
            {view ? "مديرية أمن كفر الشيخ" : "القائمة الرئيسيه"}
          </h1>
          {view && (
            <>
              <p className='text-md m-2 font-bold text-gray-800 dark:text-white'>أدارة قوات ألامن</p>
              <p className='text-sm m-3 font-bold text-gray-800 dark:text-white'>وحدة التعينات</p>
            </>
          )}
        </div>
        {view && (
          <h1 className="m-0 text-2xl font-extrabold text-primary dark:text-white">
            {`رصيد المخازن بتاريخ: ${format(selectedDate || new Date(), "dd-MM-yyyy")}`}
          </h1>
        )}
        <div className='flex items-center gap-10'>
          {!view && (
            <CustomDatePicker
              minDate={getMinDateInArray(productsHistory, "createdAt")}
              maxDate={new Date()}
              value={selectedDate || new Date()}
              onChange={setSelectedDate}
            />
          )}
          <Link to={view ? `/login?username=${user?.username || ""}` : "/view"}>
            <Button className="btn--primary flex items-center gap-4">
              <span>{view ? "الاعدادات" : "العرض"}</span>
              {view ? <BiArrowFromRight className="cursor-pointer text-white" size={22} /> : <FaEye className="cursor-pointer text-white" size={22} />}
            </Button>
          </Link>
        </div>
      </header>

      {/* Store Buttons */}
      {loadingStores ? (
        <StoreSkeleton />
      ) : (
        <ul className="flex gap-4 justify-start items-center mb-3">
          {stores.map((store) => (
            <li key={store.id}>
              <Button
                onClick={() => handleStoreClick(store.id)}
                className={`px-10 text-xl ${selectedStore === store.id ? "btn--primary" : "btn--secondary"}`}
              >
                {store.name}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="overflow-auto" style={{ height: '60vh' }}>
        <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-300 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {["الرقم التسلسلي", "اسم الصنف", "الرصيد", "تاريخ الانتاج", "تاريخ الانتهاء", "الصلاحيه", "الوصف"].map(header => (
                <th key={header} className="p-4 text-gray-950 dark:text-gray-50">{header}</th>
              ))}
            </tr>
          </thead>
          {loadingProductsHistory ? (
            <TableSkeleton />
          ) : (
            <tbody>
              {filteredProducts.map((product, i) => (
                <tr key={product.id} className={`border-t ${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
                  <td className="font-bold text-center p-4 text-gray-950 dark:text-gray-50">{product.name}</td>
                  <td className="text-center p-4 text-gray-950 dark:text-gray-50 flex flex-col gap-2">
                    <span>{`${formatComma(product.qty)} (${getLabel(product.unitId, units)})`}</span>
                    <div className='flex justify-between items-center'>
                      <p className='text-green-500 flex gap-2 m-0 items-center justify-center'>
                        <FaArrowTrendUp />
                        <span>{formatComma(product.increase)}</span>
                      </p>
                      <p className='text-red-500 flex gap-2 m-0 items-center justify-center'>
                        <FaArrowTrendDown />
                        <span>{formatComma(product.decrease)}</span>
                      </p>
                    </div>
                  </td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{product.createdDate}</td>
                  <td className={`text-center p-4 ${isExpiringSoon(product.expiryDate) ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                    {product.expiryDate}
                  </td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">
                    {getDateDifference(product.createdDate, product.expiryDate)}
                  </td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{product.description}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default Home;

const TableSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="border-t">
        {[...Array(7)].map((__, tdIndex) => (
          <td key={tdIndex} className="p-4 text-center">
            <div className="animate-pulse bg-gray-300 rounded h-8 mx-auto"></div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const StoreSkeleton = () => (
  <div className="flex gap-4 justify-start items-center mb-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="animate-pulse bg-gray-300 rounded h-10 w-32"></div>
    ))}
  </div>
);
