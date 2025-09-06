import React, { forwardRef, useId } from 'react';

interface AccessibleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    hideLabel = false,
    leftIcon,
    rightIcon,
    variant = 'outlined',
    size = 'md',
    className = '',
    disabled = false,
    ...props
  }, ref) => {
    const inputId = useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ');

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm h-8';
        case 'md':
          return 'px-3 py-2 text-base h-10';
        case 'lg':
          return 'px-4 py-3 text-lg h-12';
        default:
          return 'px-3 py-2 text-base h-10';
      }
    };

    const getVariantStyles = () => {
      const baseStyles = `
        w-full rounded-md transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-60 disabled:cursor-not-allowed
      `;

      if (error) {
        return `${baseStyles} border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500`;
      }

      switch (variant) {
        case 'filled':
          return `${baseStyles} bg-gray-100 border-transparent focus:bg-white focus:ring-blue-500 focus:border-blue-500`;
        case 'outlined':
          return `${baseStyles} bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
        default:
          return `${baseStyles} bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
      }
    };

    return (
      <div className="w-full">
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium text-gray-700 mb-1
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400" aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              ${getVariantStyles()}
              ${getSizeStyles()}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy || undefined}
            aria-required={required}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={`${error ? 'text-red-400' : 'text-gray-400'}`} aria-hidden="true">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p 
            id={helperId}
            className="mt-1 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  hideLabel?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    hideLabel = false,
    resize = 'vertical',
    className = '',
    disabled = false,
    rows = 4,
    ...props
  }, ref) => {
    const textareaId = useId();
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ');

    const getResizeClass = () => {
      switch (resize) {
        case 'none':
          return 'resize-none';
        case 'vertical':
          return 'resize-y';
        case 'horizontal':
          return 'resize-x';
        case 'both':
          return 'resize';
        default:
          return 'resize-y';
      }
    };

    return (
      <div className="w-full">
        <label 
          htmlFor={textareaId}
          className={`
            block text-sm font-medium text-gray-700 mb-1
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full px-3 py-2 border rounded-md transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-60 disabled:cursor-not-allowed
            ${getResizeClass()}
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          aria-required={required}
          disabled={disabled}
          {...props}
        />

        {error && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p 
            id={helperId}
            className="mt-1 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  hideLabel?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    hideLabel = false,
    options,
    placeholder,
    className = '',
    disabled = false,
    ...props
  }, ref) => {
    const selectId = useId();
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ');

    return (
      <div className="w-full">
        <label 
          htmlFor={selectId}
          className={`
            block text-sm font-medium text-gray-700 mb-1
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-3 py-2 border rounded-md bg-white transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:opacity-60 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          aria-required={required}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p 
            id={helperId}
            className="mt-1 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

export { AccessibleInput as default };
