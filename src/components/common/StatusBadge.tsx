import React from 'react';
import { ItemStatus } from '../../types';

interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const configMap: Record<ItemStatus, { label: string; bg: string; text: string; dot: string }> = {
    reported: {
      label: 'Reported / Pending Drop-off',
      bg: 'bg-surface-container-high',
      text: 'text-on-surface-variant',
      dot: 'bg-outline'
    },
    dropped_at_hub: {
      label: 'At Verified Hub',
      bg: 'bg-secondary-container/15 border border-secondary-container/40',
      text: 'text-secondary font-bold',
      dot: 'bg-secondary-container'
    },
    listed: {
      label: 'Listed in Network',
      bg: 'bg-primary-container/15 border border-primary-container/40',
      text: 'text-primary font-bold',
      dot: 'bg-primary'
    },
    claimed: {
      label: 'Claim in Verification',
      bg: 'bg-secondary-fixed text-on-secondary-fixed-variant',
      text: 'text-secondary font-bold',
      dot: 'bg-secondary'
    },
    verified: {
      label: 'Owner Verified',
      bg: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      text: 'text-tertiary-container font-bold',
      dot: 'bg-tertiary-container'
    },
    returned: {
      label: 'Returned to Owner',
      bg: 'bg-tertiary-fixed text-on-tertiary-fixed',
      text: 'text-tertiary-container font-bold',
      dot: 'bg-tertiary-container'
    }
  };

  const current = configMap[status] || configMap.reported;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs md:text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-label-bold tracking-wide
        ${current.bg}
        ${current.text}
        ${sizeClasses}
        ${className}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot} shrink-0`} />
      <span>{current.label}</span>
    </span>
  );
};
