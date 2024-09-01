import React, { useEffect } from 'react'
import { useSavedState } from '@/hooks'
import { Input } from '@/components'

export default function Settings() {
	const [timer, setTimer] = useSavedState(20, "timer");
	const [fontSize, setFontSize] = useSavedState(22, 'font-size');
	useEffect(() => {
		if (fontSize >= 16 && fontSize <= 25)
			document.documentElement.style.fontSize = `${fontSize}px`
	}, [fontSize])

	return (
		<div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 ">

			<h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
				ألاعدادات
			</h1>
			<form className='mt-10'>
				<div className='flex justify-between items-start gap-12 min-h-80'>
					<div className="mb-4 w-6/12">
						<Input
							mandatory
							label={"الموقت"}
							value={timer}
							onChange={(e) => setTimer(e.target.value)}
							name="timer"
						/>


					</div>
					<div className="mb-4 w-6/12">
						<Input
							mandatory
							label={"حجم الخط"}
							value={fontSize}
							onChange={(e) => setFontSize(e.target.value)}
							name="font"
							submitted={true}
							validator={{
								valid:
									+fontSize >= 16 &&
									+fontSize <= 25 &&
									!isNaN(fontSize),
								message: "القيمه يجب ان تكون بين 16 - 25",
							}}
						/>


					</div>

				</div>

			</form>
		</div>
	)
}
