import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoundItem, ItemCategory } from '../types';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  IconSearch, 
  IconFilter, 
  IconLock, 
  IconMapPin, 
  IconClock, 
  IconArrowRight, 
  IconX,
  IconCheck,
  IconSparkles
} from '@tabler/icons-react';

export const SearchLostScreen: React.FC = () => {
  const { items, hubs, navigateTo, setActiveItem, user, openAuthModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Active filter chips: e.g. "Chennai Central", "Electronics", "கடந்த 7 நாட்கள்"
  const [activeFilters, setActiveFilters] = useState<string[]>(['Chennai Central', 'கடந்த 7 நாட்கள்']);

  const CHENNAI_ZONES = [
    { id: 'All', name: 'All Chennai', tamil: 'அனைத்து சென்னை' },
    { id: 'Central', name: 'Central (T.Nagar / Marina)', tamil: 'மத்திய சென்னை' },
    { id: 'South', name: 'South (Adyar / Velachery / OMR)', tamil: 'தென் சென்னை' },
    { id: 'North', name: 'North (Parrys / Central Station)', tamil: 'வட சென்னை' },
    { id: 'West', name: 'West (Anna Nagar / Vadapalani)', tamil: 'மேற்கு சென்னை' },
  ];

  const CATEGORY_LIST: (ItemCategory | 'All')[] = [
    'All', 'Phone', 'Wallet', 'Keys', 'Documents', 'Jewellery', 'Other'
  ];

  // Filtering
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleStartClaim = (item: FoundItem) => {
    setActiveItem(item);
    navigateTo('proof-of-ownership');
  };

  const removeFilterTag = (tag: string) => {
    setActiveFilters(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col selection:bg-[#C8541A] selection:text-white pb-24 md:pb-12">
      {/* HEADER: Marina Rust Bar with title */}
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} title="பொருளைத் தேடு (Search Items)" />

      <main className="w-full max-w-[480px] mx-auto px-4 pt-20 flex flex-col gap-4">

        {/* SEARCH BAR & FILTER BUTTON */}
        <div className="flex items-center gap-2">
          {/* Search bar: Cream background, sand border, rust search icon */}
          <div className="relative flex-1">
            <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B2D00]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="பொருளைத் தேடு... (Search item, tag ID, area)"
              className="w-full pl-10 pr-9 py-2.5 bg-[#FFFFFF] border border-[#E8D5B7] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] ambient-shadow-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C765C] hover:text-[#2B1810]"
              >
                <IconX size={16} />
              </button>
            )}
          </div>

          {/* Filter button with badge icon */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="p-2.5 bg-[#FFFFFF] border border-[#E8D5B7] rounded-xl text-[#7B2D00] hover:bg-[#F7F0E6] active:scale-95 transition-all cursor-pointer relative shadow-xs"
            title="வடிகட்டிகள் (Filters)"
          >
            <IconFilter size={20} stroke={2} />
            {activeFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8541A] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7B2D00] text-white rounded-full text-xs font-jakarta font-medium shadow-xs shrink-0"
            >
              <span>{filter}</span>
              <button
                type="button"
                onClick={() => removeFilterTag(filter)}
                className="hover:text-[#F5C842] cursor-pointer"
              >
                <IconX size={13} stroke={2.5} />
              </button>
            </span>
          ))}

          {/* Category Pills quick selector */}
          <div className="flex gap-1.5 shrink-0 pl-1 border-l border-[#E8D5B7]">
            {CATEGORY_LIST.slice(0, 4).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-jakarta transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C8541A] text-white font-bold'
                    : 'bg-white text-[#614436] border border-[#E8D5B7] hover:border-[#7B2D00]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH RESULTS COUNT */}
        <div className="flex items-center justify-between px-1 text-xs text-[#614436]">
          <span>
            காண்பிக்கப்படுகிறது: <strong className="text-[#2B1810] font-jakarta">{filteredItems.length}</strong> பதிவு செய்யப்பட்ட பொருட்கள்
          </span>
          <span className="font-tiro text-[#7B2D00]">சென்னை நெட்வொர்க்</span>
        </div>

        {/* RESULT CARDS LIST */}
        <div className="flex flex-col gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] overflow-hidden ambient-shadow-card flex flex-col transition-all hover:border-[#7B2D00]/60"
            >
              {/* Photo Area: Blurred image with bay-blue overlay and lock icon */}
              <div className="relative w-full h-44 bg-[#1A3A5C] overflow-hidden">
                <img
                  src={item.photo_url}
                  alt={item.category}
                  className="w-full h-full object-cover filter blur-[6px] scale-105 opacity-60"
                />

                {/* Bay-blue privacy overlay */}
                <div className="absolute inset-0 bg-[#1A3A5C]/75 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 text-[#F5C842] flex items-center justify-center mb-2 shadow-xs ring-2 ring-white/30">
                    <IconLock size={20} stroke={2.2} />
                  </div>
                  <span className="font-tiro text-sm font-semibold text-white leading-snug max-w-xs">
                    Claim verify ஆனால் தெரியும்
                  </span>
                  <span className="font-inter text-[11px] text-[#E8D5B7] mt-0.5">
                    (Visible after claim verification for owner privacy)
                  </span>
                </div>

                {/* Category Badge: Marina Rust Pill (top right) */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-3 py-1 bg-[#7B2D00] text-white rounded-full text-xs font-jakarta font-bold shadow-sm">
                    {item.category}
                  </span>
                </div>

                {/* Reference tag (top left) */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 bg-[#2B1810]/80 text-[#F5C842] rounded-md font-mono text-xs font-bold backdrop-blur-xs">
                    #{item.item_code}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-3">
                {/* Date & Location with Neem Green location pin */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#2B1810] font-jakarta font-medium truncate">
                    <IconMapPin size={16} className="text-[#2E7D6B] shrink-0" stroke={2.4} />
                    <span className="truncate">{item.location_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#8C765C] font-inter text-[11px] shrink-0">
                    <IconClock size={14} />
                    <span>3 hrs ago</span>
                  </div>
                </div>

                {/* Description: first 2 lines visible, fade out */}
                <p className="font-inter text-xs text-[#614436] line-clamp-2 leading-relaxed">
                  {item.description || 'Verified item deposited securely at community hub. Authenticate identity to view contents.'}
                </p>

                {/* CTA: Bay of Bengal fill, white text "இது என்னுடையதா? (Is this mine?) →" */}
                <button
                  type="button"
                  onClick={() => handleStartClaim(item)}
                  className="w-full py-2.5 px-4 bg-[#1A3A5C] text-white hover:bg-[#152e49] active:scale-98 rounded-xl font-jakarta font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-1"
                >
                  <span>இது என்னுடையதா? (Is this mine?)</span>
                  <IconArrowRight size={16} stroke={2.4} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2B1810]/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-modal flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E8D5B7]">
              <h3 className="font-tiro text-lg font-bold text-[#7B2D00]">
                வடிகட்டிகள் (Search Filters)
              </h3>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 rounded-full text-[#614436] hover:bg-[#F7F0E6]"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Chennai Zones in Tamil + English */}
            <div className="flex flex-col gap-2">
              <label className="font-jakarta text-xs font-bold text-[#2B1810]">
                சென்னை மண்டலம் (Chennai Operational Zone)
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {CHENNAI_ZONES.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(zone.id)}
                    className={`p-2.5 rounded-xl text-left text-xs font-jakarta flex items-center justify-between transition-colors ${
                      selectedZone === zone.id
                        ? 'bg-[#7B2D00] text-white font-bold'
                        : 'bg-[#F7F0E6] text-[#2B1810] border border-[#E8D5B7]'
                    }`}
                  >
                    <span>{zone.name}</span>
                    <span className="font-tiro text-[11px] opacity-85">{zone.tamil}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-col gap-2">
              <label className="font-jakarta text-xs font-bold text-[#2B1810]">
                பொருளின் வகை (Item Category)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 px-1 rounded-lg text-[11px] font-jakarta font-semibold text-center transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#C8541A] text-white shadow-xs'
                        : 'bg-[#F7F0E6] text-[#2B1810] border border-[#E8D5B7]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Kolam Orange Apply Button */}
            <button
              type="button"
              onClick={() => {
                if (selectedZone !== 'All') {
                  setActiveFilters([selectedZone, selectedCategory, 'கடந்த 7 நாட்கள்']);
                }
                setIsFilterSheetOpen(false);
              }}
              className="w-full py-3 bg-[#C8541A] text-white rounded-xl font-jakarta font-bold text-sm hover:brightness-105 transition-all shadow-md mt-2 cursor-pointer"
            >
              பயன்படுத்து (Apply Filters)
            </button>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};
