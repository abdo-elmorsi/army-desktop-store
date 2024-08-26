import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelect, useIndexedDB, useInput } from '@/hooks';
import { Select, Button, Input } from '@/components';

const ProductsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products, addItem, updateItem } = useIndexedDB('products');
  const { data: stores } = useIndexedDB('stores');
  const { data: units } = useIndexedDB('units');
  const [editing, setEditing] = useState(false);

  const name = useInput("", null);
  const storeId = useSelect("", null);
  const qty = useInput("", null);
  const unitId = useSelect("", null);
  const createdDate = useInput("", null);
  const expiryDate = useInput("", null);

  const description = useInput("", null);


  useEffect(() => {
    if (id) {
      const product = products?.find((products) => products.id === parseInt(id)) || null;
      if (product) {
        name.changeValue(product.name)
        storeId.changeValue(stores.find(s => s.id === product?.storeId))
        qty.changeValue(product.qty)
        unitId.changeValue(units.find(u => u.id === product?.unitId))
        product.createdDate && createdDate.changeValue(product.createdDate)
        product.expiryDate && expiryDate.changeValue(product.expiryDate)
        description.changeValue(product.description)
        setEditing(true);
      }
    }
  }, [id, products]);



  const handleSubmit = (e) => {
    e.preventDefault();
    const obj = {
      name: name.value,
      storeId: storeId.value?.id || null,
      qty: qty.value,
      unitId: unitId.value?.id || null,
      createdDate: createdDate.value ? createdDate.value : null,
      expiryDate: expiryDate.value ? expiryDate.value : null,
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
      <form>
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
            <Input
              mandatory
              label={"تاريخ الانتاج"}
              value={createdDate.value}
              onChange={e => {
                createdDate.changeValue(e.target.value);
              }}
              type={"date"}
            />
          </div>
          <div className="mb-4 w-5/12">
            <Input
              mandatory
              label={"تاريخ الانتهاء"}
              value={expiryDate.value}
              onChange={e => {
                expiryDate.changeValue(e.target.value);
              }}
              type={"date"}
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

        <Button disabled={!name.value || !storeId.value?.id || !+qty.value || !unitId.value?.id || !createdDate.value || !expiryDate.value} onClick={handleSubmit}>
          {editing ? 'تعديل' : 'اضافه'}
        </Button>
      </form>
    </div>
  );
};

export default ProductsForm;
