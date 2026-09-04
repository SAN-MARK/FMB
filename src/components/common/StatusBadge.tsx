import React from 'react';
import { ItemStatus } from '../../types';

interface StatusBadgeProps {
  status: ItemStatus | 'rejected' | 'rewarded';
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const configMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    reported: {
      label: 'நிலுவையில் | Pending',
      bg: 'bg-[#FEF9C3] border border-[#F5C842]/50',
      text: 'text-[#2B1810]',
      dot: 'bg-[#C8541A]'
    },
    dropped_at_hub: {
      label: 'Hub-ல் உள்ளது | At Hub',
      bg: 'bg-[#E8D5B7]/60 border border-[#C8541A]/30',
      text: 'text-[#7B2D00]',
      dot: 'bg-[#7B2D00]'
    },
    listed: {
      label: 'தேடலில் | Listed',
      bg: 'bg-[#DBEAFE] border border-[#1A3A5C]/20',
      text: 'text-[#1A3A5C]',
      dot: 'bg-[#1A3A5C]'
    },
    claimed: {
      label: 'சரிபார்ப்பில் | In Review',
      bg: 'bg-[#FEF9C3] border border-[#F5C842]/60',
      text: 'text-[#2B1810]',
      dot: 'bg-[#C8541A]'
    },
    verified: {
      label: 'சரிபார்க்கப்பட்டது | Verified',
      bg: 'bg-[#DCFCE7] border border-[#2E7D6B]/30',
      text: 'text-[#14532D]',
      dot: 'bg-[#2E7D6B]'
    },
    returned: {
      label: 'திருப்பி கொடுக்கப்பட்டது | Returned',
      bg: 'bg-[#DBEAFE] border border-[#1A3A5C]/30',
      text: 'text-[#1A3A5C]',
      dot: 'bg-[#1A3A5C]'
    },
    rejected: {
      label: 'நிராகரிக்கப்பட்டது | Rejected',
      bg: 'bg-[#FEE2E2] border border-[#B91C1C]/30',
      text: 'text-[#7F1D1D]',
      dot: 'bg-[#B91C1C]'
    },
    rewarded: {
      label: 'பரிசு கிடைத்தது ₹60 | Rewarded',
      bg: 'bg-[#2B1810] border border-[#F5C842]/40',
      text: 'text-[#F5C842]',
      dot: 'bg-[#F5C842]'
    }
  };

  const current = configMap[status] || configMap.reported;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-jakarta font-semibold tracking-tight select-none
        ${current.bg}
        ${current.text}
        ${sizeClasses}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span className="truncate">{current.label}</span>
    </span>
  );
};
