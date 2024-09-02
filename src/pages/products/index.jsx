import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [updateHistoryLoading, setUpdateHistoryLoading] = useState(false)
  const tableRef = useRef(null);
  let { data: products, loading: loadingProducts, updateItem: updateProduct, deleteItem: deleteItemFromProduct } = useIndexedDB('products');
  const { data: productsHistory, loading: loadingProductsHistory, addItem: addItemToProductHistory, deleteItem: deleteItemFromHistory } = useIndexedDB('productsHistory');
  const { data: stores, loading: loadingStores } = useIndexedDB('stores');
  const { data: units } = useIndexedDB('units');
  const { getProductHistoryForYesterday } = useIndexedDB();


  const [selectedStore, setSelectedStore] = useState(null);

  const filteredProducts = useFilteredProducts(selectedStore);


  const handleDelete = async (id) => {
    if (window.location.host.includes('vercel.app')) {
      const result = window.confirm('هل انت متأكد من حذف هذا المنتج');
      if (result) {
        deleteItemFromProduct(id);
      }
    } else {
      const result = await window.ipcRenderer.showPrompt('هل انت متأكد من حذف هذا المنتج:', 'John Doe');
      if (result) {
        deleteItemFromProduct(id);
      }
    }
  };





  const handleExportToHistory = async (isNewDate = false) => {
    try {
      setUpdateHistoryLoading(true);
      const today = format(new Date(), "yyyy-MM-dd");

      // Map products to include quantities and conditional fields
      const newFilteredProducts = await Promise.all(
        products.map(async (pro) => {
          const lastItemBalance = await getProductHistoryForYesterday(pro?.id);
          return {
            ...pro,
            qty: lastItemBalance
              ? (+lastItemBalance.qty + (+lastItemBalance.increase || 0) - (+lastItemBalance.decrease || 0))
              : 0,
            ...(isNewDate ? { increase: 0, decrease: 0 } : {}),
          };
        })
      );

      // Create new product history entries
      const newProductHistory = newFilteredProducts.map(({ id, ...others }) => ({
        ...others,
        productId: id,
        createdAt: today,
      }));

      // Remove existing records for today
      const existingRecords = productsHistory.filter(record => record.createdAt === today);
      if (existingRecords.length > 0) {
        await Promise.all(
          existingRecords.map(record => deleteItemFromHistory(record.id))
        );
      }

      // Add new products to history
      if (newProductHistory.length > 0) {
        await Promise.all(
          newProductHistory.map(newItem => addItemToProductHistory(newItem))
        );
      }
    } catch (error) {
      console.error("Failed to export to history:", error);
    } finally {
      setUpdateHistoryLoading(false);
    }
  };







  const columns = useMemo(() => {
    return [
      {
        name: "الرقم التسلسلي",
        noExport: true,
        selector: (row, i) => `${i + 1}`
      },
      {
        name: "ألاسم",
        getValue: (row) => row?.name,
        selector: (row) => row?.name
      },
      {
        name: "المخزن",
        getValue: (row) => getLabel(row?.storeId, stores),
        selector: (row) => getLabel(row?.storeId, stores)
      },
      {
        name: "الرصيد قبل",
        getValue: (row) => parseFloat(row?.qty),
        selector: (row) => formatComma(row?.qty)
      },
      {
        name: "خصم واضافه",
        noExport: true,
        selector: (row) => <div className='flex flex-col gap-2 '>
          <p className='text-red-500 flex gap-2 m-0 items-center justify-center'>
            {<FaArrowTrendDown />}
            <span>{formatComma(row?.decrease)}</span>
          </p>
          <p className='text-green-500 flex gap-2 m-0 items-center justify-center'>
            {<FaArrowTrendUp />}
            <span>{formatComma(row?.increase)}</span>
          </p>
        </div>
      },
      {
        name: "خصم",
        getValue: (row) => parseFloat(row?.decrease),
        noShow: true
      },
      {
        name: "اضافه",
        getValue: (row) => parseFloat(row?.increase),
        noShow: true
      },
      {
        name: "الرصيد الفعلي",
        getValue: (row) => parseFloat(+row?.qty + (+row?.increase || 0) - (+row?.decrease || 0)),
        selector: (row) => formatComma(+row?.qty + (+row?.increase || 0) - (+row?.decrease || 0))
      },
      {
        name: "وحده القياس",
        getValue: (row) => getLabel(row?.unitId, units),
        selector: (row) => getLabel(row?.unitId, units)
      },
      {
        name: "تاريخ الانتاج",
        getValue: (row) => row?.createdDate,
        selector: (row) => row?.createdDate
      },
      {
        name: "تاريخ الانتهاء",
        getValue: (row) => row?.expiryDate,
        selector: (row) => <span className={`${isExpiringSoon(row?.expiryDate) ? "text-red-500" : ""}`}>{row?.expiryDate}</span>
      },
      {
        name: "الوصف",
        getValue: (row) => row?.description,
        selector: (row) => row?.description
      },
    ]
  }, [stores, units]);

  const exportExcel = async (name = 'المنتجات') => {
    try {
      await useExportExcel(filteredProducts, columns, name, (error) => console.log(error))
    } catch (error) {
      console.log(error);
    }
  }

  // const handlePrint = () => {
  //   window.ipcRenderer.print();
  // };


  // in case a new day and there are no history it will reset the increase and decrease

  // to remove today history
  // productsHistory.forEach(element => {
  //   if (element.createdAt === format(new Date(), "yyyy-MM-dd")) {
  //     deleteItemFromHistory(element?.id);
  //   } else {
  //     return;
  //   }
  // });

  useEffect(() => {

    const currentDate = format(new Date(), "yyyy-MM-dd");
    if (!loadingProducts && !loadingProductsHistory) {
      setTimeout(() => {
        const isTodayExist = productsHistory?.some(product => product.createdAt === currentDate);

        if (!isTodayExist) {
          const updateProducts = async () => {
            for (const product of products) {
              await updateProduct(product.id, { ...product, decrease: 0, increase: 0 });
            }
            await handleExportToHistory(true);
          };
          updateProducts();
        }
      }, 500);
    }
  }, [loadingProducts, loadingProductsHistory]);



  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المنتجات</h1>
      <div className='flex justify-between items-center mb-4'>
        <Link to="/products/add" className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary">
          اضافه منتج
        </Link>
        <Button disabled={updateHistoryLoading} onClick={() => handleExportToHistory()} className="bg-primary text-white flex items-center gap-2">
          <span>حفظ تعديلات اليوم</span>
          <CgArrowUp />
        </Button>
      </div>
      {/* Store Buttons */}
      {loadingStores ? (
        <StoreSkeleton />
      ) : (
        <ul className="flex gap-4 justify-start items-center mb-3">
          {stores.map((store) => (
            <li key={store.id}>
              <Button
                onClick={() => setSelectedStore(selectedStore !== store.id ? store.id : null)}
                className={`px-10 text-xl  ${selectedStore === store.id ? "btn--primary" : "btn--secondary"}`}
              >
                {store.name}
              </Button>
            </li>
          ))}
        </ul>
      )}


      <div className='flex gap-2 items-center justify-end'>
        <Button onClick={() => exportExcel(`المنتجات-${format(new Date, "yyyy-MM-dd")}`)} className="flex gap-2 items-center">
          <span>تنزيل اكسيل</span>
          <FaDownload />
        </Button>
        {/* <Button onClick={handlePrint} className="flex gap-2 items-center">
          <span>طباعه</span>
          <FaPrint />
        </Button> */}
      </div>
      <div className="overflow-auto" style={{ height: '55vh' }}>
        <table ref={tableRef} className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              {columns.filter(c => !c.noShow)?.map(column => (
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
                  {columns.filter(c => !c.noShow)?.map(column => (
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

export default Products;



const TableSkeleton = ({ columns }) => {
  return <tr className="border-t border-gray-200 dark:border-gray-700">
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
}

const StoreSkeleton = () => {
  return (
    <div className="flex gap-4 justify-start items-center mb-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse bg-gray-300 rounded h-10 w-32"></div>
      ))}
    </div>
  );
};