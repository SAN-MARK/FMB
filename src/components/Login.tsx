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
      setErrorMessage(err?.message || 'Authentication encountered an error. You can also use pitch evaluation access below.');
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
    <div className="min-h-screen bg-[#F1ECE2] text-[#1B1B1B] flex flex-col justify-center items-center px-4 py-12 relative">
      
      {/* Editorial Monochrome Container */}
      <div className="w-full max-w-lg bg-[#E8E1D3] border border-[#1B1B1B] p-8 sm:p-10 space-y-8">
        
        {/* Pitch Edition Header */}
        <div className="text-center space-y-2 border-b border-[#1B1B1B] pb-6">
          <div className="w-14 h-14 mx-auto bg-[#1B1B1B] text-[#F1ECE2] flex items-center justify-center text-xl font-['Archivo_Black']">
            FB
          </div>

          <span className="font-['Space_Mono'] text-[10px] uppercase tracking-widest text-[#B0492E] font-bold block pt-2">
            [ INNOVARA '26 · CHENNAI HYPERLOCAL RECOVERY LEDGER ]
          </span>

          <h1 className="text-4xl sm:text-5xl font-['Archivo_Black'] uppercase tracking-tight text-[#1B1B1B] leading-none">
            FINDBACK
          </h1>

          <p className="font-body text-xs sm:text-sm text-[#4A4A47] italic max-w-sm mx-auto">
            Hyperlocal peer-to-peer lost & found custody network for Chennai metro. 24-hour return cycles with physical partner hubs.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#F1ECE2] border border-[#B0492E] text-[#B0492E] text-xs font-['Space_Mono'] uppercase leading-relaxed text-center">
            {errorMessage}
          </div>
        )}

        {/* Primary CTA: Google Authentication */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full btn-primary py-3.5 px-4 text-xs font-['Space_Mono'] flex items-center justify-center gap-3"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="currentColor"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="currentColor"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
              />
              <path
                fill="currentColor"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>{loading ? 'AUTHENTICATING WITH GOOGLE...' : 'SIGN IN WITH GOOGLE (OAUTH 2.0)'}</span>
          </button>

          {/* Thin Rule Separator */}
          <div className="relative flex items-center justify-center py-2">
            <div className="w-full border-t border-[#1B1B1B]" />
            <span className="absolute bg-[#E8E1D3] px-3 font-['Space_Mono'] text-[10px] text-[#4A4A47] uppercase">
              OR PITCH EVALUATION ACCESS
            </span>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-['Space_Mono'] text-xs">
            <button
              type="button"
              onClick={() => handleDemoSignIn('user')}
              className="p-3 border border-[#1B1B1B] bg-[#F1ECE2] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] transition-colors cursor-pointer text-left space-y-0.5"
            >
              <div className="font-bold uppercase">[ CITIZEN PROFILE ]</div>
              <div className="text-[10px] text-[#4A4A47] hover:text-[#E8E1D3]">
                Finder & Owner Dashboard
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="p-3 border border-[#1B1B1B] bg-[#F1ECE2] hover:bg-[#1B1B1B] hover:text-[#F1ECE2] transition-colors cursor-pointer text-left space-y-0.5"
            >
              <div className="font-bold uppercase text-[#B0492E]">[ SUPER ADMIN ]</div>
              <div className="text-[10px] text-[#4A4A47] hover:text-[#E8E1D3]">
                iamheresanjeev@gmail.com
              </div>
            </button>
          </div>
        </div>

        {/* Security and Trust Footer */}
        <div className="pt-4 border-t border-[#1B1B1B] flex items-center justify-between text-[10px] font-['Space_Mono'] text-[#4A4A47] uppercase">
          <span>● GOOGLE IDENTITY + FIRESTORE</span>
          <span>CHENNAI OPS GRID</span>
        </div>
      </div>
    </div>
  );
};
