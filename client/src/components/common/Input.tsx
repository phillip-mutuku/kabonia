import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, className = '', ...rest }, ref) => {
    const inputClasses = `input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-300' : ''} ${
      leftIcon ? 'pl-10' : ''
    } ${rightIcon ? 'pr-10' : ''} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="label" htmlFor={rest.id || rest.name}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...rest} />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...rest }, ref) => {
    const textareaClasses = `input resize-y min-h-[100px] ${
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-300' : ''
    } ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="label" htmlFor={rest.id || rest.name}>
            {label}
          </label>
        )}
        <textarea ref={ref} className={textareaClasses} {...rest} />
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, helperText, className = '', ...rest }, ref) => {
    const selectClasses = `input appearance-none pr-10 ${
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-300' : ''
    } ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="label" htmlFor={rest.id || rest.name}>
            {label}
          </label>
        )}
        <div className="relative">
          <select ref={ref} className={selectClasses} {...rest}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';