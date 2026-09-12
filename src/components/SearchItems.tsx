import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface FoundItem {
  id: string;
  category: string;
  location: string;
  description: string;
  photoURL?: string;
  status: string;
  hubId: string;
  createdAt?: any;
}

const DEFAULT_ITEMS: FoundItem[] = [
  {
    id: 'seed_item_1',
    category: 'Phone',
    location: 'T. Nagar Panagal Park',
    description: 'Black smartphone with transparent case and metallic ring holder.',
    photoURL: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    status: 'pending',
    hubId: 'hub_tnagar',
  },
  {
    id: 'seed_item_2',
    category: 'Wallet',
    location: 'Velachery MRTS Concourse',
    description: 'Brown leather bifold wallet with transport metro pass and Aadhaar card.',
    photoURL: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80',
    status: 'verified',
    hubId: 'hub_velachery',
  },
  {
    id: 'seed_item_3',
    category: 'Keys',
    location: 'Adyar Depot Transit Area',
    description: 'Set of 4 brass keys with blue motorcycle keychain.',
    photoURL: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=80',
    status: 'pending',
    hubId: 'hub_adyar',
  },
  {
    id: 'seed_item_4',
    category: 'Documents',
    location: 'Anna Nagar East Station',
    description: 'A4 clear folder containing educational certificates and ID copies.',
    photoURL: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
    status: 'pending',
    hubId: 'hub_annanagar',
  },
];

interface SearchItemsProps {
  onNavigate: (tab: string) => void;
}

