import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
          'px-3 py-2',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
