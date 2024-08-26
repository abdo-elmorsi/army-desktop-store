import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIndexedDB } from '@/hooks';
import { Button } from '@/components';
import { formatComma, getLabel } from '@/utils';

const Products = () => {
  const { data: products, deleteItem } = useIndexedDB('products');
  const { data: stores } = useIndexedDB('stores');
  const { data: units } = useIndexedDB('units');
  const navigate = useNavigate();

  const [selectedStore, setSelectedStore] = useState(null);

  const handleDelete = (id) => {
    deleteItem(id);
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };
  const filteredProducts = useMemo(() => {
    if (selectedStore) {
      return products?.filter(product => product.storeId == selectedStore)

    } else {
      return products
    }
  }, [products, selectedStore])

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المنتجات</h1>
      <Link
        to="/products/add"
        className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary mb-4 inline-block"
      >
        اضافه منتج
      </Link>
      <ul className='flex gap-4 justify-start items-center mb-3'>

        {stores.map((store) => {
          return <li key={store.id} className=''>
            <Button onClick={() => {
              if (selectedStore !== store.id) {
                setSelectedStore(store?.id)
              } else {
                setSelectedStore(null)
              }
            }} className={` ${selectedStore === store.id ? "btn--primary" : "btn--secondary"}`}>

              {store.name}
            </Button>
          </li>
        })}
      </ul>
      <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-4 text-gray-800 dark:text-gray-300">الرقم التسلسلي</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">ألاسم</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">المخزن</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الرصيد</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">وحده القياس</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الانتاج</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الانتهاء</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الوصف</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((store, i) => (
            <tr key={store.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.name}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{getLabel(store.storeId, stores)}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{formatComma(store.qty)}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{getLabel(store.unitId, units)}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.createdDate}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.expiryDate}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.description}</td>
              <td className="p-4 justify-center  gap-2 flex">
                <Button
                  onClick={() => handleEdit(store.id)}
                  className="bg-primary text-white"
                >
                  تعديل
                </Button>
                <Button
                  onClick={() => handleDelete(store.id)}
                  className="btn--red"
                >
                  حذف
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;


