import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'reward' | 'whatsapp' | 'danger' | 'ghost' | 'bay';
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
  const baseStyles = 'inline-flex items-center justify-center font-jakarta font-semibold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer rounded-[12px] active:scale-[0.99]';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs min-h-[38px] gap-1.5',
    md: 'px-5 py-2.5 text-sm min-h-[46px] gap-2',
    lg: 'px-6 py-3.5 text-base min-h-[52px] gap-2.5'
  };

  const variantStyles = {
    // Primary: Kolam Orange fill, white text, 12px radius, warm rust shadow
    primary: 'bg-[#C8541A] text-white hover:brightness-108 active:brightness-95 shadow-[0_4px_14px_rgba(123,45,0,0.18)] focus:ring-[#C8541A]',
    // Secondary: Cream fill, rust border, rust text
    secondary: 'bg-[#F7F0E6] border-[1.5px] border-[#7B2D00] text-[#7B2D00] hover:bg-[#F0E6D6] hover:brightness-105 focus:ring-[#7B2D00]',
    // Reward: Jasmine Yellow fill, Night Marina text
    reward: 'bg-[#F5C842] text-[#2B1810] font-bold hover:brightness-108 active:brightness-95 shadow-[0_4px_12px_rgba(123,45,0,0.12)] focus:ring-[#F5C842]',
    // Bay of Bengal: Deep Blue
    bay: 'bg-[#1A3A5C] text-white hover:brightness-110 active:brightness-95 shadow-[0_4px_14px_rgba(26,58,92,0.2)] focus:ring-[#1A3A5C]',
    // WhatsApp: #25D366 fill, white text
    whatsapp: 'bg-[#25D366] text-white hover:brightness-108 active:brightness-95 shadow-[0_4px_14px_rgba(37,211,102,0.25)] focus:ring-[#25D366]',
    // Danger: transparent fill, rust border, rust text
    danger: 'bg-transparent border border-[#7B2D00] text-[#7B2D00] hover:bg-[#FEE2E2] focus:ring-[#B91C1C]',
    // Ghost: transparent, sand border, sand/night marina text
    ghost: 'bg-transparent border border-[#E8D5B7] text-[#2B1810] hover:bg-[#E8D5B7]/40 focus:ring-[#E8D5B7]'
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
