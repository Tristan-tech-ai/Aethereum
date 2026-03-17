import React from 'react';

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  online = false,
  className = '',
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-3xl',
  };

  const onlineDot = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
    '2xl': 'w-4 h-4 border-2',
  };

  // Generate initials from name
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Generate a deterministic color from name
  const colors = [
    'bg-primary', 'bg-secondary', 'bg-success',
    'bg-warning', 'bg-danger', 'bg-info',
    'bg-rank-scholar', 'bg-subject-art',
  ];
  const colorIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div className={`
        ${sizes[size]} rounded-full overflow-hidden
        flex items-center justify-center
        ${!src ? `${colors[colorIndex]} text-white font-semibold` : 'bg-dark-secondary'}
      `}>
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {online && (
        <span className={`
          absolute bottom-0 right-0
          ${onlineDot[size]}
          bg-success rounded-full
          border-dark-card
        `} />
      )}
    </div>
  );
};

export default Avatar;
