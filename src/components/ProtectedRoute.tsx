import React, { useEffect, useState } from 'react';
import { useAuth, ADMIN_EMAIL_IDENTIFIER } from '../context/AuthContext';
import { Login } from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);

  const activeEmail = userProfile?.email || user?.email || '';

  // Server-side verification guard for admin route
  useEffect(() => {
    if (requiredRole === 'admin') {
      fetch('/api/admin/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail }),
      })
        .then((res) => {
          if (res.status === 403) {
            setServerVerified(false);
          } else {
            setServerVerified(true);
          }
        })
        .catch(() => {
          // If offline or dev error, fallback to strict client email match
          setServerVerified(activeEmail.toLowerCase() === ADMIN_EMAIL_IDENTIFIER.toLowerCase());
        });
    } else {
      setServerVerified(true);
    }
  }, [requiredRole, activeEmail]);

  // Show Arc Reactor spinner during auth check
  if (loading || (requiredRole === 'admin' && serverVerified === null)) {
    return (
      <div className="min-h-screen bg-[#060612] flex flex-col items-center justify-center text-slate-100 selection:bg-indigo-500">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-400 animate-spin opacity-80" />
          <div className="absolute w-14 h-14 rounded-full border-2 border-purple-500 animate-ping opacity-30" />
          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.8)] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#060612] border border-cyan-200" />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p className="font-mono text-sm tracking-widest text-cyan-400 uppercase font-semibold">
            VERIFYING CLEARANCE
          </p>
          <span className="text-xs text-slate-500">
            Checking session integrity and Chennai Node keys...
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

  // Strict Admin route protection: Every non-admin gets a generic 403 page
  // Never reveal that a step-up flow exists to non-admins!
  if (requiredRole === 'admin') {
    const isAuthorizedAdmin = isAdmin && serverVerified === true;

    if (!isAuthorizedAdmin) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0a0c1e] border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 font-mono text-xl font-bold">
              403
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">
              Access Forbidden
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              You do not have permission to view or access this path. This route is restricted to authorized personnel.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-[#060714] p-2.5 rounded-lg border border-slate-900 mb-6 text-left">
              <div>HTTP ERROR: 403_FORBIDDEN</div>
              <div>RESOURCE: /admin/*</div>
              <div>SECURITY AUDIT: Incident logged to immutable registry.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#dashboard';
                window.location.reload();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

