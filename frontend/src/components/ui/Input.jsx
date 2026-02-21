import React from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full bg-slate-900 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-primary focus:ring-primary'} text-slate-100 rounded-xl px-4 py-2.5 transition-all outline-none ring-offset-slate-950 focus:ring-2`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
