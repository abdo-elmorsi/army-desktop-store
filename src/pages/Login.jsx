import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input, Button } from '@/components';
import { useInput, useDatabase } from '@/hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const userName = useInput(queryParams.get('username') || "", null);

  const password = useInput("", null);
  const [showPass, setShowPass] = useState(false);

  const { loading, data: users, error } = useDatabase('users');

  const handleShowPass = () => setShowPass(!showPass);

  useEffect(() => {
    if (!loading && users.length === 0) {
      navigate('/sign-up');
    }
  }, [users.length, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = users.find(user => user.username === userName.value && user.password === password.value);
    if (user) {
      const { password, ...others } = user;

      localStorage.setItem('user', JSON.stringify(others));
      navigate('/');
    } else {
      alert("اسم المستخدم او كلمه المرور غير صحيحه")
    }
  };




  return (
    <div className='h-screen flex  items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-primary">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} className="space-y-4 px-4">
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
            prepend={showPass ? <FaEye onClick={handleShowPass} className="cursor-pointer text-primary" size={22} /> : <FaEyeSlash onClick={handleShowPass} className="cursor-pointer text-primary" size={22} />}
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
