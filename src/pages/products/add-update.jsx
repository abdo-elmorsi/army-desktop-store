import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelect, useDatabase, useInput } from '@/hooks';
import { formatComma } from '@/utils';
import { Select, Button, Input, CustomDatePicker } from '@/components';
import { format } from 'date-fns';

const ProductsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: products, addItem, loading: loadingProducts, updateItem } = useDatabase('products');

  const { data: stores, loading: loadingStores } = useDatabase('stores');
  const { data: units, loading: loadingUnits } = useDatabase('units');


  const name = useInput("", null);
  const storeId = useSelect("", null);
  const qty = useInput("", "number", true);
  const increase = useInput("", "number", true);
  const decrease = useInput("", "number", true);
  const unitId = useSelect("", null);
  const [createdDate, setCreatedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const description = useInput("", null);



  useEffect(() => {
    if (id && !loadingProducts) {
      (async () => {
        const product = products?.find((products) => products.id === parseInt(id)) || null;


        const lastItemBalance = 100

        if (product) {
          name.changeValue(product.name)
          storeId.changeValue({ name: product.storeName, id: product.storeId })
          qty.changeValue((+lastItemBalance?.qty + (+lastItemBalance?.increase || 0) - (+lastItemBalance?.decrease || 0) || 0) || 0)
          increase.changeValue(product?.increase)
          decrease.changeValue(product?.decrease)
          unitId.changeValue({ name: product.unitName, id: product.unitId })
          product.createdDate && setCreatedDate(product.createdDate)
          product.expiryDate && setExpiryDate(product.expiryDate)
          description.changeValue(product.description)
        }
      })()
    }
  }, [id, loadingProducts]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = [
      name.value,
      storeId.value?.id || null,
      +qty.value || 0,
      +increase.value || 0,
      +decrease.value || 0,
      unitId.value?.id || null,
      createdDate ? format(createdDate,
        "yyyy-MM-dd") : null,
      expiryDate ? format(expiryDate, "yyyy-MM-dd") : null,
      description.value
    ]

    if (id) {
      await updateItem(parseInt(id), data);
    } else {
      await addItem(data);
    }
    navigate('/products');
  };



  if ((loadingProducts || loadingStores || loadingUnits) && id) {
    return (
      <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-6"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/5 mb-14"></div>
        <div className='flex justify-between items-center flex-wrap gap-8'>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
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
            {id ? 'تعديل' : 'أضافه'}s
          </li>
        </ul>
      </nav>
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
        {id ? 'تعديل' : 'أضافه'}
      </h1>
      <form className='mt-10'>
        <div className='flex justify-between items-center flex-wrap gap-6'>
          <div className="mb-4 w-5/12">
            <Input
              mandatory
              label={"اسم المنتج"}
              {...name.bind}
              name="name"
            />
          </div>
          <div className="mb-4 w-5/12">
            <Input
              disabled
              mandatory
              label={"الرصيد قبل"}
              // {...qty.bind}
              value={formatComma(qty?.value || 0)}
              name="qty"
            />
          </div>
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

          <div className="mb-4 w-5/12">
            <Input
              disabled
              mandatory
              label={"الرصيد الفعلي"}
              value={formatComma(+qty.value + (+increase.value || 0) - (+decrease.value || 0) || 0)}

            />
          </div>

          <div className="mb-4 w-5/12">
            <Select
              mandatory
              label={"المخزن"}
              options={stores}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id}
              {...storeId.bind}
            />
          </div>
          <div className="mb-4 w-5/12">
            <Select
              mandatory
              label={"وحده القياس"}
              options={units}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id}
              {...unitId.bind}
            />
          </div>
          <div className="mb-4 w-5/12">
            <CustomDatePicker
              label="تاريخ الانتاج"
              value={createdDate}
              onChange={setCreatedDate}
              maxDate={new Date()}
            />
          </div>
          <div className="mb-4 w-5/12">
            <CustomDatePicker
              label="تاريخ الانتهاء"
              value={expiryDate}
              onChange={setExpiryDate}
            />

          </div>
          <div className="mb-4 w-5/12">
            <Input
              label={"تفاصيل"}
              {...description.bind}
              name="description"
            />


          </div>
        </div>

        <div className='flex items-center justify-end gap-10'>
          <Button className="btn--red w-36" onClick={() => {
            navigate('/products');
          }}>
            ألغاء
          </Button>
          <Button className="btn--primary w-36" disabled={
            !(+qty.value + (+increase.value || 0) - (+decrease.value || 0)) ||
            !name.value ||
            !storeId.value?.id ||
            !unitId.value?.id ||
            !createdDate ||
            !expiryDate ||
            loadingProducts
          } onClick={handleSubmit}>
            حفظ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductsForm;
