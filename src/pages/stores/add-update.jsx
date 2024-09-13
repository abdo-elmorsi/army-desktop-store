import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDatabase, useInput } from '@/hooks';
import { Button, Input, Error } from '@/components';

const StoreForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: stores, loading, error, addItem, updateItem } = useDatabase('stores');

  const name = useInput("", null);
  const description = useInput("", null);

  useEffect(() => {
    if (id && !loading) {
      const store = stores.find((store) => store.id === parseInt(id));
      if (store) {
        name.changeValue(store.name)
        description.changeValue(store.description)
      }
    }
  }, [id, loading]);



  const handleSubmit = (e) => {
    e.preventDefault();
    const data = [name.value, description.value];
    if (id) {
      updateItem(parseInt(id), data);
    } else {
      addItem(data);
    }
    navigate('/stores');
  };

  if (error) {
    return <Error message={error} onRetry={() => window.location.reload()} />;
  }

  if (loading && id) {
    return (
      <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/5 mb-6"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/5 mb-14"></div>
        <div className='flex justify-between items-center flex-wrap gap-8'>
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
    <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900">
      <nav className="text-gray-700 dark:text-gray-300 mb-4">
        <ul className="list-reset flex">
          <li>
            <Link to="/stores" className="text-primary hover:underline">
              المخازن
            </Link>
          </li>
          <li className="mx-2">/</li>
          <li className={id ? 'text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
            {id ? 'تعديل' : 'أضافه'}
          </li>
        </ul>
      </nav>
      <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
        {id ? 'تعديل' : 'أضافه'}
      </h1>
      <form className='mt-10'>
        <div className='flex justify-between items-start gap-12 min-h-80'>
          <div className="mb-4 w-6/12">
            <Input
              mandatory
              label={"ألاسم"}
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
          <Button className="btn--red w-36" onClick={() => navigate('/stores')}>
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
