import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIndexedDB, useExportExcel, useFilteredProducts } from '@/hooks';
import { Button } from '@/components';
import { formatComma, getLabel, isExpiringSoon } from '@/utils';
import { format } from 'date-fns';
import { CgArrowUp } from 'react-icons/cg';
import { FaDownload } from 'react-icons/fa';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';

const Products = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [updatingHistory, setUpdatingHistory] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null);

  const { data: products, loading: loadingProducts, updateItem: updateProduct, deleteItem: deleteItemFromProduct } = useIndexedDB('products');
  const { data: productsHistory, loading: loadingProductsHistory, addItem: addItemToProductHistory, deleteItem: deleteItemFromHistory } = useIndexedDB('productsHistory');
  const { data: stores, loading: loadingStores } = useIndexedDB('stores');
  const { data: units } = useIndexedDB('units');
  const { getProductHistoryForYesterday } = useIndexedDB();

  const filteredProducts = useFilteredProducts(selectedStore);

  const handleDelete = useCallback(async (id) => {
    const confirmationMessage = 'هل انت متأكد من حذف هذا المنتج';
    const isConfirmed = window.location.host.includes('vercel.app')
      ? window.confirm(confirmationMessage)
      : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

    if (isConfirmed) {
      deleteItemFromProduct(id);
    }
  }, [deleteItemFromProduct]);

  const handleExportToHistory = useCallback(async (isNewDate = false) => {
    try {
      setUpdatingHistory(true);
      const today = format(new Date(), "yyyy-MM-dd");
      const newFilteredProducts = await Promise.all(products.map(async (product) => {
        const lastItemBalance = await getProductHistoryForYesterday(product?.id);
        return {
          ...product,
          qty: lastItemBalance ? (+lastItemBalance.qty + (+lastItemBalance.increase || 0) - (+lastItemBalance.decrease || 0)) : 0,
          ...(isNewDate ? { increase: 0, decrease: 0 } : {}),
        };
      }));

      const existingRecords = productsHistory.filter(record => record.createdAt === today);
      await Promise.all(existingRecords.map(record => deleteItemFromHistory(record.id)));

      const newProductHistory = newFilteredProducts.map(({ id, ...others }) => ({
        ...others,
        productId: id,
        createdAt: today,
      }));

      if (newProductHistory.length > 0) {
        await Promise.all(newProductHistory.map(newItem => addItemToProductHistory(newItem)));
      }
    } catch (error) {
      console.error("Failed to export to history:", error);
    } finally {
      setUpdatingHistory(false);
    }
  }, [addItemToProductHistory, deleteItemFromHistory, products, productsHistory, getProductHistoryForYesterday]);

  const columns = useMemo(() => {
    return [
      { name: "الرقم التسلسلي", noExport: true, selector: (row, i) => `${i + 1}` },
      { name: "ألاسم", selector: row => row?.name },
      { name: "المخزن", selector: row => getLabel(row?.storeId, stores) },
      { name: "الرصيد قبل", selector: row => formatComma(row?.qty) },
      {
        name: "خصم واضافه", noExport: true,
        selector: row => (
          <div className='flex flex-col gap-2'>
            <p className='text-red-500 flex gap-2 m-0 items-center justify-center'>
              <FaArrowTrendDown />
              <span>{formatComma(row?.decrease)}</span>
            </p>
            <p className='text-green-500 flex gap-2 m-0 items-center justify-center'>
              <FaArrowTrendUp />
              <span>{formatComma(row?.increase)}</span>
            </p>
          </div>
        )
      },
      { name: "خصم", noShow: true, getValue: row => parseFloat(row?.decrease) },
      { name: "اضافه", noShow: true, getValue: row => parseFloat(row?.increase) },
      {
        name: "الرصيد الفعلي",
        selector: row => formatComma(+row?.qty + (+row?.increase || 0) - (+row?.decrease || 0))
      },
      { name: "وحده القياس", selector: row => getLabel(row?.unitId, units) },
      { name: "تاريخ الانتاج", selector: row => row?.createdDate },
      {
        name: "تاريخ الانتهاء",
        selector: row => (
          <span className={`${isExpiringSoon(row?.expiryDate) ? "text-red-500" : ""}`}>{row?.expiryDate}</span>
        )
      },
      { name: "الوصف", selector: row => row?.description },
    ];
  }, [stores, units]);

  const exportExcel = useCallback(async (name = 'المنتجات') => {
    try {
      await useExportExcel(filteredProducts, columns, name, (error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  }, [filteredProducts, columns]);


  // to remove today history
  // useEffect(() => {
  //   productsHistory.forEach(element => {
  //     if (element.createdAt === format(new Date(), "yyyy-MM-dd")) {
  //       deleteItemFromHistory(element?.id);
  //     } else {
  //       return;
  //     }
  //   });
  // }, [])

  useEffect(() => {
    if (!loadingProducts && !loadingProductsHistory && !isUpdated) {
      const currentDate = format(new Date(), "yyyy-MM-dd");
      const isTodayExist = productsHistory?.some(product => product.createdAt === currentDate);

      if (!isTodayExist) {
        setIsUpdated(true);
        const updateProducts = async () => {
          await Promise.all(products.map(product => updateProduct(product.id, { ...product, decrease: 0, increase: 0 })));
          await handleExportToHistory(true);

        };
        updateProducts();
      }
    }
  }, [loadingProducts, loadingProductsHistory, isUpdated]);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المنتجات</h1>
      <div className='flex justify-between items-center mb-4'>
        <Link to="/products/add" className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary">
          اضافه منتج
        </Link>
        <Button disabled={updatingHistory} onClick={() => handleExportToHistory()} className="bg-primary text-white flex items-center gap-2">
          <span>حفظ تعديلات اليوم</span>
          <CgArrowUp />
        </Button>
      </div>

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

      <div className="overflow-auto" style={{ height: '55vh' }}>
        <table ref={tableRef} className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              {columns.filter(c => !c.noShow).map(column => (
                <th key={column.name} className="p-4 text-gray-800 dark:text-gray-300">{column.name}</th>
              ))}
              <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
            </tr>
          </thead>
          <tbody>
            {(loadingProducts || loadingProductsHistory) ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableSkeleton columns={columns} key={index} />
              ))
            ) : (
              filteredProducts.map((product, i) => (
                <tr key={product.id} className="border-t border-gray-200 dark:border-gray-700">
                  {columns.filter(c => !c.noShow).map(column => (
                    <td key={column.name} className="p-4 text-gray-800 dark:text-gray-200">{column.selector(product, i)}</td>
                  ))}
                  <td className="p-4 flex justify-center gap-2">
                    <Button onClick={() => navigate(`/products/edit/${product.id}`)} className="bg-primary text-white">تعديل</Button>
                    <Button onClick={() => handleDelete(product.id)} className="btn--red">حذف</Button>
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

const TableSkeleton = ({ columns }) => (
  <tr className="border-t border-gray-200 dark:border-gray-700">
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

export default Products;