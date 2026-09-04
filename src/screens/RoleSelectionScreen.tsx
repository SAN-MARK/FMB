import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryChip } from '../components/common/CategoryChip';
import { INITIAL_HUBS, ChennaiHub } from '../data/mockData';
import { 
  IconMapPin, 
  IconClock, 
  IconArrowRight, 
  IconSearch, 
  IconHandStop, 
  IconChevronRight, 
  IconCoinRupee,
  IconShieldCheck,
  IconSparkles
} from '@tabler/icons-react';

export const RoleSelectionScreen: React.FC = () => {
  const { 
    setRole, 
    navigateTo, 
    userActiveCase, 
    items, 
    user, 
    openAuthModal 
  } = useApp();

  const [selectedHubId, setSelectedHubId] = useState<string>('hub-chennai-tnagar-02');
  const hubs = INITIAL_HUBS as ChennaiHub[];

  const handleStartReport = () => {
    setRole('FINDER');
    navigateTo('report-found');
  };

  const handleStartSearch = () => {
    setRole('OWNER');
    navigateTo('search-lost');
  };

  const handleItemClick = (itemId: string) => {
    navigateTo('active-cases');
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col selection:bg-[#C8541A] selection:text-white pb-20 md:pb-12">
      {/* SCREEN 2 — Top navigation bar (Marina Rust, 64px, logo, notification bell with jasmine yellow dot, user avatar circle) */}
      <TopAppBar />

      {/* Main Content Area: centered mobile sandbox container (max 480px, expanded comfortably on desktop) */}
      <main className="w-full max-w-[480px] mx-auto px-4 pt-20 flex flex-col gap-6">

        {/* Active Case Quick Access Banner (if user has an ongoing case) */}
        {userActiveCase && (
          <div className="w-full bg-[#FFFFFF] rounded-2xl border-l-4 border-l-[#C8541A] border border-[#E8D5B7] p-3.5 ambient-shadow-card flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#7B2D00]/10 text-[#7B2D00] flex items-center justify-center shrink-0">
                <IconShieldCheck size={20} />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-jakarta font-bold text-xs text-[#2B1810]">
                    செயலில் உள்ள கேஸ் #{userActiveCase.item_code}
                  </span>
                  <StatusBadge status={userActiveCase.status} size="sm" />
                </div>
                <p className="text-[11px] text-[#614436] truncate">
                  {userActiveCase.category} • {userActiveCase.location_name}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('active-cases')}
              className="px-2.5 py-1 bg-[#7B2D00] text-white rounded-lg text-xs font-jakarta font-semibold shrink-0 hover:bg-[#C8541A] transition-colors cursor-pointer"
            >
              நிலை (Status)
            </button>
          </div>
        )}

        {/* HERO CARD (Full Width): Bay of Bengal (#1A3A5C) Background */}
        <section 
          id="marina-hero-card"
          className="relative w-full rounded-2xl overflow-hidden bg-[#1A3A5C] text-white p-5 sm:p-6 ambient-shadow-card flex flex-col justify-between min-h-[175px] shadow-[0_8px_24px_rgba(26,58,92,0.22)]"
        >
          {/* Subtle wave SVG shape at bottom edge (white, 8% opacity) */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-[0.08]">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-16 fill-white">
              <path d="M0.00,49.98 C150.00,140.00 349.81,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-1.5">
            {/* Bilingual Heading in Tiro Tamil 22px white */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[#F5C842] text-[10px] font-jakarta font-bold uppercase tracking-wider">
                Chennai Network
              </span>
              <span className="text-white/60 text-xs">• 100% Escrow Safe</span>
            </div>
            <h1 className="font-tiro text-[22px] sm:text-2xl font-bold text-white leading-tight">
              கண்டீர்களா? (Did you find something?)
            </h1>
            <p className="font-inter text-xs sm:text-[13px] text-[#E8D5B7] leading-relaxed">
              Drop it at a hub. Earn ₹60 when returned.
            </p>
          </div>

          {/* CTA: Jasmine Yellow (#F5C842) button, Night Marina text "Item Report பண்ணு →" */}
          <div className="relative z-10 pt-4 flex items-center justify-between">
            <button
              id="hero-report-button"
              onClick={handleStartReport}
              className="px-4 py-2.5 bg-[#F5C842] text-[#2B1810] hover:brightness-105 active:scale-98 rounded-xl font-jakarta font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Item Report பண்ணு</span>
              <IconArrowRight size={16} stroke={2.5} />
            </button>

            {/* Quick Link to Owner Search */}
            <button
              onClick={handleStartSearch}
              className="text-xs text-[#E8D5B7] hover:text-white font-inter underline underline-offset-4 cursor-pointer"
            >
              இழந்ததை தேட (I Lost) →
            </button>
          </div>
        </section>

        {/* HUB MAP SECTION */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-jakarta font-semibold text-sm text-[#2B1810]">
              அருகில் உள்ள Hubs (Nearby Hubs)
            </h2>
            <span className="text-xs text-[#7B2D00] font-tiro font-semibold">
              6 Active Centers
            </span>
          </div>

          {/* Interactive Chennai Road Map with Hub Pins */}
          <InteractiveMap
            locationName="Chennai Central Operational Grid"
            selectedHubId={selectedHubId}
            onHubSelect={(hubId) => setSelectedHubId(hubId)}
            heightClass="h-56 sm:h-64"
          />
        </section>

        {/* HUB CARDS (Horizontal Scroll) */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-jakarta font-medium text-[#614436]">
              Swipe to explore verified drop-off hubs
            </span>
            <span className="text-[11px] text-[#8C765C]">T.Nagar • Marina • Adyar</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1 snap-x">
            {hubs.map((hub) => {
              const isSelected = selectedHubId === hub.id;
              return (
                <div
                  key={hub.id}
                  onClick={() => setSelectedHubId(hub.id)}
                  className={`min-w-[240px] sm:min-w-[260px] bg-[#FFFFFF] rounded-2xl border p-3.5 flex flex-col justify-between gap-3 snap-start ambient-shadow-card cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-[#7B2D00] ring-1 ring-[#7B2D00] shadow-[0_4px_16px_rgba(123,45,0,0.12)]'
                      : 'border-[#E8D5B7] hover:border-[#7B2D00]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#7B2D00]/10 text-[#7B2D00] flex items-center justify-center shrink-0">
                        <IconMapPin size={18} />
                      </div>
                      <div>
                        {/* Hub Name in Tamil + English */}
                        <h3 className="font-tiro text-sm font-semibold text-[#2B1810] leading-tight">
                          {hub.tamil_name || hub.name}
                        </h3>
                        <p className="font-inter text-[11px] text-[#614436]">
                          {hub.name}
                        </p>
                      </div>
                    </div>

                    {/* Distance Badge in Bay of Bengal blue pill */}
                    <span className="px-2 py-0.5 rounded-full bg-[#1A3A5C] text-white text-[10px] font-jakarta font-semibold shrink-0">
                      {hub.distance_badge || '1.8 km'}
                    </span>
                  </div>

                  <p className="text-xs text-[#614436] line-clamp-1">
                    {hub.landmark || hub.address}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8D5B7]/60 text-xs">
                    {/* Opening hours with neem green dot */}
                    <div className="flex items-center gap-1.5 text-[#2E7D6B] font-inter font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D6B]" />
                      <span>{hub.hours || '8AM - 10PM'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRole('FINDER');
                        navigateTo('report-found');
                      }}
                      className="text-[11px] font-jakarta font-bold text-[#C8541A] hover:underline"
                    >
                      Drop Item →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RECENT ITEMS SECTION */}
        <section className="flex flex-col gap-3 pb-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-tiro text-base font-semibold text-[#2B1810]">
              உங்கள் Items (Recent Network Items)
            </h2>
            <button
              onClick={() => navigateTo('search-lost')}
              className="text-xs font-jakarta font-semibold text-[#7B2D00] hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {items.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="relative bg-[#FFFFFF] rounded-xl border border-[#E8D5B7] p-3 pl-4 ambient-shadow-card flex items-center justify-between gap-3 cursor-pointer hover:border-[#7B2D00]/50 transition-colors"
              >
                {/* Left accent bar in rust (3px) */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#7B2D00] rounded-l-xl" />

                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg bg-[#F7F0E6] overflow-hidden shrink-0 border border-[#E8D5B7]">
                    <img 
                      src={item.photo_url} 
                      alt={item.category} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#7B2D00]">
                        #{item.item_code}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="font-jakarta text-xs font-semibold text-[#2B1810] mt-0.5 truncate">
                      {item.category} • {item.location_name}
                    </p>
                    <p className="text-[11px] text-[#614436] truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <IconChevronRight size={18} className="text-[#8C765C] shrink-0" />
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* SCREEN 2 — Bottom navigation: Cream background, sand border, 4 tabs (Home | Search | Report | Rewards) */}
      <BottomNavBar />
    </div>
  );
};