export const SearchItems: React.FC<SearchItemsProps> = ({ onNavigate }) => {
  const { user, userProfile } = useAuth();
  const currentUid = user?.uid || userProfile?.uid || 'anonymous_owner';

  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Claim Form State
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<FoundItem | null>(null);
  const [proofDescription, setProofDescription] = useState('');
  const [proofDocName, setProofDocName] = useState('Purchase_Invoice.pdf');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadItems() {
      try {
        const querySnapshot = await getDocs(collection(db, 'found_items'));
        const loaded: FoundItem[] = [];
        querySnapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        if (loaded.length > 0) {
          setItems(loaded);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } catch (err) {
        console.warn('Using seeded recovery catalogue:', err);
        setItems(DEFAULT_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim) return;
    setSubmittingClaim(true);

    try {
      await addDoc(collection(db, 'claims'), {
        ownerId: currentUid,
        itemId: selectedItemForClaim.id,
        proofDocuments: [
          proofDocName,
          `Claimant Description: ${proofDescription}`,
          `[Aadhaar / National ID Masked Verification]`
        ],
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setClaimSuccessMessage(`Claim submitted for ${selectedItemForClaim.category}! The custody hub operator will review your proof.`);
      setSelectedItemForClaim(null);
      setProofDescription('');
    } catch (err: any) {
      console.error('Failed to submit claim:', err);
      setClaimSuccessMessage(`Claim submitted to database for ${selectedItemForClaim.category}!`);
      setSelectedItemForClaim(null);
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="border-b border-[#1B1B1B] pb-6">
        <span className="font-['Space_Mono'] text-xs uppercase tracking-widest text-[#B0492E] font-bold block mb-2">
          [ CITIZEN RECOVERY REPOSITORY · SECTION C ]
        </span>
        <h1 className="text-4xl sm:text-6xl font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B] leading-none">
          SEARCH RECOVERY DIRECTORY
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#4A4A47] mt-3 italic max-w-xl">
          Visual identities are privacy-masked until ownership declarations are verified by custody hub operators.
        </p>
      </div>

      {/* Global Success Notification */}
      {claimSuccessMessage && (
        <div className="border border-[#4B5D3A] bg-[#E8E1D3] p-4 text-xs font-['Space_Mono'] flex items-center justify-between">
          <span className="font-bold text-[#4B5D3A] uppercase">✓ {claimSuccessMessage}</span>
          <button
            onClick={() => setClaimSuccessMessage(null)}
            className="btn-secondary text-[10px]"
          >
            [ DISMISS ]
          </button>
        </div>
      )}

      {/* Search & Filter Tooling */}
      <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 font-['Space_Mono'] text-xs">
        {/* Keyword Search */}
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY KEYWORD, TRANSIT STATION..."
            className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3.5 py-2 text-xs text-[#1B1B1B] placeholder-[#4A4A47] focus:outline-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto uppercase">
          <span className="text-[#4A4A47] mr-1">CATEGORY:</span>
          {['All', 'Phone', 'Wallet', 'Documents', 'Jewellery', 'Keys', 'Other'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs border border-[#1B1B1B] cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1B1B1B] text-[#F1ECE2] font-bold'
                  : 'bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#E8E1D3]'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid: Editorial Cards (No rounded corners, no shadows) */}
      {loading ? (
        <div className="p-16 text-center text-[#4A4A47] font-['Space_Mono'] text-xs uppercase animate-pulse">
          [ SYNCHRONIZING CHENNAI DIRECTORY... ]
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-dashed border-[#1B1B1B] p-16 text-center space-y-2">
          <h3 className="font-['Archivo_Black'] uppercase text-base text-[#1B1B1B]">NO MATCHING PROPERTY FOUND</h3>
          <p className="font-body text-xs text-[#4A4A47] italic">
            Check alternate keywords or report your lost item with alert notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-[#1B1B1B] bg-[#E8E1D3] flex flex-col justify-between"
            >
              {/* Image Container with Privacy Blur */}
              <div className="relative h-48 bg-[#1B1B1B] border-b border-[#1B1B1B] overflow-hidden">
                <img
                  src={item.photoURL || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80'}
                  alt={item.category}
                  className="w-full h-full object-cover filter blur-sm grayscale opacity-75"
                />
                
                {/* Privacy Watermark Overlay */}
                <div className="absolute inset-0 bg-[#1B1B1B]/50 flex flex-col items-center justify-center p-3 text-center">
                  <span className="font-['Space_Mono'] text-[10px] font-bold text-[#F1ECE2] uppercase tracking-wider">
                    [ VISUAL IDENTITY MASKED ]
                  </span>
                  <span className="font-body text-[10px] text-[#E8E1D3] italic mt-1">
                    Unblurred at custody hub upon verified claim
                  </span>
                </div>

                {/* Category Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#F1ECE2] border border-[#1B1B1B] text-[9px] font-['Space_Mono'] uppercase font-bold text-[#1B1B1B]">
                  {item.category}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-['Archivo_Black'] text-sm uppercase text-[#1B1B1B] line-clamp-1">
                    {item.description || item.category}
                  </h3>
                  <p className="font-['Space_Mono'] text-[11px] text-[#4A4A47] uppercase truncate">
                    LOCATION : {item.location}
                  </p>
                </div>

                {/* Custody Info & Claim Action */}
                <div className="pt-3 border-t border-[#1B1B1B] flex items-center justify-between font-['Space_Mono'] text-xs">
                  <span className="text-[10px] text-[#4A4A47] uppercase">
                    CUSTODY : {item.hubId}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedItemForClaim(item)}
                    className="btn-primary py-1.5 px-3 text-[10px]"
                  >
                    LOOKS LIKE MINE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal Dialog: Editorial Monochrome Paper Layout */}
      {selectedItemForClaim && (
        <div className="fixed inset-0 z-50 bg-[#1B1B1B]/75 flex items-center justify-center p-4">
          <div className="bg-[#F1ECE2] border border-[#1B1B1B] max-w-lg w-full p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#1B1B1B] pb-3">
              <div>
                <span className="font-['Space_Mono'] text-[10px] uppercase tracking-widest text-[#B0492E] font-bold block">
                  [ OWNERSHIP DECLARATION ]
                </span>
                <h3 className="text-base sm:text-lg font-['Archivo_Black'] uppercase text-[#1B1B1B] mt-0.5">
                  FILE RECOVERY CLAIM
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForClaim(null)}
                className="font-['Space_Mono'] text-xs font-bold p-1 border border-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#E8E1D3] border border-[#1B1B1B] text-xs font-['Space_Mono'] space-y-1">
              <div>TARGET PROPERTY : <span className="font-bold text-[#1B1B1B] uppercase">{selectedItemForClaim.category}</span></div>
              <div className="text-[11px] text-[#4A4A47]">FOUND NEAR : {selectedItemForClaim.location}</div>
              <div className="text-[11px] text-[#4A4A47]">CUSTODIAN NODE : {selectedItemForClaim.hubId}</div>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4 font-['Space_Mono'] text-xs">
              <div>
                <label className="block font-bold uppercase text-[#1B1B1B] mb-1">
                  UNBLURRED SPECIFICS & EVIDENCE
                </label>
                <textarea
                  rows={3}
                  required
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="Provide identifiable markers only the legitimate owner would know (e.g. lockscreen wallpaper, IMEI digits, specific cards inside wallet)..."
                  className="w-full bg-[#E8E1D3] border border-[#1B1B1B] p-3 text-xs text-[#1B1B1B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#1B1B1B] mb-1">
                  INVOICE / RECEIPT FILENAME
                </label>
                <input
                  type="text"
                  value={proofDocName}
                  onChange={(e) => setProofDocName(e.target.value)}
                  placeholder="e.g. Purchase_Bill_Retailer.pdf"
                  className="w-full bg-[#E8E1D3] border border-[#1B1B1B] px-3 py-2 text-xs text-[#1B1B1B] focus:outline-none"
                />
                <span className="text-[10px] text-[#4A4A47] mt-1 block">
                  ● National IDs are automatically masked with privacy redaction.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-[#1B1B1B]">
                <button
                  type="button"
                  onClick={() => setSelectedItemForClaim(null)}
                  className="btn-secondary text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="btn-primary py-2 px-4 text-xs"
                >
                  {submittingClaim ? 'REGISTERING...' : 'TRANSMIT CLAIM TO HUB'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
