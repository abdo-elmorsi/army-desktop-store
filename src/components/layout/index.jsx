import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorageUser } from '@/hooks';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
	const navigate = useNavigate();
	const { user, isAuthenticated, isLoading } = useLocalStorageUser();

	useEffect(() => {
		// Redirect to login if not authenticated and loading is complete
		if (!isLoading && !isAuthenticated) {
			navigate('/login');
		}
	}, [isLoading, isAuthenticated, navigate]);

	// Display loading state or redirect based on authentication
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
				<div className="text-gray-700 dark:text-gray-300">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Or redirect to login, show message, etc.
	}

	return (
		<div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
			<div>
				<Header />
			</div>
			<div className="flex-1 flex flex-row dark:bg-gray-900">
				<Sidebar />
				<main className="flex-1 p-6 bg-white dark:bg-gray-800">
					{children}
				</main>
			</div>
		</div>
	);
};

export default Layout;
