import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIndexedDB, useExportExcel } from '@/hooks';
import { Button } from '@/components';
import { formatComma, getLabel } from '@/utils';
import { differenceInDays, format, parseISO } from 'date-fns';
import { CgArrowUp } from 'react-icons/cg';
import { FaDownload, FaPrint } from 'react-icons/fa';

const Products = () => {
  const navigate = useNavigate();
  const [updateHistoryLoading, setUpdateHistoryLoading] = useState(false)
  const tableRef = useRef(null);
  const { data: products, deleteItem } = useIndexedDB('products');
  const { data: productsHistory, addItem, updateItem, deleteItem: deleteItemFromHistory } = useIndexedDB('productsHistory');
  const { data: stores } = useIndexedDB('stores');
  const { data: units } = useIndexedDB('units');

  const [selectedStore, setSelectedStore] = useState(null);

  const handleDelete = async (id) => {
    const result = await window.ipcRenderer.showPrompt('هل انت متأكد من حذف هذا المنتج:', 'John Doe');
    if (result) {
      deleteItem(id);
    }
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };


  const handleExportToHistory = async () => {
    setUpdateHistoryLoading(true);
    const currentDate = format(new Date(), "yyyy-MM-dd");

    const newProductHistory = products.map(({ id, ...others }) => ({
      ...others,
      productId: id,
      createdAt: currentDate,
    }));

    // Map of existing records for quick lookup
    const existingRecordsMap = productsHistory.reduce((acc, item) => {
      if (item.createdAt === currentDate) {
        acc[item.productId] = item;
      }
      return acc;
    }, {});

    // Determine which records need to be removed
    const productsIdsSet = new Set(products.map((product) => product.id));

    const obsoleteRecords = Object.values(existingRecordsMap).filter(
      (record) => !productsIdsSet.has(record.productId)
    );

    // Remove obsolete records
    await Promise.all(
      obsoleteRecords.map((obsoleteItem) => deleteItemFromHistory(obsoleteItem.id))
    );

    // Update existing records or add new ones
    await Promise.all(
      newProductHistory.map(async (newItem) => {
        const existingItem = existingRecordsMap[newItem.productId];
        if (existingItem) {
          // Update existing record
          const { id, ...others } = existingItem;
          await updateItem(id, { ...others, ...newItem });
        } else {
          // Add new record
          await addItem(newItem);
        }
      })
    );

    setUpdateHistoryLoading(false);
  };


  const filteredProducts = useMemo(() => {
    const new_products = selectedStore ?
      products?.filter(product => product.storeId === selectedStore) :
      products;
    return new_products.sort((a, b) => a.storeId - b.storeId)
  }, [products, selectedStore]);

  const isExpiringSoon = (expiryDate) => {
    return differenceInDays(parseISO(expiryDate), new Date()) < 30;
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
        getValue: (row) => row.name,
        selector: (row) => row.name
      },
      {
        name: "المخزن",
        getValue: (row) => getLabel(row.storeId, stores),
        selector: (row) => getLabel(row.storeId, stores)
      },
      {
        name: "الرصيد",
        getValue: (row) => parseFloat(row.qty),
        selector: (row) => formatComma(row.qty)
      },
      {
        name: "وحده القياس",
        getValue: (row) => getLabel(row.unitId, units),
        selector: (row) => getLabel(row.unitId, units)
      },
      {
        name: "تاريخ الانتاج",
        getValue: (row) => row.createdDate,
        selector: (row) => row.createdDate
      },
      {
        name: "تاريخ الانتهاء",
        getValue: (row) => row.expiryDate,
        selector: (row) => row.expiryDate
      },
      {
        name: "الوصف",
        getValue: (row) => row.description,
        selector: (row) => row.description
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

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">المنتجات</h1>
      <div className='flex justify-between items-center mb-4'>
        <Link to="/products/add" className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary">
          اضافه منتج
        </Link>
        <Button disabled={updateHistoryLoading} onClick={handleExportToHistory} className="bg-primary text-white flex items-center gap-2">
          <span>حفظ تعديلات اليوم</span>
          <CgArrowUp />
        </Button>
      </div>
      <ul className='flex gap-4 mb-3'>
        {stores.map(store => (
          <li key={store.id}>
            <Button
              onClick={() => setSelectedStore(selectedStore !== store.id ? store.id : null)}
              className={selectedStore === store.id ? "btn--primary" : "btn--secondary"}
            >
              {store.name}
            </Button>
          </li>
        ))}
      </ul>
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
      <table ref={tableRef} className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
        <thead id="printableArea" className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map(columns => {
              return <th key={columns.name} className="p-4 text-gray-800 dark:text-gray-300">{columns.name}</th>
            })}
            <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>

          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, i) => (
            <tr key={product.id} className="border-t border-gray-200 dark:border-gray-700">
              {columns.map(column => {
                if (column.name === "تاريخ الانتهاء") {
                  <td className={`text-center p-4 ${isExpiringSoon(column.selector(product, i)) ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                    {column.selector(product, i)}
                  </td>
                }
                return <th key={column.name} className="p-4 text-gray-800 dark:text-gray-300">{column.selector(product, i)}</th>
              })}
              <td className="p-4 flex justify-center gap-2">
                <Button onClick={() => handleEdit(product.id)} className="bg-primary text-white">تعديل</Button>
                <Button onClick={() => handleDelete(product.id)} className="btn--red">حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;