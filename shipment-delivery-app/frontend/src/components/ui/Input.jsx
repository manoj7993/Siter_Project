import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
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
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
            Icon ? 'pl-10' : 'pl-3',
            'pr-3 py-2',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
