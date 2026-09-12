import React, { useState } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { simulateEmailNotificationToOwner } from '../lib/notifications';

const CHENNAI_HUBS = [
  { id: 'hub_velachery', name: 'Velachery Metro Custody Hub', address: 'Velachery MRTS Station concourse, Chennai 600042' },
  { id: 'hub_tnagar', name: 'T. Nagar Panagal Park Station Hub', address: 'Pondy Bazaar Circle, T. Nagar, Chennai 600017' },
  { id: 'hub_adyar', name: 'Adyar Depot Transit Hub', address: 'Lattice Bridge Road, Adyar, Chennai 600020' },
  { id: 'hub_annanagar', name: 'Anna Nagar Tower Park Hub', address: '3rd Avenue, Anna Nagar East, Chennai 600102' },
  { id: 'hub_central', name: 'Chennai Central Railway Concourse Hub', address: 'Puratchi Thalaivar Dr. M.G.R Central, Chennai 600003' },
];

const CATEGORIES = ['Phone', 'Wallet', 'Documents', 'Jewellery', 'Keys', 'Other'];

interface ReportItemProps {
  onSuccess?: () => void;
  onNavigate: (tab: string) => void;
}

export const ReportItem: React.FC<ReportItemProps> = ({ onSuccess, onNavigate }) => {
  const { user, userProfile } = useAuth();
  const currentUid = user?.uid || userProfile?.uid || 'anonymous_finder';

  const [category, setCategory] = useState('Phone');
  const [location, setLocation] = useState('Velachery MRTS Station');
  const [description, setDescription] = useState('');
  const [selectedHub, setSelectedHub] = useState(CHENNAI_HUBS[0].id);
  const [photoURL, setPhotoURL] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80');
  
  // Optional owner contact for simulated email alerting
  const [ownerEmailPrompt, setOwnerEmailPrompt] = useState('priya.lostproperty@gmail.com');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<any>(null);
  const [emailAlertInfo, setEmailAlertInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const hubData = CHENNAI_HUBS.find((h) => h.id === selectedHub) || CHENNAI_HUBS[0];
      const claimCode = `FBC-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Save to Firestore found_items collection
      const docRef = await addDoc(collection(db, 'found_items'), {
        finderId: currentUid,
        photoURL,
        category,
        location,
        description: description || `Found ${category} near ${location}`,
        status: 'pending',
        hubId: selectedHub,
        claimCode,
        createdAt: serverTimestamp(),
      });

      // 2. Simulate email notification to the owner that their item is reported found at a hub
      const emailResult = await simulateEmailNotificationToOwner({
        ownerEmail: ownerEmailPrompt || 'citizen.chennai@findback.network',
        ownerName: 'Chennai Resident',
        itemName: description || `${category} found at ${location}`,
        itemCategory: category,
        hubName: hubData.name,
        hubAddress: hubData.address,
        claimCode,
        photoUrl: photoURL,
        finderNotes: `Deposited by citizen finder. Safe custody guaranteed until verified claim.`,
      });

      setEmailAlertInfo(emailResult);
      setSubmittedItem({
        id: docRef.id,
        claimCode,
        hub: hubData,
        category,
        location,
        description,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to submit found item to Firestore:', err);
      setErrorMessage(err?.message || 'Error recording item in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="border-b border-[#1B1B1B] pb-6">
        <span className="font-['Space_Mono'] text-xs uppercase tracking-widest text-[#B0492E] font-bold block mb-2">
          [ CITIZEN DEPOSIT PROTOCOL · SECTION D ]
        </span>
        <h1 className="text-4xl sm:text-6xl font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B] leading-none">
          REPORT FOUND ITEM
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#4A4A47] mt-3 italic max-w-xl">
          Register the discovered property and deposit it at any verified Chennai custody hub to earn your 30% statutory reward upon recovery.
        </p>
      </div>

      {submittedItem ? (
        /* Confirmation State: Editorial Certificate Layout */
        <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-8 space-y-6">
          <div className="border-b border-[#1B1B1B] pb-4 flex items-center justify-between">
            <div>
              <span className="font-['Space_Mono'] text-[10px] uppercase text-[#4B5D3A] font-bold block">
                [ RECORD REGISTERED IN FIRESTORE ]
              </span>
              <h2 className="text-2xl font-['Archivo_Black'] uppercase text-[#1B1B1B] mt-1">
                CUSTODY PASS ISSUED
              </h2>
            </div>
            <div className="text-right font-['Space_Mono'] text-xs text-[#1B1B1B]">
              PASS NO : <span className="font-bold underline">{submittedItem.claimCode}</span>
            </div>
          </div>

          <div className="border border-[#1B1B1B] bg-[#F1ECE2] p-6 space-y-3 font-['Space_Mono'] text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[#4A4A47] block text-[10px] uppercase">ITEM CATEGORY</span>
                <span className="font-bold text-[#1B1B1B]">{submittedItem.category}</span>
              </div>
              <div>
                <span className="text-[#4A4A47] block text-[10px] uppercase">DEPOSIT HUB</span>
                <span className="font-bold text-[#1B1B1B]">{submittedItem.hub.name}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1B1B1B]">
              <span className="text-[#4A4A47] block text-[10px] uppercase">HUB ADDRESS</span>
              <span className="text-[#1B1B1B]">{submittedItem.hub.address}</span>
            </div>
          </div>

          {emailAlertInfo && (
            <div className="border border-[#4B5D3A] bg-[#F1ECE2] p-4 font-['Space_Mono'] text-xs space-y-1">
              <div className="font-bold text-[#4B5D3A] uppercase">
                ✉️ OWNER NOTIFICATION DISPATCHED : {emailAlertInfo.messageId}
              </div>
              <p className="font-body text-[#1B1B1B] text-xs">
                {emailAlertInfo.subject}
              </p>
              <div className="text-[10px] text-[#4A4A47]">
                Recipient provided with custody hub directions and cryptographic claim code.
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-2 font-['Space_Mono']">
            <button
              type="button"
              onClick={() => {
                setSubmittedItem(null);
                setEmailAlertInfo(null);
              }}
              className="btn-secondary text-xs"
            >
              [ + REPORT ANOTHER ITEM ]
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="btn-primary py-2.5 px-6 text-xs"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      ) : (
        /* Report Form: Sharp Architectural Inputs */
        <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-3 bg-[#F1ECE2] border border-[#B0492E] text-[#B0492E] text-xs font-['Space_Mono'] uppercase">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 font-['Space_Mono'] text-xs">
            
            {/* Category Selector */}
            <div>
              <label className="block font-bold uppercase text-[#1B1B1B] mb-2">
                1. SELECT CATEGORY
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-1 text-center border border-[#1B1B1B] cursor-pointer transition-colors ${
                      category === cat
                        ? 'bg-[#1B1B1B] text-[#F1ECE2] font-bold'
                        : 'bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#E8E1D3]'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Reference */}
            <div>
              <label className="block font-bold uppercase text-[#1B1B1B] mb-2">
                2. EVIDENCE PHOTOGRAPH
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-20 h-20 bg-[#1B1B1B] border border-[#1B1B1B] shrink-0 overflow-hidden">
                  <img
                    src={photoURL}
                    alt="Preview"
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="Photo Image URL"
                    className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3 py-2 text-xs text-[#1B1B1B] focus:outline-none"
                  />
                  <div className="flex gap-4 text-[10px] text-[#4A4A47] uppercase">
                    <button
                      type="button"
                      onClick={() => setPhotoURL('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80')}
                      className="underline cursor-pointer hover:text-[#1B1B1B]"
                    >
                      PHONE PRESET
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setPhotoURL('https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80')}
                      className="underline cursor-pointer hover:text-[#1B1B1B]"
                    >
                      WALLET PRESET
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setPhotoURL('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80')}
                      className="underline cursor-pointer hover:text-[#1B1B1B]"
                    >
                      DOCS PRESET
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Discovery Location */}
            <div>
              <label className="block font-bold uppercase text-[#1B1B1B] mb-1">
                3. DISCOVERY LOCATION (CHENNAI METRO)
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Velachery MRTS Concourse, Near Platform 2"
                className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3.5 py-2.5 text-xs text-[#1B1B1B] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold uppercase text-[#1B1B1B] mb-1">
                4. DESCRIPTION & DISTINGUISHING FEATURES
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Midnight blue iPhone 13 in matte bumper case with CMRL travel card attached."
                className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3.5 py-2 text-xs text-[#1B1B1B] focus:outline-none"
              />
            </div>

            {/* Custody Hub Selection */}
            <div>
              <label className="block font-bold uppercase text-[#1B1B1B] mb-1">
                5. DESIGNATED CUSTODY HUB
              </label>
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3.5 py-2.5 text-xs text-[#1B1B1B] focus:outline-none cursor-pointer"
              >
                {CHENNAI_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} — {hub.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Automated Owner Alert Hook */}
            <div className="border border-[#1B1B1B] bg-[#F1ECE2] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[#1B1B1B]">
                  6. AUTOMATIC OWNER ALERT NOTIFICATION (SIMULATION)
                </span>
                <span className="text-[10px] text-[#B0492E] font-bold">[ HOOK ]</span>
              </div>
              <input
                type="email"
                value={ownerEmailPrompt}
                onChange={(e) => setOwnerEmailPrompt(e.target.value)}
                placeholder="Owner email if found on tag"
                className="w-full bg-[#E8E1D3] border border-[#1B1B1B] px-3 py-1.5 text-xs text-[#1B1B1B] focus:outline-none"
              />
              <p className="font-body text-[11px] text-[#4A4A47] italic">
                FindBack will automatically simulate dispatching an encrypted email notification to this owner alerting them of the custody hub drop.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3.5 text-xs"
            >
              {isSubmitting ? 'RECORDING IN FIRESTORE...' : 'REGISTER PROPERTY IN LEDGER & GENERATE CUSTODY PASS'}
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
