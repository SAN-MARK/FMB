import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';
import { findNearestHub } from '../data/mockData';

export const DropOffHubScreen: React.FC = () => {
  const { activeItem, hubs, confirmItemDropOff, navigateTo, isLoading } = useApp();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Identify assigned hub from active item or default to closest
  const assignedHub = hubs.find(h => h.id === activeItem?.hub_id) || hubs[0];
  const hubDistance = activeItem
    ? findNearestHub(activeItem.lat, activeItem.lng, hubs)
    : { distanceMinutesWalk: 2, distanceKm: 0.15 };

  const handleGetDirections = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${assignedHub.lat},${assignedHub.lng}&destination_place_id=${encodeURIComponent(assignedHub.name)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmDropOff = async () => {
    if (activeItem) {
      await confirmItemDropOff(activeItem.id);
    }
    navigateTo('tag-generated');
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col pt-16 pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('report-found')} />

      <main className="max-w-[1200px] mx-auto pt-2 md:pt-6 pb-8 px-container-margin-mobile md:px-container-margin-desktop min-h-[calc(100vh-4rem)] flex flex-col w-full">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-primary mb-2">
            Drop-off at your nearest Hub
          </h1>
          <p className="text-sm md:text-base font-body-lg text-on-surface-variant max-w-2xl">
            We've located a secure FindBack partner facility nearby to safely deposit the item.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter flex-grow items-stretch">
          {/* Map Card (Dominant Left / Top) */}
          <div className="md:col-span-7 lg:col-span-8 bg-surface-container-lowest rounded-2xl ambient-shadow-card border border-outline-variant/30 overflow-hidden flex flex-col relative min-h-[260px] md:min-h-[420px]">
            {/* Verified Partner Badge Top Pill */}
            <div className="absolute top-3 left-3 z-10 bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-outline-variant/40 flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-tertiary-container text-base filled">
                verified
              </span>
              <span className="text-xs font-label-bold text-tertiary-container">
                This hub is a verified FindBack partner
              </span>
            </div>

            {/* Map Visual Layer */}
            <div className="w-full h-full flex-grow relative bg-surface-container-high overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=80"
                alt="City Hub Map View"
                className="w-full h-full object-cover filter contrast-105"
              />

              {/* Pin Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center animate-bounce-short">
                  <div className="px-3 py-1 bg-primary text-white rounded-full text-xs font-label-bold shadow-md mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs filled">store</span>
                    <span>{assignedHub.name}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-white shadow-xl">
                    <span className="material-symbols-outlined text-lg filled">navigation</span>
                  </div>
                  <div className="w-2 h-2 bg-primary rotate-45 -mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Details Sidebar (Right / Bottom) */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-element-gap">
            <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 ambient-shadow-card border border-outline-variant/30 flex flex-col h-full justify-between">
              <div>
                {/* Storefront / Civic Hub Image */}
                <div className="w-full h-32 md:h-36 rounded-xl bg-surface-container-highest mb-4 overflow-hidden relative shadow-inner">
                  <img
                    src={assignedHub.photo_url}
                    alt={assignedHub.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-label-bold rounded-full">
                    Partner Hub #4A
                  </span>
                </div>

                {/* Hub Info */}
                <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1.5">
                  {assignedHub.name}
                </h2>
                
                <p className="text-xs md:text-sm text-on-surface-variant mb-6 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                    location_on
                  </span>
                  <span>{assignedHub.address}</span>
                </p>

                {/* 2-Col Stats Box */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex flex-col">
                    <span className="text-xs font-label-bold text-on-surface-variant mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">
                        directions_walk
                      </span>
                      Distance
                    </span>
                    <span className="text-xl font-bold font-sans text-primary">
                      {hubDistance.distanceMinutesWalk} mins
                    </span>
                    <span className="text-[11px] text-on-surface-variant">away ({hubDistance.distanceKm} km)</span>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex flex-col">
                    <span className="text-xs font-label-bold text-on-surface-variant mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">
                        schedule
                      </span>
                      Hours
                    </span>
                    <span className="text-xl font-bold font-sans text-primary">
                      {assignedHub.hours}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Open until today</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  onClick={handleGetDirections}
                  icon={<span className="material-symbols-outlined text-lg">navigation</span>}
                >
                  Get Directions
                </Button>

                <Button
                  variant="reward"
                  fullWidth
                  size="md"
                  isLoading={isLoading}
                  onClick={handleConfirmDropOff}
                  icon={<span className="material-symbols-outlined text-lg filled">check_circle</span>}
                >
                  I've Dropped It Off
                </Button>

                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="w-full text-center text-xs font-label-bold text-primary hover:underline py-1.5"
                >
                  I need help getting there
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full ambient-shadow-modal border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-primary">Drop-off Assistance</h3>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              If you cannot reach <strong>{assignedHub.name}</strong>, you can contact the hub supervisor or choose an alternative drop-off locker.
            </p>
            <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
              <p className="font-label-bold text-on-surface">Hub Phone:</p>
              <p className="text-primary font-bold">{assignedHub.phone || '+1 (415) 555-0192'}</p>
            </div>
            <Button variant="primary" fullWidth size="sm" onClick={() => setIsHelpModalOpen(false)}>
              Got It
            </Button>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};
