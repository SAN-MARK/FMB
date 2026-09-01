import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'reward' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-label-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-full min-h-[36px] gap-1.5',
    md: 'px-6 py-3.5 text-sm rounded-full min-h-[48px] gap-2',
    lg: 'px-8 py-4 text-base rounded-full min-h-[56px] gap-2.5 shadow-md'
  };

  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98] shadow-[0_4px_12px_rgba(2,36,72,0.15)] focus:ring-primary',
    secondary: 'bg-transparent border-[1.5px] border-primary text-primary hover:bg-primary/5 active:bg-primary/10 focus:ring-primary',
    reward: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:scale-[0.98] shadow-[0_4px_12px_rgba(253,178,68,0.25)] focus:ring-secondary-container font-bold',
    danger: 'bg-error text-on-error hover:bg-error/90 focus:ring-error',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus:ring-outline'
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon && iconPosition === 'left' ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === 'right' ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : null}
    </button>
  );
};
