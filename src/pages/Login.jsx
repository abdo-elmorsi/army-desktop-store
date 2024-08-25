import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Input, Button } from '@/components';
import { useInput, useIndexedDB } from '@/hooks';

const Login = () => {
  const userName = useInput("", null);
  const password = useInput("", null);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const { loginUser, error, loading, data } = useIndexedDB('users');

  const handleShowPass = () => setShowPass(!showPass);

  useEffect(() => {
    if (!loading && data.length === 0) {
      navigate('/sign-up');
    }
  }, [data.length, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(userName.value, password.value);
      if (user) {
        const { password, ...others } = user;
        localStorage.setItem('user', JSON.stringify(others));
        return navigate('/'); // Navigate to home screen
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className='h-screen flex  items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-primary">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
            تسجيل الدخول
          </Button>
        </form>
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
