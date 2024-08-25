// src/components/Sidebar.jsx

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

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md h-full flex flex-col">
      <div className="p-4 flex-1">
        {/* Sidebar Logo or Header */}
        <div className="text-lg font-semibold text-primary mb-6">
          Sidebar
        </div>

        {/* Navigation Links */}
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className={`block p-3 rounded-md transition-colors ${location.pathname === '/'
                ? 'bg-gray-200 dark:bg-gray-700 text-primary'
                : 'text-text dark:text-textLight hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`block p-3 rounded-md transition-colors ${location.pathname === '/profile'
                ? 'bg-gray-200 dark:bg-gray-700 text-primary'
                : 'text-text dark:text-textLight hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`block p-3 rounded-md transition-colors ${location.pathname === '/settings'
                ? 'bg-gray-200 dark:bg-gray-700 text-primary'
                : 'text-text dark:text-textLight hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Settings
            </Link>
          </li>
        </ul>
      </div>

      {/* User Info and Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {isAuthenticated && !isLoading && (
          <div>

            <Button
              onClick={logout}
              className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
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
