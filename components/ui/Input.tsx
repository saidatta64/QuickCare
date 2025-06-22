import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'