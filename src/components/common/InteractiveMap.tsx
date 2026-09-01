import React, { useState } from 'react';
import { Coordinates } from '../../types';

interface InteractiveMapProps {
  locationName: string;
  coordinates: Coordinates;
  onLocationChange?: (locationName: string, coords: Coordinates) => void;
  isEditable?: boolean;
  hubName?: string;
  heightClass?: string;
  badgeLabel?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locationName,
  coordinates,
  onLocationChange,
  isEditable = true,
  hubName,
  heightClass = 'h-48 md:h-56',
  badgeLabel = 'Auto-pinned Location'
}) => {
  const [mapMode, setMapMode] = useState<'vector' | 'satellite' | 'terrain'>('vector');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState(locationName);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        const detectedName = `Lat: ${newCoords.lat.toFixed(4)}, Lng: ${newCoords.lng.toFixed(4)}`;
        if (onLocationChange) {
          onLocationChange(detectedName, newCoords);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation denied or failed, using fallback:', err);
        setIsEditingModalOpen(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleManualSave = () => {
    if (customAddress.trim() && onLocationChange) {
      onLocationChange(customAddress.trim(), coordinates);
    }
    setIsEditingModalOpen(false);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-outline-variant/50 ambient-shadow-card bg-surface-container-lowest group">
      {/* Map Canvas Visual Layer */}
      <div className={`w-full ${heightClass} relative overflow-hidden bg-slate-100`}>
        {mapMode === 'satellite' ? (
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80"
            alt="Satellite Map Grid"
            className="w-full h-full object-cover filter contrast-110"
          />
        ) : mapMode === 'terrain' ? (
          <img
            src="https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1000&q=80"
            alt="Terrain Map Grid"
            className="w-full h-full object-cover filter brightness-95"
          />
        ) : (
          /* High-fidelity Vector Map Grid */
          <div className="w-full h-full relative bg-[#f1f5f9] flex items-center justify-center">
            <svg
              className="w-full h-full absolute inset-0 opacity-80"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 400 240"
            >
              {/* Background Grid Roads */}
              <rect width="400" height="240" fill="#f4f6f8" />
              {/* Water feature */}
              <path d="M 320 0 Q 340 120 400 180 L 400 0 Z" fill="#e0f2fe" opacity="0.7" />
              {/* Major Roads */}
              <path d="M 0 60 L 400 80" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
              <path d="M 0 60 L 400 80" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              
              <path d="M 0 160 Q 200 140 400 180" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
              <path d="M 0 160 Q 200 140 400 180" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

              <path d="M 120 0 L 160 240" stroke="#ffffff" strokeWidth="10" />
              <path d="M 120 0 L 160 240" stroke="#cbd5e1" strokeWidth="1.5" />

              <path d="M 280 0 L 260 240" stroke="#ffffff" strokeWidth="10" />
              <path d="M 280 0 L 260 240" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Park Blocks */}
              <rect x="40" y="90" width="60" height="50" rx="4" fill="#dcfce7" opacity="0.6" />
              <rect x="180" y="30" width="80" height="40" rx="4" fill="#dcfce7" opacity="0.6" />
              <rect x="290" y="100" width="70" height="60" rx="4" fill="#f1f5f9" />
            </svg>
          </div>
        )}

        {/* Central Map Pin Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative -translate-y-4 flex flex-col items-center animate-bounce-short">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-white">
              <span className="material-symbols-outlined text-xl filled">
                {hubName ? 'store' : 'location_on'}
              </span>
            </div>
            <div className="w-2.5 h-2.5 bg-primary rotate-45 -mt-1 shadow-sm" />
            <div className="w-6 h-2 bg-primary/20 rounded-full blur-[2px] mt-1" />
          </div>
        </div>

        {/* Map Layer Switcher */}
        <div className="absolute top-2 right-2 flex items-center bg-surface/90 backdrop-blur-md rounded-lg p-1 border border-outline-variant/40 shadow-sm z-20">
          <button
            type="button"
            onClick={() => setMapMode('vector')}
            className={`px-2 py-1 text-[11px] font-label-bold rounded ${
              mapMode === 'vector' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`px-2 py-1 text-[11px] font-label-bold rounded ${
              mapMode === 'satellite' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sat
          </button>
          <button
            type="button"
            onClick={() => setMapMode('terrain')}
            className={`px-2 py-1 text-[11px] font-label-bold rounded ${
              mapMode === 'terrain' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Terrain
          </button>
        </div>

        {/* GPS Locate Me Button */}
        {isEditable && (
          <button
            type="button"
            onClick={handleLocateMe}
            className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-surface/90 backdrop-blur-md border border-outline-variant/40 shadow-sm flex items-center justify-center text-primary hover:bg-white active:scale-95 transition-all z-20"
            title="Auto-detect My Location"
          >
            <span className={`material-symbols-outlined text-lg ${isLocating ? 'animate-spin' : ''}`}>
              my_location
            </span>
          </button>
        )}

        {/* Bottom Floating Location Badge (Matching Design) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-surface/95 backdrop-blur-md rounded-xl px-3 py-2 flex items-center justify-between border border-outline-variant/40 shadow-sm z-20">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-xl shrink-0">
              location_on
            </span>
            <div className="flex flex-col truncate">
              <span className="font-label-bold text-[11px] md:text-[12px] text-on-surface">
                {badgeLabel}
              </span>
              <span className="font-body-md text-[10px] md:text-[11px] text-on-surface-variant truncate">
                {locationName || 'Central Park, NY'}
              </span>
            </div>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={() => setIsEditingModalOpen(true)}
              className="text-xs font-label-bold text-primary hover:underline px-2 py-1 rounded bg-primary/5 shrink-0"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Edit Address Modal */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full ambient-shadow-modal border border-outline-variant/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-primary">Specify Location</h3>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Enter the landmark, street, or venue where the item was found:
            </p>
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="e.g., Central Park / 5th Ave Fountain"
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant text-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="px-4 py-2 text-xs font-label-bold text-on-surface-variant hover:bg-surface-container-low rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualSave}
                className="px-5 py-2 text-xs font-label-bold bg-primary text-white rounded-full hover:bg-primary/90 shadow-sm"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
