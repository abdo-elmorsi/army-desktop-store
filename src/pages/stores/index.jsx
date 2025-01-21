import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '@/hooks';
import { Button, Error } from '@/components';
import { BiEdit, BiTrash } from 'react-icons/bi';

const Stores = () => {
  const navigate = useNavigate();
  const { data: products } = useDatabase('products');
  const { data: stores, loading, error, deleteItem } = useDatabase('stores');


  const handleDelete = useCallback(async (id) => {
    const product = products.find(product => product.storeId == id);
    if (product) {
      alert('لا يمكن الحذف لانه يوجد منتج مرتبط به');
      return;
    }
    const confirmationMessage = 'هل انت متأكد من حذف هذا المخزن';
    const isConfirmed = window.location.host.includes('vercel.app')
      ? window.confirm(confirmationMessage)
      : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

    if (isConfirmed) {
      await deleteItem(id);
    }
  }, [deleteItem, products]);


  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المخازن</h1>
      <Link
        to="/stores/add"
        className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary mb-4 inline-block"
      >
        اضافه مخزن
      </Link>
      <div className="overflow-auto" style={{ height: '60vh' }}>
        <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-300 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-gray-800 dark:text-gray-300">الرقم التسلسلي</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">ألاسم</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">الوصف</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableSkeleton key={index} />
              ))
            ) : (
              stores.map((store, i) => (
                <tr key={store.id} className={`${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{store.name}</td>
                  <td className="text-center p-4 text-gray-800 dark:text-gray-200">{store.description}</td>
                  <td className="p-4 justify-center gap-2 flex">
                    <Button disabled={loading} onClick={() => navigate(`/stores/edit/${store.id}`)} className="bg-primary text-white flex items-center gap-2">
                      <BiEdit />
                      <span>تعديل</span>
                    </Button>

                    <Button disabled={loading} onClick={() => handleDelete(store.id)} className="btn--red flex items-center gap-2">
                      <BiTrash />
                      <span>حذف</span>
                    </Button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stores;


const TableSkeleton = () => {
  return <tr>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-12 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-32 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-48 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="flex justify-center gap-2">
        <div className="animate-pulse bg-gray-300 rounded h-8 w-16"></div>
        <div className="animate-pulse bg-gray-300 rounded h-8 w-16"></div>
      </div>
    </td>
  </tr>
}