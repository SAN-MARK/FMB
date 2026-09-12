import React, { useState, useEffect, useRef } from 'react';
import { Hub } from '../types';

interface ChennaiMapProps {
  hubs: Hub[];
  selectedHubId?: string;
  onSelectHub?: (hub: Hub) => void;
  userCoords?: { lat: number; lng: number } | null;
  mode?: 'picker' | 'admin_volume' | 'display';
  height?: string;
}

// Chennai metro strict bounding box
export const CHENNAI_METRO_BOUNDS = {
  north: 13.24,
  south: 12.83,
  west: 80.04,
  east: 80.32,
  center: { lat: 13.0418, lng: 80.2341 },
};

// Haversine distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const ChennaiMap: React.FC<ChennaiMapProps> = ({
  hubs,
  selectedHubId,
  onSelectHub,
  userCoords,
  mode = 'picker',
  height = '360px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeHub, setActiveHub] = useState<Hub | null>(null);
  const [mapType, setMapType] = useState<'cartographic' | 'blueprint' | 'volume'>('cartographic');

  useEffect(() => {
    if (selectedHubId) {
      const found = hubs.find((h) => h.id === selectedHubId);
      if (found) setActiveHub(found);
    }
  }, [selectedHubId, hubs]);

  // Convert lat/lng to percentage in Chennai metro bounding box
  const getPositionPercent = (lat: number, lng: number) => {
    const latSpan = CHENNAI_METRO_BOUNDS.north - CHENNAI_METRO_BOUNDS.south;
    const lngSpan = CHENNAI_METRO_BOUNDS.east - CHENNAI_METRO_BOUNDS.west;

    // Invert Y because latitude increases North
    const top = ((CHENNAI_METRO_BOUNDS.north - lat) / latSpan) * 100;
    const left = ((lng - CHENNAI_METRO_BOUNDS.west) / lngSpan) * 100;

    return {
      top: `${Math.max(8, Math.min(92, top))}%`,
      left: `${Math.max(8, Math.min(92, left))}%`,
    };
  };

  return (
    <div className="flex flex-col border border-[#1B1B1B] bg-[#F1ECE2] select-none">
      {/* Header controls: Architectural Cartography Titlebar */}
      <div className="px-4 py-2.5 bg-[#E8E1D3] border-b border-[#1B1B1B] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#1B1B1B] block" />
          <span className="font-['Archivo_Black'] uppercase text-xs text-[#1B1B1B] tracking-wide">
            CHENNAI METROPOLITAN RECOVERY GRID
          </span>
          <span className="font-['Space_Mono'] text-[10px] text-[#4A4A47] hidden sm:inline">
            [ 12.83°N – 13.24°N · 80.04°E – 80.32°E ]
          </span>
        </div>

        {/* Layer Switcher */}
        <div className="flex items-center gap-1 text-[10px] font-['Space_Mono'] uppercase">
          <button
            type="button"
            onClick={() => setMapType('cartographic')}
            className={`px-2 py-1 border border-[#1B1B1B] cursor-pointer transition-colors ${
              mapType === 'cartographic'
                ? 'bg-[#1B1B1B] text-[#F1ECE2] font-bold'
                : 'bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#E8E1D3]'
            }`}
          >
            CARTOGRAPHIC
          </button>
          <button
            type="button"
            onClick={() => setMapType('blueprint')}
            className={`px-2 py-1 border border-[#1B1B1B] cursor-pointer transition-colors ${
              mapType === 'blueprint'
                ? 'bg-[#1B1B1B] text-[#F1ECE2] font-bold'
                : 'bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#E8E1D3]'
            }`}
          >
            BLUEPRINT
          </button>
          {mode === 'admin_volume' && (
            <button
              type="button"
              onClick={() => setMapType('volume')}
              className={`px-2 py-1 border border-[#1B1B1B] cursor-pointer transition-colors ${
                mapType === 'volume'
                  ? 'bg-[#B0492E] text-[#F1ECE2] font-bold'
                  : 'bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#E8E1D3]'
              }`}
            >
              VOLUME DENSITY
            </button>
          )}
        </div>
      </div>

      {/* Map Surface: Architectural Sepia / Blueprint Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className={`relative w-full overflow-hidden transition-colors ${
          mapType === 'blueprint' ? 'bg-[#E0D8C8]' : 'bg-[#EDE7DA]'
        }`}
      >
        {/* Cartographic / Topographic Vector Grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="arch-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1B1B1B" strokeWidth="0.5" strokeOpacity="0.15" />
            </pattern>
            <pattern id="arch-subgrid" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1B1B1B" strokeWidth="0.25" strokeOpacity="0.08" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#arch-subgrid)" />
          <rect width="100%" height="100%" fill="url(#arch-grid)" />

          {/* Bay of Bengal Coastline (Eastern Boundary) */}
          <path
            d="M 420,0 Q 380,100 410,210 T 390,420"
            fill="none"
            stroke="#1B1B1B"
            strokeWidth="1.5"
            strokeDasharray="6 3"
            strokeOpacity="0.4"
          />
          <text
            x="82%"
            y="48%"
            fill="#1B1B1B"
            fillOpacity="0.35"
            fontSize="10"
            fontFamily="'Space Mono', monospace"
            letterSpacing="3"
          >
            BAY OF BENGAL
          </text>

          {/* Cooum River and Adyar River Line Art */}
          <path
            d="M 20,130 Q 180,160 395,150"
            fill="none"
            stroke="#1B1B1B"
            strokeWidth="1.25"
            strokeOpacity="0.25"
          />
          <text
            x="40%"
            y="38%"
            fill="#1B1B1B"
            fillOpacity="0.3"
            fontSize="8"
            fontFamily="'Space Mono', monospace"
          >
            COOUM RIVER
          </text>

          <path
            d="M 30,280 Q 200,260 405,290"
            fill="none"
            stroke="#1B1B1B"
            strokeWidth="1.25"
            strokeOpacity="0.25"
          />
          <text
            x="42%"
            y="72%"
            fill="#1B1B1B"
            fillOpacity="0.3"
            fontSize="8"
            fontFamily="'Space Mono', monospace"
          >
            ADYAR RIVER
          </text>

          {/* Key Transit Axis: Mount Road / Anna Salai Line */}
          <line
            x1="120"
            y1="60"
            x2="280"
            y2="340"
            stroke="#B0492E"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="4 2"
          />
        </svg>

        {/* User live position marker */}
        {userCoords && (
          <div
            style={getPositionPercent(userCoords.lat, userCoords.lng)}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 border border-[#1B1B1B] rotate-45 bg-[#F1ECE2] flex items-center justify-center">
                <div className="w-2 h-2 bg-[#B0492E]" />
              </div>
            </div>
            <div className="mt-1 px-1.5 py-0.5 bg-[#1B1B1B] text-[#F1ECE2] text-[8px] font-['Space_Mono'] uppercase whitespace-nowrap">
              YOU ARE HERE
            </div>
          </div>
        )}

        {/* Hub Markers: Architectural Monochromatic Pins */}
        {hubs.map((hub) => {
          const isSelected = selectedHubId === hub.id || activeHub?.id === hub.id;
          const pos = getPositionPercent(hub.lat, hub.lng);
          const distance = userCoords
            ? calculateDistanceKm(userCoords.lat, userCoords.lng, hub.lat, hub.lng)
            : null;

          const isHigh = hub.volume_level === 'high';
          const isMedium = hub.volume_level === 'medium';

          return (
            <div
              key={hub.id}
              style={pos}
              onClick={() => {
                setActiveHub(hub);
                if (onSelectHub) onSelectHub(hub);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                
                {/* Volume indicator ring in volume mode */}
                {mapType === 'volume' && (
                  <div
                    className={`absolute w-8 h-8 border ${
                      isHigh
                        ? 'border-[#B0492E] bg-[#B0492E]/20'
                        : isMedium
                        ? 'border-[#A8792B] bg-[#A8792B]/20'
                        : 'border-[#4B5D3A] bg-[#4B5D3A]/20'
                    }`}
                  />
                )}

                {/* Architectural Pin Box */}
                <div
                  className={`w-6 h-6 border flex items-center justify-center text-[10px] font-['Space_Mono'] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1B1B1B] text-[#F1ECE2] border-[#1B1B1B] scale-125 z-20'
                      : 'bg-[#F1ECE2] text-[#1B1B1B] border-[#1B1B1B] hover:bg-[#E8E1D3]'
                  }`}
                >
                  {hub.id.includes('tnagar') ? 'TN' : hub.id.includes('velachery') ? 'VL' : hub.id.includes('central') ? 'CN' : hub.id.includes('adyar') ? 'AD' : 'HB'}
                </div>
              </div>

              {/* Pin Tag Label */}
              <div
                className={`mt-1 px-1.5 py-0.5 border text-[9px] font-['Space_Mono'] uppercase whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#1B1B1B] text-[#F1ECE2] border-[#1B1B1B] font-bold'
                    : 'bg-[#E8E1D3] text-[#1B1B1B] border-[#1B1B1B] group-hover:bg-[#F1ECE2]'
                }`}
              >
                {hub.name.split('(')[0].trim()}
                {distance !== null && (
                  <span className="ml-1 text-[8px] text-[#4A4A47]">({distance}km)</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Chennai Metro Boundary Badge */}
        <div className="absolute bottom-2 left-2 bg-[#E8E1D3] border border-[#1B1B1B] px-2 py-1 text-[9px] font-['Space_Mono'] text-[#1B1B1B] uppercase">
          ● ACTIVE CHENNAI GRID · {hubs.length} HUBS REGISTERED
        </div>
      </div>

      {/* Selected Hub Details Tray */}
      {activeHub && (
        <div className="p-4 bg-[#E8E1D3] border-t border-[#1B1B1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-['Space_Mono'] text-xs">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-['Archivo_Black'] uppercase text-sm text-[#1B1B1B]">{activeHub.name}</span>
              {activeHub.volume_level && (
                <span className="text-[10px] text-[#B0492E] font-bold">
                  [ {activeHub.volume_level.toUpperCase()} TRAFFIC ]
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#4A4A47]">{activeHub.address}</p>
            <div className="flex items-center gap-4 text-[10px] text-[#4A4A47] pt-0.5">
              <span>HOURS : {activeHub.hours || '08:00 - 22:00'}</span>
              {activeHub.phone && <span>TEL : {activeHub.phone}</span>}
              {activeHub.landmark && <span>REF : {activeHub.landmark}</span>}
            </div>
          </div>

          {onSelectHub && (
            <button
              type="button"
              onClick={() => onSelectHub(activeHub)}
              className="btn-primary py-2 px-4 text-xs whitespace-nowrap self-stretch sm:self-center"
            >
              CONFIRM THIS CUSTODY HUB
            </button>
          )}
        </div>
      )}
    </div>
  );
};
