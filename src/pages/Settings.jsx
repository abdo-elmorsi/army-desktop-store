import React from 'react'
import { useSavedState } from '@/hooks'
import { Input } from '@/components'

export default function Settings() {
	const [timer, setTimer] = useSavedState(5, "timer")
	return (
		<div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900 ">

			<h1 className="text-2xl mb-4 text-gray-800 dark:text-white">
				ألاعدادات
			</h1>
			<form>
				<div className='flex justify-start items-start flex-wrap gap-6 flex-col'>

					<div className="mb-4 w-5/12">
						<Input
							mandatory
							label={"الموقت"}
							value={timer}
							onChange={(e) => setTimer(e.target.value)}
							name="name"
						/>


					</div>

				</div>

			</form>
		</div>
	)
}
