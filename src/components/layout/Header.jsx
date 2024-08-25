// src/components/Header.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'; // Adjust imports based on your icon library

const Header = () => {
	const [darkMode, setDarkMode] = useState(false);

	const toggleDarkMode = () => {
		setDarkMode(prevMode => {
			const newMode = !prevMode;
			document.documentElement.classList.toggle('dark', newMode);
			return newMode;
		});
	};

	return (
		<header className="bg-primary text-white p-4 shadow-md flex items-center justify-between">
			<div className="flex items-center space-x-4">
				<Link to="/" className="text-xl font-bold flex items-center">
					<img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" /> {/* Replace with your logo path */}
					Home
				</Link>
			</div>
			<nav className="flex space-x-4">
				<Link to="/" className="hover:underline">Dashboard</Link>
				<Link to="/profile" className="hover:underline">Profile</Link>
				<Link to="/settings" className="hover:underline">Settings</Link>
			</nav>
			<button
				onClick={toggleDarkMode}
				className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
			>
				{darkMode ? (
					<SunIcon className="h-6 w-6 text-yellow-500" />
				) : (
					<MoonIcon className="h-6 w-6 text-gray-500" />
				)}
			</button>
		</header>
	);
};

export default Header;
