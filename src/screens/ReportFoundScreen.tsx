import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCategory, Coordinates } from '../types';
import { CATEGORIES } from '../components/common/CategoryChip';
import { INITIAL_HUBS, ChennaiHub, findNearestHub } from '../data/mockData';
import { uploadItemPhoto } from '../lib/supabase';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';
import { 
  IconCamera, 
  IconCheck, 
  IconMapPin, 
  IconCrosshair, 
  IconClock, 
  IconSparkles,
  IconArrowRight,
  IconArrowLeft
} from '@tabler/icons-react';

export const ReportFoundScreen: React.FC = () => {
  const { reportFoundItem, navigateTo, isLoading } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3-Step Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Photo & Category
  const [photoPreview, setPhotoPreview] = useState<string>('https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCustomUploaded, setIsCustomUploaded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('Wallet');

  // Step 2: Details & Location
  const [description, setDescription] = useState<string>('நீல நிற leather wallet, front corner-ல் சிறிய scratch இருக்கு.');
  const [locationName, setLocationName] = useState<string>('T. Nagar, Chennai');
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 13.0418, lng: 80.2341 });
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  // Step 3: Hub Assignment
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-chennai-tnagar-02');
  const hubs = INITIAL_HUBS as ChennaiHub[];
  const selectedHub = hubs.find(h => h.id === selectedHubId) || hubs[0];

  // 6 specific category chips in 3x2 grid as specified in prompt:
  const CHENNAI_6_CATEGORIES: { category: ItemCategory; label: string; icon: string }[] = [
    { category: 'Phone', label: 'Phone', icon: '📱' },
    { category: 'Wallet', label: 'Wallet பை', icon: '👛' },
    { category: 'Keys', label: 'Keys சாவி', icon: '🔑' },
    { category: 'Documents', label: 'Documents ஆவணம்', icon: '📄' },
    { category: 'Jewellery', label: 'நகை Jewellery', icon: '💍' },
    { category: 'Other', label: 'மற்றவை Other', icon: '📦' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setIsCustomUploaded(true);
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsAutoDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsAutoDetecting(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoordinates(coords);
        const nearest = findNearestHub(coords.lat, coords.lng, hubs);
        setLocationName(`Near ${nearest.hub.name}, Chennai`);
        setSelectedHubId(nearest.hub.id);
      },
      () => {
        setIsAutoDetecting(false);
        setLocationName('T. Nagar Usman Road, Chennai');
      },
      { timeout: 6000 }
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      navigateTo('role-selection');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPhotoUrl = photoPreview;
    if (photoFile) {
      try {
        finalPhotoUrl = await uploadItemPhoto(photoFile);
      } catch (err) {
        console.warn('Photo upload fallback to preview URL:', err);
      }
    }

    await reportFoundItem({
      category: selectedCategory,
      photo_url: finalPhotoUrl,
      lat: coordinates.lat,
      lng: coordinates.lng,
      location_name: locationName,
      hub_id: selectedHub.id,
      description: description.trim()
    });

    // Navigate to Tag Generated (Screen 4)
    navigateTo('tag-generated');
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col selection:bg-[#C8541A] selection:text-white pb-24 md:pb-12">
      {/* Top App Bar with back button */}
      <TopAppBar showBack onBack={handleBack} title="பொருளைப் புகாரளித்தல் (Report Found)" />

      <main className="w-full max-w-[480px] mx-auto px-4 pt-20 flex flex-col gap-5">

        {/* STEP PROGRESS INDICATOR: 3 dots connected by a line */}
        <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-4 ambient-shadow-card">
          <div className="relative flex items-center justify-between max-w-xs mx-auto">
            {/* Connecting line */}
            <div className="absolute top-3.5 left-6 right-6 h-[2px] bg-[#E8D5B7] z-0">
              <div 
                className="h-full bg-[#C8541A] transition-all duration-300"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />
            </div>

            {/* Step 1 Dot: படம் | Photo */}
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
                படம் | Photo
              </span>
            </button>

            {/* Step 2 Dot: விவரம் | Details */}
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
                விவரம் | Details
              </span>
            </button>

            {/* Step 3 Dot: Hub */}
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
                Hub
              </span>
            </button>
          </div>
        </div>

        {/* STEP 1 — PHOTO UPLOAD & CATEGORY */}
        {currentStep === 1 && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col gap-5 animate-fade-in">
            <div>
              <h2 className="font-tiro text-lg font-semibold text-[#2B1810]">
                படி 1: பொருளின் புகைப்படம் (Photo of Item)
              </h2>
              <p className="font-inter text-xs text-[#614436] mt-0.5">
                Take a clear picture of the found item for secure cataloging.
              </p>
            </div>

            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            {/* UPLOAD ZONE */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
                isCustomUploaded
                  ? 'border-2 border-[#2E7D6B] bg-[#F0FDF4]'
                  : 'border-2 border-dashed border-[#C8541A] bg-[#F7F0E6] hover:bg-[#F7F0E6]/80'
              }`}
            >
              {isCustomUploaded ? (
                /* When file selected: border turns Neem Green, check icon, green badge, thumbnail on right */
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-[#2E7D6B] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <IconCheck size={22} stroke={2.5} />
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#2E7D6B] text-white text-[11px] font-jakarta font-bold">
                        படம் ரெடி! (Photo Ready!)
                      </span>
                      <p className="text-[11px] text-[#14532D] mt-1 font-inter">
                        Click to change photo if needed
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail preview on right */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#2E7D6B] shadow-sm shrink-0 bg-white">
                    <img src={photoPreview} alt="Item Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                /* Default Upload prompt */
                <>
                  <div className="w-12 h-12 rounded-full bg-[#7B2D00]/10 text-[#7B2D00] flex items-center justify-center">
                    <IconCamera size={26} stroke={1.8} />
                  </div>
                  <div>
                    <span className="font-tiro text-base font-semibold text-[#7B2D00] block">
                      படம் எடுங்க (Take Photo)
                    </span>
                    <span className="font-inter text-xs text-[#8C765C] mt-0.5 block">
                      or drag and drop · JPG, PNG · 10MB max
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* CATEGORY CHIPS (3x2 Grid) */}
            <div className="flex flex-col gap-2">
              <label className="font-tiro text-sm font-semibold text-[#2B1810]">
                வகை தேர்வு (Select Category)
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {CHENNAI_6_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.category;
                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setSelectedCategory(cat.category)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-jakarta font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C8541A] text-white shadow-md scale-[1.02]'
                          : 'bg-[#F7F0E6] text-[#2B1810] border border-[#E8D5B7] hover:border-[#C8541A]/50'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[11px] text-center leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNext}
              className="mt-2"
            >
              <span>விவரங்களுக்கு தொடர்க (Continue to Details)</span>
              <IconArrowRight size={18} />
            </Button>
          </div>
        )}

        {/* STEP 2 — DETAILS & LOCATION */}
        {currentStep === 2 && (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="font-tiro text-lg font-semibold text-[#2B1810]">
                படி 2: கண்டெடுக்கப்பட்ட விவரம் (Details)
              </h2>
              <p className="font-inter text-xs text-[#614436] mt-0.5">
                Describe the item and where you encountered it in Chennai.
              </p>
            </div>

            {/* Description textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter font-medium text-xs text-[#2B1810]">
                பொருளின் விளக்கம் (Item Description)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item-ஐ பற்றி சொல்லுங்க... e.g. நீல நிற wallet, corner-ல் scratch இருக்கு"
                className="w-full p-3 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] resize-none"
              />
            </div>

            {/* Location Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-inter font-medium text-xs text-[#2B1810]">
                  கண்டெடுக்கப்பட்ட இடம் (Found Location)
                </label>
                {/* Auto-detect button with rust text & underline */}
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  className="text-xs text-[#7B2D00] underline font-tiro hover:text-[#C8541A] cursor-pointer flex items-center gap-1"
                >
                  <IconCrosshair size={14} className={isAutoDetecting ? 'animate-spin' : ''} />
                  <span>இடத்தை தானாக கண்டறி (Auto-detect)</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. T.Nagar, Chennai"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810]"
                />
                <IconMapPin size={18} className="absolute left-3 top-3 text-[#7B2D00]" />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2.5 pt-2">
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
                <span>Hub தேர்வு செய்க</span>
                <IconArrowRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — HUB ASSIGNMENT & CONFIRM */}
        {currentStep === 3 && (
          <form onSubmit={handleFinalSubmit} className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 ambient-shadow-card flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="font-tiro text-lg font-semibold text-[#2B1810]">
                படி 3: ஒப்படைப்பு Hub (Assigned Drop-off Hub)
              </h2>
              <p className="font-inter text-xs text-[#614436] mt-0.5">
                Take the item to this verified community hub in Chennai.
              </p>
            </div>

            {/* HUB CARD: Top half Bay of Bengal, bottom half cream */}
            <div className="rounded-2xl overflow-hidden border border-[#E8D5B7] ambient-shadow-card flex flex-col">
              {/* Top Half: Bay of Bengal (#1A3A5C) */}
              <div className="bg-[#1A3A5C] text-white p-4 flex flex-col gap-1 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-white/20 text-[#F5C842] rounded-full text-[10px] font-jakarta font-bold">
                    NEAREST VERIFIED HUB
                  </span>
                  {/* Distance badge: rust pill with white text */}
                  <span className="px-2.5 py-0.5 bg-[#7B2D00] text-white rounded-full text-[11px] font-jakarta font-semibold shadow-xs">
                    {selectedHub.distance_badge || '1.2 km'} தொலைவில்
                  </span>
                </div>

                <h3 className="font-tiro text-lg font-bold text-white mt-1">
                  {selectedHub.tamil_name || selectedHub.name}
                </h3>
                <p className="font-inter text-xs text-[#E8D5B7]">
                  {selectedHub.name}
                </p>
              </div>

              {/* Bottom Half: Cream (#F7F0E6) */}
              <div className="bg-[#F7F0E6] p-4 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <IconMapPin size={18} className="text-[#7B2D00] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#2B1810] font-inter">
                    {selectedHub.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8D5B7] text-xs">
                  {/* Neem green dot + hours */}
                  <div className="flex items-center gap-1.5 text-[#2E7D6B] font-inter font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D6B]" />
                    <span>{selectedHub.hours || '8AM - 10PM'} வரை திறந்திருக்கும்</span>
                  </div>

                  <span className="text-[11px] font-jakarta font-bold text-[#7B2D00]">
                    Verified Operator ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Hub Switcher if user prefers another hub */}
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-xs text-[#614436]">
                வேறு Hub மாற்ற (Choose Another Hub):
              </label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-xs text-[#2B1810]"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.tamil_name || h.name} — {h.address}
                  </option>
                ))}
              </select>
            </div>

            {/* CONFIRM BUTTON & FINE PRINT */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="rounded-[14px]"
              >
                உறுதிப்படுத்து (Confirm Drop-off)
              </Button>

              {/* Fine print in italic cream/sand */}
              <p className="text-center font-inter italic text-[11px] text-[#614436]">
                "Hub-ல் item கொடுத்ததும் ₹60 reward கிடைக்கும்"
              </p>
            </div>
          </form>
        )}

      </main>

      <BottomNavBar />
    </div>
  );
};
