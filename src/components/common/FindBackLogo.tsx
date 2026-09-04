import React from 'react';

interface FindBackLogoProps {
  variant?: 'light' | 'dark' | 'rust';
  size?: 'sm' | 'md' | 'lg';
  showTamilAccent?: boolean;
  className?: string;
  onClick?: () => void;
}

export const FindBackLogo: React.FC<FindBackLogoProps> = ({
  variant = 'light',
  size = 'md',
  showTamilAccent = true,
  className = '',
  onClick
}) => {
  // Dimensions
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const tamilClass = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  const isDarkBg = variant === 'rust';
  const wordmarkColor = isDarkBg ? 'text-white' : 'text-[#7B2D00]';
  const subtitleColor = isDarkBg ? 'text-[#E8D5B7]' : 'text-[#C8541A]';
  const pinBg = isDarkBg ? 'bg-[#F7F0E6] text-[#7B2D00]' : 'bg-[#7B2D00] text-[#F7F0E6]';

  return (
    <div 
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer ${className}`}
      onClick={onClick}
      id="brand-findback-logo"
    >
      {/* Kolam-dot Pin Icon with Curved Return Arrow */}
      <div className={`relative ${iconSize} rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 ${pinBg}`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Kolam pin shape */}
          <path
            d="M16 3C10.477 3 6 7.477 6 13C6 19.5 14.5 28.2 15.3 29C15.7 29.4 16.3 29.4 16.7 29C17.5 28.2 26 19.5 26 13C26 7.477 21.523 3 16 3Z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Curved Return Arrow inside pin (FindBack) */}
          <path
            d="M19 12C19 10.343 17.657 9 16 9C14.343 9 13 10.343 13 12C13 14 15 15.5 18 16.5M13 16.5L11 14.5M13 16.5L15 18.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Traditional Kolam decorative center dot */}
          <circle cx="16" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-jakarta font-bold tracking-tight ${textClass} ${wordmarkColor}`}>
            FindBack
          </span>
          {showTamilAccent && (
            <span className={`font-tiro font-normal ${tamilClass} ${subtitleColor} opacity-90`}>
              காண்டு திரும்ப
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
