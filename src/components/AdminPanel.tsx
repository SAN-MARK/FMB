import React, { useState, useEffect } from 'react';
import { useAuth, ADMIN_EMAIL_IDENTIFIER } from '../context/AuthContext';
import { Payout, Hub, AdminAuditLog } from '../types';
import { ChennaiMap } from './ChennaiMap';

export const AdminPanel: React.FC = () => {
  const { 
    userProfile, 
    user, 
    isAdmin, 
    adminSessionToken, 
    requestAdminOtp, 
    verifyAdminOtp, 
    clearAdminSession 
  } = useAuth();

  // Step-up 2FA state
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes in seconds

  // Admin Module Navigation
  const [activeTab, setActiveTab] = useState<'payouts' | 'disputes' | 'hubs_map' | 'audit_log'>('payouts');

  // Payouts & Data
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters for Payouts
  const [hubFilter, setHubFilter] = useState('all');
  const [disputeFilter, setDisputeFilter] = useState<'all' | 'disputed'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Hold / Reject Modal State
  const [modalAction, setModalAction] = useState<{
    payoutId: string;
    action: 'hold' | 'reject';
    reason: string;
  } | null>(null);

  // Dispute resolution inspect state
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [disputeResolutionNote, setDisputeResolutionNote] = useState('');

  // Countdown timer for active OTP code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // Fetch admin data once session token is verified
  useEffect(() => {
    if (adminSessionToken) {
      fetchAdminRecords();
    }
  }, [adminSessionToken]);

  const fetchAdminRecords = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Payouts
      const payoutsRes = await fetch('/api/admin/payouts', {
        headers: { 'x-admin-token': adminSessionToken || '' },
      });
      if (payoutsRes.ok) {
        const pData = await payoutsRes.json();
        setPayouts(pData.payouts || []);
      }

      // 2. Fetch Hubs
      const hubsRes = await fetch('/api/hubs');
      if (hubsRes.ok) {
        const hData = await hubsRes.json();
        setHubs(hData.hubs || []);
      }

      // 3. Fetch Audit Logs
      const logsRes = await fetch('/api/admin/audit-logs', {
        headers: { 'x-admin-token': adminSessionToken || '' },
      });
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setAuditLogs(lData.logs || []);
      }
    } catch (e) {
      console.warn('Error fetching admin records:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Step-up 2FA: Request OTP
  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await requestAdminOtp();
      setOtpSent(true);
      setCountdown(600);
      if (res.simulatedPreviewCode) {
        setSimulatedCode(res.simulatedPreviewCode);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to dispatch OTP. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step-up 2FA: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    try {
      await verifyAdminOtp(otpInput.trim());
      setOtpSent(false);
      setOtpInput('');
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Incorrect or expired code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Approve Payout
  const handleApprovePayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken || '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'approved',
                  razorpay_payout_id: data.razorpay_payout_id,
                  approved_at: new Date().toISOString(),
                }
              : p
          )
        );
        fetchAdminRecords();
      } else {
        alert(data.message || 'Approval failed');
      }
    } catch (err) {
      alert('Network error during payout approval');
    }
  };

  // Hold or Reject Payout with Mandatory Reason
  const handleSubmitHoldOrReject = async () => {
    if (!modalAction) return;
    if (!modalAction.reason.trim()) {
      alert('A mandatory reason is strictly required to hold or reject a payout.');
      return;
    }

    try {
      const endpoint =
        modalAction.action === 'hold'
          ? `/api/admin/payouts/${modalAction.payoutId}/hold`
          : `/api/admin/payouts/${modalAction.payoutId}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken || '',
        },
        body: JSON.stringify({ reason: modalAction.reason }),
      });

      const data = await res.json();
      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === modalAction.payoutId
              ? {
                  ...p,
                  status: modalAction.action === 'hold' ? 'held' : 'rejected',
                  hold_reason: modalAction.reason,
                }
              : p
          )
        );
        setModalAction(null);
        fetchAdminRecords();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      alert('Network error submitting decision');
    }
  };

  // Export Payouts to CSV
  const handleExportCsv = () => {
    if (payouts.length === 0) {
      alert('No payout records to export.');
      return;
    }

    const headers = [
      'Payout ID',
      'Claim ID',
      'Item Description',
      'Finder Name',
      'Finder UPI / Phone',
      'Custody Hub',
      'Recovery Fee (INR)',
      'Finder Reward 30% (INR)',
      'Status',
      'Dispute Flag',
      'Razorpay Reference',
      'Decision Reason',
      'Approved At',
      'Created At',
    ];

    const rows = payouts.map((p) => [
      p.id,
      p.claim_id,
      `"${p.item_description.replace(/"/g, '""')}"`,
      `"${p.finder_name}"`,
      p.finder_upi || p.finder_phone,
      `"${p.hub_name}"`,
      p.total_recovery_fee,
      p.finder_reward_amount,
      p.status,
      p.dispute_flag ? 'YES' : 'NO',
      p.razorpay_payout_id || 'PENDING',
      `"${(p.hold_reason || '').replace(/"/g, '""')}"`,
      p.approved_at || '',
      p.created_at,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FindBack_Payouts_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Resolve Dispute
  const handleResolveDispute = async (payoutId: string, resolution: 'finder' | 'owner') => {
    if (!disputeResolutionNote.trim()) {
      alert('Please enter an administrative resolution note explaining the judgment.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/resolve-dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken || '',
        },
        body: JSON.stringify({
          resolutionWinner: resolution,
          resolutionNote: disputeResolutionNote,
        }),
      });

      if (res.ok) {
        alert(`Dispute resolved in favor of ${resolution.toUpperCase()}. Payout queue updated.`);
        setSelectedDispute(null);
        setDisputeResolutionNote('');
        fetchAdminRecords();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to resolve dispute');
      }
    } catch {
      alert('Network error resolving dispute');
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (hubFilter !== 'all' && p.hub_id !== hubFilter) return false;
    if (disputeFilter === 'disputed' && !p.dispute_flag) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const m =
        p.finder_name.toLowerCase().includes(q) ||
        p.item_description.toLowerCase().includes(q) ||
        p.hub_name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      if (!m) return false;
    }
    return true;
  });

  // STEP-UP 2FA VERIFICATION MODAL / SCREEN (Editorial Monochrome Theme)
  if (!adminSessionToken) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#E8E1D3] border border-[#1B1B1B] p-8 text-center relative">
          
          <div className="w-14 h-14 mx-auto bg-[#1B1B1B] text-[#F1ECE2] flex items-center justify-center text-2xl font-['Archivo_Black'] mb-4">
            §
          </div>

          <span className="font-['Space_Mono'] text-[10px] uppercase tracking-widest text-[#B0492E] font-bold block mb-1">
            [ STEP-UP 2FA PROTOCOL ]
          </span>
          <h2 className="text-2xl font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B]">
            ADMIN CONSOLE CLEARANCE
          </h2>

          <p className="font-body text-xs text-[#4A4A47] mt-3 leading-relaxed italic">
            Financial disbursements and arbitration require one-time cryptographic authentication for privileged operator <span className="font-['Space_Mono'] font-bold text-[#1B1B1B] not-italic">{ADMIN_EMAIL_IDENTIFIER}</span>.
          </p>

          {!otpSent ? (
            <div className="mt-6 space-y-3 font-['Space_Mono']">
              <button
                type="button"
                disabled={otpLoading}
                onClick={handleRequestOtp}
                className="w-full btn-primary py-3"
              >
                {otpLoading ? 'DISPATCHING TOKEN...' : `DISPATCH 6-DIGIT PIN TO ADMIN`}
              </button>
              <div className="text-[10px] text-[#4A4A47] uppercase">
                RATE-LIMITED : 3 ATTEMPTS PER 10 MINUTES
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4 font-['Space_Mono']">
              <div className="bg-[#F1ECE2] p-4 border border-[#1B1B1B] text-left">
                <div className="flex justify-between items-center text-[10px] text-[#4A4A47] mb-2 uppercase">
                  <span>ENTER 6-DIGIT CODE:</span>
                  <span className="text-[#B0492E] font-bold">
                    EXPIRES IN {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#E8E1D3] border border-[#1B1B1B] px-4 py-2 text-center text-2xl font-['Space_Mono'] tracking-widest text-[#1B1B1B] font-bold focus:outline-none"
                />

                {simulatedCode && (
                  <div className="mt-3 p-2 bg-[#E8E1D3] border border-[#1B1B1B] text-[10px] text-[#1B1B1B] flex items-center justify-between">
                    <span className="font-bold">DEV CODE:</span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(simulatedCode)}
                      className="btn-secondary text-[10px] underline"
                    >
                      {simulatedCode} (INSERT)
                    </button>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="text-xs text-[#B0492E] border border-[#B0492E] p-2 font-['Space_Mono'] uppercase">
                  {otpError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                  className="btn-secondary text-xs"
                >
                  RESEND
                </button>
                <button
                  type="submit"
                  disabled={otpLoading || otpInput.length !== 6}
                  className="flex-1 btn-primary py-2.5"
                >
                  {otpLoading ? 'VERIFYING...' : 'UNLOCK CONSOLE'}
                </button>
              </div>
            </form>
          )}

          {otpError && !otpSent && (
            <div className="mt-3 text-xs text-[#B0492E] border border-[#B0492E] p-2 font-['Space_Mono'] uppercase">
              {otpError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN ADMIN CONSOLE (UNLOCKED) — Editorial Monochrome Theme
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Top Header Bar */}
      <div className="border-b border-[#1B1B1B] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-['Space_Mono'] text-xs uppercase tracking-widest text-[#B0492E] font-bold block mb-2">
            [ PRIVILEGED OPERATOR : {ADMIN_EMAIL_IDENTIFIER} ]
          </span>
          <h1 className="text-4xl sm:text-6xl font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B] leading-none">
            ADMIN CONSOLE
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#4A4A47] mt-2 italic">
            30% Statutory recovery disbursements, dispute arbitration, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleExportCsv}
            className="btn-secondary text-xs font-bold"
          >
            [ EXPORT RECONCILIATION CSV ]
          </button>
          <button
            type="button"
            onClick={clearAdminSession}
            className="btn-primary text-xs"
          >
            LOCK SESSION
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Simple underlined text links (no pill buttons) */}
      <div className="flex items-center gap-8 border-b border-[#1B1B1B] pb-3 overflow-x-auto text-xs font-['Space_Mono'] uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`py-1 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'payouts'
              ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
              : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
          }`}
        >
          REWARD PAYOUTS QUEUE ({payouts.filter((p) => p.status === 'pending').length} PENDING)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disputes')}
          className={`py-1 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'disputes'
              ? 'text-[#B0492E] font-bold underline underline-offset-8 decoration-2 decoration-[#B0492E]'
              : 'text-[#4A4A47] hover:text-[#B0492E] hover:underline hover:underline-offset-8'
          }`}
        >
          DISPUTE ARBITRATION ({payouts.filter((p) => p.dispute_flag).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hubs_map')}
          className={`py-1 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'hubs_map'
              ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
              : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
          }`}
        >
          CHENNAI HUBS VOLUME
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit_log')}
          className={`py-1 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'audit_log'
              ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
              : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
          }`}
        >
          IMMUTABLE AUDIT REGISTRY
        </button>
      </div>

      {/* TAB 1: PAYOUTS QUEUE */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-['Space_Mono'] uppercase">
            <input
              type="text"
              placeholder="SEARCH FINDER, ITEM, HUB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F1ECE2] border border-[#1B1B1B] px-3 py-2 text-xs text-[#1B1B1B] placeholder-[#4A4A47] focus:outline-none flex-1 min-w-[200px]"
            />

            <div className="flex items-center gap-2">
              <span className="text-[#4A4A47]">HUB:</span>
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="bg-[#F1ECE2] border border-[#1B1B1B] px-2.5 py-1.5 text-xs text-[#1B1B1B] focus:outline-none cursor-pointer"
              >
                <option value="all">ALL HUBS</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#4A4A47]">STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#F1ECE2] border border-[#1B1B1B] px-2.5 py-1.5 text-xs text-[#1B1B1B] focus:outline-none cursor-pointer"
              >
                <option value="all">ALL</option>
                <option value="pending">PENDING</option>
                <option value="approved">APPROVED</option>
                <option value="held">HELD</option>
                <option value="rejected">REJECTED</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setDisputeFilter(disputeFilter === 'all' ? 'disputed' : 'all')}
              className={`px-3 py-1.5 border border-[#1B1B1B] text-xs cursor-pointer ${
                disputeFilter === 'disputed'
                  ? 'bg-[#1B1B1B] text-[#F1ECE2] font-bold'
                  : 'bg-[#F1ECE2] text-[#1B1B1B]'
              }`}
            >
              {disputeFilter === 'disputed' ? '[ SHOWING DISPUTED ]' : '[ FILTER DISPUTED ]'}
            </button>
          </div>

          {/* Payouts Table — Thin horizontal rules only */}
          <div className="border border-[#1B1B1B] bg-[#F1ECE2]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['Space_Mono']">
                <thead className="bg-[#E8E1D3] border-b border-[#1B1B1B] text-[11px] uppercase tracking-wider text-[#1B1B1B]">
                  <tr>
                    <th className="p-4">ITEM / CLAIM</th>
                    <th className="p-4">FINDER DETAILS</th>
                    <th className="p-4">CUSTODY HUB</th>
                    <th className="p-4">30% REWARD</th>
                    <th className="p-4">STATUS & REF</th>
                    <th className="p-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B1B1B]">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#4A4A47] italic">
                        No disbursements pending in ledger.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => {
                      const isPending = p.status === 'pending';
                      const isApproved = p.status === 'approved';
                      const isHeld = p.status === 'held';
                      const isRejected = p.status === 'rejected';

                      return (
                        <tr key={p.id} className="hover:bg-[#E8E1D3]/60 transition-colors">
                          <td className="p-4">
                            <div className="font-['Archivo_Black'] uppercase text-xs text-[#1B1B1B]">{p.item_description}</div>
                            <div className="text-[10px] text-[#4A4A47] mt-0.5">
                              REF: {p.claim_id}
                            </div>
                            {p.dispute_flag && (
                              <span className="inline-block mt-1 text-[10px] text-[#B0492E] font-bold">
                                [ DISPUTED CLAIM ]
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-[#1B1B1B] uppercase">{p.finder_name}</div>
                            <div className="text-[10px] text-[#4A4A47]">
                              {p.finder_upi || p.finder_phone}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="text-[#1B1B1B] uppercase">{p.hub_name}</div>
                          </td>

                          <td className="p-4">
                            <div className="text-sm font-['Archivo_Black'] text-[#1B1B1B]">
                              ₹{p.finder_reward_amount}
                            </div>
                            <div className="text-[10px] text-[#4A4A47]">
                              (30% OF ₹{p.total_recovery_fee})
                            </div>
                          </td>

                          <td className="p-4">
                            {isApproved && (
                              <div>
                                <span className="font-bold text-[#4B5D3A]">[ APPROVED ]</span>
                                {p.razorpay_payout_id && (
                                  <div className="text-[9px] text-[#4A4A47] mt-0.5">
                                    RZP : {p.razorpay_payout_id}
                                  </div>
                                )}
                              </div>
                            )}

                            {isPending && (
                              <span className="font-bold text-[#A8792B]">[ PENDING RELEASE ]</span>
                            )}

                            {isHeld && (
                              <div>
                                <span className="font-bold text-[#1B1B1B]">[ HELD ON REVIEW ]</span>
                                {p.hold_reason && (
                                  <div className="text-[9px] text-[#4A4A47] mt-0.5 italic max-w-xs">
                                    "{p.hold_reason}"
                                  </div>
                                )}
                              </div>
                            )}

                            {isRejected && (
                              <div>
                                <span className="font-bold text-[#B0492E]">[ REJECTED ]</span>
                                {p.hold_reason && (
                                  <div className="text-[9px] text-[#4A4A47] mt-0.5 italic max-w-xs">
                                    "{p.hold_reason}"
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {isPending && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApprovePayout(p.id)}
                                  className="btn-primary py-1 px-2.5 text-[10px]"
                                >
                                  APPROVE
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModalAction({ payoutId: p.id, action: 'hold', reason: '' })
                                  }
                                  className="btn-secondary text-[10px]"
                                >
                                  HOLD
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModalAction({ payoutId: p.id, action: 'reject', reason: '' })
                                  }
                                  className="btn-secondary text-[10px] text-[#B0492E]"
                                >
                                  REJECT
                                </button>
                              </div>
                            )}

                            {!isPending && (
                              <span className="text-[10px] text-[#4A4A47]">
                                [ FINALIZED ]
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISPUTE QUEUE (Split Panel with thin vertical divider) */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-4 text-xs font-['Space_Mono']">
            <span className="font-bold uppercase block mb-1">DISPUTE ARBITRATION & EVIDENCE INSPECTION</span>
            <p className="font-body text-[#4A4A47] italic">
              Inspect original live camera captured evidence alongside invoice and serial declarations before clearing the 30% statutory finder payout.
            </p>
          </div>

          <div className="space-y-6">
            {payouts
              .filter((p) => p.dispute_flag)
              .map((p) => (
                <div
                  key={p.id}
                  className="border border-[#1B1B1B] bg-[#F1ECE2] p-6 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-[#1B1B1B] pb-3">
                    <div>
                      <span className="font-['Archivo_Black'] uppercase text-base text-[#1B1B1B]">
                        CASE #{p.claim_id} : {p.item_description}
                      </span>
                      <span className="ml-3 font-['Space_Mono'] text-xs font-bold text-[#B0492E]">
                        [ COMPETING CLAIMS ]
                      </span>
                    </div>
                    <div className="font-['Space_Mono'] text-xs font-bold text-[#1B1B1B]">
                      REWARD AT STAKE : ₹{p.finder_reward_amount}
                    </div>
                  </div>

                  {/* Clean Split Panel with thin vertical divider */}
                  <div className="grid grid-cols-1 md:grid-cols-2 border border-[#1B1B1B] divide-y md:divide-y-0 md:divide-x divide-[#1B1B1B] bg-[#E8E1D3]">
                    
                    {/* Panel 1: Finder Live Evidence */}
                    <div className="p-5 space-y-3 font-['Space_Mono'] text-xs">
                      <div className="flex items-center justify-between border-b border-[#1B1B1B] pb-1">
                        <span className="font-bold text-[#1B1B1B]">1. FINDER DEPOSIT (LIVE SHUTTER)</span>
                        <span className="text-[#4A4A47]">{p.finder_name}</span>
                      </div>
                      <div className="h-44 bg-[#1B1B1B] border border-[#1B1B1B] overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
                          alt="Finder Evidence"
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                      <div className="space-y-1 text-[11px] text-[#4A4A47]">
                        <div>LOCATION : {p.hub_name} (Panagal Park drop)</div>
                        <div>EXIF : Hardware device shutter confirmed</div>
                        <div className="font-bold text-[#4B5D3A]">AI SIMILARITY SCORE : 94%</div>
                      </div>
                    </div>

                    {/* Panel 2: Owner Claim Evidence */}
                    <div className="p-5 space-y-3 font-['Space_Mono'] text-xs">
                      <div className="flex items-center justify-between border-b border-[#1B1B1B] pb-1">
                        <span className="font-bold text-[#1B1B1B]">2. OWNER CLAIM EVIDENCE</span>
                        <span className="text-[#4A4A47]">Priya Sundaram</span>
                      </div>
                      <div className="h-44 bg-[#F1ECE2] border border-[#1B1B1B] p-4 text-[#1B1B1B] space-y-2 overflow-y-auto font-body text-xs">
                        <div className="font-bold uppercase font-['Space_Mono'] text-[11px]">DECLARATION & INVOICE :</div>
                        <p>1. Apple Store Phoenix Marketcity Tax Invoice (#INV-8910)</p>
                        <p>2. Hardware Serial/IMEI ending: 4821 (matched lockscreen)</p>
                        <p>3. Identity Verification: [Aadhaar Redacted]</p>
                        <p className="italic text-[#4A4A47] pt-1">
                          "Dropped near Panagal Park shelter while boarding MTC Route 29C."
                        </p>
                      </div>
                      <div className="space-y-1 text-[11px] text-[#4A4A47]">
                        <div>STATUTORY FEE : ₹200 PAID VIA UPI</div>
                        <div className="font-bold text-[#1B1B1B]">CUSTODY OPERATOR : IDENTITY MATCH CONFIRMED</div>
                      </div>
                    </div>

                  </div>

                  {/* Resolution Controls */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-['Space_Mono'] text-xs">
                    <input
                      type="text"
                      placeholder="ADMINISTRATIVE JUDGMENT JUSTIFICATION..."
                      value={selectedDispute === p.id ? disputeResolutionNote : ''}
                      onChange={(e) => {
                        setSelectedDispute(p.id);
                        setDisputeResolutionNote(e.target.value);
                      }}
                      className="flex-1 bg-[#F1ECE2] border border-[#1B1B1B] px-3 py-2 text-xs text-[#1B1B1B] focus:outline-none"
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleResolveDispute(p.id, 'finder')}
                        className="btn-primary py-2 px-4 text-xs"
                      >
                        AWARD FINDER (DISBURSE)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveDispute(p.id, 'owner')}
                        className="btn-secondary text-xs text-[#B0492E] font-bold"
                      >
                        REFUND OWNER (HOLD FINDER)
                      </button>
                    </div>
                  </div>

                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHENNAI HUBS VOLUME MAP */}
      {activeTab === 'hubs_map' && (
        <div className="space-y-6">
          <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-4 text-xs font-['Space_Mono']">
            <span className="font-bold uppercase block mb-1">CHENNAI PARTNER HUBS · METRO VOLUME ARCHIVE</span>
            <p className="font-body text-[#4A4A47] italic">
              Geographic monitoring of transit hubs, pharmacies, and kirana custody checkpoints across the Chennai grid.
            </p>
          </div>

          <div className="border border-[#1B1B1B] overflow-hidden">
            <ChennaiMap
              hubs={hubs}
              mode="admin_volume"
              height="420px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#1B1B1B] divide-y sm:divide-y-0 sm:divide-x divide-[#1B1B1B] bg-[#F1ECE2] font-['Space_Mono'] text-xs">
            <div className="p-4 space-y-1">
              <div className="font-bold text-[#1B1B1B] uppercase">HIGH VOLUME HUBS</div>
              <p className="text-[#4A4A47] text-[11px]">T. Nagar & Central Stations ({'>'}15 drops / wk)</p>
            </div>
            <div className="p-4 space-y-1">
              <div className="font-bold text-[#1B1B1B] uppercase">MODERATE VOLUME HUBS</div>
              <p className="text-[#4A4A47] text-[11px]">Velachery & Adyar Corridors (5-15 drops / wk)</p>
            </div>
            <div className="p-4 space-y-1">
              <div className="font-bold text-[#1B1B1B] uppercase">STANDARD HUBS</div>
              <p className="text-[#4A4A47] text-[11px]">Tambaram & Anna Nagar ({'<'}5 drops / wk)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOG (Typeset print style) */}
      {activeTab === 'audit_log' && (
        <div className="space-y-6">
          <div className="border border-[#1B1B1B] bg-[#E8E1D3] p-4 text-xs font-['Space_Mono']">
            <span className="font-bold uppercase block mb-1">CRYPTOGRAPHIC SECURITY & AUDIT REGISTRY</span>
            <p className="font-body text-[#4A4A47] italic">
              Append-only audit trail logging all route access attempts, step-up OTP authentications, and statutory payouts.
            </p>
          </div>

          <div className="border border-[#1B1B1B] divide-y divide-[#1B1B1B] bg-[#F1ECE2] font-['Space_Mono'] text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-[#4A4A47] italic">No audit records found.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#E8E1D3]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1B1B1B] uppercase">{log.action}</span>
                      <span className="text-[#4A4A47] text-[11px]">[ {log.actor_email} ]</span>
                    </div>
                    <div className="text-[11px] text-[#4A4A47]">
                      {JSON.stringify(log.metadata || {})}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#4A4A47] uppercase whitespace-nowrap self-start sm:self-center">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mandatory Reason Modal for Hold or Reject */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1B1B]/75">
          <div className="bg-[#F1ECE2] border border-[#1B1B1B] w-full max-w-md p-6 space-y-4">
            <h3 className="font-['Archivo_Black'] uppercase text-base text-[#1B1B1B]">
              MANDATORY JUSTIFICATION : {modalAction.action.toUpperCase()}
            </h3>
            <p className="font-body text-xs text-[#4A4A47] leading-relaxed italic">
              Financial reconciliation protocol requires recording the administrative rationale before placing payouts on hold or rejection.
            </p>

            <textarea
              rows={3}
              required
              autoFocus
              placeholder="e.g. Serial number does not match physical item; awaiting secondary inspection."
              value={modalAction.reason}
              onChange={(e) => setModalAction({ ...modalAction, reason: e.target.value })}
              className="w-full bg-[#E8E1D3] border border-[#1B1B1B] p-3 text-xs font-['Space_Mono'] text-[#1B1B1B] focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2 font-['Space_Mono']">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="btn-secondary text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSubmitHoldOrReject}
                className="btn-primary text-xs"
              >
                CONFIRM {modalAction.action.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
