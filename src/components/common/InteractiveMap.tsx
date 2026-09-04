import React, { useState } from 'react';
import { Coordinates } from '../../types';
import { INITIAL_HUBS } from '../../data/mockData';
import { IconMapPin, IconCrosshair, IconLayersIntersect } from '@tabler/icons-react';

interface InteractiveMapProps {
  locationName: string;
  coordinates?: Coordinates;
  onLocationChange?: (locationName: string, coords: Coordinates) => void;
  isEditable?: boolean;
  selectedHubId?: string;
  onHubSelect?: (hubId: string) => void;
  heightClass?: string;
  badgeLabel?: string;
  showAllHubs?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locationName,
  coordinates = { lat: 13.0418, lng: 80.2341 }, // T. Nagar default
  onLocationChange,
  isEditable = true,
  selectedHubId,
  onHubSelect,
  heightClass = 'h-56 sm:h-64',
  badgeLabel = 'Chennai Operational Grid',
  showAllHubs = true
}) => {
  const [mapMode, setMapMode] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [activePin, setActivePin] = useState<string | null>(selectedHubId || 'hub-chennai-tnagar-02');
  const [isLocating, setIsLocating] = useState(false);

  // Chennai Hub Locations with coordinate offsets for the responsive SVG canvas
  const chennaiPins = [
    { id: 'hub-chennai-central-05', name: 'Central Rail Hub', tamil: 'சென்ட்ரல் Hub', x: 260, y: 55, lat: 13.0827, lng: 80.2707 },
    { id: 'hub-chennai-annanagar-04', name: 'Anna Nagar Hub', tamil: 'அண்ணா நகர் Hub', x: 140, y: 70, lat: 13.0850, lng: 80.2101 },
    { id: 'hub-chennai-tnagar-02', name: 'T. Nagar Hub', tamil: 'T.நகர் Hub', x: 190, y: 135, lat: 13.0418, lng: 80.2341 },
    { id: 'hub-chennai-marina', name: 'Marina Beach Hub', tamil: 'மெரினா கடற்கரை', x: 295, y: 125, lat: 13.0500, lng: 80.2824 },
    { id: 'hub-chennai-adyar-03', name: 'Adyar Transit Hub', tamil: 'அடையாறு Hub', x: 250, y: 190, lat: 13.0012, lng: 80.2565 },
    { id: 'hub-chennai-velachery-01', name: 'Velachery Civic Hub', tamil: 'வேளச்சேரி Hub', x: 165, y: 220, lat: 12.9756, lng: 80.2207 }
  ];

  const handlePinClick = (pin: typeof chennaiPins[0]) => {
    setActivePin(pin.id);
    if (onHubSelect) onHubSelect(pin.id);
    if (onLocationChange) onLocationChange(pin.name, { lat: pin.lat, lng: pin.lng });
  };

  const handleLocateGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const label = `Chennai GPS (${coords.lat.toFixed(3)}°N, ${coords.lng.toFixed(3)}°E)`;
        if (onLocationChange) onLocationChange(label, coords);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 6000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E8D5B7] ambient-shadow-card bg-[#F7F0E6] flex flex-col">
      
      {/* Top Map Bar with View Toggles (Standard | Satellite | Terrain) */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#FFFFFF] border-b border-[#E8D5B7] z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2E7D6B] animate-pulse" />
          <span className="font-jakarta font-semibold text-xs text-[#2B1810]">
            {badgeLabel}
          </span>
        </div>

        {/* View toggle buttons: Standard | Satellite | Terrain — rust underline on active */}
        <div className="flex items-center gap-2">
          {(['standard', 'satellite', 'terrain'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapMode(mode)}
              className={`relative px-2 py-1 text-xs font-jakarta capitalize transition-colors cursor-pointer ${
                mapMode === mode ? 'text-[#7B2D00] font-bold' : 'text-[#8C765C] hover:text-[#2B1810]'
              }`}
            >
              <span>{mode}</span>
              {mapMode === mode && (
                <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-[#7B2D00] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Map Graphic Area */}
      <div className={`w-full ${heightClass} relative overflow-hidden select-none`}>
        {mapMode === 'satellite' ? (
          /* Satellite View simulation */
          <div className="w-full h-full relative bg-[#1c2c38]">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80" 
              alt="Satellite Chennai View" 
              className="w-full h-full object-cover filter contrast-125 brightness-90"
            />
            <div className="absolute inset-0 bg-[#1A3A5C]/25" />
          </div>
        ) : mapMode === 'terrain' ? (
          /* Terrain View simulation */
          <div className="w-full h-full relative bg-[#33412a]">
            <img 
              src="https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1000&q=80" 
              alt="Terrain Chennai View" 
              className="w-full h-full object-cover filter contrast-110 brightness-95"
            />
            <div className="absolute inset-0 bg-[#7B2D00]/15" />
          </div>
        ) : (
          /* Standard Chennai Road Map Layout with Bay of Bengal coastline */
          <div className="w-full h-full relative bg-[#F7F0E6] flex items-center justify-center">
            <svg
              className="w-full h-full absolute inset-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 380 260"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Land Base (Vepery Cream) */}
              <rect width="380" height="260" fill="#F7F0E6" />
              
              {/* Bay of Bengal (Ocean water on the East/Right side) */}
              <path
                d="M 310 0 C 300 40 305 90 315 130 C 322 170 305 210 320 260 L 380 260 L 380 0 Z"
                fill="#1A3A5C"
                opacity="0.22"
              />
              <path
                d="M 320 0 C 310 40 315 90 325 130 C 332 170 315 210 330 260 L 380 260 L 380 0 Z"
                fill="#1A3A5C"
                opacity="0.3"
              />
              
              {/* Sandy Coastline (Marina Beach) */}
              <path
                d="M 305 0 C 295 40 300 90 310 130 C 317 170 300 210 315 260"
                stroke="#E8D5B7"
                strokeWidth="7"
                fill="none"
              />

              {/* Cooum & Adyar Rivers */}
              <path d="M 0 90 Q 140 100 220 85 T 310 75" fill="none" stroke="#B9D5E8" strokeWidth="4" strokeLinecap="round" />
              <path d="M 0 195 Q 120 180 220 190 T 315 190" fill="none" stroke="#B9D5E8" strokeWidth="5" strokeLinecap="round" />

              {/* Major Arterial Roads: Anna Salai / Mount Road (Central to Guindy) */}
              <path d="M 260 55 L 190 135 L 120 220" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
              <path d="M 260 55 L 190 135 L 120 220" stroke="#C8541A" strokeWidth="2.5" strokeOpacity="0.45" strokeLinecap="round" />

              {/* Poonamallee High Road */}
              <path d="M 0 65 L 260 55" stroke="#FFFFFF" strokeWidth="7" />
              <path d="M 0 65 L 260 55" stroke="#DCCBB0" strokeWidth="1.5" />

              {/* OMR / IT Corridor (Adyar southwards) */}
              <path d="M 250 190 L 250 260" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              <path d="M 250 190 L 250 260" stroke="#C8541A" strokeWidth="2" strokeOpacity="0.4" />

              {/* Inner Ring Road / 100ft Road (Anna Nagar to Velachery) */}
              <path d="M 140 70 L 140 150 L 165 220" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
              <path d="M 140 70 L 140 150 L 165 220" stroke="#DCCBB0" strokeWidth="1.5" />

              {/* Marina Kamarajar Salai Beach Road */}
              <path d="M 260 55 L 305 100 L 295 160 L 250 190" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
              <path d="M 260 55 L 305 100 L 295 160 L 250 190" stroke="#1A3A5C" strokeWidth="1.5" strokeOpacity="0.4" />

              {/* Area Labels */}
              <text x="330" y="30" fill="#1A3A5C" fontSize="9" fontFamily="Plus Jakarta Sans" fontWeight="600" opacity="0.8">BAY OF BENGAL</text>
              <text x="330" y="42" fill="#1A3A5C" fontSize="8" fontFamily="Tiro Tamil" opacity="0.8">வங்காள விரிகுடா</text>
              <text x="280" y="110" fill="#7B2D00" fontSize="8" fontFamily="Inter" opacity="0.7">Marina</text>
              <text x="175" y="125" fill="#7B2D00" fontSize="8" fontFamily="Inter" opacity="0.7">T. Nagar</text>
              <text x="115" y="60" fill="#7B2D00" fontSize="8" fontFamily="Inter" opacity="0.7">Anna Nagar</text>
              <text x="150" y="240" fill="#7B2D00" fontSize="8" fontFamily="Inter" opacity="0.7">Velachery</text>
              <text x="235" y="175" fill="#7B2D00" fontSize="8" fontFamily="Inter" opacity="0.7">Adyar</text>
            </svg>
          </div>
        )}

        {/* Map Pins: Marina Rust kolam-dot style with tails */}
        {showAllHubs && chennaiPins.map((pin) => {
          const isSelected = activePin === pin.id;
          return (
            <div
              key={pin.id}
              onClick={() => handlePinClick(pin)}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-full cursor-pointer group transition-transform duration-200 hover:scale-110"
              style={{ left: `${(pin.x / 380) * 100}%`, top: `${(pin.y / 260) * 100}%` }}
            >
              {/* Kolam Dot with Tail - Marina Rust Fill */}
              <div className="relative flex flex-col items-center">
                {/* Active Pulse Ring */}
                {isSelected && (
                  <span className="absolute -inset-1.5 rounded-full bg-[#C8541A]/30 animate-ping" />
                )}

                {/* Kolam Dot Pin Body */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(123,45,0,0.35)] transition-all ${
                  isSelected ? 'bg-[#7B2D00] text-[#F5C842] ring-2 ring-[#F5C842]' : 'bg-[#7B2D00] text-white hover:bg-[#C8541A]'
                }`}>
                  {/* Traditional Kolam flower / 4-petal dot symbol */}
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <circle cx="8" cy="8" r="2" />
                    <circle cx="8" cy="4" r="1" />
                    <circle cx="8" cy="12" r="1" />
                    <circle cx="4" cy="8" r="1" />
                    <circle cx="12" cy="8" r="1" />
                  </svg>
                </div>

                {/* Pin Tail */}
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#7B2D00] -mt-[1px]" />

                {/* Pin Label Tooltip */}
                <div className={`mt-0.5 px-1.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-jakarta font-semibold shadow-xs transition-opacity ${
                  isSelected ? 'bg-[#2B1810] text-white opacity-100' : 'bg-[#FFFFFF]/90 text-[#7B2D00] border border-[#E8D5B7] group-hover:opacity-100 opacity-80'
                }`}>
                  {pin.tamil}
                </div>
              </div>
            </div>
          );
        })}

        {/* GPS Auto-detect Button */}
        {isEditable && (
          <button
            type="button"
            onClick={handleLocateGPS}
            className="absolute bottom-3 right-3 z-30 p-2 bg-[#FFFFFF] border border-[#E8D5B7] rounded-xl shadow-md text-[#7B2D00] hover:bg-[#F7F0E6] active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-xs font-jakarta font-medium"
            title="Auto-detect Chennai GPS Location"
          >
            <IconCrosshair size={16} className={isLocating ? 'animate-spin text-[#C8541A]' : 'text-[#7B2D00]'} />
            <span className="hidden sm:inline">GPS கண்டறி</span>
          </button>
        )}
      </div>

      {/* Selected Location Summary Bar */}
      <div className="p-3 bg-[#FFFFFF] border-t border-[#E8D5B7] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-[#7B2D00]/10 text-[#7B2D00] flex items-center justify-center shrink-0">
            <IconMapPin size={16} />
          </div>
          <div className="truncate">
            <span className="block text-xs font-jakarta font-semibold text-[#2B1810] truncate">
              {locationName || 'சென்னை செயல்பாட்டு தளம் (Chennai Central Operations)'}
            </span>
            <span className="block text-[11px] text-[#614436] truncate">
              Near Marina & Mount Road transit corridor
            </span>
          </div>
        </div>

        <span className="shrink-0 px-2.5 py-0.5 bg-[#DCFCE7] text-[#14532D] border border-[#2E7D6B]/30 rounded-full text-[10px] font-jakarta font-semibold">
          Active Hub Grid
        </span>
      </div>
    </div>
  );
};
