import React, { useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';
import { INITIAL_HUBS, ChennaiHub } from '../data/mockData';
import { 
  IconCheck, 
  IconDownload, 
  IconBrandWhatsapp, 
  IconArrowLeft,
  IconCopy,
  IconShieldCheck
} from '@tabler/icons-react';

export const TagGeneratedScreen: React.FC = () => {
  const { activeItem, navigateTo } = useApp();
  const qrRef = useRef<HTMLDivElement>(null);

  const itemCode = activeItem?.item_code || 'FB-2024-0041';
  const hubs = INITIAL_HUBS as ChennaiHub[];
  const assignedHub = hubs.find(h => h.id === activeItem?.hub_id) || hubs[0];
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#7B2D00', '#C8541A', '#2E7D6B', '#F5C842']
      });
    } catch (e) {
      // Confetti fallback
    }
  }, []);

  const handleSaveQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `FindBack-Slip-${itemCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*FindBack Chennai Lost & Found Network*\n` +
      `Collection Slip: ${itemCode}\n` +
      `Item: ${activeItem?.category || 'Found Item'}\n` +
      `Drop-off Hub: ${assignedHub.tamil_name || assignedHub.name} (${assignedHub.address})\n` +
      `Status: Drop-off Ready (₹60 reward on owner return)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col selection:bg-[#C8541A] selection:text-white pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} title="சேகரிப்பு Slip" />

      <main className="w-full max-w-[440px] mx-auto px-4 pt-20 flex flex-col items-center gap-5 text-center">

        {/* TOP: Large animated checkmark in Neem Green circle (80px), outward ripple */}
        <div className="relative mt-2 flex items-center justify-center">
          {/* Outward ripple circles */}
          <div className="absolute w-24 h-24 rounded-full bg-[#2E7D6B]/20 animate-ping" />
          <div className="absolute w-28 h-28 rounded-full bg-[#2E7D6B]/10" />

          {/* 80px Neem Green Circle */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-[#2E7D6B] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(46,125,107,0.35)] ring-4 ring-[#FFFFFF]">
            <IconCheck size={44} stroke={3} className="animate-fade-in" />
          </div>
        </div>

        {/* Heading in Tiro Tamil 28px Night Marina */}
        <div>
          <h1 className="font-tiro text-[28px] font-bold text-[#2B1810] leading-tight">
            சமர்ப்பிக்கப்பட்டது!
          </h1>
          <p className="font-inter text-xs sm:text-sm text-[#614436] mt-1 max-w-xs mx-auto">
            Show this QR at {assignedHub.tamil_name || assignedHub.name} to complete drop-off
          </p>
        </div>

        {/* QR SLIP CARD: White card, 16px radius, warm shadow */}
        <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] overflow-hidden ambient-shadow-modal flex flex-col relative text-left">
          
          {/* Top Strip in Marina Rust: "COLLECTION SLIP / சேகரிப்பு slip" */}
          <div className="bg-[#7B2D00] text-white px-4 py-2.5 flex items-center justify-between">
            <span className="font-jakarta font-bold text-xs tracking-wider uppercase">
              COLLECTION SLIP / சேகரிப்பு slip
            </span>
            <div className="flex items-center gap-1 text-[10px] text-[#F5C842] font-semibold">
              <IconShieldCheck size={14} />
              <span>VERIFIED</span>
            </div>
          </div>

          {/* Slip Body with QR Code */}
          <div className="p-5 flex flex-col items-center gap-4 text-center">
            
            {/* Scannable QR Code Canvas */}
            <div 
              ref={qrRef}
              className="p-3 bg-white rounded-xl border border-[#E8D5B7] shadow-xs relative flex items-center justify-center"
            >
              <QRCodeCanvas
                value={`https://findback.network/tag/${itemCode}?hub=${encodeURIComponent(assignedHub.name)}`}
                size={168}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#2B1810"
              />
              
              {/* Kolam Dot Logo Watermark in center of QR */}
              <div className="absolute w-7 h-7 rounded-full bg-[#7B2D00] text-[#F5C842] flex items-center justify-center shadow-xs pointer-events-none ring-2 ring-white">
                <span className="text-xs font-bold font-jakarta">FB</span>
              </div>
            </div>

            {/* Reference Number in JetBrains Mono 18px Bold */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-lg sm:text-xl font-bold text-[#7B2D00] tracking-wider">
                #{itemCode}
              </span>
              <span className="text-[11px] text-[#8C765C] font-inter">
                FindBack Unique Item Identifier
              </span>
            </div>

            {/* Item Details Row: Category | Date | Hub Name */}
            <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-[#E8D5B7] text-left">
              <div>
                <span className="block text-[10px] uppercase font-inter text-[#8C765C]">Category</span>
                <span className="block text-xs font-jakarta font-semibold text-[#2B1810] truncate">
                  {activeItem?.category || 'Wallet'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-inter text-[#8C765C]">Date</span>
                <span className="block text-xs font-jakarta font-semibold text-[#2B1810]">
                  {dateStr}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-inter text-[#8C765C]">Hub</span>
                <span className="block text-xs font-jakarta font-semibold text-[#2B1810] truncate">
                  {assignedHub.tamil_name || assignedHub.name}
                </span>
              </div>
            </div>
          </div>

          {/* Perforated coupon effect at bottom of card (dashed line + half circles on edges) */}
          <div className="relative w-full py-1">
            {/* Left cutout notch */}
            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F7F0E6] border-r border-[#E8D5B7]" />
            {/* Right cutout notch */}
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F7F0E6] border-l border-[#E8D5B7]" />
            {/* Dashed perforation line */}
            <div className="border-t-2 border-dashed border-[#E8D5B7] mx-5" />
          </div>

          {/* Fine print footer strip */}
          <div className="p-3 px-5 bg-[#F7F0E6]/60 flex items-center justify-between text-xs text-[#614436]">
            <span>Finder Reward on Recovery:</span>
            <span className="font-jakarta font-bold text-[#2E7D6B] text-sm">₹60.00</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          {/* Button 1: "QR Save பண்ணு (Save QR Code)" — cream fill, rust border, rust text */}
          <button
            type="button"
            onClick={handleSaveQR}
            className="w-full py-3 px-4 bg-[#F7F0E6] border-2 border-[#7B2D00] text-[#7B2D00] hover:bg-[#E8D5B7]/40 active:scale-98 rounded-xl font-jakarta font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <IconDownload size={18} stroke={2.2} />
            <span>QR Save பண்ணு (Save QR Code)</span>
          </button>

          {/* Button 2: "WhatsApp-ல் Share பண்ணு" — WhatsApp green (#25D366), white text, WhatsApp icon */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3 px-4 bg-[#25D366] text-white hover:brightness-105 active:scale-98 rounded-xl font-jakarta font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <IconBrandWhatsapp size={20} stroke={2.2} />
            <span>WhatsApp-ல் Share பண்ணு</span>
          </button>

          {/* Back link: "Dashboard-க்கு திரும்பு (Return to Dashboard)" — text only, rust */}
          <button
            type="button"
            onClick={() => navigateTo('role-selection')}
            className="pt-2 font-tiro text-sm text-[#7B2D00] hover:underline cursor-pointer flex items-center justify-center gap-1"
          >
            <IconArrowLeft size={16} />
            <span>Dashboard-க்கு திரும்பு (Return to Dashboard)</span>
          </button>
        </div>

      </main>

      <BottomNavBar />
    </div>
  );
};
