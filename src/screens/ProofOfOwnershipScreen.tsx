import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';
import { 
  IconCheck, 
  IconUpload, 
  IconShieldCheck, 
  IconDeviceMobile, 
  IconReceipt, 
  IconFileCertificate, 
  IconInfoCircle,
  IconArrowRight,
  IconArrowLeft,
  IconLock
} from '@tabler/icons-react';

export const ProofOfOwnershipScreen: React.FC = () => {
  const { activeItem, submitClaimVerification, navigateTo, user, setActiveItem, items } = useApp();

  // If no active item, pick the first demo item
  const currentItem = activeItem || items[0];

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Identity
  const [fullName, setFullName] = useState(user?.name || 'Sanjeev Kumar');
  const [phone, setPhone] = useState(user?.phone || '+91 98400 12345');
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);
  const [aadhaarMasked, setAadhaarMasked] = useState('[Aadhaar Redacted]');

  // Step 2: Ownership Proof
  const [proofType, setProofType] = useState<'INVOICE' | 'IMEI_SCREENSHOT' | 'PHOTO_WITH_ITEM'>('IMEI_SCREENSHOT');
  const [secretDetail, setSecretDetail] = useState('');
  const [proofFileUploaded, setProofFileUploaded] = useState(true);

  // Step 3: Payment
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAadhaarUpload = () => {
    setAadhaarUploaded(true);
    setAadhaarMasked('XXXX-XXXX-8921 [Masked]');
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as 1 | 2 | 3);
    } else {
      navigateTo('search-lost');
    }
  };

  const handleFinalSubmitAndPay = async () => {
    setIsProcessing(true);

    try {
      await submitClaimVerification({
        item_id: currentItem.id,
        proof_type: proofType === 'INVOICE' ? 'PURCHASE_RECEIPT' : proofType === 'IMEI_SCREENSHOT' ? 'IMEI_SERIAL' : 'PHOTO_WITH_ITEM',
        id_number_masked: aadhaarMasked,
        review_notes: secretDetail || 'Tamil Nadu verified citizen claim via Digilocker.'
      });

      setActiveItem(currentItem);
      setIsProcessing(false);
      // Navigate to Screen 7: Claim Status & Collection Slip
      navigateTo('item-received');
    } catch (err) {
      setIsProcessing(false);
      navigateTo('item-received');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col selection:bg-[#C8541A] selection:text-white pb-24 md:pb-12">
      {/* Top Header */}
      <TopAppBar showBack onBack={handleBack} title="உரிமைச் சான்று (Proof of Ownership)" />

      <main className="w-full max-w-[460px] mx-auto px-4 pt-20 flex flex-col gap-5">

        {/* STEP PROGRESS: "அடையாளம் | ID", "ஆதாரம் | Proof", "கட்டணம் | Pay" */}
        <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-3.5 ambient-shadow-card">
          <div className="relative flex items-center justify-between max-w-xs mx-auto">
            {/* Connecting progress line */}
            <div className="absolute top-3.5 left-6 right-6 h-[2px] bg-[#E8D5B7] z-0">
              <div 
                className="h-full bg-[#C8541A] transition-all duration-300"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />
            </div>

            {/* Step 1: அடையாளம் | ID */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="relative z-10 flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className={`rounded-full flex items-center justify-center transition-all ${
                currentStep === 1 
                  ? 'w-8 h-8 bg-[#7B2D00] text-white ring-4 ring-[#7B2D00]/20 animate-pulse'
                  : currentStep > 1 
                  ? 'w-7 h-7 bg-[#C8541A] text-white shadow-sm'
                  : 'w-7 h-7 bg-[#E8D5B7] text-[#8C765C]'
              }`}>
                {currentStep > 1 ? <IconCheck size={14} stroke={3} /> : <span className="text-xs font-bold">1</span>}
              </div>
              <span className={`text-[11px] font-jakarta ${currentStep === 1 ? 'text-[#7B2D00] font-bold' : 'text-[#614436]'}`}>
                அடையாளம் | ID
              </span>
            </button>

            {/* Step 2: ஆதாரம் | Proof */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="relative z-10 flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className={`rounded-full flex items-center justify-center transition-all ${
                currentStep === 2 
                  ? 'w-8 h-8 bg-[#7B2D00] text-white ring-4 ring-[#7B2D00]/20 animate-pulse'
                  : currentStep > 2 
                  ? 'w-7 h-7 bg-[#C8541A] text-white shadow-sm'
                  : 'w-7 h-7 bg-[#E8D5B7] text-[#8C765C]'
              }`}>
                {currentStep > 2 ? <IconCheck size={14} stroke={3} /> : <span className="text-xs font-bold">2</span>}
              </div>
              <span className={`text-[11px] font-jakarta ${currentStep === 2 ? 'text-[#7B2D00] font-bold' : 'text-[#614436]'}`}>
                ஆதாரம் | Proof
              </span>
            </button>

            {/* Step 3: கட்டணம் | Pay */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="relative z-10 flex flex-col items-center gap-1 cursor-pointer"
            >
              <div className={`rounded-full flex items-center justify-center transition-all ${
                currentStep === 3 
                  ? 'w-8 h-8 bg-[#7B2D00] text-white ring-4 ring-[#7B2D00]/20 animate-pulse'
                  : 'w-7 h-7 bg-[#E8D5B7] text-[#8C765C]'
              }`}>
                <span className="text-xs font-bold">3</span>
              </div>
              <span className={`text-[11px] font-jakarta ${currentStep === 3 ? 'text-[#7B2D00] font-bold' : 'text-[#614436]'}`}>
                கட்டணம் | Pay
              </span>
            </button>
          </div>
        </div>

        {/* Selected Item Mini-Banner */}
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E8D5B7] p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2 py-0.5 bg-[#7B2D00] text-white rounded-md font-mono font-bold text-[11px]">
              #{currentItem.item_code}
            </span>
            <div className="truncate">
              <span className="font-jakarta font-bold text-[#2B1810] block truncate">
                {currentItem.category} • {currentItem.location_name}
              </span>
              <span className="text-[11px] text-[#614436] truncate block">
                Verification required before hub collection
              </span>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#1A3A5C] text-white text-[10px] font-semibold">
            T.Nagar Hub
          </span>
        </div>

        {/* STEP 1 — IDENTITY */}
        {currentStep === 1 && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="font-tiro text-xl font-bold text-[#2B1810]">
                யார் நீங்கள்? (Who are you?)
              </h2>
              <p className="font-inter text-xs text-[#614436] mt-0.5">
                Verify your legal identity so the hub operator can release the item.
              </p>
            </div>

            {/* Full Name as per Aadhaar */}
            <div className="flex flex-col gap-1">
              <label className="font-inter font-medium text-xs text-[#2B1810]">
                முழு பெயர் (Full Name as per Aadhaar)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sanjeev Kumar"
                className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810]"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label className="font-inter font-medium text-xs text-[#2B1810]">
                கைபேசி எண் (Mobile Phone)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 12345"
                className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810]"
              />
            </div>

            {/* Aadhaar Upload Box */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter font-medium text-xs text-[#2B1810]">
                ஆதார் அட்டை சரிபார்ப்பு (Aadhaar Verification)
              </label>
              
              <div
                onClick={handleAadhaarUpload}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                  aadhaarUploaded
                    ? 'border-2 border-[#2E7D6B] bg-[#F0FDF4]'
                    : 'border-2 border-dashed border-[#C8541A] bg-[#F7F0E6] hover:bg-[#E8D5B7]/40'
                }`}
              >
                {aadhaarUploaded ? (
                  <div className="flex items-center gap-2 text-[#2E7D6B]">
                    <IconCheck size={22} stroke={3} />
                    <span className="font-tiro text-base font-bold">
                      சரிபார்க்கப்பட்டது ✓ (Verified)
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-[#7B2D00]/10 text-[#7B2D00] flex items-center justify-center">
                      <IconUpload size={20} />
                    </div>
                    <span className="font-tiro text-sm font-semibold text-[#7B2D00]">
                      Aadhaar Upload பண்ணு (Upload Aadhaar)
                    </span>
                    <span className="font-inter text-[11px] text-[#8C765C]">
                      Front & back · Digilocker accepted · Mask first 8 digits
                    </span>
                  </>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              className="mt-2"
            >
              <span>ஆதார விவரங்கள் சேர்க்க (Continue to Proof)</span>
              <IconArrowRight size={18} />
            </Button>
          </div>
        )}

        {/* STEP 2 — OWNERSHIP PROOF */}
        {currentStep === 2 && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="font-tiro text-xl font-bold text-[#2B1810]">
                உரிமைக்கான ஆதாரம் (Ownership Proof)
              </h2>
              <p className="font-inter text-xs text-[#614436] mt-0.5">
                Provide documentation only the rightful owner would possess.
              </p>
            </div>

            {/* Proof Options */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Option A: Purchase Bill */}
              <button
                type="button"
                onClick={() => setProofType('INVOICE')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  proofType === 'INVOICE'
                    ? 'border-2 border-[#7B2D00] bg-[#F7F0E6] shadow-xs'
                    : 'border-[#E8D5B7] bg-white hover:border-[#7B2D00]/50'
                }`}
              >
                <IconReceipt size={22} className="text-[#7B2D00]" />
                <div>
                  <span className="block font-jakarta font-bold text-xs text-[#2B1810]">
                    Purchase Bill (பில்)
                  </span>
                  <span className="block text-[11px] text-[#614436]">
                    Invoice or order receipt
                  </span>
                </div>
              </button>

              {/* Option B: IMEI / Settings screenshot */}
              <button
                type="button"
                onClick={() => setProofType('IMEI_SCREENSHOT')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  proofType === 'IMEI_SCREENSHOT'
                    ? 'border-2 border-[#7B2D00] bg-[#F7F0E6] shadow-xs'
                    : 'border-[#E8D5B7] bg-white hover:border-[#7B2D00]/50'
                }`}
              >
                <IconDeviceMobile size={22} className="text-[#1A3A5C]" />
                <div>
                  <span className="block font-jakarta font-bold text-xs text-[#2B1810]">
                    IMEI / Settings
                  </span>
                  <span className="block text-[11px] text-[#614436]">
                    Serial or device box
                  </span>
                </div>
              </button>
            </div>

            {/* Help box for IMEI */}
            {proofType === 'IMEI_SCREENSHOT' && (
              <div className="p-3 bg-[#E8D5B7]/40 border border-[#E8D5B7] rounded-xl flex items-center gap-2 text-xs text-[#2B1810]">
                <IconInfoCircle size={18} className="text-[#7B2D00] shrink-0" />
                <span>
                  Help tip: Dial <strong>*#06#</strong> on your phone or check original box packaging to obtain the 15-digit IMEI number.
                </span>
              </div>
            )}

            {/* Secret Description textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-tiro font-semibold text-xs text-[#2B1810]">
                  உரிமையாளருக்கு மட்டும் தெரிந்த ஒரு விவரம் சொல்லுங்க...
                </label>
                <span className="text-[11px] text-[#8C765C] font-mono">
                  {secretDetail.length}/300
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={secretDetail}
                onChange={(e) => setSecretDetail(e.target.value)}
                placeholder="e.g. Lock screen wallpaper photo, scratch near the volume rocker, or distinctive card inside."
                className="w-full p-3 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBack}
                className="w-1/3"
              >
                பின்செல்ல
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="w-2/3"
              >
                <span>கட்டண மதிப்பாய்வு</span>
                <IconArrowRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — REVIEW & PAY */}
        {currentStep === 3 && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col gap-4 animate-fade-in">
            
            {/* Summary card with rust top border (4px) */}
            <div className="rounded-xl border border-[#E8D5B7] border-t-4 border-t-[#7B2D00] p-4 bg-[#F7F0E6]/50 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8D5B7]">
                <div>
                  <span className="font-tiro text-base font-bold text-[#7B2D00] block">
                    {currentItem.category} ({currentItem.item_code})
                  </span>
                  <span className="font-inter text-xs text-[#614436]">
                    Assigned Hub: T.Nagar Hub, Chennai
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-[#2E7D6B] text-white rounded-full text-[10px] font-bold">
                  MATCH READY
                </span>
              </div>

              {/* Fee Breakdown */}
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[#614436]">
                  <span>Finder reward (நேர்மையான கண்டவருக்கு பரிசு):</span>
                  <span className="font-semibold text-[#2B1810]">₹60</span>
                </div>
                <div className="flex items-center justify-between text-[#614436]">
                  <span>Hub handling fee (பாதுகாப்பு & சேகரிப்பு கட்டணம்):</span>
                  <span className="font-semibold text-[#2B1810]">₹189</span>
                </div>
                <div className="flex items-center justify-between text-[#614436]">
                  <span>GST (18% சரக்கு சேவை வரி):</span>
                  <span className="font-semibold text-[#2B1810]">₹50</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8D5B7] text-base font-bold">
                  <span className="text-[#2B1810]">மொத்த கட்டணம் (Total):</span>
                  {/* Total: ₹299 (Bay of Bengal bold, 20px) */}
                  <span className="font-jakarta text-[20px] font-bold text-[#1A3A5C]">
                    ₹299
                  </span>
                </div>
              </div>
            </div>

            {/* Escrow note: Neem Green strip with shield icon */}
            <div className="p-3 bg-[#DCFCE7] border border-[#2E7D6B]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#14532D]">
              <IconShieldCheck size={20} className="text-[#2E7D6B] shrink-0 mt-0.5" />
              <p className="font-inter leading-relaxed">
                <strong>Fee escrow-ல் வைக்கப்படும்:</strong> Hub operator claim-ஐ உறுதி செய்யும் வரை உங்கள் பணம் பாதுகாப்பாக escrow கணக்கில் இருக்கும். Claim approve ஆகவில்லை என்றால் 100% refund உடனடியாக வழங்கப்படும்.
              </p>
            </div>

            {/* Submit Button: Full width, Kolam Orange, shield icon */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isProcessing}
              onClick={handleFinalSubmitAndPay}
              className="py-3.5 rounded-xl font-jakarta font-bold text-sm"
            >
              <IconShieldCheck size={20} />
              <span>சமர்ப்பி & ₹299 செலுத்து (Submit & Pay ₹299)</span>
            </Button>
          </div>
        )}

      </main>

      <BottomNavBar />
    </div>
  );
};
