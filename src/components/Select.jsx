import React from 'react';
import ReactSelect from 'react-select';
import TextError from "./TextError";

export default function Select({
	label,
	validator,
	mandatory,
	submitted,
	isMulti = false,
	isClearable = true,
	formGroup = true,
	small = false,
	async = false,
	autoHeight = false,
	className = "",
	cacheOptions = true,

	placeholder = "أختر واحدا",
	...props
}) {
	let hasWarning = submitted && validator && !validator.valid;

	const customStyles = {
		control: (styles, { isFocused }) => ({
			...styles,
			backgroundColor: '#FFF',
			borderColor: isFocused ? '#336a86' : '#DCDFE3',
			color: '#2f353b',
			boxShadow: isFocused ? '0 0 0 1px #336a86' : 'none',
			'&:hover': {
				borderColor: '#28556c',
			},
		}),
		option: (styles, { isSelected, isFocused }) => ({
			...styles,
			backgroundColor: isSelected
				? '#336a86'
				: isFocused
					? '#e8fffe'
					: 'transparent',
			color: isSelected ? '#FFF' : '#28556c',
			'&:hover': {
				backgroundColor: '#28556c',
				color: '#FFF',
			},
		}),
		menu: (styles) => ({
			...styles,
			backgroundColor: '#e8fffe',
			color: '#2f353b',
		}),
		singleValue: (styles) => ({
			...styles,
			color: '#336a86',
		}),
		placeholder: (styles) => ({
			...styles,
			color: '#336a86',
		}),
	};

	return (
		<div
			className={`w-full ${formGroup ? 'form-group' : ''} ${hasWarning ? '-mb-1' : ''}`}
		>
			{label && (
				<label className="block text-md text-gray-800 dark:text-white pb-1">
					{label} {mandatory && <span className="text-red-900">*</span>}
				</label>
			)}
			<ReactSelect
				className={`react-select py-3 ${className} ${submitted && validator && !validator.valid
					? 'border-primary text-primary'
					: ''
					}`}
				styles={customStyles}
				isMulti={isMulti}
				isClearable={isClearable}
				placeholder={placeholder}
				{...props}
			/>
			{hasWarning && <TextError>{validator.message}</TextError>}
		</div>
	);
}
