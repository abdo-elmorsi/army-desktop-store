import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIndexedDB } from '@/hooks';
import { Button } from '@/components';

const Products = () => {
  const { data: products, deleteItem } = useIndexedDB('products');
  const navigate = useNavigate();

  const handleDelete = (id) => {
    deleteItem(id);
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };


  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المنتجات</h1>
      <Link
        to="/products/add"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block"
      >
        اضافه منتج
      </Link>
      <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-4 text-gray-800 dark:text-gray-300">مسلسل</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">ألاسم</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">المخزن</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الرصيد</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">وحده القياس</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الوصف</th>
            <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
          </tr>
        </thead>
        <tbody>
          {products.map((store, i) => (
            <tr key={store.id} className="border-t border-gray-200 dark:border-gray-700">
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.name}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.store}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.qty}</td>
              <td className=" text-center p-4 text-gray-800 dark:text-gray-200">{store.unit}</td>
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
