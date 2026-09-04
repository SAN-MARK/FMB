import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from './Button';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, user, loginDemo, logout, navigateTo } = useApp();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-surface-container-lowest w-full max-w-md rounded-2xl ambient-shadow-modal border border-outline-variant/40 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg filled">verified</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-primary">
              {user ? 'Profile & Session' : 'FindBack Authentication'}
            </h2>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-label-bold text-sm text-on-surface truncate">{user.name}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-secondary">call</span>
                    <span>{user.phone || user.email}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-label-bold bg-primary/10 text-primary">
                      Role: {user.role_default || 'FINDER'}
                    </span>
                    <span className="text-[10px] text-tertiary font-label-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px] filled">check_circle</span>
                      <span>Verified Session</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Locked Phone Notice */}
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-[11px] text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">
                  lock
                </span>
                <span>
                  <strong>User ID Locked:</strong> Phone number cannot be changed from within the application. Password can only be reset via secure reset dispatch.
                </span>
              </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <p className="font-label-bold text-xs text-on-surface-variant mb-2">Switch Active Persona (Demo):</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => loginDemo('FINDER')}
                    className="p-2.5 rounded-lg border border-outline-variant/50 hover:border-primary text-xs font-label-bold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all text-center"
                  >
                    Finder
                  </button>
                  <button
                    onClick={() => loginDemo('OWNER')}
                    className="p-2.5 rounded-lg border border-outline-variant/50 hover:border-primary text-xs font-label-bold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all text-center"
                  >
                    Owner
                  </button>
                  <button
                    onClick={() => loginDemo('HUB_STAFF')}
                    className="p-2.5 rounded-lg border border-secondary-container/80 text-xs font-label-bold text-secondary bg-secondary-container/10 hover:bg-secondary-container/20 transition-all text-center"
                  >
                    Hub Staff
                  </button>
                </div>
              </div>

              <Button 
                variant="secondary" 
                fullWidth 
                onClick={async () => {
                  await logout();
                  closeAuthModal();
                }}
              >
                Sign Out of FindBack
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant text-center leading-relaxed">
                Sign in with your registered phone number and password to access the FindBack network.
              </p>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => {
                  closeAuthModal();
                  navigateTo('auth');
                }}
              >
                Go to Sign In / Sign Up Screen
              </Button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-outline-variant/30 w-full" />
                <span className="bg-surface-container-lowest px-3 text-xs text-on-surface-variant font-label-bold uppercase">
                  Quick Demo Access
                </span>
                <div className="border-t border-outline-variant/30 w-full" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => loginDemo('FINDER')}
                  className="p-3 rounded-xl border border-outline-variant/40 hover:border-primary text-xs font-label-bold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-secondary text-xl">front_hand</span>
                  <span>Finder</span>
                </button>
                <button
                  onClick={() => loginDemo('OWNER')}
                  className="p-3 rounded-xl border border-outline-variant/40 hover:border-primary text-xs font-label-bold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-primary text-xl">search</span>
                  <span>Owner</span>
                </button>
                <button
                  onClick={() => loginDemo('HUB_STAFF')}
                  className="p-3 rounded-xl border border-secondary-container/80 text-xs font-label-bold text-secondary bg-secondary-container/10 hover:bg-secondary-container/20 transition-all flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-tertiary-container text-xl">hub</span>
                  <span>Hub Staff</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

