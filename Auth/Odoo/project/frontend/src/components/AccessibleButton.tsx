import React, { forwardRef } from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    type = 'button',
    ...props
  }, ref) => {
    const getVariantStyles = () => {
      const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
      
      switch (variant) {
        case 'primary':
          return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300`;
        case 'secondary':
          return `${baseStyles} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400`;
        case 'danger':
          return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300`;
        case 'ghost':
          return `${baseStyles} text-gray-700 hover:bg-gray-100 focus:ring-blue-500 disabled:text-gray-400`;
        case 'link':
          return `${baseStyles} text-blue-600 hover:text-blue-800 underline focus:ring-blue-500 disabled:text-blue-300`;
        default:
          return baseStyles;
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm h-8';
        case 'md':
          return 'px-4 py-2 text-base h-10';
        case 'lg':
          return 'px-6 py-3 text-lg h-12';
        default:
          return 'px-4 py-2 text-base h-10';
      }
    };

    const isDisabled = disabled || loading;
    const ariaAttributes = {
      'aria-busy': loading,
      'aria-disabled': isDisabled,
      ...props,
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`
          ${getVariantStyles()}
          ${getSizeStyles()}
          ${fullWidth ? 'w-full' : ''}
          ${variant !== 'link' ? 'rounded-md' : ''}
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${className}
        `}
        {...ariaAttributes}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span className={loading ? 'opacity-60' : ''}>
          {children}
        </span>
        
        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {loading && (
          <span className="sr-only">Loading...</span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
