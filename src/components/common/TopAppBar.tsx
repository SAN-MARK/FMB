import React from 'react';
import { useApp } from '../../context/AppContext';
import { FindBackLogo } from './FindBackLogo';
import { IconBell, IconArrowLeft, IconPalette } from '@tabler/icons-react';

interface TopAppBarProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ showBack, onBack, title }) => {
  const { user, userActiveCase, currentScreen, navigateTo, openAuthModal } = useApp();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigateTo('role-selection');
    }
  };

  const getUserInitial = (): string => {
    if (!user || !user.name) return 'C';
    return user.name.trim().charAt(0).toUpperCase();
  };

  return (
    <header 
      id="chennai-top-app-bar"
      className="flex justify-between items-center w-full px-4 md:px-6 h-16 fixed top-0 left-0 right-0 z-40 bg-[#7B2D00] text-white shadow-[0_4px_16px_rgba(43,24,16,0.25)] transition-all duration-200"
    >
      <div className="flex items-center gap-2.5">
        {showBack ? (
          <button
            onClick={handleBackClick}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Go Back"
          >
            <IconArrowLeft size={22} stroke={2.2} />
          </button>
        ) : null}

        <FindBackLogo 
          variant="rust" 
          size="md" 
          showTamilAccent={!title}
          onClick={() => navigateTo('role-selection')}
        />

        {title && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/20">
            <span className="font-tiro text-sm text-[#E8D5B7]">{title}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Design System Showcase Quick Launcher */}
        <button
          onClick={() => navigateTo('active-cases')}
          className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-xs font-jakarta text-[#E8D5B7] transition-all cursor-pointer"
          title="Chennai Brand Guidelines & Cases"
        >
          <IconPalette size={14} className="text-[#F5C842]" />
          <span className="text-[11px] font-medium hidden md:inline">Chennai Hub</span>
        </button>

        {/* Active Case Quick Badge */}
        {userActiveCase && currentScreen !== 'active-cases' && (
          <button
            onClick={() => navigateTo('active-cases')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5C842] text-[#2B1810] rounded-full text-xs font-jakarta font-bold shadow-sm hover:brightness-105 transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8541A] animate-pulse" />
            <span className="text-[11px]">Active</span>
          </button>
        )}

        {/* Notification Bell with Jasmine Yellow unread dot */}
        <button
          onClick={() => navigateTo('active-cases')}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
          title="Chennai Network Alerts"
        >
          <IconBell size={21} stroke={1.8} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F5C842] ring-2 ring-[#7B2D00]" />
        </button>

        {/* User Avatar Circle */}
        {user ? (
          <button
            onClick={openAuthModal}
            className="w-9 h-9 rounded-full bg-[#F7F0E6] text-[#7B2D00] font-jakarta font-bold text-sm flex items-center justify-center ring-2 ring-[#F5C842]/80 hover:ring-white transition-all overflow-hidden cursor-pointer shadow-sm"
            title={`Signed in as ${user.name}`}
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
            className="px-3.5 py-1.5 rounded-xl bg-[#C8541A] text-white font-jakarta font-semibold text-xs hover:brightness-110 transition-all cursor-pointer shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
