import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '@/hooks';
import { Button, Error } from '@/components';

const Units = () => {
  const { data: units, loading, error, deleteItem } = useDatabase('units');
  const navigate = useNavigate();


  const handleDelete = useCallback(async (id) => {
    const confirmationMessage = 'هل انت متأكد من حذف وحدة القياس';
    const isConfirmed = window.location.host.includes('vercel.app')
      ? window.confirm(confirmationMessage)
      : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

    if (isConfirmed) {
      await deleteItem(id);
    }
  }, [deleteItem]);



  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">وحدات القياس</h1>
      <Link
        to="/units/add"
        className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary mb-4 inline-block"
      >
        اضافه وحده
      </Link>
      <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
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
            units.map((unit, i) => (
              <tr key={unit.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
                <td className="text-center p-4 text-gray-800 dark:text-gray-200">{unit.name}</td>
                <td className="text-center p-4 text-gray-800 dark:text-gray-200">{unit.description}</td>
                <td className="p-4 justify-center gap-2 flex">
                  <Button onClick={() => navigate(`/units/edit/${unit.id}`)} className="bg-primary text-white">تعديل</Button>

                  <Button onClick={() => handleDelete(unit.id)} className="btn--red">
                    حذف
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Units;


const TableSkeleton = () => {
  return <tr className="border-t border-gray-200 dark:border-gray-700">
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