import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useIndexedDB, useInput } from '@/hooks';
import { Button, Input } from '@/components';

const StoreForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: stores, addItem, updateItem } = useIndexedDB('stores');
  const [editing, setEditing] = useState(false);

  const name = useInput("", null);
  const description = useInput("", null);

  useEffect(() => {
    if (id) {
      const store = stores.find((store) => store.id === parseInt(id));
      if (store) {
        name.changeValue(store.name)
        description.changeValue(store.description)
        setEditing(true);
      }
    }
  }, [id, stores]);



  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateItem(parseInt(id), { name: name.value, description: description.value });
    } else {

      addItem({ name: name.value, description: description.value });
    }
    navigate('/stores');
  };

  return (
    <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900">
      <nav className="text-gray-700 dark:text-gray-300 mb-4">
        <ul className="list-reset flex">
          <li>
            <Link to="/stores" className="text-blue-500 dark:text-blue-400 hover:underline">
              المخازن
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className={editing ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
            {editing ? 'تعديل' : 'أضافه'}
          </li>
        </ul>
      </nav>
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
        {editing ? 'تعديل مخزن' : 'اضافه مخزن'}
      </h1>
      <form className='mt-10'>
        <div className='flex justify-between items-start gap-12 min-h-80'>
          <div className="mb-4 w-6/12">
            <Input
              mandatory
              label={"اسم المخزن"}
              {...name.bind}
              name="name"
            />


          </div>
          <div className="mb-4 w-6/12">
            <Input

              label={"تفاصيل"}
              {...description.bind}
              name="description"
            />


          </div>

        </div>

        <div className='flex items-center justify-end gap-10'>
          <Button className="btn--red w-36" onClick={() => {
            navigate('/stores');
          }}>
            ألغاء
          </Button>
          <Button className="btn--primary w-36" disabled={!name.value} onClick={handleSubmit}>
            حفظ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StoreForm;
