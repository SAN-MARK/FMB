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
  
  // Optional owner contact for simulated email alerting if finder knows or found contact card
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
      // Even if Firestore rule restricts unauthenticated test tokens, provide resilient feedback
      setErrorMessage(err?.message || 'Error recording item in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060612] text-slate-100 p-4 sm:p-6 pb-24 relative">
      
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Success / Confirmation State */}
        {submittedItem ? (
          <div className="bg-[#090b20] border border-cyan-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl shadow-[0_0_20px_#22d3ee] mb-4">
              ✓
            </div>

            <h2 className="text-2xl font-black text-white">Item Registered to Hub!</h2>
            <p className="text-xs text-cyan-400 font-mono mt-1">
              RECORDED IN FIRESTORE COLLECTION: `found_items/{submittedItem.id}`
            </p>

            {/* Custody Tag Card */}
            <div className="my-6 p-5 bg-[#0d1133] border border-indigo-500/40 rounded-2xl text-left font-mono">
              <div className="flex justify-between items-center border-b border-indigo-900 pb-2 mb-3">
                <span className="text-xs text-slate-400">FINDBACK CUSTODY PASS</span>
                <span className="text-xs text-cyan-400 font-bold">{submittedItem.claimCode}</span>
              </div>
              <p className="text-xs text-slate-300">
                Category: <strong className="text-white">{submittedItem.category}</strong>
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Drop Location: <strong className="text-white">{submittedItem.hub.name}</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Address: {submittedItem.hub.address}
              </p>
            </div>

            {/* Email Notification Simulation Banner */}
            {emailAlertInfo && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-left mb-6">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs font-mono">
                  <span>✉️ Owner Notification Dispatched:</span>
                  <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-white">
                    {emailAlertInfo.messageId}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {emailAlertInfo.subject}
                </p>
                <p className="text-[10px] text-emerald-400/80 mt-1">
                  Recipient received secure claim code & hub custody directions without exposing your identity.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmittedItem(null);
                  setEmailAlertInfo(null);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                + Report Another Item
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-2.5 bg-[#0d102b] hover:bg-[#141842] border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold transition-all"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Report Form */
          <div className="bg-[#090b20]/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(99,102,241,0.2)]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-950 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                  FINDER INTAKE PROTOCOL
                </span>
                <h1 className="text-2xl font-black text-white mt-1">Report Found Item</h1>
                <p className="text-xs text-slate-400">
                  Register the item and drop it at any Chennai verified hub to earn ₹60 reward.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-lg">
                📦
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  Item Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.4)] border border-cyan-400'
                          : 'bg-[#0d102b] text-slate-400 hover:text-white border border-indigo-900/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Reference (Preset Sample / Custom URL) */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                  Photo Evidence (Protected / Blurred in Public Directory)
                </label>
                <div className="flex gap-3 items-center">
                  <img
                    src={photoURL}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="Photo Image URL"
                      className="w-full bg-[#0d102b] border border-indigo-900/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <div className="flex gap-2 mt-1.5 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setPhotoURL('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80')}
                        className="text-cyan-400 hover:underline"
                      >
                        Phone Preset
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setPhotoURL('https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80')}
                        className="text-cyan-400 hover:underline"
                      >
                        Wallet Preset
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setPhotoURL('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80')}
                        className="text-cyan-400 hover:underline"
                      >
                        Docs Preset
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discovery Location */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Discovery Location (Chennai Landmark)
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Velachery MRTS Concourse, Near Ticket Counter"
                  className="w-full bg-[#0d102b] border border-indigo-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Item Description & Distinct Identifiers
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Midnight blue iPhone 13 in black bumper case with Tamil Nadu transport smart card attached in sleeve."
                  className="w-full bg-[#0d102b] border border-indigo-900/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>

              {/* Custody Hub Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Designated Custody Drop Hub
                </label>
                <select
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                  className="w-full bg-[#0d102b] border border-indigo-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {CHENNAI_HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name} — {hub.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Simulated Owner Email Notification Dispatch Trigger */}
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-700/40 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                    <span>⚡ Automatic Owner Alert Simulation</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">UTILITY HOOK</span>
                </div>
                <input
                  type="email"
                  value={ownerEmailPrompt}
                  onChange={(e) => setOwnerEmailPrompt(e.target.value)}
                  placeholder="Owner's email (if visible on tag or in contact card)"
                  className="w-full bg-[#090b20] border border-indigo-800/80 rounded-xl px-3 py-1.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400 mt-1"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  FindBack will automatically simulate dispatching an encrypted email notification to this owner alerting them of the custody hub location.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all cursor-pointer active:scale-[0.99] border border-cyan-400/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting to Firestore & Notifying Owner...</span>
                  </>
                ) : (
                  <span>SUBMIT ITEM & GENERATE CUSTODY PASS</span>
                )}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
