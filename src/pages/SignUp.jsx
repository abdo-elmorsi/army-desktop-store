import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { Input, Button } from '@/components';
import { useInput, useIndexedDB } from '@/hooks';

const SignUp = () => {
  const navigate = useNavigate();
  const { registerUser,data, error } = useIndexedDB('users');

  const userName = useInput("", null);
  const password = useInput("", null);
  const [showPass, setShowPass] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleShowPass = () => setShowPass(!showPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(userName.value, password.value, "admin");
      setIsRegistered(true); // Set registered state to true
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  useEffect(() => {
    if (isRegistered) {
      navigate('/login'); // Navigate after registration
    }
  }, [isRegistered, navigate]);

  return (
    <div className='h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
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
            prepend={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
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
