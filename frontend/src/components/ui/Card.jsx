import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all ${hover ? 'hover:border-slate-700 hover:shadow-xl hover:shadow-primary/5' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
