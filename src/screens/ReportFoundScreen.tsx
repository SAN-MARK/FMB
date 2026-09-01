import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCategory, Coordinates } from '../types';
import { CATEGORIES, CategoryChip } from '../components/common/CategoryChip';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { findNearestHub } from '../data/mockData';
import { uploadItemPhoto } from '../lib/supabase';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNavBar } from '../components/common/BottomNavBar';
import { Button } from '../components/common/Button';

export const ReportFoundScreen: React.FC = () => {
  const { reportFoundItem, navigateTo, hubs, isLoading } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('Wallet');
  const [locationName, setLocationName] = useState<string>('Central Park, NY');
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 37.7879, lng: -122.4074 });
  const [description, setDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setValidationError(null);
  };

  // Quick fallback photos for quick testing if camera not available
  const handleUseSamplePhoto = (sampleUrl: string) => {
    setPhotoPreview(sampleUrl);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPhotoUrl = photoPreview;

    if (!finalPhotoUrl) {
      // Default placeholder if none provided
      finalPhotoUrl = 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80';
    } else if (photoFile) {
      try {
        finalPhotoUrl = await uploadItemPhoto(photoFile);
      } catch (err) {
        console.warn('Failed to upload photo file, using preview URL:', err);
      }
    }

    // Auto-calculate nearest hub based on report coordinates
    const nearestResult = findNearestHub(coordinates.lat, coordinates.lng, hubs);

    const newItem = await reportFoundItem({
      category: selectedCategory,
      photo_url: finalPhotoUrl,
      lat: coordinates.lat,
      lng: coordinates.lng,
      location_name: locationName,
      hub_id: nearestResult.hub.id,
      description: description.trim()
    });

    // Navigate to Drop-off screen
    navigateTo('drop-off');
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col pt-16 pb-24 md:pb-12">
      <TopAppBar showBack onBack={() => navigateTo('role-selection')} />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-container-margin-mobile md:px-container-margin-desktop py-6 md:py-8 flex flex-col gap-6 md:gap-8">
        {/* Header Section */}
        <section className="flex flex-col gap-1.5">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
            Report a Found Item
          </h2>
          <p className="font-body-md text-sm md:text-base text-on-surface-variant">
            Thank you for being honest. Let's get this home.
          </p>
        </section>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-label-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-gutter items-start">
          {/* Left Column: Photo Capture & Category */}
          <div className="flex flex-col gap-6 w-full">
            {/* Camera Capture Card */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              <div
                onClick={handlePhotoClick}
                className="w-full aspect-[4/3] md:aspect-square bg-surface-container-lowest border border-outline-variant rounded-2xl ambient-shadow-card flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors group relative overflow-hidden"
              >
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Found Item Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-surface text-primary rounded-full font-label-bold text-xs shadow-md flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        Change Photo
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                      <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                    </div>
                    <span className="font-label-bold text-sm text-primary">
                      Tap to take a photo
                    </span>
                    <span className="text-[11px] text-on-surface-variant -mt-2">
                      or choose from photo gallery
                    </span>
                  </>
                )}
              </div>

              {/* Sample Photo Pickers for testing ease */}
              {!photoPreview && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <span className="text-[11px] text-on-surface-variant font-label-bold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleUseSamplePhoto('https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80')}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Wallet
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleUseSamplePhoto('https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80')}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Phone
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleUseSamplePhoto('https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80')}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Keys
                  </button>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="flex flex-col gap-3">
              <label className="font-label-bold text-sm text-on-surface">
                What did you find?
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <CategoryChip
                    key={cat}
                    category={cat}
                    isSelected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Location & Action */}
          <div className="flex flex-col gap-6 w-full h-full justify-between">
            {/* Location Section */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-sm text-on-surface flex items-center justify-between">
                <span>Where was it found?</span>
              </label>

              <InteractiveMap
                locationName={locationName}
                coordinates={coordinates}
                onLocationChange={(newLoc, newCoords) => {
                  setLocationName(newLoc);
                  setCoordinates(newCoords);
                }}
                isEditable
                heightClass="h-48 md:h-52"
                badgeLabel="Auto-pinned Location"
              />
            </div>

            {/* Additional Details Input */}
            <div className="flex flex-col gap-2">
              <label className="font-label-bold text-sm text-on-surface">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any distinguishing marks or context? (e.g. black leather, teal keychain, transit pass inside)"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5 font-body-md text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-24 shadow-sm"
              />
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                icon={<span className="material-symbols-outlined text-lg">arrow_forward</span>}
                iconPosition="right"
              >
                Next: Find a Hub
              </Button>
            </div>
          </div>
        </form>
      </main>

      <BottomNavBar />
    </div>
  );
};
