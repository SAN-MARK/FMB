import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusTimeline } from '../components/common/StatusTimeline';
import { Button } from '../components/common/Button';
import { ItemStatus } from '../types';

export const ItemReceivedScreen: React.FC = () => {
  const { activeItem, items, updateItemStatus, navigateTo, user } = useApp();
  const [currentStatus, setCurrentStatus] = useState<ItemStatus>(
    activeItem?.status || 'dropped_at_hub'
  );

  // Keep in sync with latest item updates in context
  useEffect(() => {
    if (activeItem) {
      const match = items.find(i => i.id === activeItem.id);
      if (match) {
        setCurrentStatus(match.status);
      }
    }
  }, [items, activeItem]);

  // Demo status stepper for hub staff scan simulation
  const handleAdvanceStatus = async () => {
    if (!activeItem) return;
    const flow: ItemStatus[] = ['reported', 'dropped_at_hub', 'listed', 'claimed', 'returned'];
    const currentIndex = flow.indexOf(currentStatus);
    const nextStatus = flow[(currentIndex + 1) % flow.length];
    await updateItemStatus(activeItem.id, nextStatus);
    setCurrentStatus(nextStatus);
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased overflow-x-hidden relative flex flex-col justify-center items-center py-10 md:py-16 px-container-margin-mobile md:px-container-margin-desktop">
      {/* Background Ambient Glows (Matching Stitch Image 12) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-tertiary-fixed opacity-25 rounded-full blur-3xl absolute -top-32 -left-32 mix-blend-multiply" />
        <div className="w-[500px] h-[500px] bg-primary-fixed opacity-30 rounded-full blur-3xl absolute -bottom-20 -right-20 mix-blend-multiply" />
      </div>

      {/* Main Container Card */}
      <main className="z-10 bg-surface-container-lowest rounded-2xl ambient-shadow-modal border border-outline-variant/30 p-6 md:p-12 w-full max-w-xl text-center flex flex-col items-center">
        {/* Success Pulsing Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-tertiary-fixed rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-[0_4px_12px_rgba(164,243,202,0.4)] relative">
          <div className="absolute inset-0 bg-tertiary-fixed rounded-full animate-ping opacity-20" />
          <span className="material-symbols-outlined filled text-tertiary-container text-4xl md:text-5xl">
            check_circle
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">
          Item Received ✅
        </h1>

        {/* Supporting Copy */}
        <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-md mx-auto mb-8 md:mb-10">
          The item is now safe. We'll notify you as soon as the owner claims it. Thank you for your integrity.
        </p>

        {/* Item Tag details badge */}
        {activeItem && (
          <div className="mb-6 px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs flex items-center justify-between w-full">
            <span className="text-on-surface-variant">Tag: <strong className="text-primary font-mono">{activeItem.item_code}</strong></span>
            <span className="text-on-surface-variant">Category: <strong className="text-on-surface">{activeItem.category}</strong></span>
          </div>
        )}

        {/* Status Timeline Reusable Component */}
        <StatusTimeline status={currentStatus} className="mb-8" />

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigateTo('role-selection')}
          >
            Back to Home
          </Button>

          {/* Interactive Simulation / Realtime Trigger */}
          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Hub Sync Active
            </span>

            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="text-xs font-label-bold text-secondary hover:underline px-2.5 py-1 rounded bg-secondary-container/10 border border-secondary-container/30"
              title="Test Hub Staff Status updates"
            >
              ⚡ Test Staff Scan Next Step
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
