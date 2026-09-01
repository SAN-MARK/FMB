import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from './Button';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, user, loginWithGoogle, loginDemo, logout, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'roles'>('signin');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleCustomLogin = (role: UserRole) => {
    if (!customName.trim() && !customEmail.trim()) {
      loginDemo(role);
      return;
    }
    const name = customName.trim() || 'Community Member';
    const email = customEmail.trim() || 'member@findback.org';
    loginDemo(role);
  };

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
              {user ? 'Account & Roles' : 'Sign in to FindBack'}
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
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-bold text-lg flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <h3 className="font-label-bold text-sm text-on-surface">{user.name}</h3>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-label-bold bg-primary/10 text-primary">
                    Role: {user.role_default || 'FINDER'}
                  </span>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <p className="font-label-bold text-xs text-on-surface-variant mb-2">Switch Active Persona:</p>
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

              <Button variant="secondary" fullWidth onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant text-center">
                Secure access for finding, tracking, and claiming lost items with verified 24hr recovery.
              </p>

              {/* Google OAuth Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                onClick={loginWithGoogle}
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                }
              >
                Continue with Google
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
