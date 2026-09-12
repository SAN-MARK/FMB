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
  'Keys',
  'Documents',
  'Jewellery',
  'Other'
];

export const CATEGORY_TAMIL_LABELS: Record<ItemCategory, string> = {
  Phone: 'Phone',
  Wallet: 'Wallet பை',
  'ID Card': 'ID Card அடையாள அட்டை',
  Bag: 'Bag பை',
  Keys: 'Keys சாவி',
  Documents: 'Documents ஆவணம்',
  Jewellery: 'நகை Jewellery',
  Other: 'மற்றவை Other'
};

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
        px-3.5 py-2.5 rounded-xl font-jakarta font-medium text-xs md:text-sm transition-all duration-150 cursor-pointer select-none flex items-center justify-between gap-1.5
        ${
          isSelected
            ? 'bg-[#C8541A] text-white border border-[#C8541A] shadow-[0_4px_12px_rgba(123,45,0,0.18)] scale-[1.02]'
            : 'bg-[#F7F0E6] border border-[#E8D5B7] text-[#2B1810] hover:border-[#C8541A]/50 hover:bg-[#F0E6D6]'
        }
      `}
    >
      <span>{CATEGORY_TAMIL_LABELS[category] || category}</span>
      {typeof count === 'number' && (
        <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${isSelected ? 'bg-white/25 text-white' : 'bg-[#E8D5B7] text-[#2B1810]'}`}>
          {count}
        </span>
      )}
    </button>
  );
};
