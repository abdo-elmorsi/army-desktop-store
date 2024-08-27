import React from 'react';
import ReactSelect from 'react-select';
import TextError from "./TextError";

const Select = ({
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
}) => {
  const hasWarning = submitted && validator && !validator.valid;
  const isDark = document.querySelector("html").classList.contains("dark");

  const customStyles = {
    control: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isDark ? '#1f2937' : '#FFFFFF',
      borderColor: isFocused ? '#336a86' : hasWarning ? '#F56565' : '#DCDFE3',
      color: isDark ? '#FFFFFF' : '#2f353b',
      boxShadow: isFocused ? '0 0 0 1px #336a86' : 'none',
      '&:hover': {
        borderColor: hasWarning ? '#F56565' : '#28556c',
      },
    }),
    option: (styles, { isSelected, isFocused }) => ({
      ...styles,
      backgroundColor: isSelected
        ? '#336a86'
        : isFocused
          ? '#e8fffe'
          : 'transparent',
      color: isDark ? '#FFFFFF' : isSelected ? '#FFFFFF' : '#28556c',
      '&:hover': {
        backgroundColor: '#28556c',
        color: isDark ? '#FFFFFF' : '#336a86',
      },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: isDark ? '#1f2937' : '#e8fffe',
      color: isDark ? '#FFFFFF' : '#336a86',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: isDark ? '#FFFFFF' : '#336a86',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: isDark ? '#FFFFFF' : '#336a86',
    }),
  };

  return (
    <div
      className={`w-full ${formGroup ? 'form-group' : ''} ${hasWarning ? '-mb-1' : ''}`}
    >
      {label && (
        <label className={`block text-${small ? 'sm' : 'md'} text-gray-800 dark:text-white pb-1`}>
          {label} {mandatory && <span className="text-red-500">*</span>}
        </label>
      )}
      <ReactSelect
        className={`react-select py-3 ${className} ${hasWarning ? 'border-red-500 text-red-500' : ''}`}
        styles={customStyles}
        isMulti={isMulti}
        isClearable={isClearable}
        placeholder={placeholder}
        {...props}
      />
      {hasWarning && <TextError>{validator.message}</TextError>}
    </div>
  );
};

export default Select;