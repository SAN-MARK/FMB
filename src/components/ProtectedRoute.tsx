import React from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Login } from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { user, userProfile, loading } = useAuth();

  // Show Marvel Arc Reactor spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060612] flex flex-col items-center justify-center text-slate-100 selection:bg-indigo-500">
        <div className="relative flex items-center justify-center">
          {/* Outer rotating energy ring */}
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-400 animate-spin opacity-80" />
          {/* Secondary purple pulse */}
          <div className="absolute w-14 h-14 rounded-full border-2 border-purple-500 animate-ping opacity-30" />
          {/* Inner Arc Reactor Core */}
          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.8)] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#060612] border border-cyan-200" />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p className="font-mono text-sm tracking-widest text-cyan-400 uppercase font-semibold">
            SYNCHRONIZING RECOVERY CORE
          </p>
          <span className="text-xs text-slate-500">
            Checking Firebase Authentication & Chennai Node Keys...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated
  const isAuthenticated = !!user || !!userProfile;
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <Login />;
  }

  // Role check if specific role is mandated (e.g., admin)
  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d102b] border border-red-500/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Restricted Access Clearance</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            This terminal requires <span className="font-mono uppercase text-red-400 font-bold">{requiredRole}</span> privileges. Your current clearance is <span className="font-mono uppercase text-cyan-400 font-bold">{userProfile?.role || 'finder'}</span>.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              Return to Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
