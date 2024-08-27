// src/components/CopyrightFooter.js
import React from 'react';

const CopyrightFooter = () => {
	return (
		<p className="fixed text-xs pointer-events-none bottom-1 left-2 rtl:left-auto rtl:right-2 dark:text-white">
			© Copyright:{' '}
			<a
				target="_blank"
				rel="noreferrer"
				className="text-primary hover:underline"
				href="https://elmorsi.vercel.app/"
			>
				Abdo
			</a>{' '}
			2024
		</p>
	);
};

export default CopyrightFooter;