import React from 'react';
import { ItemCategory } from '../../types';

interface CategoryChipProps {
  category: ItemCategory;
  isSelected?: boolean;
  onClick?: () => void;
  count?: number;
}

export const CATEGORIES: ItemCategory[] = [
  'Phone',
  'Wallet',
  'Documents',
  'Jewellery',
  'Keys',
  'Other'
];

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected = false,
  onClick,
  count
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full font-label-bold text-sm transition-all duration-200 cursor-pointer select-none
        ${
          isSelected
            ? 'border-2 border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 scale-[1.02]'
            : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        }
      `}
    >
      <span>{category}</span>
      {typeof count === 'number' && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-high'}`}>
          {count}
        </span>
      )}
    </button>
  );
};
