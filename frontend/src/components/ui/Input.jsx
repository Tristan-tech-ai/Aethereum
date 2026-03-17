import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-body-sm font-medium mb-3 transition-colors ${
          error ? 'text-danger' : 'text-text-secondary peer-focus:text-primary'
        }`}>
          {label}
        </label>
      )}
      <input
        type={type}
        disabled={disabled}
        className={`
          peer w-full h-11 bg-dark-secondary text-text-primary text-sm
          rounded-[8px] px-4 py-3
          transition-all duration-fast outline-none
          placeholder:text-text-muted
          ${disabled
            ? 'bg-[#151520] border border-dark-card text-text-disabled cursor-not-allowed'
            : error
              ? 'border-2 border-danger focus:border-danger'
              : 'border border-border hover:border-border-hover hover:bg-dark-card focus:border-2 focus:border-primary focus:bg-dark-card'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-caption text-danger font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
