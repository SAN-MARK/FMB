import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 'base' | 'card' | 'modal';
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'card',
  interactive = false,
  padding = 'md',
  bordered = true,
  className = '',
  ...props
}) => {
  const elevationStyles = {
    base: 'ambient-shadow-base',
    card: 'ambient-shadow-card',
    modal: 'ambient-shadow-modal'
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`
        bg-surface-container-lowest 
        rounded-2xl
        ${elevationStyles[elevation]}
        ${bordered ? 'border border-outline-variant/30' : ''}
        ${paddingStyles[padding]}
        ${interactive ? 'transition-all duration-300 hover:ambient-shadow-modal hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
