import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { Input, Button } from '@/components';
import { useInput, useDatabase } from '@/hooks';

const SignUp = () => {
  const navigate = useNavigate();
  const { addItem, loading, data: users, error } = useDatabase('users');

  const userName = useInput("", null);
  const password = useInput("", null);
  const [showPass, setShowPass] = useState(false);

  const handleShowPass = () => setShowPass(!showPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addItem([userName.value, password.value, "admin"]);
    navigate('/login');
  };


  useEffect(() => {
    if (!loading && users.length) {
      navigate('/login')
    }
  }, [loading, users.length, navigate])

  return (
    <div className='h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-primary text-center">أنشاء حساب</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className=''>
            <Input
              label={"ألاسم"}
              {...userName.bind}
              name="userName"
            />
          </div>
          <Input
            label={"الباسورد"}
            name="password"
            type={showPass ? "text" : "password"}
            prepend={showPass ? <FaEye onClick={handleShowPass} className="cursor-pointer text-primary" size={22} /> : <FaEyeSlash onClick={handleShowPass} className="cursor-pointer text-primary" size={22} />}
            {...password.bind}
          />
          <Button
            disabled={!userName.value || !password.value}
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md shadow-sm hover:bg-hoverPrimary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            أنشاء حساب
          </Button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default SignUp;
