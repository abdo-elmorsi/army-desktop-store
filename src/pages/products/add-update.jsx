import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelect, useIndexedDB, useInput } from '@/hooks';
import { Select, Button, Input, CustomDatePicker } from '@/components';
import { format } from 'date-fns';

const ProductsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: products, addItem, loading, updateItem } = useIndexedDB('products');
  const { data: stores } = useIndexedDB('stores');
  const { data: units } = useIndexedDB('units');
  const [editing, setEditing] = useState(false);
  const name = useInput("", null);
  const storeId = useSelect("", null);
  const qty = useInput("", "number", true);
  const unitId = useSelect("", null);
  const [createdDate, setCreatedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const description = useInput("", null);


  useEffect(() => {
    if (id && products?.length && stores?.length && units?.length) {
      const product = products?.find((products) => products.id === parseInt(id)) || null;
      if (product) {
        name.changeValue(product.name)
        storeId.changeValue(stores.find(s => s.id === product?.storeId))
        qty.changeValue(product.qty)
        unitId.changeValue(units.find(u => u.id === product?.unitId))
        product.createdDate && setCreatedDate(product.createdDate)
        product.expiryDate && setExpiryDate(product.expiryDate)
        description.changeValue(product.description)
        setEditing(true);
      }
    }
  }, [id, products, stores, units]);



  const handleSubmit = (e) => {
    e.preventDefault();
    const obj = {
      name: name.value,
      storeId: storeId.value?.id || null,
      qty: qty.value,
      unitId: unitId.value?.id || null,
      createdDate: createdDate ? format(createdDate, "yyyy-MM-dd") : null,
      expiryDate: expiryDate ? format(expiryDate, "yyyy-MM-dd") : null,
      description: description.value
    }
    if (editing) {
      updateItem(parseInt(id), obj);
    } else {
      addItem(obj);
    }
    navigate('/products');
  };

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
          <li className={editing ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
            {editing ? 'تعديل' : 'أضافه'}
          </li>
        </ul>
      </nav>
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
        {editing ? 'تعديل منتج' : 'اضافه منتج'}
      </h1>
      {loading ? <h3 className='text-center'>تحميل...</h3> :
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
              <Input
                mandatory
                label={"الرصيد"}
                {...qty.bind}
                name="qty"
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
            <Button className="btn--primary w-36" disabled={!name.value || !storeId.value?.id || !+qty.value || !unitId.value?.id || !createdDate || !expiryDate} onClick={handleSubmit}>
              حفظ
            </Button>
          </div>
        </form>}
    </div>
  );
};

export default ProductsForm;
