import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { INITIAL_HUBS, ChennaiHub } from '../data/mockData';
import { 
  IconCheck, 
  IconHourglassEmpty, 
  IconLock, 
  IconBrandWhatsapp, 
  IconCopy, 
  IconDownload, 
  IconMapPin, 
  IconAlertCircle,
  IconArrowLeft,
  IconSparkles
} from '@tabler/icons-react';

export const ItemReceivedScreen: React.FC = () => {
  const { activeItem, navigateTo, items } = useApp();
  const [claimState, setClaimState] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const currentItem = activeItem || items[0];
  const hubs = INITIAL_HUBS as ChennaiHub[];
  const assignedHub = hubs.find(h => h.id === currentItem.hub_id) || hubs[0];
  const itemCode = currentItem.item_code || 'FB-2024-0041';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(itemCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSlip = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `FindBack-ClaimSlip-${itemCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleWhatsAppInquiry = () => {
    const msg = encodeURIComponent(
      `வணக்கம்! FindBack Claim status inquiry for Item #${itemCode} (${currentItem.category}) at ${assignedHub.name}.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col selection:bg-[#C8541A] selection:text-white pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} title="கோரிக்கை நிலை (Claim Status)" />

      <main className="w-full max-w-[440px] mx-auto px-4 pt-20 flex flex-col items-center gap-5">

        {/* STATE A — PENDING VERIFICATION */}
        {claimState === 'PENDING' ? (
          <div className="w-full flex flex-col items-center gap-5 animate-fade-in text-center">
            
            {/* Top: Neem Green checkmark circle (48px) */}
            <div className="w-12 h-12 rounded-full bg-[#2E7D6B] text-white flex items-center justify-center shadow-md ring-4 ring-[#FFFFFF] mt-2">
              <IconCheck size={28} stroke={3} />
            </div>

            {/* Heading in Tiro Tamil 22px Night Marina */}
            <div>
              <h1 className="font-tiro text-[22px] font-bold text-[#2B1810] leading-tight">
                சமர்ப்பிக்கப்பட்டது! (Claim Submitted!)
              </h1>
              <p className="font-inter text-xs text-[#614436] mt-1">
                Hub operator is verifying your claim against the deposited item.
              </p>
            </div>

            {/* Vertical 3-Step Timeline */}
            <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col text-left">
              <div className="relative flex flex-col gap-6">
                
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#E8D5B7]" />

                {/* Step 1: Claim Submitted (Done) */}
                <div className="relative flex items-start gap-3.5 z-10">
                  {/* Neem Green filled kolam-dot + checkmark */}
                  <div className="w-8 h-8 rounded-full bg-[#2E7D6B] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <IconCheck size={16} stroke={3} />
                  </div>
                  <div>
                    <h4 className="font-tiro text-sm font-semibold text-[#2B1810]">
                      கோரிக்கை சமர்ப்பிக்கப்பட்டது (Claim Submitted)
                    </h4>
                    <p className="text-[11px] text-[#614436] mt-0.5">
                      Identity & proof verified with escrow receipt.
                    </p>
                  </div>
                </div>

                {/* Step 2: Verifying at Hub (Active) */}
                <div className="relative flex items-start gap-3.5 z-10">
                  {/* Dashed rust border, hourglass icon pulsing */}
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#7B2D00] bg-[#F7F0E6] text-[#7B2D00] flex items-center justify-center shrink-0 animate-pulse">
                    <IconHourglassEmpty size={16} stroke={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-tiro text-sm font-bold text-[#7B2D00]">
                        Hub-ல் சரிபார்க்கப்படுகிறது (Verifying at Hub)
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-[#C8541A] animate-ping" />
                    </div>
                    <p className="text-[11px] text-[#614436] mt-0.5">
                      {assignedHub.tamil_name || assignedHub.name} operator inspecting serial/IMEI match.
                    </p>
                  </div>
                </div>

                {/* Step 3: Ready for Collection (Locked) */}
                <div className="relative flex items-start gap-3.5 z-10">
                  {/* Sand dot, lock icon */}
                  <div className="w-8 h-8 rounded-full bg-[#E8D5B7] text-[#8C765C] flex items-center justify-center shrink-0">
                    <IconLock size={16} />
                  </div>
                  <div>
                    <h4 className="font-tiro text-sm font-medium text-[#8C765C]">
                      பொருள் பெற தயார் (Ready for Collection)
                    </h4>
                    <p className="text-[11px] text-[#8C765C] mt-0.5">
                      Collection QR slip will be unlocked upon operator approval.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* WhatsApp Button: green outline, rust text */}
            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              className="w-full py-3 px-4 bg-white border-2 border-[#25D366] text-[#7B2D00] hover:bg-[#F0FDF4] active:scale-98 rounded-xl font-jakarta font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <IconBrandWhatsapp size={20} className="text-[#25D366]" />
              <span>WhatsApp-ல் Update கேளு (Get Updates on WhatsApp)</span>
            </button>

            {/* Demo toggle link */}
            <button
              type="button"
              onClick={() => setClaimState('APPROVED')}
              className="font-inter text-xs text-[#8C765C] hover:text-[#7B2D00] underline underline-offset-4 cursor-pointer pt-2"
            >
              ⚡ Demo Toggle: See approved state →
            </button>

          </div>
        ) : (
          /* STATE B — APPROVED (COLLECTION SLIP) */
          <div className="w-full flex flex-col items-center gap-4 animate-fade-in text-center">
            
            {/* Heading in Tiro Tamil Neem Green 24px */}
            <div>
              <h1 className="font-tiro text-2xl font-bold text-[#2E7D6B] leading-tight">
                அனுமதிக்கப்பட்டது! 🎉 (Claim Approved!)
              </h1>
              <p className="font-inter text-xs text-[#614436] mt-0.5">
                Your ownership was verified. Show this slip at the hub to collect.
              </p>
            </div>

            {/* COLLECTION SLIP CARD: Bay of Bengal 2px border, cream background */}
            <div className="w-full bg-[#FFFFFF] rounded-2xl border-2 border-[#1A3A5C] overflow-hidden ambient-shadow-modal flex flex-col text-left relative">
              
              {/* Top Strip: Marina Rust */}
              <div className="bg-[#7B2D00] text-white px-4 py-2.5 flex items-center justify-between">
                <span className="font-jakarta font-bold text-xs tracking-wider uppercase">
                  COLLECTION SLIP / சேகரிப்பு slip
                </span>
                <span className="px-2 py-0.5 bg-[#2E7D6B] text-white text-[10px] font-bold rounded-full">
                  OFFICIAL RELEASE
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col items-center gap-3.5 text-center bg-[#F7F0E6]/30">
                
                {/* QR Code (160px) with Kolam dot pattern border */}
                <div 
                  ref={qrRef}
                  className="p-3 bg-white rounded-xl border-2 border-dashed border-[#7B2D00]/50 shadow-xs relative"
                >
                  <QRCodeCanvas
                    value={`https://findback.network/pickup/${itemCode}?status=approved`}
                    size={160}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#1A3A5C"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A3A5C] text-white flex items-center justify-center text-[10px] font-bold shadow-xs pointer-events-none">
                    FB
                  </div>
                </div>

                {/* Reference in JetBrains Mono */}
                <div className="flex flex-col items-center">
                  <span className="font-mono text-xl font-bold text-[#1A3A5C] tracking-wider">
                    #{itemCode}
                  </span>
                  <span className="text-[11px] text-[#614436] font-inter">
                    Item: {currentItem.category}
                  </span>
                </div>

                {/* Hub name */}
                <div className="w-full p-2.5 bg-white rounded-xl border border-[#E8D5B7] flex items-center gap-2 text-left">
                  <IconMapPin size={18} className="text-[#7B2D00] shrink-0" />
                  <div className="truncate">
                    <span className="font-tiro text-xs font-bold text-[#2B1810] block truncate">
                      {assignedHub.tamil_name || assignedHub.name}
                    </span>
                    <span className="font-inter text-[11px] text-[#614436] block truncate">
                      {assignedHub.address}
                    </span>
                  </div>
                </div>

                {/* Ready Time Chip: Jasmine Yellow fill, Night Marina text "செவ்வாய் 3PM க்கு ரெடி" */}
                <div className="px-4 py-1.5 bg-[#F5C842] text-[#2B1810] rounded-full text-xs font-jakarta font-bold shadow-xs">
                  செவ்வாய் 3PM க்கு ரெடி (Ready by Tuesday 3:00 PM)
                </div>

                {/* Important Note in Red-Rust Box */}
                <div className="w-full p-3 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-xl flex items-start gap-2 text-left text-xs text-[#991B1B]">
                  <IconAlertCircle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
                  <p className="font-inter leading-relaxed">
                    <strong>முக்கிய குறிப்பு:</strong> Original Aadhaar அட்டை உடன் கொண்டு வாருங்கள் (Bring original Aadhaar physical card for final release).
                  </p>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="relative w-full py-1 bg-[#FFFFFF]">
                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F7F0E6] border-r-2 border-[#1A3A5C]" />
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#F7F0E6] border-l-2 border-[#1A3A5C]" />
                <div className="border-t-2 border-dashed border-[#E8D5B7] mx-5" />
              </div>

              {/* Bottom Action Strip in perforated bottom strip: WhatsApp icon | Copy Reference | Download PDF */}
              <div className="p-3 bg-[#FFFFFF] grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="py-2 px-1 bg-[#25D366]/10 text-[#15803D] hover:bg-[#25D366]/20 rounded-xl text-xs font-jakarta font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="WhatsApp Update"
                >
                  <IconBrandWhatsapp size={16} />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="py-2 px-1 bg-[#F7F0E6] text-[#7B2D00] hover:bg-[#E8D5B7]/50 rounded-xl text-xs font-jakarta font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Copy Reference Number"
                >
                  <IconCopy size={16} />
                  <span>{copied ? 'Copied!' : 'Copy Ref'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSlip}
                  className="py-2 px-1 bg-[#1A3A5C] text-white hover:bg-[#152e49] rounded-xl text-xs font-jakarta font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Download Slip"
                >
                  <IconDownload size={16} />
                  <span>Save Slip</span>
                </button>
              </div>

            </div>

            {/* Back to Pending toggle for testing */}
            <button
              type="button"
              onClick={() => setClaimState('PENDING')}
              className="font-inter text-xs text-[#8C765C] hover:text-[#7B2D00] underline underline-offset-4 cursor-pointer pt-1"
            >
              ← Back to Pending Verification state
            </button>

          </div>
        )}

      </main>

      <BottomNavBar />
    </div>
  );
};
