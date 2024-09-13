import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDatabase, useInput } from '@/hooks';
import { Button, Input } from '@/components';

const ProductsBalanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('product-id') || ""

  const { data: transactions, addItem, loading, updateItem } = useDatabase('transactions');
  const transaction = transactions?.find((transaction) => transaction.id === parseInt(id)) || null;
  const { data: product } = useDatabase('products', productId);

  const increase = useInput("", "number", true);
  const decrease = useInput("", "number", true);


  useEffect(() => {
    if (id && !loading) {
      (async () => {

        if (transaction) {
          increase.changeValue(transaction.increase)
          decrease.changeValue(transaction.decrease)
        }
      })()
    }
  }, [id, loading]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    let data = [
      increase.value,
      decrease.value,
    ]

    if (id) {
      await updateItem(parseInt(id), data);
    } else {
      data.unshift(productId)
      await addItem(data);
    }
    navigate(-1);
  };



  if (loading && id) {
    return (
      <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-6"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/5 mb-14"></div>
        <div className='flex justify-between items-center flex-wrap gap-8'>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>

        </div>
        <div className="flex justify-end gap-4 mt-8">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 ">
      <nav className="text-gray-700 dark:text-gray-300 mb-4">
        <ul className="list-reset flex">
          <li>
            <Link to="/products" className="text-primary hover:underline">
              المنتجات
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className={id ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
            <Link to={`/transactions/${productId}`} className="text-primary hover:underline">
              الحركات
              (<span className='text-primary'>{id ? transaction.productName : product?.name || ""}</span>)
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className={id ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
            {id ? 'تعديل' : 'أضافه'}
          </li>
        </ul>
      </nav>

      <form className='mt-10'>
        <div className='flex justify-between items-center flex-wrap gap-6'>
          <div className="mb-4 w-5/12">
            <Input

              label={"أضافه رصيد"}
              {...increase.bind}
              name="increase"
            />
          </div>
          <div className="mb-4 w-5/12">
            <Input

              label={"خصم رصيد"}
              {...decrease.bind}
              name="decrease"
            />
          </div>

        </div>

        <div className='flex items-center justify-end gap-10'>
          <Button className="btn--red w-36" onClick={() => navigate(-1)}>
            ألغاء
          </Button>
          <Button className="btn--primary w-36" disabled={
            (!+increase.value &&
              !+decrease.value) ||
            loading
          } onClick={handleSubmit}>
            حفظ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductsBalanceForm;