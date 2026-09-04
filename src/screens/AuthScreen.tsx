import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { FindBackLogo } from '../components/common/FindBackLogo';
import { formatPhoneNumber, validatePasswordStrength, validateFullName } from '../lib/authHelpers';
import { UserRole } from '../types';
import { 
  IconHandStop, 
  IconSearch, 
  IconEye, 
  IconEyeOff, 
  IconShieldCheck, 
  IconBrandGoogle, 
  IconArrowLeft,
  IconCheck
} from '@tabler/icons-react';

export const AuthScreen: React.FC = () => {
  const { 
    signUpWithPhonePassword, 
    loginWithPhonePassword, 
    requestPasswordReset, 
    loginDemo, 
    loginWithGoogle,
    setRole,
    role,
    isLoading 
  } = useApp();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [selectedRole, setSelectedRole] = useState<'FINDER' | 'OWNER'>(role === 'OWNER' ? 'OWNER' : 'FINDER');
  
  // Sign up form state
  const [name, setName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Inline validation & local error state
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Real-time strength calculation
  const passwordStrength = validatePasswordStrength(signupPassword);
  const signupPhoneInfo = formatPhoneNumber(signupPhone);
  const loginPhoneInfo = formatPhoneNumber(loginPhone);
  const nameValidation = validateFullName(name);

  const handleRoleSelect = (r: 'FINDER' | 'OWNER') => {
    setSelectedRole(r);
    setRole(r);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTouched({ name: true, phone: true, password: true });

    if (!nameValidation.isValid) {
      setFormError(nameValidation.errorMessage || 'Please enter your name.');
      return;
    }
    if (!signupPhoneInfo.isValid) {
      setFormError(signupPhoneInfo.errorMessage || 'Please enter a valid mobile number.');
      return;
    }
    if (!passwordStrength.isValid) {
      setFormError(passwordStrength.errors[0] || 'Password does not meet security requirements.');
      return;
    }
    if (!agreeTerms) {
      setFormError('Please agree to the FindBack Trust & Community terms.');
      return;
    }

    try {
      await signUpWithPhonePassword(name, signupPhone, signupPassword);
    } catch (err: any) {
      setFormError(err.message || 'Sign up failed. Please check your credentials.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTouched({ loginPhone: true, loginPassword: true });

    if (!loginPhoneInfo.isValid) {
      setFormError(loginPhoneInfo.errorMessage || 'Please enter a valid mobile number.');
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      await loginWithPhonePassword(loginPhone, loginPassword);
    } catch (err: any) {
      setFormError(err.message || 'Invalid phone or password. Please try again.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone || forgotPhone.trim().length < 8) {
      return;
    }
    try {
      await requestPasswordReset(forgotPhone);
      setForgotSubmitted(true);
    } catch (err: any) {
      setForgotSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F0E6] bg-kolam-grid text-[#2B1810] flex flex-col items-center justify-start pb-12 selection:bg-[#C8541A] selection:text-white relative">
      
      {/* Top 30% of screen: deep Marina Rust (#7B2D00) curved section (Temple Gopuram Arch shape) */}
      <div className="w-full bg-[#7B2D00] text-white relative pt-10 pb-16 px-6 overflow-hidden flex flex-col items-center text-center shadow-md">
        {/* Subtle decorative temple/kolam geometric motif background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F5C842_1px,transparent_1px)] [background-size:18px_18px]" />

        {/* Logo centered */}
        <div className="relative z-10 flex flex-col items-center">
          <FindBackLogo variant="rust" size="lg" showTamilAccent={false} />
          
          {/* Tamil Subtitle */}
          <span className="font-tiro text-sm md:text-base text-[#E8D5B7] mt-1.5 tracking-wide">
            காண்டு திரும்ப
          </span>
          
          {/* Tagline */}
          <p className="font-inter text-xs md:text-sm text-[#F7F0E6]/90 mt-1 max-w-xs font-normal">
            Chennai's trusted lost & found network
          </p>
        </div>

        {/* Temple Gopuram Arch SVG Curved Divider at the bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-8 md:h-10 text-[#F7F0E6] fill-current"
          >
            {/* Gopuram arched gateway curve */}
            <path d="M0,0 C300,90 450,115 600,115 C750,115 900,90 1200,0 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </div>

      {/* Main Container - restricted to mobile sandbox 480px width */}
      <main className="w-full max-w-[440px] px-5 -mt-3 z-20 flex flex-col gap-5">

        {/* Role selection cards (below the curve, on cream) */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="font-tiro text-sm text-[#7B2D00]">உங்கள் பங்கு (Select Role)</span>
            <span className="font-inter text-[11px] text-[#614436]">Chennai Operations</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Left: "நான் கண்டேன்" (I Found) */}
            <button
              type="button"
              id="role-finder-card"
              onClick={() => handleRoleSelect('FINDER')}
              className={`p-3.5 rounded-2xl transition-all duration-150 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F7F0E6] text-center ambient-shadow-card ${
                selectedRole === 'FINDER'
                  ? 'border-2 border-[#7B2D00] shadow-[0_4px_16px_rgba(123,45,0,0.14)] scale-[1.01]'
                  : 'border border-[#E8D5B7] hover:border-[#7B2D00]/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedRole === 'FINDER' ? 'bg-[#7B2D00] text-white' : 'bg-[#E8D5B7]/60 text-[#7B2D00]'
              }`}>
                <IconHandStop size={22} stroke={2} />
              </div>
              <div>
                <span className="block font-tiro text-base font-semibold text-[#2B1810] leading-tight">
                  நான் கண்டேன்
                </span>
                <span className="block font-inter text-xs text-[#614436] mt-0.5">
                  I Found (Finder)
                </span>
              </div>
            </button>

            {/* Right: "நான் இழந்தேன்" (I Lost) */}
            <button
              type="button"
              id="role-owner-card"
              onClick={() => handleRoleSelect('OWNER')}
              className={`p-3.5 rounded-2xl transition-all duration-150 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F7F0E6] text-center ambient-shadow-card ${
                selectedRole === 'OWNER'
                  ? 'border-2 border-[#7B2D00] shadow-[0_4px_16px_rgba(123,45,0,0.14)] scale-[1.01]'
                  : 'border border-[#E8D5B7] hover:border-[#7B2D00]/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedRole === 'OWNER' ? 'bg-[#1A3A5C] text-white' : 'bg-[#E8D5B7]/60 text-[#1A3A5C]'
              }`}>
                <IconSearch size={22} stroke={2} />
              </div>
              <div>
                <span className="block font-tiro text-base font-semibold text-[#2B1810] leading-tight">
                  நான் இழந்தேன்
                </span>
                <span className="block font-inter text-xs text-[#614436] mt-0.5">
                  I Lost (Owner)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8D5B7] p-5 sm:p-6 ambient-shadow-card flex flex-col gap-4">
          
          {/* Mode Switch Tabs */}
          <div className="flex border-b border-[#E8D5B7] pb-1">
            <button
              type="button"
              onClick={() => { setMode('signup'); setFormError(null); }}
              className={`flex-1 pb-2 text-sm font-jakarta font-semibold text-center relative cursor-pointer ${
                mode === 'signup' ? 'text-[#7B2D00]' : 'text-[#614436] hover:text-[#2B1810]'
              }`}
            >
              <span>கணக்கு உருவாக்கு (Sign Up)</span>
              {mode === 'signup' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#7B2D00] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setFormError(null); }}
              className={`flex-1 pb-2 text-sm font-jakarta font-semibold text-center relative cursor-pointer ${
                mode === 'login' ? 'text-[#7B2D00]' : 'text-[#614436] hover:text-[#2B1810]'
              }`}
            >
              <span>உள்நுழை (Sign In)</span>
              {mode === 'login' && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#7B2D00] rounded-full" />
              )}
            </button>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-[#FEE2E2] border-l-4 border-[#B91C1C] rounded-r-xl text-xs text-[#7F1D1D] font-inter">
              {formError}
            </div>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' ? (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-inter font-medium text-xs text-[#2B1810]">
                  முழு பெயர் (Full Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sanjeev Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, name: true }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] transition-colors"
                />
              </div>

              {/* Mobile Phone Number */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="font-inter font-medium text-xs text-[#2B1810]">
                    கைபேசி எண் (Mobile Number)
                  </label>
                  <span className="font-inter text-[10px] text-[#2E7D6B] font-medium">
                    Permanent Identifier
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, phone: true }))}
                    required
                    className={`w-full px-3.5 py-2.5 bg-[#F7F0E6] border rounded-xl text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] transition-colors ${
                      touched.phone && !signupPhoneInfo.isValid ? 'border-[#B91C1C]' : 'border-[#E8D5B7]'
                    }`}
                  />
                  {signupPhoneInfo.isValid && (
                    <IconCheck size={16} className="absolute right-3 top-3 text-[#2E7D6B]" />
                  )}
                </div>
                <span className="text-[11px] text-[#614436]">
                  {signupPhoneInfo.isValid ? `Standardized E.164: ${signupPhoneInfo.e164}` : 'Tamil Nadu & India 10-digit mobile (+91)'}
                </span>
              </div>

              {/* Password with Strength Meter */}
              <div className="flex flex-col gap-1">
                <label className="font-inter font-medium text-xs text-[#2B1810]">
                  கடவுச்சொல் (Password)
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, password: true }))}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-3 text-[#614436] hover:text-[#2B1810] cursor-pointer"
                  >
                    {showSignupPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {signupPassword.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#614436]">Security:</span>
                      <span className={`font-semibold ${
                        passwordStrength.score >= 3 ? 'text-[#2E7D6B]' : passwordStrength.score >= 2 ? 'text-[#C8541A]' : 'text-[#B91C1C]'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8D5B7]/60 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 h-full rounded-full transition-colors duration-200 ${
                            step <= passwordStrength.score
                              ? step >= 3 ? 'bg-[#2E7D6B]' : step === 2 ? 'bg-[#F5C842]' : 'bg-[#B91C1C]'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#E8D5B7] text-[#C8541A] focus:ring-[#7B2D00]"
                />
                <span className="text-[11px] text-[#614436] leading-tight">
                  FindBack Chennai நெறிமுறைகள் மற்றும் விதிமுறைகளை ஒப்புக்கொள்கிறேன் (Agree to Trust Terms).
                </span>
              </label>

              {/* CTA Button: full width, Kolam Orange fill, white text "தொடரவும் (Continue)", 12px radius */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                தொடரவும் (Continue)
              </Button>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-inter font-medium text-xs text-[#2B1810]">
                  கைபேசி எண் (Mobile Phone)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98400 12345"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, loginPhone: true }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="font-inter font-medium text-xs text-[#2B1810]">
                    கடவுச்சொல் (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] text-[#C8541A] hover:underline cursor-pointer"
                  >
                    மறந்துவிட்டதா? (Forgot?)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810] placeholder-[#8C765C] focus:outline-none focus:border-[#7B2D00] focus:ring-1 focus:ring-[#7B2D00] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-[#614436] hover:text-[#2B1810] cursor-pointer"
                  >
                    {showLoginPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              {/* CTA Button: full width, Kolam Orange fill, white text "தொடரவும் (Continue)" */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                தொடரவும் (Continue)
              </Button>
            </form>
          )}

          {/* Section Divider: thin rust-orange horizontal line (1px, #C8541A, 40% opacity) */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full divider-chennai" />
            <span className="absolute bg-[#FFFFFF] px-2 text-[11px] text-[#8C765C] font-inter">
              அல்லது (OR)
            </span>
          </div>

          {/* Google button: white fill, sand border, Google logo */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full py-2.5 px-4 bg-white border border-[#E8D5B7] rounded-xl text-xs font-jakarta font-semibold text-[#2B1810] hover:bg-[#F7F0E6] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <IconBrandGoogle size={18} className="text-[#C8541A]" />
            <span>Google வழியாக தொடரவும்</span>
          </button>

          {/* Quick Demo Logins for Testing */}
          <div className="pt-2 border-t border-[#E8D5B7]/60 flex flex-col gap-1.5">
            <span className="text-[10px] text-[#614436] text-center font-medium">
              Demo Fast Pass (Instant Login):
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => loginDemo('FINDER')}
                className="flex-1 py-1.5 px-2 bg-[#F7F0E6] border border-[#E8D5B7] rounded-lg text-[11px] text-[#7B2D00] font-semibold hover:bg-[#E8D5B7]/50 transition-colors"
              >
                Finder Demo (கண்டவர்)
              </button>
              <button
                type="button"
                onClick={() => loginDemo('OWNER')}
                className="flex-1 py-1.5 px-2 bg-[#F7F0E6] border border-[#E8D5B7] rounded-lg text-[11px] text-[#1A3A5C] font-semibold hover:bg-[#E8D5B7]/50 transition-colors"
              >
                Owner Demo (உரிமையாளர்)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Tamil link: "புதியவரா? கணக்கு உருவாக்கு" (New here? Create account) in rust colour */}
        <div className="flex justify-center text-center pb-2">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="font-tiro text-sm text-[#7B2D00] hover:underline cursor-pointer"
            >
              புதியவரா? கணக்கு உருவாக்கு (New here? Create account)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="font-tiro text-sm text-[#7B2D00] hover:underline cursor-pointer"
            >
              ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக (Already have an account? Sign In)
            </button>
          )}
        </div>

      </main>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1810]/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E8D5B7] rounded-2xl p-6 w-full max-w-sm ambient-shadow-modal flex flex-col gap-4">
            <h3 className="font-tiro text-lg text-[#7B2D00]">
              கடவுச்சொல் மீட்டெடுப்பு (Password Reset)
            </h3>
            {forgotSubmitted ? (
              <div className="flex flex-col gap-3 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#2E7D6B] mx-auto flex items-center justify-center">
                  <IconCheck size={24} />
                </div>
                <p className="text-xs text-[#2B1810]">
                  If an account exists for this mobile number, reset instructions have been dispatched.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setIsForgotModalOpen(false); setForgotSubmitted(false); }}
                >
                  முடிந்தது (Close)
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-3">
                <p className="text-xs text-[#614436]">
                  Enter your registered mobile number to receive reset instructions.
                </p>
                <input
                  type="tel"
                  placeholder="+91 98400 12345"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F7F0E6] border border-[#E8D5B7] rounded-xl text-sm text-[#2B1810]"
                />
                <div className="flex gap-2 justify-end mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsForgotModalOpen(false)}
                  >
                    ரத்து (Cancel)
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    அனுப்பு (Send)
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
