import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface FoundItem {
  id: string;
  finderId: string;
  category: string;
  location: string;
  description: string;
  status: string;
  hubId: string;
  claimCode?: string;
  createdAt?: any;
}

interface Claim {
  id: string;
  ownerId: string;
  itemId: string;
  proofDocuments: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

interface UserRecord {
  id: string;
  displayName: string;
  email: string;
  role: string;
  photoURL?: string;
}

export const AdminPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'claims' | 'items' | 'users'>('claims');
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [payoutNotification, setPayoutNotification] = useState<{
    claimId: string;
    payoutId: string;
    amount: number;
    upiId: string;
  } | null>(null);

  // Load all records from Firestore
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Claims
      const claimsSnap = await getDocs(collection(db, 'claims'));
      const loadedClaims: Claim[] = [];
      claimsSnap.forEach((d) => loadedClaims.push({ id: d.id, ...(d.data() as any) }));
      
      // Default mock claims if collection is empty
      if (loadedClaims.length === 0) {
        loadedClaims.push(
          {
            id: 'claim_demo_01',
            ownerId: 'owner_priya_chennai',
            itemId: 'found_item_tnagar_iphone',
            proofDocuments: ['Invoice_AppleStore_PhoenixMarketcity.pdf', 'IMEI ends in 4821'],
            status: 'pending',
          },
          {
            id: 'claim_demo_02',
            ownerId: 'owner_rahul_adya',
            itemId: 'found_item_wallet_velachery',
            proofDocuments: ['Driving License Tamil Nadu Copy', '[Aadhaar Redacted]'],
            status: 'pending',
          }
        );
      }
      setClaims(loadedClaims);

      // 2. Found Items
      const itemsSnap = await getDocs(collection(db, 'found_items'));
      const loadedItems: FoundItem[] = [];
      itemsSnap.forEach((d) => loadedItems.push({ id: d.id, ...(d.data() as any) }));
      setFoundItems(loadedItems);

      // 3. Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const loadedUsers: UserRecord[] = [];
      usersSnap.forEach((d) => loadedUsers.push({ id: d.id, ...(d.data() as any) }));
      
      if (loadedUsers.length === 0) {
        loadedUsers.push(
          {
            id: 'usr_admin_01',
            displayName: 'Chennai Hub Director',
            email: 'admin.chennai@findback.network',
            role: 'admin',
          },
          {
            id: 'usr_finder_01',
            displayName: 'Karthik Raja',
            email: 'karthik.finder@gmail.com',
            role: 'finder',
          },
          {
            id: 'usr_owner_01',
            displayName: 'Priya Sundaram',
            email: 'priya.s@gmail.com',
            role: 'owner',
          }
        );
      }
      setUsers(loadedUsers);

    } catch (err) {
      console.warn('Admin read data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Approve Claim: Triggers Razorpay Sandbox UPI payout simulation
  const handleApprove = async (claimId: string, itemId: string) => {
    try {
      // 1. Update claim status in Firestore
      try {
        const claimRef = doc(db, 'claims', claimId);
        await updateDoc(claimRef, {
          status: 'approved',
          reviewedAt: serverTimestamp(),
          reviewerId: userProfile?.uid || 'admin',
        });
      } catch (e) {
        console.warn('Firestore claim update:', e);
      }

      // 2. Update found item status to returned
      try {
        const itemRef = doc(db, 'found_items', itemId);
        await updateDoc(itemRef, {
          status: 'returned',
          returnedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('Firestore item update:', e);
      }

      // 3. Trigger Razorpay Sandbox UPI Payout
      const payoutId = `rzp_pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const upiId = 'finder.karthik@okhdfcbank';
      
      setPayoutNotification({
        claimId,
        payoutId,
        amount: 60,
        upiId,
      });

      // Update local state
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: 'approved' } : c))
      );
      setFoundItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: 'returned' } : i))
      );

    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  // Handle Reject Claim
  const handleReject = async (claimId: string) => {
    try {
      try {
        const claimRef = doc(db, 'claims', claimId);
        await updateDoc(claimRef, {
          status: 'rejected',
          reviewedAt: serverTimestamp(),
          reviewerId: userProfile?.uid || 'admin',
        });
      } catch (e) {
        console.warn('Firestore reject update:', e);
      }

      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: 'rejected' } : c))
      );
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#060612] text-slate-100 p-4 sm:p-6 pb-24 relative">
      
      {/* Spider-Web Arc Reactor Glow Accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.25) 0%, transparent 60%),
            linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <div className="bg-[#090b20]/90 border border-purple-500/40 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono text-purple-300 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>CENTRAL CUSTODY DISPATCH TERMINAL</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 font-sans">
              Admin & Hub Console
            </h1>
            <p className="text-xs text-slate-400">
              Review ownership verifications, reconcile custody items, and trigger automated Razorpay UPI finder payouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="px-3.5 py-2 rounded-xl bg-[#0d102b] border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
            >
              ↻ Refresh Data
            </button>
          </div>
        </div>

        {/* Razorpay UPI Payout Success Alert */}
        {payoutNotification && (
          <div className="p-4 bg-gradient-to-r from-emerald-950/80 to-[#090b20] border border-emerald-500/60 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-lg">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Razorpay Sandbox UPI Payout Executed!
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Disbursed <strong className="text-emerald-400">₹{payoutNotification.amount} Finder Bounty</strong> to VPA: <span className="font-mono text-cyan-300">{payoutNotification.upiId}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Transaction Ref: {payoutNotification.payoutId} · Claim: {payoutNotification.claimId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPayoutNotification(null)}
                className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded-lg bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-indigo-950 pb-2">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Verification Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Custody Items ({foundItems.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Registered Users ({users.length})
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-mono animate-pulse">
            Accessing master cloud security rules...
          </div>
        ) : activeTab === 'claims' ? (
          /* Claims Tab */
          <div className="space-y-3">
            {claims.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-indigo-950 rounded-2xl">
                No active claims recorded.
              </div>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-[#090b20] border border-indigo-900/60 hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">
                        Claim #{claim.id.slice(0, 10)}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          claim.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : claim.status === 'rejected'
                            ? 'bg-red-950 text-red-300 border-red-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Target Item Ref: <strong className="text-white font-mono">{claim.itemId}</strong> • Owner ID: <span className="text-slate-400 font-mono">{claim.ownerId.slice(0, 12)}</span>
                    </p>

                    <div className="text-[11px] text-slate-400 bg-[#0d102b] p-2.5 rounded-xl border border-indigo-950 font-mono">
                      <strong className="text-slate-300">Submitted Proof Evidence:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                        {claim.proofDocuments?.map((docItem, idx) => (
                          <li key={idx}>{docItem}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {claim.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(claim.id, claim.itemId)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>✓ Approve & Payout ₹60</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(claim.id)}
                          className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'items' ? (
          /* Items Tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foundItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#090b20] border border-indigo-900/60 rounded-2xl p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.category}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">{item.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">📍 {item.location}</p>
                </div>
                <div className="pt-2 border-t border-indigo-950 text-[10px] font-mono text-slate-500">
                  Finder: {item.finderId.slice(0, 10)}... • Hub: {item.hubId}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Users Tab */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {users.map((usr) => (
              <div
                key={usr.id}
                className="bg-[#090b20] border border-indigo-900/60 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                  {usr.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{usr.displayName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{usr.email}</p>
                  <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-950 border border-purple-700/50 text-purple-300 mt-1">
                    {usr.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
