import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDatabase } from '@/hooks';
import { Button, Error, Input } from '@/components';
import { formatComma } from '@/utils';
import { format } from 'date-fns';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';
import { FaBalanceScale } from 'react-icons/fa';
import debounce from 'lodash.debounce';

const TransactionsHistory = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: product, fetchData: fetchProducts, loading: loadingProduct } = useDatabase('products', productId);
  const {
    data: { data: transactions, pagination },
    fetchData,
    loading,
    error,
    deleteItem
  } = useDatabase(
    'transactions',
    null,
    [productId, null, searchQuery, itemsPerPage, (currentPage - 1) * itemsPerPage]
  );

  const debouncedFetchData = useRef(debounce((query) => {
    fetchData(null, [productId, null, query, itemsPerPage, (currentPage - 1) * itemsPerPage]);
  }, 1000)).current;

  const handleDelete = useCallback(async (id) => {
    const confirmationMessage = id ? 'هل انت متأكد من حذف هذه الحركه' : 'هل انت متأكد من حذف جميع الحركات';
    const isConfirmed = window.location.host.includes('vercel.app')
      ? window.confirm(confirmationMessage)
      : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

    if (isConfirmed) {
      id ? await deleteItem(id) : await window.ipcRenderer.invoke('delete-all-transactions', productId);
      fetchProducts(productId)
      !id && fetchData(null, [productId, null, "", 5, 0]);
    }
  }, [deleteItem]);

  const totalPages = pagination?.totalPages || 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedFetchData(query);
  };

  useEffect(() => {
    if (!loading && productId) {
      fetchData(null, [productId, null, searchQuery, itemsPerPage, (currentPage - 1) * itemsPerPage]);
    }
  }, [currentPage]);

  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <nav className="text-gray-700 dark:text-gray-300 mb-4">
        <ul className="list-reset flex">
          <li>
            <Link to="/products" className="text-primary hover:underline">المنتجات</Link>
          </li>
          <li className="mx-2">/</li>
          <li>
            <Link to={`/transactions/${productId}`} className="text-gray-700 dark:text-gray-300 hover:underline">
              الحركات ({loadingProduct ? "تحميل..." : product?.name})
            </Link>
          </li>
        </ul>
      </nav>

      <div className='flex justify-between items-center w-full'>
        <Link
          to={`/transactions/add?product-id=${productId}`}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-hoverPrimary mb-4 inline-block"
        >
          اضافه
        </Link>
        <Button
          title="يفضل الحذف مع بداية سنه جديده"
          onClick={() => handleDelete(null)}
          className="btn--red flex gap-2 items-center"
        >
          <BiTrash />
          <span>
            حذف الكل
          </span>
        </Button>
      </div>

      <div className="mb-4 pe-7">
        <Input
          type="text"
          placeholder="ابحث عن حركة بالتاريخ"
          className="p-2 w-96 border rounded-md"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="overflow-auto" style={{ height: '56vh' }}>
        <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-300 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-gray-800 dark:text-gray-300">الرقم التسلسلي</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">تاريخ الحركه</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">اضافه</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">خصم</th>
              <th className="p-4 text-gray-800 dark:text-gray-300">الرصيد</th>
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
              <>
                {transactions.length > 0 && (
                  <tr className="bg-gray-100 dark:bg-gray-900 sticky top-12 z-10">
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200" colSpan={2}>المجموع</td>
                    <td className="text-center p-4 text-green-500 gap-2">
                      <FaArrowTrendUp />
                      <span className='mx-2'>{formatComma(product.increase)}</span>
                    </td>
                    <td className="text-center p-4 text-red-500 gap-2">
                      <FaArrowTrendDown />
                      <span className='mx-2'>{formatComma(product.decrease)}</span>
                    </td>
                    <td className="text-center p-4 text-primary gap-2 font-bold">
                      <FaBalanceScale />
                      <span className='mx-2'>{formatComma(product.balance)}</span>
                    </td>
                    <td className="p-4" colSpan={2}></td>
                  </tr>
                )}
                {transactions.map((transaction, i) => (
                  <tr key={transaction.id}>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{format(transaction.createdAt, "yyyy-MM-dd")}</td>
                    <td className="text-center p-4 text-green-500 gap-2">
                      <FaArrowTrendUp />
                      <span className='mx-2'>{formatComma(transaction.increase)}</span>
                    </td>
                    <td className="text-center p-4 text-red-500 gap-2">
                      <FaArrowTrendDown />
                      <span className='mx-2'>{formatComma(transaction.decrease)}</span>
                    </td>
                    <td className="text-center p-4 text-primary gap-2">
                      <FaBalanceScale />
                      <span className='mx-2'>{formatComma(transaction.increase - transaction.decrease)}</span>
                    </td>
                    <td className="text-center p-4 text-gray-800 dark:text-gray-200">{transaction?.description}</td>

                    <td className="p-4 flex justify-center gap-2">
                      <Button
                        disabled={loading}
                        onClick={() => navigate(`/transactions/edit/${transaction.id}?product-id=${productId}`)}
                        className="bg-primary text-white flex items-center gap-2"
                      >
                        <BiEdit />
                        <span>تعديل</span>
                      </Button>
                      <Button
                        disabled={loading}
                        onClick={() => handleDelete(transaction.id)}
                        className="btn--red flex items-center gap-2"
                      >
                        <BiTrash />
                        <span>حذف</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center my-4 items-center">
        <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>السابق</Button>
        <span className="mx-4 dark:text-white">صفحة {currentPage} من {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>التالي</Button>
      </div>
    </div>
  );
};

const TableSkeleton = () => (
  <tr>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-12 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-32 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-16 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-16 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-16 mx-auto"></div>
    </td>
    <td className="p-4 text-center">
      <div className="animate-pulse bg-gray-300 rounded h-8 w-12 mx-auto"></div>
    </td>
  </tr>
);

export default TransactionsHistory;
