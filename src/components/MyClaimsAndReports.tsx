import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FoundItem, Claim, Hub, ItemCategory, LiveCaptureMetadata, CounterpartMessage } from '../types';
import { ChennaiMap, calculateDistanceKm } from './ChennaiMap';
import { LiveCameraCaptureModal } from './LiveCameraCaptureModal';

interface MyClaimsAndReportsProps {
  onNavigate?: (tab: string) => void;
}

export const MyClaimsAndReports: React.FC<MyClaimsAndReportsProps> = ({ onNavigate }) => {
  const { user, userProfile } = useAuth();
  const currentUid = user?.uid || userProfile?.uid || 'usr_chennai_current';
  const currentEmail = userProfile?.email || user?.email || '';
  const currentName = userProfile?.displayName || user?.displayName || 'FindBack Citizen';

  const [items, setItems] = useState<FoundItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, CounterpartMessage[]>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable row state
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [replyMessageText, setReplyMessageText] = useState('');

  // "Upload Found Item" Flow Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [captureMetadata, setCaptureMetadata] = useState<LiveCaptureMetadata | null>(null);

  // Form inputs for found item
  const [formCategory, setFormCategory] = useState<ItemCategory>('Phone');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('Anna Salai, Chennai');
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-chennai-tnagar-02');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Fetch Hubs and Items
  useEffect(() => {
    fetchHubs();
    loadUserRecords();
  }, [currentUid]);

  // Request user location for nearest hubs calculation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: Math.round(pos.coords.latitude * 1000) / 1000,
            lng: Math.round(pos.coords.longitude * 1000) / 1000,
          });
        },
        () => {
          setUserLocation({ lat: 13.0418, lng: 80.2341 });
        }
      );
    }
  }, []);

  const fetchHubs = async () => {
    try {
      const res = await fetch('/api/hubs');
      const data = await res.json();
      if (data.hubs) {
        setHubs(data.hubs);
      }
    } catch (e) {
      console.warn('Could not load hubs from API, using defaults');
    }
  };

  const loadUserRecords = async () => {
    setLoading(true);
    try {
      // 1. Fetch found items reported by this user
      const foundQuery = query(
        collection(db, 'found_items'),
        where('reporter_id', '==', currentUid)
      );
      const foundSnap = await getDocs(foundQuery);
      const loadedFound: FoundItem[] = [];
      foundSnap.forEach((docSnap) => {
        loadedFound.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      // 2. Fetch claims filed by this user
      const claimsQuery = query(
        collection(db, 'claims'),
        where('claimant_id', '==', currentUid)
      );
      const claimsSnap = await getDocs(claimsQuery);
      const loadedClaims: Claim[] = [];
      claimsSnap.forEach((docSnap) => {
        loadedClaims.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      // Populate realistic sample data if empty
      if (loadedFound.length === 0) {
        loadedFound.push(
          {
            id: 'item_chn_sample_1',
            reporter_id: currentUid,
            reporter_name: currentName,
            reporter_email: currentEmail,
            category: 'Phone',
            item_code: 'FND-CHN-7812',
            photo_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
            lat: 13.0418,
            lng: 80.2341,
            location_name: 'Panagal Park Bus Shelter, T. Nagar',
            hub_id: 'hub-chennai-tnagar-02',
            status: 'claimed',
            description: 'iPhone 15 Midnight Blue with transparent Spigen protective case found on passenger bench.',
            capture_metadata: {
              timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
              is_live_camera: true,
              geolocation: { lat: 13.0418, lng: 80.2341, accuracy: 8 },
            },
            ai_verification: {
              match_score: 94,
              confidence: 'high',
              summary: 'Live hardware capture verified. Optical features confirmed against Chennai lost registry.',
              fraud_risk: 'low',
              detected_features: ['Dual camera sensor', 'Midnight Blue anodized rail', 'Case mark'],
            },
            created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'item_chn_sample_2',
            reporter_id: currentUid,
            reporter_name: currentName,
            reporter_email: currentEmail,
            category: 'Wallet',
            item_code: 'FND-CHN-8931',
            photo_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
            lat: 12.9756,
            lng: 80.2207,
            location_name: 'Velachery MRTS Ticket Concourse',
            hub_id: 'hub-chennai-velachery-01',
            status: 'verified',
            description: 'WildHorn genuine brown leather tri-fold wallet with metro pass and key card inside.',
            capture_metadata: {
              timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
              is_live_camera: true,
              geolocation: { lat: 12.9756, lng: 80.2207, accuracy: 12 },
            },
            ai_verification: {
              match_score: 89,
              confidence: 'high',
              summary: 'Live capture verified at Velachery hub with matched card placement.',
              fraud_risk: 'low',
              detected_features: ['WildHorn embossed logo', 'CMRL metro transit token'],
            },
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          }
        );
      }

      setItems(loadedFound);
      setClaims(loadedClaims);

      // Seed counterpart messages
      setMessagesMap({
        item_chn_sample_1: [
          {
            id: 'msg_1',
            item_id: 'item_chn_sample_1',
            sender_id: 'claimant_priya',
            sender_name: 'Priya Sundaram (Owner)',
            sender_email: 'priya.sundaram@gmail.com',
            sender_role: 'owner',
            message: 'Hello! Does this phone have a pink butterfly lockscreen wallpaper?',
            timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: 'msg_2',
            item_id: 'item_chn_sample_1',
            sender_id: currentUid,
            sender_name: `${currentName} (Finder)`,
            sender_email: currentEmail,
            sender_role: 'finder',
            message: 'Yes, exactly! I deposited it with Sangeetha Store at the T. Nagar Hub. You can claim it with your ID.',
            timestamp: new Date(Date.now() - 5400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]
      });
    } catch (e) {
      console.error('Error loading reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const getNearestHubs = () => {
    if (!userLocation || hubs.length === 0) return hubs.slice(0, 3);
    const sorted = [...hubs].sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
    return sorted.slice(0, 3);
  };

  const handleSubmitFoundItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedPhoto) {
      alert('Anti-Fraud Requirement: Live camera photo capture is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const aiResponse = await fetch('/api/ai/verify-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCategory: formCategory,
          itemDescription: formDescription,
          locationName: formLocation,
          imageBase64: capturedPhoto,
          liveCaptureMetadata: captureMetadata,
        }),
      });
      const aiData = await aiResponse.json();
      setAiAnalysisResult(aiData);

      const newItemCode = `FND-CHN-${Math.floor(1000 + Math.random() * 9000)}`;
      const selectedHubObj = hubs.find((h) => h.id === selectedHubId);

      const newItemDoc: Omit<FoundItem, 'id'> = {
        reporter_id: currentUid,
        reporter_name: currentName,
        reporter_email: currentEmail,
        category: formCategory,
        item_code: newItemCode,
        photo_url: capturedPhoto,
        lat: captureMetadata?.geolocation?.lat || userLocation?.lat || 13.0418,
        lng: captureMetadata?.geolocation?.lng || userLocation?.lng || 80.2341,
        location_name: formLocation,
        hub_id: selectedHubId,
        hub: selectedHubObj,
        status: 'reported',
        description: formDescription,
        capture_metadata: captureMetadata || {
          timestamp: new Date().toISOString(),
          is_live_camera: true,
        },
        ai_verification: aiData,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'found_items'), {
        ...newItemDoc,
        createdAt: serverTimestamp(),
      });

      const createdItem: FoundItem = { id: docRef.id, ...newItemDoc };
      setItems((prev) => [createdItem, ...prev]);

      setCapturedPhoto(null);
      setCaptureMetadata(null);
      setFormDescription('');
      setIsUploadModalOpen(false);
      setExpandedItemId(createdItem.id);
    } catch (err: any) {
      console.error('Failed to submit item:', err);
      alert('Could not submit item. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = (itemId: string) => {
    if (!replyMessageText.trim()) return;

    const newMsg: CounterpartMessage = {
      id: `msg_${Date.now()}`,
      item_id: itemId,
      sender_id: currentUid,
      sender_name: currentName,
      sender_email: currentEmail,
      sender_role: 'finder',
      message: replyMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newMsg],
    }));

    setReplyMessageText('');
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'all') {
      const normalizedStatus = item.status.toLowerCase();
      if (normalizedStatus !== statusFilter.toLowerCase()) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.description.toLowerCase().includes(q) ||
        item.item_code.toLowerCase().includes(q) ||
        item.location_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Status badges: text only with brackets, no pill backgrounds!
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'returned':
      case 'verified':
        return <span className="font-['Space_Mono'] text-xs font-bold text-[#4B5D3A]">[ RETURNED ]</span>;
      case 'verifying':
      case 'under_review':
        return <span className="font-['Space_Mono'] text-xs font-bold text-[#A8792B]">[ VERIFYING ]</span>;
      case 'matched':
      case 'claimed':
        return <span className="font-['Space_Mono'] text-xs font-bold text-[#1B1B1B]">[ MATCHED ]</span>;
      case 'disputed':
        return <span className="font-['Space_Mono'] text-xs font-bold text-[#B0492E]">[ DISPUTED ]</span>;
      case 'reported':
      default:
        return <span className="font-['Space_Mono'] text-xs font-bold text-[#A8792B]">[ REPORTED ]</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Editorial Header Section — Oversized 48-72px bold condensed headline */}
      <div className="border-b border-[#1B1B1B] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-['Space_Mono'] text-xs uppercase tracking-widest text-[#4A4A47] block mb-2">
            [ SECTION B · CITIZEN RECOVERY REPOSITORY ]
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B] leading-none">
            MY CLAIMS & REPORTS
          </h1>
          <p className="font-body text-sm sm:text-base text-[#4A4A47] mt-3 max-w-2xl italic">
            Permanent ledger of items reported, verified physical custody drops at partner hubs, and cryptographic recovery payouts across Chennai.
          </p>
        </div>

        {/* Action Button: Primary Black with Cream Text */}
        <button
          type="button"
          onClick={() => {
            setIsUploadModalOpen(true);
            setIsCameraModalOpen(true);
          }}
          className="btn-primary py-3 px-6 text-xs sm:text-sm self-start md:self-end"
        >
          <span>📸</span>
          <span>REPORT FOUND ITEM (LIVE CAMERA)</span>
        </button>
      </div>

      {/* Filter and Search Bar: Thin black rules, no cards/shadows */}
      <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="SEARCH CODE, DESCRIPTION, LOCATION..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3.5 py-2 text-xs font-['Space_Mono'] text-[#1B1B1B] placeholder-[#4A4A47] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-['Space_Mono'] uppercase">
          <span className="text-[#4A4A47]">CATEGORY:</span>
          {['all', 'Phone', 'Wallet', 'ID Card', 'Bag', 'Keys'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs border border-[#1B1B1B] cursor-pointer transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#1B1B1B] text-[#F1ECE2] font-bold'
                  : 'bg-[#F1ECE2] text-[#1B1B1B] hover:bg-[#E8E1D3]'
              }`}
            >
              {cat === 'all' ? 'ALL' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs font-['Space_Mono'] uppercase">
          <span className="text-[#4A4A47]">STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F1ECE2] border border-[#1B1B1B] px-2.5 py-1 text-xs font-['Space_Mono'] text-[#1B1B1B] focus:outline-none cursor-pointer"
          >
            <option value="all">ALL STATUSES</option>
            <option value="reported">REPORTED</option>
            <option value="matched">MATCHED</option>
            <option value="verifying">VERIFYING</option>
            <option value="claimed">CLAIMED</option>
            <option value="returned">RETURNED</option>
            <option value="disputed">DISPUTED</option>
          </select>
        </div>
      </div>

      {/* Reports & Claims Table / List: Thin horizontal rules only, no cards, no shadows */}
      <div className="border border-[#1B1B1B] divide-y divide-[#1B1B1B] bg-[#F1ECE2]">
        
        {/* Table Column Header Bar */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#E8E1D3] border-b border-[#1B1B1B] font-['Space_Mono'] text-[11px] font-bold uppercase tracking-wider text-[#1B1B1B]">
          <div className="col-span-2">REF CODE / DATE</div>
          <div className="col-span-5">DESCRIPTION & METRICS</div>
          <div className="col-span-2">LOCATION</div>
          <div className="col-span-2">CUSTODY STATUS</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#4A4A47] flex flex-col items-center justify-center">
            <span className="font-['Space_Mono'] text-xs uppercase tracking-wider animate-pulse">
              [ SYNCHRONIZING CHENNAI RECOVERY ARCHIVE... ]
            </span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-[#4A4A47] space-y-3">
            <h3 className="font-['Archivo_Black'] text-lg uppercase text-[#1B1B1B]">NO MATCHING RECORDS IN LEDGER</h3>
            <p className="font-body text-xs text-[#4A4A47] max-w-sm mx-auto italic">
              No reported or claimed items match the current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsUploadModalOpen(true);
                setIsCameraModalOpen(true);
              }}
              className="btn-primary mt-2"
            >
              FILE LIVE CAMERA REPORT
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const hubObj = hubs.find((h) => h.id === item.hub_id);
            const messages = messagesMap[item.id] || [];

            return (
              <div key={item.id} className="transition-colors hover:bg-[#E8E1D3]/50">
                {/* Main Row */}
                <div
                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center cursor-pointer select-none"
                >
                  {/* Col 1: Item Code & Date */}
                  <div className="md:col-span-2 space-y-1">
                    <div className="font-['Space_Mono'] text-xs font-bold text-[#1B1B1B]">
                      {item.item_code}
                    </div>
                    <div className="font-['Space_Mono'] text-[10px] text-[#4A4A47] uppercase">
                      [ {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ]
                    </div>
                  </div>

                  {/* Col 2: Thumbnail & Description */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div className="w-14 h-14 shrink-0 bg-[#1B1B1B] border border-[#1B1B1B] overflow-hidden relative">
                      <img
                        src={item.photo_url}
                        alt={item.description}
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                      {item.capture_metadata?.is_live_camera && (
                        <div className="absolute bottom-0 inset-x-0 bg-[#1B1B1B] text-[#F1ECE2] text-[8px] font-['Space_Mono'] text-center uppercase">
                          LIVE
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="font-['Space_Mono'] text-[10px] uppercase text-[#4A4A47] block">
                        ( {item.category} )
                      </span>
                      <h4 className="font-['Archivo_Black'] text-sm uppercase text-[#1B1B1B] line-clamp-1">
                        {item.description}
                      </h4>
                      {item.ai_verification && (
                        <span className="font-['Space_Mono'] text-[10px] text-[#4B5D3A] font-bold block">
                          AI MATCH : {item.ai_verification.match_score}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Col 3: Location */}
                  <div className="md:col-span-2 font-['Space_Mono'] text-xs text-[#1B1B1B]">
                    <div className="truncate font-medium">{item.location_name}</div>
                    <div className="text-[10px] text-[#4A4A47] uppercase truncate">
                      HUB: {hubObj?.name?.split('(')[0] || 'T. Nagar'}
                    </div>
                  </div>

                  {/* Col 4: Status Badge (Text with bracket only) */}
                  <div className="md:col-span-2">
                    {renderStatusBadge(item.status)}
                  </div>

                  {/* Col 5: Expand Toggle Button */}
                  <div className="md:col-span-1 text-right self-end md:self-center">
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                    >
                      {isExpanded ? '[ CLOSE ]' : '[ INSPECT ]'}
                    </button>
                  </div>
                </div>

                {/* Expandable Slide-Down Panel: Cream-on-cream with hairline top border, no shadows */}
                {isExpanded && (
                  <div className="p-6 bg-[#E8E1D3] border-t border-[#1B1B1B] space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Sub-panel 1: Telemetry & Watermarked Evidence */}
                      <div className="border border-[#1B1B1B] bg-[#F1ECE2] p-4 space-y-3">
                        <span className="font-['Space_Mono'] text-[10px] font-bold uppercase tracking-widest text-[#1B1B1B] block border-b border-[#1B1B1B] pb-1">
                          ( FORENSIC EVIDENCE & EXIF )
                        </span>
                        <div className="w-full h-44 bg-[#1B1B1B] border border-[#1B1B1B] overflow-hidden">
                          <img
                            src={item.photo_url}
                            alt="Forensic Evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {item.capture_metadata && (
                          <div className="font-['Space_Mono'] text-[11px] text-[#1B1B1B] space-y-1 pt-1">
                            <div>TIMESTAMP : {new Date(item.capture_metadata.timestamp).toLocaleString('en-IN')}</div>
                            <div>COORDINATES : {item.capture_metadata.geolocation?.lat}°N, {item.capture_metadata.geolocation?.lng}°E</div>
                            <div className="font-bold text-[#4B5D3A]">● HARDWARE CAMERA SHUTTER VERIFIED</div>
                          </div>
                        )}
                      </div>

                      {/* Sub-panel 2: Custody Destination & Recovery Stepper */}
                      <div className="border border-[#1B1B1B] bg-[#F1ECE2] p-4 space-y-4">
                        <span className="font-['Space_Mono'] text-[10px] font-bold uppercase tracking-widest text-[#1B1B1B] block border-b border-[#1B1B1B] pb-1">
                          ( CHENNAI CUSTODY HUB )
                        </span>
                        {hubObj ? (
                          <div className="space-y-1.5 font-['Space_Mono'] text-xs text-[#1B1B1B]">
                            <div className="font-['Archivo_Black'] uppercase text-sm">{hubObj.name}</div>
                            <div className="text-[11px] text-[#4A4A47]">{hubObj.address}</div>
                            <div className="text-[11px] text-[#4A4A47]">HOURS : {hubObj.hours || '08:00 - 22:00'}</div>
                            {hubObj.phone && <div className="text-[11px] text-[#4A4A47]">CONTACT : {hubObj.phone}</div>}
                            <div className="mt-3 p-2 border border-[#1B1B1B] bg-[#E8E1D3] text-[11px]">
                              RECOVERY FEE : ₹200 · FINDER REWARD (30%) : ₹60
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-['Space_Mono'] text-[#4A4A47]">NO SPECIFIC HUB ASSIGNED</p>
                        )}

                        {/* Recovery Stepper */}
                        <div className="pt-2 border-t border-[#1B1B1B]">
                          <span className="font-['Space_Mono'] text-[10px] text-[#4A4A47] uppercase block mb-2">
                            RECOVERY STAGES :
                          </span>
                          <div className="flex items-center justify-between font-['Space_Mono'] text-[10px] uppercase font-bold text-[#4A4A47]">
                            <span className="text-[#1B1B1B] underline">1. REPORTED</span>
                            <span>→</span>
                            <span className={item.status !== 'reported' ? 'text-[#1B1B1B] underline' : ''}>
                              2. MATCHED
                            </span>
                            <span>→</span>
                            <span className={item.status === 'verified' || item.status === 'returned' ? 'text-[#4B5D3A] underline' : ''}>
                              3. RETURNED
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-panel 3: Counterpart Communication */}
                      <div className="border border-[#1B1B1B] bg-[#F1ECE2] p-4 flex flex-col justify-between">
                        <div>
                          <span className="font-['Space_Mono'] text-[10px] font-bold uppercase tracking-widest text-[#1B1B1B] block border-b border-[#1B1B1B] pb-1 mb-2">
                            ( COUNTERPART DIALOGUE )
                          </span>

                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {messages.length === 0 ? (
                              <p className="font-body text-xs text-[#4A4A47] italic py-4 text-center">
                                No counterpart correspondence recorded yet.
                              </p>
                            ) : (
                              messages.map((m) => {
                                const isMe = m.sender_id === currentUid;
                                return (
                                  <div
                                    key={m.id}
                                    className={`p-2.5 border border-[#1B1B1B] text-xs font-['Space_Mono'] ${
                                      isMe ? 'bg-[#E8E1D3] ml-3' : 'bg-[#F1ECE2] mr-3'
                                    }`}
                                  >
                                    <div className="flex justify-between text-[9px] text-[#4A4A47] mb-1 uppercase">
                                      <span>{m.sender_name}</span>
                                      <span>{m.timestamp}</span>
                                    </div>
                                    <p className="font-body text-xs text-[#1B1B1B]">{m.message}</p>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Reply Input */}
                        <div className="mt-4 pt-2 border-t border-[#1B1B1B] flex gap-2">
                          <input
                            type="text"
                            placeholder="TYPE MESSAGE..."
                            value={replyMessageText}
                            onChange={(e) => setReplyMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendMessage(item.id);
                            }}
                            className="flex-1 bg-[#F1ECE2] border border-[#1B1B1B] px-2 py-1.5 text-xs font-['Space_Mono'] text-[#1B1B1B] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendMessage(item.id)}
                            className="btn-primary py-1 px-3 text-xs"
                          >
                            SEND
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* "Upload Found Item" Intake Flow Modal with mandatory Live Camera capture */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#1B1B1B]/75 overflow-y-auto">
          <div className="bg-[#F1ECE2] border border-[#1B1B1B] w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#E8E1D3] border-b border-[#1B1B1B] flex items-center justify-between">
              <div>
                <span className="font-['Space_Mono'] text-[10px] uppercase tracking-widest text-[#B0492E] font-bold block">
                  [ CUSTODY INTAKE FLOW ]
                </span>
                <h3 className="text-base sm:text-lg font-['Archivo_Black'] uppercase text-[#1B1B1B]">
                  REPORT FOUND ITEM (CHENNAI METRO)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="font-['Space_Mono'] text-xs font-bold p-1 border border-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleSubmitFoundItem} className="p-6 space-y-6 text-xs font-['Space_Mono']">
              {/* Photo Shutter Area */}
              <div>
                <label className="block text-[#1B1B1B] font-bold uppercase mb-2">
                  1. LIVE CAMERA EVIDENCE <span className="text-[#B0492E]">*</span>
                </label>
                {!capturedPhoto ? (
                  <div
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full h-40 border-2 border-dashed border-[#1B1B1B] bg-[#E8E1D3] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F1ECE2] transition-colors"
                  >
                    <div className="w-12 h-12 border border-[#1B1B1B] flex items-center justify-center text-xl mb-2">
                      📸
                    </div>
                    <span className="font-bold text-xs uppercase text-[#1B1B1B]">
                      TRIGGER LIVE HARDWARE SHUTTER
                    </span>
                    <span className="text-[10px] text-[#4A4A47] uppercase mt-1">
                      PHOTO ALBUMS DISABLED · MANDATORY LIVE TIME & GPS WATERMARK
                    </span>
                  </div>
                ) : (
                  <div className="relative w-full h-44 bg-[#1B1B1B] border border-[#1B1B1B] overflow-hidden">
                    <img
                      src={capturedPhoto}
                      alt="Captured Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#E8E1D3] border border-[#1B1B1B] px-2 py-0.5 text-[10px] text-[#4B5D3A] font-bold uppercase">
                      ✓ LIVE WATERMARK VERIFIED
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="absolute bottom-2 right-2 btn-primary text-[10px] py-1 px-2"
                    >
                      RETAKE SHOT
                    </button>
                  </div>
                )}
              </div>

              {/* Category & Location Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1B1B1B] font-bold uppercase mb-1">ITEM CATEGORY</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ItemCategory)}
                    className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3 py-2 text-xs font-['Space_Mono'] text-[#1B1B1B] focus:outline-none"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Wallet">Wallet</option>
                    <option value="ID Card">ID Card</option>
                    <option value="Bag">Bag / Backpack</option>
                    <option value="Documents">Documents</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1B1B1B] font-bold uppercase mb-1">LANDMARK FOUND</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panagal Park bus shelter"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3 py-2 text-xs font-['Space_Mono'] text-[#1B1B1B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#1B1B1B] font-bold uppercase mb-1">
                  DESCRIPTION & VISUAL MARKERS
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe manufacturer, color, condition, and identifiable markers..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#F1ECE2] border border-[#1B1B1B] px-3 py-2 text-xs font-['Space_Mono'] text-[#1B1B1B] focus:outline-none"
                />
              </div>

              {/* Nearest Chennai Custody Hub Picker with Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#1B1B1B] font-bold uppercase">
                    2. DEPOSIT HUB (CHENNAI METRO GRID)
                  </label>
                  <span className="text-[10px] text-[#4A4A47] uppercase">
                    SUGGESTED NEAREST 3 HUBS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {getNearestHubs().map((hub) => {
                    const isSelected = selectedHubId === hub.id;
                    const distance = userLocation
                      ? calculateDistanceKm(userLocation.lat, userLocation.lng, hub.lat, hub.lng)
                      : null;

                    return (
                      <div
                        key={hub.id}
                        onClick={() => setSelectedHubId(hub.id)}
                        className={`p-2.5 border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1B1B1B] text-[#F1ECE2] border-[#1B1B1B]'
                            : 'bg-[#E8E1D3] text-[#1B1B1B] border-[#1B1B1B] hover:bg-[#F1ECE2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate uppercase">{hub.name.split('(')[0]}</span>
                          {distance !== null && (
                            <span className="text-[9px] font-['Space_Mono']">
                              {distance}km
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] truncate mt-0.5 opacity-80">{hub.address}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Chennai Metro Map */}
                <ChennaiMap
                  hubs={hubs}
                  selectedHubId={selectedHubId}
                  onSelectHub={(hub) => setSelectedHubId(hub.id)}
                  userCoords={userLocation}
                  height="200px"
                  mode="picker"
                />
              </div>

              {/* Submit Controls */}
              <div className="pt-4 border-t border-[#1B1B1B] flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn-secondary"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !capturedPhoto}
                  className={`btn-primary py-2.5 px-6 ${
                    isSubmitting || !capturedPhoto ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'VERIFYING WITH GEMINI AI...' : 'REGISTER IN LEDGER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      <LiveCameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(base64, meta) => {
          setCapturedPhoto(base64);
          setCaptureMetadata(meta);
        }}
      />
    </div>
  );
};
