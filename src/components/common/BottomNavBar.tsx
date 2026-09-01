import React from 'react';
import { useApp, ScreenName } from '../../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { currentScreen, navigateTo, openAuthModal, user, setRole } = useApp();

  const isHome = currentScreen === 'role-selection' || currentScreen === 'splash';
  const isSearch = currentScreen === 'search-lost';
  const isReport = currentScreen === 'report-found' || currentScreen === 'drop-off' || currentScreen === 'tag-generated';
  const isProfile = currentScreen === 'active-cases' || currentScreen === 'hub-console';

  const handleReportClick = () => {
    setRole('FINDER');
    navigateTo('report-found');
  };

  const handleSearchClick = () => {
    setRole('OWNER');
    navigateTo('search-lost');
  };

  const handleHomeClick = () => {
    navigateTo('role-selection');
  };

  const handleProfileClick = () => {
    if (user) {
      if (user.role_default === 'HUB_STAFF' || user.role_default === 'ADMIN') {
        navigateTo('hub-console');
      } else {
        navigateTo('active-cases');
      }
    } else {
      openAuthModal();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-4 pt-2 bg-surface/95 backdrop-blur-md shadow-[0_-4px_12px_rgba(2,36,72,0.05)] border-t border-outline-variant/20 pb-safe md:hidden h-18">
      {/* Home Tab */}
      <button
        onClick={handleHomeClick}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
          isHome ? 'text-primary scale-105' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className={`material-symbols-outlined text-2xl ${isHome ? 'filled font-bold' : ''}`}>
          home
        </span>
        <span className="font-label-bold text-[10px] mt-0.5">Home</span>
      </button>

      {/* Search Tab */}
      <button
        onClick={handleSearchClick}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
          isSearch ? 'text-primary scale-105' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className={`material-symbols-outlined text-2xl ${isSearch ? 'filled font-bold' : ''}`}>
          search
        </span>
        <span className="font-label-bold text-[10px] mt-0.5">Search</span>
      </button>

      {/* Report Active / Center Tab */}
      <button
        onClick={handleReportClick}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
          isReport
            ? 'bg-primary-container text-on-primary-container shadow-md scale-100'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        }`}
      >
        <span
          className={`material-symbols-outlined text-2xl ${
            isReport ? 'filled text-on-primary-container' : ''
          }`}
        >
          add_circle
        </span>
        <span
          className={`font-label-bold text-[10px] ${
            isReport ? 'text-on-primary-container font-semibold' : ''
          }`}
        >
          Report
        </span>
      </button>

      {/* Profile / Cases Tab */}
      <button
        onClick={handleProfileClick}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
          isProfile ? 'text-primary scale-105' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className={`material-symbols-outlined text-2xl ${isProfile ? 'filled' : ''}`}>
          person
        </span>
        <span className="font-label-bold text-[10px] mt-0.5">Profile</span>
      </button>
    </nav>
  );
};
