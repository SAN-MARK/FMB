import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { signInWithGoogle, loginAsDemo, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Authentication encountered an error. You can also use Quick Pitch Demo Access below.');
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    try {
      setErrorMessage(null);
      await loginAsDemo(role);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not initialize demo profile.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060612] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Spider-Man Web Geometric Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 60%),
            linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* Decorative Neon Energy Corner Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Comic-Book Arc Reactor Card */}
      <div className="relative z-10 w-full max-w-md bg-[#090b20]/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.25)] flex flex-col items-center">
        
        {/* INNOVARA '26 Pitch Competition Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-cyan-400/40 text-[11px] font-mono uppercase tracking-wider text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>INNOVARA '26 · CHENNAI HYPERLOCAL</span>
        </div>

        {/* Iron Man Arc Reactor Core Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer mechanical reactor ring with notched tick marks */}
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400/70 animate-spin-slow flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <div className="w-20 h-20 rounded-full border border-purple-500/50" />
          </div>

          {/* Inner pulsating Arc Core */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.9)] animate-pulse">
            <div className="w-9 h-9 rounded-full bg-[#060612] border-2 border-cyan-300 flex items-center justify-center">
              {/* Center triangular power prism */}
              <div className="w-3.5 h-3.5 bg-cyan-300 transform rotate-45 shadow-[0_0_10px_#22d3ee]" />
            </div>
          </div>
        </div>

        {/* Brand Title & Tagline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-sans">
          FindBack
        </h1>
        <p className="text-sm font-medium text-cyan-400 mt-1 text-center">
          Return lost items in 24 hours.
        </p>
        <p className="text-xs text-slate-400 text-center mt-2 max-w-xs leading-relaxed">
          Chennai's verified community recovery network powered by Firebase cloud persistence & custody hubs.
        </p>

        {errorMessage && (
          <div className="mt-4 w-full p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Primary CTA: Sign in with Google */}
        <div className="w-full mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all transform active:scale-[0.98] cursor-pointer border border-cyan-400/30"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>{loading ? 'Connecting with Google...' : 'Sign in with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-indigo-900/60" />
            <span className="absolute bg-[#090b20] px-3 text-[11px] font-mono text-slate-500 uppercase">
              OR QUICK PITCH EVALUATION
            </span>
          </div>

          {/* Quick Demo Access Buttons for Pitch Evaluators */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('finder')}
              className="py-2.5 px-2 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-xl text-[11px] font-mono text-indigo-300 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="font-bold">FINDER</span>
              <span className="text-[9px] text-slate-400">Report & Hub</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('owner')}
              className="py-2.5 px-2 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/40 rounded-xl text-[11px] font-mono text-purple-300 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="font-bold">OWNER</span>
              <span className="text-[9px] text-slate-400">Search & Claim</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="py-2.5 px-2 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/40 rounded-xl text-[11px] font-mono text-cyan-300 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="font-bold">ADMIN</span>
              <span className="text-[9px] text-slate-400">Review & Payout</span>
            </button>
          </div>
        </div>

        {/* Security and Trust Footer */}
        <div className="mt-6 pt-4 border-t border-indigo-950 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>🔒 Google Identity + Firestore</span>
          <span>Chennai Ops Grid</span>
        </div>
      </div>
    </div>
  );
};
