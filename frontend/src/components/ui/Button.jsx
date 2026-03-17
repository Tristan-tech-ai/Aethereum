import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus cursor-pointer';

  const variants = {
    primary: `bg-primary text-white hover:bg-primary-dark hover:shadow-glow-primary active:bg-[#5B21B6] ${disabled ? 'bg-disabled-bg text-disabled-text hover:bg-disabled-bg hover:shadow-none' : ''}`,
    secondary: `bg-transparent text-primary-light border border-primary-light hover:bg-primary/10 active:bg-primary/20 ${disabled ? 'border-disabled-bg text-disabled-text hover:bg-transparent' : ''}`,
    ghost: `bg-transparent text-text-secondary hover:bg-white/5 active:bg-white/10 ${disabled ? 'text-text-disabled hover:bg-transparent' : ''}`,
    danger: `bg-danger text-white hover:bg-danger-dark active:bg-danger-darker ${disabled ? 'bg-disabled-bg text-disabled-text hover:bg-disabled-bg' : ''}`,
    success: `bg-success text-white hover:bg-success-dark active:bg-success-darker ${disabled ? 'bg-disabled-bg text-disabled-text hover:bg-disabled-bg' : ''}`,
  };

  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-sm-drd gap-1.5',
    md: 'h-10 px-4 text-sm rounded-[8px] gap-2',
    lg: 'h-12 px-6 text-base rounded-md-drd gap-2',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'pointer-events-none' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
