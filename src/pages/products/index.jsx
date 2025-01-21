import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase, useExportExcel } from '@/hooks';
import { Button, Error, Select } from '@/components';
import { formatComma, isExpiringSoon } from '@/utils';
import { FaDownload } from 'react-icons/fa';
import { format } from 'date-fns';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';
const options = [
  { value: 'view', label: 'عرض الحركات' },
  { value: 'editBalance', label: 'تعديل الرصيد' },
  { value: 'edit', label: 'تعديل' },
  { value: 'delete', label: 'حذف' },
];

const Products = () => {
  const navigate = useNavigate();
  const { data: notFormattedProducts, loading, error, deleteItem } = useDatabase('products');
  const { data: stores, loading: loadingStores } = useDatabase('stores');
  const [selectedStore, setSelectedStore] = useState(null);
  const products = useMemo(() => {
    return notFormattedProducts.filter(product => {
      if (!selectedStore) {
        return true;
      }
      return product.storeId === selectedStore;
    })
  }, [selectedStore, notFormattedProducts])

  const handleDelete = useCallback(async (id) => {
    const confirmationMessage = 'هل انت متأكد من حذف هذا المنتج';
    const isConfirmed = window.location.host.includes('vercel.app')
      ? window.confirm(confirmationMessage)
      : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

    if (isConfirmed) {
      await deleteItem(id);
    }
  }, [deleteItem]);




  const columns = useMemo(() => {
    return [
      { name: "الرقم التسلسلي", noExport: true, selector: (row, i) => `${i + 1}` },
      { name: "ألاسم", selector: row => row?.name },
      { name: "المخزن", selector: row => row.storeName },
      {
        name: "الرصيد", selector: row => <div className={`text-center p-4 text-gray-950 dark:text-gray-50 flex flex-col gap-2`}>
          <span>
            {formatComma(row?.balance || 0)} ({row.unitName})
          </span>

          <div className='flex justify-between items-center'>
            <p className='text-green-500 flex gap-2 m-0 items-center justify-center'>
              <FaArrowTrendUp />
              <span>{formatComma(row?.lastTransaction?.increase || 0)}</span>
            </p>
            <p className='text-red-500 flex gap-2 m-0 items-center justify-center'>
              <FaArrowTrendDown />
              <span>{formatComma(row?.lastTransaction?.decrease || 0)}</span>
            </p>
          </div>
        </div>
      },
      { name: "تاريخ الانتاج", selector: row => row?.createdDate },
      {
        name: "تاريخ الانتهاء",
        selector: row => (
          <span className={`${isExpiringSoon(row?.expiryDate) ? "text-red-500" : ""}`}>{row?.expiryDate}</span>
        )
      },
      { name: "الوصف", selector: row => row?.description },
    ];
  }, []);

  const exportExcel = useCallback(async (name = 'المنتجات') => {
    try {
      await useExportExcel(products, columns, name, (error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  }, [products, columns]);


  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  const handleSelectChange = (selectedOption, product) => {
    const action = selectedOption.value;
    if (action === "view") {
      navigate(`/transactions/${product.id}`);
    } else if (action === "editBalance") {
      navigate(`/transactions/add?product-id=${product.id}`);
    } else if (action === "edit") {
      navigate(`/products/edit/${product.id}`);
    } else if (action === "delete") {
      handleDelete(product.id);
    }
  };
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المنتجات</h1>
      <Link
        to="/products/add"
        className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary mb-4 inline-block"
      >
        اضافه منتج
      </Link>

      {loadingStores ? (
        <StoreSkeleton />
      ) : (
        <ul className="flex gap-4 justify-start items-center mb-3">
          {stores.map(store => (
            <li key={store.id}>
              <Button
                onClick={() => setSelectedStore(selectedStore !== store.id ? store.id : null)}
                className={`px-10 text-xl ${selectedStore === store.id ? "btn--primary" : "btn--secondary"}`}
              >
                {store.name}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className='flex gap-2 items-center justify-end'>
        <Button onClick={() => exportExcel(`المنتجات-${format(new Date(), "yyyy-MM-dd")}`)} className="flex gap-2 items-center">
          <span>تنزيل اكسيل</span>
          <FaDownload />
        </Button>
      </div>
      <div className="overflow-auto" style={{ height: '65vh' }}>
        <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-300 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {columns.filter(c => !c.noShow).map(column => (
                <th key={column.name} className="p-4 text-gray-800 dark:text-gray-300">{column.name}</th>
              ))}
              <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableSkeleton columns={columns} key={index} />
              ))
            ) : (
              products.map((product, i) => (
                <tr key={product.id} className={`${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                  {columns.filter(c => !c.noShow).map(column => (
                    <td key={column.name} className="p-4 text-gray-800 dark:text-gray-200">{column.selector(product, i)}</td>
                  ))}
                  <td className="p-2">
                    <div className="relative">
                      <Select
                        value={""}
                        onChange={(value) => handleSelectChange(value, product)}
                        placeholder="اختيار إجراء"
                        options={options}
                      />
                    </div>
                  </td>
                  {/* <td className="p-2 flex flex-col gap-2">
                    <div className='flex justify-start gap-2'>
                      <Button onClick={() => navigate(`/transactions/${product.id}`)} className="px-2 py-1 bg-primary text-white flex items-center gap-2">
                        <FaEye />
                        <span>
                          عرض الحركات
                        </span>
                      </Button>
                      <Button onClick={() => navigate(`/transactions/add?product-id=${product.id}`)} className="px-2 py-1 bg-primary text-white flex items-center gap-2">

                        <BiEdit />
                        <span>
                          تعديل الرصيد
                        </span>
                      </Button>
                    </div>
                    <div className='flex justify-start gap-2'>
                      <Button disabled={loading} onClick={() => navigate(`/products/edit/${product.id}`)} className="px-2 py-1 bg-primary text-white flex items-center gap-2">
                        <BiEdit />
                        <span>تعديل</span>
                      </Button>
                      <Button disabled={loading} onClick={() => handleDelete(product.id)} className="px-2 py-1 btn--red flex items-center gap-2">
                        <BiTrash />
                        <span>حذف</span>
                      </Button>
                    </div>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;



const TableSkeleton = ({ columns }) => (
  <tr>
    {columns.filter(c => !c.noShow).map((_, index) => (
      <td key={index} className="p-4 text-center">
        <div className="animate-pulse bg-gray-300 rounded h-8 mx-auto"></div>
      </td>
    ))}
    <td className="p-4 text-center">
      <div className="flex justify-center gap-2">
        <div className="animate-pulse bg-gray-300 rounded h-8 w-16"></div>
        <div className="animate-pulse bg-gray-300 rounded h-8 w-16"></div>
      </div>
    </td>
  </tr>
);

const StoreSkeleton = () => (
  <div className="flex gap-4 justify-start items-center mb-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="animate-pulse bg-gray-300 rounded h-10 w-32"></div>
    ))}
  </div>
);