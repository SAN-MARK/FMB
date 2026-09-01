import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const RoleSelectionScreen: React.FC = () => {
  const { setRole, navigateTo, userActiveCase, user, openAuthModal } = useApp();

  const handleFoundClick = () => {
    setRole('FINDER');
    navigateTo('report-found');
  };

  const handleLostClick = () => {
    setRole('OWNER');
    navigateTo('search-lost');
  };

  const handleCheckStatus = () => {
    if (userActiveCase) {
      navigateTo('item-received');
    } else {
      navigateTo('active-cases');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased pt-4 pb-20 md:pb-8">
      <main className="flex-grow flex flex-col items-center justify-center px-container-margin-mobile md:px-container-margin-desktop py-8 md:py-12 w-full max-w-4xl mx-auto">
        
        {/* Header (Matching Stitch Design) */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
            FindBack
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl text-on-surface-variant font-medium">
            What brings you here today?
          </h2>
        </header>

        {/* Active Case Banner (if user has active case in database) */}
        {userActiveCase && (
          <div className="w-full mb-8 bg-surface-container-lowest rounded-2xl border border-secondary-container/50 ambient-shadow-card p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined filled text-xl">inventory_2</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-label-bold text-sm text-on-surface">You have an active case</p>
                  <StatusBadge status={userActiveCase.status} size="sm" />
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Item #{userActiveCase.item_code} • {userActiveCase.category}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckStatus}
              className="px-4 py-2 bg-primary text-white rounded-full text-xs font-label-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 self-end sm:self-center shadow-sm"
            >
              <span>Check Status</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* 2 Main Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-element-gap md:gap-gutter w-full">
          {/* Card 1: I Found Something (Amber Theme) */}
          <button
            onClick={handleFoundClick}
            className="group relative flex flex-col h-full bg-surface-container-lowest rounded-[20px] ambient-shadow-card hover:ambient-shadow-modal transition-all duration-300 overflow-hidden text-left border border-outline-variant/30 hover:border-secondary-container focus:outline-none focus:ring-2 focus:ring-secondary-container focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
          >
            {/* Decorative Top Edge Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-secondary-container origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            
            <div className="p-8 flex-grow flex flex-col items-center text-center">
              <div className="w-28 h-28 md:w-32 md:h-32 mb-6 rounded-full bg-secondary-container/10 flex items-center justify-center group-hover:bg-secondary-container/20 transition-colors duration-300">
                <span className="material-symbols-outlined text-5xl md:text-6xl text-secondary group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                  front_hand
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-on-surface mb-3 font-semibold">
                I Found Something
              </h3>
              <p className="font-body-lg text-base text-on-surface-variant max-w-xs">
                Help reunite an item with its owner. Start the secure reporting process here.
              </p>
            </div>

            <div className="px-8 py-5 bg-surface-container-low border-t border-outline-variant/20 flex justify-between items-center group-hover:bg-secondary-container/10 transition-colors duration-300 w-full">
              <span className="font-label-bold text-sm text-secondary">Start Report</span>
              <span className="material-symbols-outlined text-secondary transform group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </div>
          </button>

          {/* Card 2: I Lost Something (Trust Blue Theme) */}
          <button
            onClick={handleLostClick}
            className="group relative flex flex-col h-full bg-surface-container-lowest rounded-[20px] ambient-shadow-card hover:ambient-shadow-modal transition-all duration-300 overflow-hidden text-left border border-outline-variant/30 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
          >
            {/* Decorative Top Edge Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-primary origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            
            <div className="p-8 flex-grow flex flex-col items-center text-center">
              <div className="w-28 h-28 md:w-32 md:h-32 mb-6 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                <span className="material-symbols-outlined text-5xl md:text-6xl text-primary group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                  search
                </span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-on-surface mb-3 font-semibold">
                I Lost Something
              </h3>
              <p className="font-body-lg text-base text-on-surface-variant max-w-xs">
                Search the FindBack network or file a claim to alert our community.
              </p>
            </div>

            <div className="px-8 py-5 bg-surface-container-low border-t border-outline-variant/20 flex justify-between items-center group-hover:bg-primary/5 transition-colors duration-300 w-full">
              <span className="font-label-bold text-sm text-primary">Search & Claim</span>
              <span className="material-symbols-outlined text-primary transform group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </div>
          </button>
        </div>

        {/* Footer Check Status link */}
        <div className="mt-10 text-center">
          <p className="font-body-md text-sm text-on-surface-variant">
            Already have an active case?{' '}
            <button
              onClick={handleCheckStatus}
              className="text-primary font-label-bold hover:underline font-semibold cursor-pointer ml-1"
            >
              Check Status
            </button>
          </p>

          {/* Quick Staff Mode Affordance */}
          <div className="mt-4">
            <button
              onClick={() => {
                if (user?.role_default === 'HUB_STAFF') {
                  navigateTo('hub-console');
                } else {
                  openAuthModal();
                }
              }}
              className="text-xs text-outline hover:text-on-surface-variant transition-colors"
            >
              Hub Partner & Staff Console →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
