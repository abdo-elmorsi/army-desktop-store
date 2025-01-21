import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorageUser } from '@/hooks';
import { Button } from '@/components';
import { AiOutlineProduct } from 'react-icons/ai';
import { MdOutlineBalance, MdOutlineStorefront, MdSettings } from 'react-icons/md';
import { FaArrowRight, FaHome } from 'react-icons/fa';
import { FcSettings } from 'react-icons/fc';
import { BiUser, BiUserPlus, BiUserX } from 'react-icons/bi';
// import { FaArrowRightFromBracket } from 'react-icons/fa6';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useLocalStorageUser();

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define links with paths and labels
  const links = [
    {
      to: '/',
      label: 'القائمه الرئيسيه',
      icon: (isActive) => <FaHome size={22} className={isActive ? "text-white" : "text-primary hover:text-white"} />

    },
    {
      to: '/products',
      label: 'المنتجات',
      icon: (isActive) => <AiOutlineProduct size={22} className={isActive ? "text-white" : "text-primary hover:text-white"} />

    },
    {
      to: '/stores',
      label: 'المخازن',
      icon: (isActive) => <MdOutlineStorefront size={22} className={isActive ? "text-white" : "text-primary hover:text-white"} />

    },
    {
      to: '/units',
      label: 'وحدات القياس',
      icon: (isActive) => <MdOutlineBalance size={22} className={isActive ? "text-white" : "text-primary hover:text-white"} />

    },
    {
      to: '/settings',
      label: 'الاعدادات',
      icon: (isActive) => <MdSettings size={22} className={isActive ? "text-white" : "text-primary hover:text-white"} />

    },
    // {
    //   to: '/users',
    //   label: 'المستخدمين',
    //   icon: (isActive) =>  <BiUserPlus size={22} className={isActive ? "text-white":"text-primary hover:text-white"} />

    // },
    // Add more links here as needed
  ];

  // Helper function to determine if the link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 shadow-lg flex flex-col sidebar">
      <div className="p-4 flex-1">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block p-3 rounded-md transition-all duration-300 ${isActive(link.to)
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white'
                  }`}
              >
                <div className='flex justify-start gap-2'>
                  <span>{link.icon(isActive(link.to))}</span>
                  <span className='flex-1'>{link.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info and Logout */}
      <div className="p-4">
        {isAuthenticated && !isLoading && (
          <div>
            <Button
              onClick={logout}
              className="btn--red flex items-center justify-center gap-4 w-full"
            >
              <FaArrowRight size={22} />
              <span>تسجيل الخروج</span>

            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
