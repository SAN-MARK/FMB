import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSimulatedNotificationLogs, DispatchedNotificationRecord } from '../lib/notifications';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
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

  const displayName = userProfile?.displayName || user?.displayName || 'Citizen';
  const email = userProfile?.email || user?.email || '';
  const photoURL = userProfile?.photoURL || user?.photoURL || '';
  const initialChar = displayName.trim().charAt(0).toUpperCase() || 'F';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F1ECE2] border-b border-[#1B1B1B] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo / Wordmark (Bold condensed architectural print branding) */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-7 h-7 bg-[#1B1B1B] text-[#F1ECE2] flex items-center justify-center font-['Archivo_Black'] text-sm tracking-tighter">
              F
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Archivo_Black'] text-xl sm:text-2xl tracking-tighter text-[#1B1B1B] uppercase">
                FINDBACK
              </span>
              <span className="font-['Space_Mono'] text-[10px] uppercase tracking-widest text-[#4A4A47]">
                [ CHENNAI ]
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links — uppercase + letter-spaced, underline on active/hover, no pills */}
          <nav className="hidden md:flex items-center gap-6 font-['Space_Mono'] text-xs uppercase tracking-wider">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`py-1 cursor-pointer transition-colors ${
                currentTab === 'dashboard'
                  ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
                  : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
              }`}
            >
              PROFILE & FEED
            </button>
            <button
              onClick={() => onNavigate('claims_reports')}
              className={`py-1 cursor-pointer transition-colors ${
                currentTab === 'claims_reports'
                  ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
                  : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
              }`}
            >
              MY CLAIMS & REPORTS
            </button>
            <button
              onClick={() => onNavigate('report-item')}
              className={`py-1 cursor-pointer transition-colors ${
                currentTab === 'report-item'
                  ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
                  : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
              }`}
            >
              REPORT LOST
            </button>
            <button
              onClick={() => onNavigate('search')}
              className={`py-1 cursor-pointer transition-colors ${
                currentTab === 'search'
                  ? 'text-[#1B1B1B] font-bold underline underline-offset-8 decoration-2 decoration-[#1B1B1B]'
                  : 'text-[#4A4A47] hover:text-[#1B1B1B] hover:underline hover:underline-offset-8'
              }`}
            >
              SEARCH & CLAIM
            </button>

            {/* Admin Console Link: Only visible to privileged hardcoded admin email */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`py-1 cursor-pointer transition-colors flex items-center gap-1.5 font-bold ${
                  currentTab === 'admin'
                    ? 'text-[#B0492E] underline underline-offset-8 decoration-2 decoration-[#B0492E]'
                    : 'text-[#B0492E] hover:underline hover:underline-offset-8'
                }`}
              >
                <span>[ ADMIN CONSOLE ]</span>
              </button>
            )}
          </nav>

          {/* Right Action: Notifications & User Session */}
          <div className="flex items-center gap-3">
            
            {/* Simulated Email Notifications Trigger */}
            <button
              type="button"
              onClick={() => setNotifModalOpen(true)}
              className="p-1.5 border border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-['Space_Mono'] uppercase"
              title="Dispatched Custody Notifications Log"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">NOTIFS</span>
              {notifications.length > 0 && (
                <span className="font-bold text-[#B0492E]">({notifications.length})</span>
              )}
            </button>

            {/* User Session Dropdown */}
            {user || userProfile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 border border-[#1B1B1B] hover:bg-[#E8E1D3] transition-colors cursor-pointer"
                >
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className="w-6 h-6 object-cover border border-[#1B1B1B]"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-[#1B1B1B] text-[#F1ECE2] font-['Space_Mono'] font-bold text-xs flex items-center justify-center">
                      {initialChar}
                    </div>
                  )}
                  <span className="text-xs font-['Space_Mono'] font-bold text-[#1B1B1B] hidden sm:inline max-w-[120px] truncate uppercase">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-['Space_Mono'] uppercase text-[#4A4A47] hidden sm:inline">
                    {isAdmin ? '( ADMIN )' : '( CITIZEN )'}
                  </span>
                </button>

                {/* Dropdown Menu — Sharp architectural panel with thin border */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-[#E8E1D3] border border-[#1B1B1B] py-2 text-[#1B1B1B] z-50">
                    <div className="px-4 py-2 border-b border-[#1B1B1B]">
                      <p className="text-xs font-['Archivo_Black'] uppercase truncate">{displayName}</p>
                      <p className="text-[11px] text-[#4A4A47] truncate font-['Space_Mono']">{email}</p>
                      <div className="mt-1">
                        <span className="text-[10px] font-['Space_Mono'] uppercase font-bold text-[#1B1B1B]">
                          ROLE : {isAdmin ? 'SUPER ADMIN' : 'CITIZEN'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 text-xs font-['Space_Mono'] uppercase">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F1ECE2] text-[#1B1B1B] flex items-center gap-2 cursor-pointer"
                      >
                        <span>→</span>
                        <span>PROFILE & FEED</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onNavigate('claims_reports');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F1ECE2] text-[#1B1B1B] flex items-center gap-2 cursor-pointer"
                      >
                        <span>→</span>
                        <span>MY CLAIMS & REPORTS</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-[#F1ECE2] text-[#B0492E] flex items-center gap-2 cursor-pointer font-bold"
                        >
                          <span>→</span>
                          <span>ADMIN CONSOLE</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#1B1B1B]">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                          onNavigate('login');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-['Space_Mono'] text-[#B0492E] hover:bg-[#F1ECE2] flex items-center gap-2 cursor-pointer uppercase font-bold"
                      >
                        <span>✕</span>
                        <span>SIGN OUT</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="btn-primary"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Strip — Thin horizontal divider */}
        <div className="md:hidden flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#1B1B1B] text-[11px] font-['Space_Mono'] uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`py-1 px-1.5 whitespace-nowrap ${currentTab === 'dashboard' ? 'font-bold underline underline-offset-4 text-[#1B1B1B]' : 'text-[#4A4A47]'}`}
          >
            FEED
          </button>
          <button
            onClick={() => onNavigate('claims_reports')}
            className={`py-1 px-1.5 whitespace-nowrap ${currentTab === 'claims_reports' ? 'font-bold underline underline-offset-4 text-[#1B1B1B]' : 'text-[#4A4A47]'}`}
          >
            CLAIMS
          </button>
          <button
            onClick={() => onNavigate('report-item')}
            className={`py-1 px-1.5 whitespace-nowrap ${currentTab === 'report-item' ? 'font-bold underline underline-offset-4 text-[#1B1B1B]' : 'text-[#4A4A47]'}`}
          >
            REPORT
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`py-1 px-1.5 whitespace-nowrap ${currentTab === 'search' ? 'font-bold underline underline-offset-4 text-[#1B1B1B]' : 'text-[#4A4A47]'}`}
          >
            SEARCH
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`py-1 px-1.5 whitespace-nowrap font-bold ${currentTab === 'admin' ? 'text-[#B0492E] underline underline-offset-4' : 'text-[#B0492E]'}`}
            >
              ADMIN
            </button>
          )}
        </div>
      </header>

      {/* Simulated Email Notification Viewer Modal (Monochrome Vintage Spec) */}
      {notifModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B1B1B]/60 flex items-center justify-center p-4">
          <div className="bg-[#F1ECE2] border border-[#1B1B1B] max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#1B1B1B] flex items-center justify-between bg-[#E8E1D3]">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Mono'] font-bold text-xs uppercase tracking-wider text-[#1B1B1B]">
                  [ DISPATCHED NOTIFICATION ARCHIVE ]
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotifModalOpen(false)}
                className="font-['Space_Mono'] text-xs font-bold px-2 py-1 border border-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs font-body text-[#4A4A47] leading-relaxed">
                Whenever items are registered or custody handoffs occur at Chennai partner hubs, FindBack records and dispatches cryptographic notifications to the verified owner.
              </p>

              {notifications.length === 0 ? (
                <div className="p-8 text-center border border-[#1B1B1B] bg-[#E8E1D3]">
                  <p className="font-['Space_Mono'] text-xs text-[#1B1B1B] uppercase">NO NOTIFICATIONS LOGGED YET</p>
                  <p className="text-xs font-body text-[#4A4A47] mt-1">
                    Report a found item or process a claim to generate custody dispatches.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="border border-[#1B1B1B] bg-[#E8E1D3] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-['Space_Mono']">
                      <span className="font-bold text-[#1B1B1B]">TO : {notif.recipientEmail}</span>
                      <span className="text-[#4A4A47]">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm font-['Archivo_Black'] uppercase text-[#1B1B1B]">{notif.subject}</div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#1B1B1B] font-['Space_Mono'] uppercase">
                      <span>CATEGORY : [{notif.itemCategory}]</span>
                      <span>HUB : {notif.hubName}</span>
                      <span className="font-bold">CODE : {notif.claimCode}</span>
                    </div>

                    <div className="pt-2 border-t border-[#1B1B1B]">
                      <details className="text-xs">
                        <summary className="text-[11px] text-[#B0492E] cursor-pointer font-['Space_Mono'] hover:underline uppercase font-bold">
                          [ VIEW DISPATCH PREVIEW ]
                        </summary>
                        <div 
                          className="mt-2 p-3 bg-[#F1ECE2] border border-[#1B1B1B] text-[11px] font-body max-h-60 overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: notif.previewHtml }}
                        />
                      </details>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[#1B1B1B] bg-[#E8E1D3] flex justify-end">
              <button
                type="button"
                onClick={() => setNotifModalOpen(false)}
                className="btn-primary"
              >
                DISMISS LOG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
