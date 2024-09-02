import React from 'react'

function Progress() {
	return (
		<div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
			<div className="shrink-0">
				<span className="size-12 block bg-gray-600 dark:bg-gray-100 animate-ping rounded-full"></span>
			</div>
		</div>
	)
}

export default Progress