import React, { useEffect } from 'react';
import { useSavedState, useDatabase, useStoreSwipe, useLocalStorageUser } from '@/hooks';
import { Button, CustomDatePicker, Error } from '@/components';
import { formatComma, getDateDifference, isExpiringSoon } from '@/utils';
import { Link } from 'react-router-dom';
import { FaBalanceScale, FaEye } from 'react-icons/fa';
import { BiArrowFromRight } from 'react-icons/bi';
import { format } from 'date-fns';

const Home = ({ view = false }) => {
  const { user } = useLocalStorageUser();

  const [selectedDate, setSelectedDate] = useSavedState(format(new Date(), "yyyy-MM-dd"), 'selected-date');
  const { fetchData, data: notFormattedProducts, loadingProducts, errorProducts } = useDatabase('products', null, [new Date(selectedDate)]);

  const { data: stores, loading: loadingStores, error: errorStores } = useDatabase('stores');


  useEffect(() => {
    if (!loadingProducts) {
      fetchData(null, [new Date(selectedDate)])
    }

  }, [selectedDate, loadingProducts])



  const [timer, _] = useSavedState(20, "timer");
  const { selectedStore, handleStoreClick } = useStoreSwipe(stores, timer);


  const products = notFormattedProducts.filter(product => {
    if (!selectedStore) {
      return true;
    }
    return product.storeId === selectedStore;
  });

  if (errorProducts || errorStores) {
    return <Error message={errorProducts || errorStores} onRetry={() => window.location.reload()} />;
  }
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
              // minDate={getMinDateInArray(productsHistory, "createdAt")}
              maxDate={new Date()}
              value={selectedDate || new Date()}
              onChange={value => {
                setSelectedDate(value ? value : new Date())
              }}
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
          {loadingProducts ? (
            <TableSkeleton />
          ) : (
            <tbody>
              {products.map((product, i) => (
                <tr key={product.id} className={`${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
                  <td className="font-bold text-center p-4 text-gray-950 dark:text-gray-50">{product.name}</td>
                  <td className={`flex justify-center items-center gap-2 p-4 font-bold ${product?.balance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <FaBalanceScale />
                    <span>
                      {formatComma(product?.balance || 0)} ({product.unitName})
                    </span>
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
