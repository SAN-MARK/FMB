import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  IconHome, 
  IconSearch, 
  IconHandStop, 
  IconCoinRupee 
} from '@tabler/icons-react';

export const BottomNavBar: React.FC = () => {
  const { currentScreen, navigateTo, setRole, user, openAuthModal } = useApp();

  const isHome = currentScreen === 'role-selection' || currentScreen === 'splash';
  const isSearch = currentScreen === 'search-lost';
  const isReport = currentScreen === 'report-found' || currentScreen === 'drop-off' || currentScreen === 'tag-generated';
  const isRewards = currentScreen === 'active-cases' || currentScreen === 'hub-console';

  const handleHomeClick = () => {
    navigateTo('role-selection');
  };

  const handleSearchClick = () => {
    setRole('OWNER');
    navigateTo('search-lost');
  };

  const handleReportClick = () => {
    setRole('FINDER');
    navigateTo('report-found');
  };

  const handleRewardsClick = () => {
    if (user) {
      navigateTo('active-cases');
    } else {
      openAuthModal();
    }
  };

  return (
    <nav 
      id="chennai-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-4 bg-[#F7F0E6] border-t border-[#E8D5B7] pb-safe md:hidden h-16 shadow-[0_-4px_16px_rgba(123,45,0,0.06)]"
    >
      {/* Home Tab */}
      <button
        onClick={handleHomeClick}
        className="relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors"
      >
        <IconHome 
          size={22} 
          className={isHome ? 'text-[#7B2D00]' : 'text-[#A89279] hover:text-[#7B2D00]'} 
          stroke={isHome ? 2.3 : 1.6} 
        />
        <span className={`font-jakarta text-[11px] mt-0.5 ${isHome ? 'text-[#7B2D00] font-bold' : 'text-[#8C765C]'}`}>
          Home
        </span>
        {isHome && (
          <span className="absolute bottom-1 w-6 h-[2px] bg-[#7B2D00] rounded-full" />
        )}
      </button>

      {/* Search Tab */}
      <button
        onClick={handleSearchClick}
        className="relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors"
      >
        <IconSearch 
          size={22} 
          className={isSearch ? 'text-[#7B2D00]' : 'text-[#A89279] hover:text-[#7B2D00]'} 
          stroke={isSearch ? 2.3 : 1.6} 
        />
        <span className={`font-jakarta text-[11px] mt-0.5 ${isSearch ? 'text-[#7B2D00] font-bold' : 'text-[#8C765C]'}`}>
          Search
        </span>
        {isSearch && (
          <span className="absolute bottom-1 w-6 h-[2px] bg-[#7B2D00] rounded-full" />
        )}
      </button>

      {/* Report Tab */}
      <button
        onClick={handleReportClick}
        className="relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors"
      >
        <IconHandStop 
          size={22} 
          className={isReport ? 'text-[#C8541A]' : 'text-[#A89279] hover:text-[#C8541A]'} 
          stroke={isReport ? 2.3 : 1.6} 
        />
        <span className={`font-jakarta text-[11px] mt-0.5 ${isReport ? 'text-[#C8541A] font-bold' : 'text-[#8C765C]'}`}>
          Report
        </span>
        {isReport && (
          <span className="absolute bottom-1 w-6 h-[2px] bg-[#C8541A] rounded-full" />
        )}
      </button>

      {/* Rewards Tab */}
      <button
        onClick={handleRewardsClick}
        className="relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors"
      >
        <IconCoinRupee 
          size={22} 
          className={isRewards ? 'text-[#7B2D00]' : 'text-[#A89279] hover:text-[#7B2D00]'} 
          stroke={isRewards ? 2.3 : 1.6} 
        />
        <span className={`font-jakarta text-[11px] mt-0.5 ${isRewards ? 'text-[#7B2D00] font-bold' : 'text-[#8C765C]'}`}>
          Rewards
        </span>
        {isRewards && (
          <span className="absolute bottom-1 w-6 h-[2px] bg-[#7B2D00] rounded-full" />
        )}
      </button>
    </nav>
  );
};
