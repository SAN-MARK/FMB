import React from 'react';
import { useApp } from '../../context/AppContext';

interface TopAppBarProps {
  showBack?: boolean;
  onBack?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ showBack, onBack }) => {
  const { user, userActiveCase, currentScreen, navigateTo, openAuthModal } = useApp();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigateTo('role-selection');
    }
  };

  const getUserInitial = (): string => {
    if (!user || !user.name) return 'U';
    return user.name.trim().charAt(0).toUpperCase();
  };

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-6 h-16 fixed top-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant/20 transition-all duration-200">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={handleBackClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all"
            aria-label="Go Back"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        ) : (
          <button
            onClick={() => navigateTo('role-selection')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/5 active:scale-95 transition-all"
            title="Verified Network"
          >
            <span className="material-symbols-outlined filled text-primary text-2xl">verified</span>
          </button>
        )}

        <button
          onClick={() => navigateTo('role-selection')}
          className="text-left group cursor-pointer"
        >
          <span className="text-xl md:text-2xl font-serif font-bold text-primary tracking-tight">
            FindBack
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Active Case Quick Badge */}
        {userActiveCase && currentScreen !== 'active-cases' && currentScreen !== 'item-received' && (
          <button
            onClick={() => navigateTo('active-cases')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/15 text-secondary border border-secondary-container/40 rounded-full text-xs font-label-bold hover:bg-secondary-container/25 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Active Case</span>
          </button>
        )}

        {/* 24hr Recovery SLA Tooltip/Indicator */}
        <button
          onClick={() => navigateTo('splash')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-primary/80 hover:bg-surface-container-high transition-colors"
          title="24hr Recovery SLA Guarantee"
        >
          <span className="material-symbols-outlined text-[20px]">timer</span>
        </button>

        {/* User / Auth Trigger */}
        {user ? (
          <button
            onClick={openAuthModal}
            className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-label-bold flex items-center justify-center text-sm ring-2 ring-outline-variant/30 hover:ring-primary transition-all overflow-hidden"
            title={`Signed in as ${user.name} (${user.role_default || 'User'})`}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{getUserInitial()}</span>
            )}
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            className="px-3.5 py-1.5 rounded-full border border-primary text-primary font-label-bold text-xs hover:bg-primary/5 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
