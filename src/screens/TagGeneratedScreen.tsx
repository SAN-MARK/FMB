import React, { useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';

export const TagGeneratedScreen: React.FC = () => {
  const { activeItem, hubs, navigateTo } = useApp();
  const qrRef = useRef<HTMLDivElement>(null);

  const itemCode = activeItem?.item_code || 'FB-9921-X';
  const assignedHub = hubs.find(h => h.id === activeItem?.hub_id) || hubs[0];

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#022448', '#fdb244', '#a4f3ca', '#adc8f5']
      });
    } catch (e) {
      // Confetti fallback
    }
  }, []);

  const handleDownloadTag = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `FindBack-Tag-${itemCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: `FindBack Tag: ${itemCode}`,
      text: `Item registered on FindBack network with Tag ${itemCode}. Drop-off at ${assignedHub.name}.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(`FindBack Item Tag: ${itemCode} - Hub: ${assignedHub.name}`);
      alert(`Tag ${itemCode} copied to clipboard!`);
    }
  };

  const handleViewStatus = () => {
    navigateTo('item-received');
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col pt-16 pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('drop-off')} />

      <main className="flex-grow flex flex-col items-center justify-center px-container-margin-mobile md:px-container-margin-desktop w-full max-w-lg mx-auto py-6 md:py-10">
        <div className="w-full relative">
          
          {/* Celebratory Card (Matching Stitch Image 10) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 relative overflow-hidden ambient-shadow-modal border border-outline-variant/30 text-center flex flex-col items-center">
            {/* Confetti Background Pattern */}
            <div className="absolute inset-0 confetti-pattern pointer-events-none" />

            {/* Emblem / Badge */}
            <div className="w-16 h-16 bg-secondary-fixed rounded-full flex items-center justify-center mb-5 relative z-10 shadow-[0_4px_12px_rgba(253,178,68,0.25)] ring-4 ring-secondary-container/10">
              <span className="material-symbols-outlined text-on-secondary-fixed text-3xl filled">
                verified
              </span>
            </div>

            {/* Headline & ID */}
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1 relative z-10">
              Tag Generated
            </h1>
            <p className="text-sm font-body-md text-on-surface-variant mb-6 relative z-10">
              ID: <span className="font-bold text-on-surface text-base tracking-wider">{itemCode}</span>
            </p>

            {/* Scannable QR Code Canvas */}
            <div
              ref={qrRef}
              className="bg-surface p-4 rounded-xl border border-outline-variant/50 mb-6 relative z-10 shadow-[0_4px_12px_rgba(2,36,72,0.06)] flex flex-col items-center"
            >
              <QRCodeCanvas
                value={`https://findback.network/tag/${itemCode}?hub=${encodeURIComponent(assignedHub.name)}&cat=${activeItem?.category || 'Item'}`}
                size={180}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#022448"
              />
              <span className="text-[11px] font-label-bold text-on-surface-variant mt-2 tracking-widest uppercase">
                {itemCode}
              </span>
            </div>

            {/* Drop-off Instructions Card */}
            <div className="bg-surface-container rounded-xl p-4 mb-6 w-full relative z-10 text-left flex items-start gap-3 border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5 filled">
                location_on
              </span>
              <div>
                <p className="font-label-bold text-xs text-on-surface mb-0.5">
                  Drop-off Instructions
                </p>
                <p className="font-body-md text-xs text-on-surface-variant">
                  Drop this at <strong className="text-on-surface font-semibold">{assignedHub.name}</strong> within 48hrs.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col w-full gap-3 relative z-10">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleDownloadTag}
                icon={<span className="material-symbols-outlined text-lg">download</span>}
              >
                Download Tag
              </Button>

              <Button
                variant="secondary"
                fullWidth
                size="md"
                onClick={handleShare}
                icon={<span className="material-symbols-outlined text-lg">share</span>}
              >
                Share
              </Button>

              <button
                type="button"
                onClick={handleViewStatus}
                className="w-full mt-1 py-2 text-xs font-label-bold text-primary hover:underline flex items-center justify-center gap-1"
              >
                <span>Track Status in Hub Timeline</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Emotional Footer (Matching Stitch Image 10) */}
          <div className="mt-8 text-center px-4">
            <span className="material-symbols-outlined text-secondary text-3xl mb-1 filled inline-block">
              favorite
            </span>
            <p className="text-base font-serif italic text-primary font-medium">
              You're making a difference.
            </p>
            <p className="text-xs font-body-md text-on-surface-variant mt-1">
              Thank you for helping reunite someone with what matters.
            </p>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
};
