// src/components/Error.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components';

const Error = ({ message, onRetry }) => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate('/');
	};

	return (
		<div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-4">
			<h1 className="text-4xl font-bold text-red-600 dark:text-red-400">حدث خطأ</h1>
			<p className="mt-4 text-gray-700 dark:text-gray-300">{message}</p>
			<div className="mt-6 flex gap-4">
				{onRetry && (
					<Button onClick={onRetry} className="btn--primary">
						إعادة المحاولة
					</Button>
				)}
				<Button onClick={handleGoHome} className="btn--secondary">
					العودة إلى الصفحة الرئيسية
				</Button>
			</div>
		</div>
	);
};

export default Error;
