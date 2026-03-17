import React from 'react';

const Card = ({ children, className = '', hover = false, padding = 'default' }) => {
  const paddings = {
    none: '',
    compact: 'p-4',
    default: 'p-5',
    spacious: 'p-6',
  };

  return (
    <div className={`
      bg-dark-card border border-border rounded-md-drd
      transition-all duration-200 ease-in-out
      ${paddings[padding]}
      ${hover ? 'hover:-translate-y-0.5 hover:shadow-md-drd cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
