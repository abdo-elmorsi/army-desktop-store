// src/components/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate('/');
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
			<h1 className="text-4xl font-bold text-primary">404 - الصفحة غير موجودة</h1>
			<p className="mt-4 text-text dark:text-textLight">
				عذرًا! الصفحة التي تبحث عنها غير موجودة.
			</p>
			<button
				onClick={handleGoHome}
				className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
			>
				العودة إلى الصفحة الرئيسية
			</button>
		</div>
	);
};

export default NotFound;
