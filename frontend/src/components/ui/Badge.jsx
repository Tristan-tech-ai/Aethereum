import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-text-secondary/10 text-text-secondary',
    primary: 'bg-primary/15 text-primary-light',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/15 text-danger',
    info: 'bg-info/15 text-info',
  };

  return (
    <span className={`
      inline-flex items-center
      px-2.5 py-1 text-caption font-semibold
      rounded-full
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;
