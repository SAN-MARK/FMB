import React, { useState, useEffect, useRef } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { getSimulatedNotificationLogs, DispatchedNotificationRecord } from '../lib/notifications';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, userProfile, signOut, updateRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<DispatchedNotificationRecord[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load simulated email notification records
  useEffect(() => {
    setNotifications(getSimulatedNotificationLogs());
    const handleDispatched = () => {
      setNotifications(getSimulatedNotificationLogs());
    };
    window.addEventListener('findback:email-dispatched', handleDispatched);
    return () => window.removeEventListener('findback:email-dispatched', handleDispatched);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = userProfile?.role || 'finder';
  const isAdmin = role === 'admin';
  const displayName = userProfile?.displayName || user?.displayName || 'Citizen';
  const email = userProfile?.email || user?.email || '';
  const photoURL = userProfile?.photoURL || user?.photoURL || '';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#060612]/90 backdrop-blur-md border-b border-indigo-500/20 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo with Arc Reactor Glow */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.9)] transition-all">
              <div className="w-4 h-4 rounded-full bg-[#060612] border border-cyan-300 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-300 transform rotate-45" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white flex items-center gap-1 font-sans">
                FINDBACK
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-400/40 px-1.5 py-0.2 rounded">
                  CHN
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0c0f24] border border-indigo-900/50 p-1 rounded-full text-xs font-medium">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('report-item')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                currentTab === 'report-item'
                  ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Report Item
            </button>
            <button
              onClick={() => onNavigate('search')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                currentTab === 'search'
                  ? 'bg-indigo-600 text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Search & Claim
            </button>

            {/* Admin Panel Link: Only visible if role === "admin" */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Simulated Email Notifications Trigger */}
            <button
              type="button"
              onClick={() => setNotifModalOpen(true)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all cursor-pointer"
              title="Simulated Owner Email Alerts"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[#060612] text-[10px] font-bold flex items-center justify-center font-mono">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Authenticated User / Sign In Button */}
            {user || userProfile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#0d102b] border border-indigo-500/40 hover:border-cyan-400/60 transition-all cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                >
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    role === 'admin' 
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50' 
                      : role === 'owner'
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50'
                      : 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50'
                  }`}>
                    {role}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090b20] border border-indigo-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-indigo-900/40">
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{email}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">
                          Role: {role}
                        </span>
                        {/* Instant Role Switcher for Pitch Evaluator Demo */}
                        <div className="flex gap-1 text-[9px] font-mono">
                          <button
                            type="button"
                            onClick={() => updateRole('finder')}
                            className={`px-1.5 py-0.5 rounded ${role === 'finder' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                          >
                            Find
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRole('owner')}
                            className={`px-1.5 py-0.5 rounded ${role === 'owner' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                          >
                            Own
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRole('admin')}
                            className={`px-1.5 py-0.5 rounded ${role === 'admin' ? 'bg-purple-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-indigo-950/60 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                      >
                        <span>📊</span>
                        <span>Profile & Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-indigo-950/60 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                      >
                        <span>📦</span>
                        <span>My Claims & Reports</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-purple-950/60 text-purple-300 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <span>⚡</span>
                          <span>Admin Console (Payouts)</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-indigo-900/40">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                          onNavigate('login');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-full text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around pt-2 mt-2 border-t border-indigo-950/80 text-[11px] font-mono">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`py-1 px-2 rounded ${currentTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('report-item')}
            className={`py-1 px-2 rounded ${currentTab === 'report-item' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Report
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`py-1 px-2 rounded ${currentTab === 'search' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Search
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`py-1 px-2 rounded ${currentTab === 'admin' ? 'text-purple-400 font-bold' : 'text-purple-400/70'}`}
            >
              Admin
            </button>
          )}
        </div>
      </header>

      {/* Simulated Email Notification Viewer Modal */}
      {notifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090b20] border border-cyan-500/40 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="p-4 border-b border-indigo-900/50 flex items-center justify-between bg-[#0c0f24]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Owner Email Dispatch Simulation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNotifModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-400 leading-relaxed">
                When a lost item is reported at a custody hub, FindBack automatically generates and dispatches an encrypted email notification to the registered owner with custody location and claim codes.
              </p>

              {notifications.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-indigo-900/60 rounded-2xl">
                  <p className="text-xs text-slate-400">No emails dispatched yet.</p>
                  <p className="text-[11px] text-cyan-400 mt-1">
                    Try reporting an item in the Finder Flow to trigger an owner email notification!
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-[#111538] border border-indigo-500/30 rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 font-semibold">To: {notif.recipientEmail}</span>
                      <span className="text-slate-500">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{notif.subject}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="bg-indigo-950 border border-indigo-700/50 px-2 py-0.5 rounded text-indigo-300">
                        {notif.itemCategory}
                      </span>
                      <span>Hub: {notif.hubName}</span>
                      <span className="text-cyan-300">Code: {notif.claimCode}</span>
                    </div>

                    <div className="pt-2 border-t border-indigo-950/80">
                      <details className="text-xs">
                        <summary className="text-[11px] text-cyan-400 cursor-pointer font-mono hover:underline">
                          View Rendered Email Preview
                        </summary>
                        <div 
                          className="mt-2 p-3 bg-[#060612] rounded-xl border border-slate-800 text-[11px] max-h-60 overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: notif.previewHtml }}
                        />
                      </details>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-indigo-900/50 bg-[#0c0f24] flex justify-end">
              <button
                type="button"
                onClick={() => setNotifModalOpen(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
