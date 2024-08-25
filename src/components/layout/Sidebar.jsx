import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorageUser } from '@/hooks';
import { Button } from '@/components';

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
    { to: '/', label: 'القائمه الرئيسيه' },
    { to: '/products', label: 'المنتجات' },
    { to: '/stores', label: 'المخازن' },
    { to: '/units', label: 'وحدات القياس' },
    // Add more links here as needed
  ];

  // Helper function to determine if the link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 shadow-lg h-full flex flex-col">
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
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info and Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {isAuthenticated && !isLoading && (
          <div>
            <Button
              onClick={logout}
              className="btn--secondary bg-red-500 border-none dark:bg-red-600 text-white w-full hover:bg-red-600 dark:hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
