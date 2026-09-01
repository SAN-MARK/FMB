import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoundItem, ItemCategory, Verification } from '../types';
import { CATEGORIES, CategoryChip } from '../components/common/CategoryChip';
import { StatusBadge } from '../components/common/StatusBadge';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';

export const SearchLostScreen: React.FC = () => {
  const { items, hubs, submitClaimVerification, navigateTo, setActiveItem, user, openAuthModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>('All');
  const [claimingItem, setClaimingItem] = useState<FoundItem | null>(null);
  
  // Claim form state
  const [proofType, setProofType] = useState<Verification['proof_type']>('ID_CARD');
  const [idMasked, setIdMasked] = useState('[Aadhaar Redacted]');
  const [claimNotes, setClaimNotes] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Filter items
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

  const handleOpenClaimModal = (item: FoundItem) => {
    setClaimingItem(item);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;

    setIsSubmittingClaim(true);
    await submitClaimVerification({
      item_id: claimingItem.id,
      proof_type: proofType,
      id_number_masked: idMasked,
      review_notes: claimNotes
    });

    setActiveItem(claimingItem);
    setIsSubmittingClaim(false);
    setClaimingItem(null);
    navigateTo('item-received');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pt-16 pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} />

      <main className="max-w-[1200px] mx-auto px-container-margin-mobile md:px-container-margin-desktop py-6 md:py-8 flex flex-col gap-6 w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1.5">
            Search Lost & Found Network
          </h1>
          <p className="text-sm text-on-surface-variant">
            Explore verified items safely deposited across community partner hubs.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, tag ID (e.g. FB-9921-X), or location..."
              className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none ambient-shadow-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'border-2 border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            All Categories ({items.length})
          </button>
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat}
              category={cat}
              isSelected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              count={items.filter(i => i.category === cat).length}
            />
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-element-gap">
          {filteredItems.map(item => {
            const hub = hubs.find(h => h.id === item.hub_id) || hubs[0];
            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow-card overflow-hidden flex flex-col justify-between hover:ambient-shadow-modal transition-all duration-300 group"
              >
                <div>
                  {/* Photo & Badge */}
                  <div className="w-full h-48 bg-surface-container-high relative overflow-hidden">
                    <img
                      src={item.photo_url}
                      alt={item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-mono font-bold tracking-wider">
                      #{item.item_code}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-xl font-bold text-primary">
                        {item.category}
                      </h3>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">
                      {item.description || 'Verified item deposited at partner hub.'}
                    </p>

                    <div className="space-y-1.5 text-xs text-on-surface-variant border-t border-outline-variant/20 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                        <span className="truncate">{item.location_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary text-sm filled">store</span>
                        <span className="truncate font-semibold text-on-surface">{hub.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <Button
                    variant={item.status === 'returned' ? 'secondary' : 'primary'}
                    size="sm"
                    fullWidth
                    disabled={item.status === 'returned'}
                    onClick={() => handleOpenClaimModal(item)}
                  >
                    {item.status === 'returned' ? 'Item Returned' : 'Claim This Item'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-8">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              search_off
            </span>
            <h3 className="font-serif text-lg font-bold text-on-surface mb-1">No items found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-4">
              Try adjusting your search terms or category filters. Our network updates constantly as new items arrive at partner hubs.
            </p>
            <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      {/* Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full ambient-shadow-modal border border-outline-variant/40 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">
                  File Ownership Claim
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Tag #{claimingItem.item_code} • {claimingItem.category}
                </p>
              </div>
              <button
                onClick={() => setClaimingItem(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
              <div>
                <label className="font-label-bold text-on-surface block mb-1.5">
                  Verification Proof Type
                </label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs font-label-bold focus:border-primary outline-none"
                >
                  <option value="ID_CARD">National ID / Driver License</option>
                  <option value="PURCHASE_RECEIPT">Purchase Receipt / Bill</option>
                  <option value="IMEI_SERIAL">Device Serial Number / IMEI</option>
                  <option value="PHOTO_WITH_ITEM">Photo of you with Item</option>
                  <option value="SECURITY_QUESTION">Secret Passcode / Description</option>
                </select>
              </div>

              <div>
                <label className="font-label-bold text-on-surface block mb-1">
                  ID Masking Placeholder
                </label>
                <input
                  type="text"
                  value={idMasked}
                  onChange={(e) => setIdMasked(e.target.value)}
                  placeholder="[Aadhaar Redacted]"
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-on-surface-variant"
                />
                <span className="text-[10px] text-outline mt-1 block">
                  🛡️ Strict client safety: identification numbers are masked and securely redacted.
                </span>
              </div>

              <div>
                <label className="font-label-bold text-on-surface block mb-1">
                  Ownership Proof Description / Details
                </label>
                <textarea
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="Describe unique features, wallpaper, cards inside, or markings only the owner would know..."
                  className="w-full p-3 rounded-xl border border-outline-variant text-xs h-20 outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => setClaimingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  fullWidth
                  isLoading={isSubmittingClaim}
                >
                  Submit Claim
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};
