import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { formatPhoneNumber, validatePasswordStrength, validateFullName } from '../lib/authHelpers';
import { UserRole } from '../types';

export const AuthScreen: React.FC = () => {
  const { 
    signUpWithPhonePassword, 
    loginWithPhonePassword, 
    requestPasswordReset, 
    loginDemo, 
    loginWithGoogle,
    isLoading 
  } = useApp();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTouched({ name: true, phone: true, password: true });

    if (!nameValidation.isValid) {
      setFormError(nameValidation.errorMessage || 'Please enter your name.');
      return;
    }
    if (!signupPhoneInfo.isValid) {
      setFormError(signupPhoneInfo.errorMessage || 'Please enter a valid phone number.');
      return;
    }
    if (!passwordStrength.isValid) {
      setFormError(passwordStrength.errors[0] || 'Password does not meet security requirements.');
      return;
    }
    if (!agreeTerms) {
      setFormError('Please agree to the FindBack Trust & Privacy terms.');
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
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!loginPassword) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      await loginWithPhonePassword(loginPhone, loginPassword);
    } catch (err: any) {
      setFormError(err.message || 'Phone number or password is incorrect.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) return;
    try {
      await requestPasswordReset(forgotPhone);
      setForgotSubmitted(true);
    } catch (err: any) {
      // Always treat gently to avoid enumeration
      setForgotSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-between items-center py-6 px-4">
      {/* Mobile-first Max-width Sandbox Frame */}
      <div className="w-full max-w-[480px] mx-auto flex flex-col justify-start flex-grow">
        
        {/* Brand Header */}
        <div className="text-center pt-4 pb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-on-primary mb-3 shadow-md">
            <span className="material-symbols-outlined text-3xl filled text-secondary-fixed">
              verified
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary tracking-tight">
            FindBack
          </h1>
          <p className="text-xs text-on-surface-variant font-label-bold mt-1 tracking-wide uppercase">
            Verified Lost & Found Network
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 ambient-shadow-card mb-6">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface-container-high rounded-xl mb-6">
            <button
              id="tab-btn-signup"
              type="button"
              onClick={() => { setMode('signup'); setFormError(null); }}
              className={`py-2.5 text-xs font-label-bold rounded-lg transition-all text-center ${
                mode === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Create Account
            </button>
            <button
              id="tab-btn-login"
              type="button"
              onClick={() => { setMode('login'); setFormError(null); }}
              className={`py-2.5 text-xs font-label-bold rounded-lg transition-all text-center ${
                mode === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Inline Form Error Notification */}
          {formError && (
            <div className="mb-5 p-3 rounded-xl bg-error-container text-error text-xs font-label-bold flex items-start gap-2 border border-error/20 animate-fade-in">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
              <div className="flex-grow">
                <span>{formError}</span>
                {formError.includes('already registered') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginPhone(signupPhone);
                      setFormError(null);
                    }}
                    className="block mt-1 text-primary underline hover:text-primary-fixed"
                  >
                    Switch to Sign In →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SIGN UP FORM */}
          {/* ======================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="signup-name-input" 
                  className="block font-label-bold text-xs text-on-surface mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    person
                  </span>
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    placeholder="e.g. Sanjeev Kumar"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFormError(null); }}
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                    className={`w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border rounded-xl text-sm font-sans focus:outline-none focus:ring-2 transition-all ${
                      touched.name && !nameValidation.isValid
                        ? 'border-error focus:ring-error/20'
                        : 'border-outline-variant/60 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </div>
                {touched.name && !nameValidation.isValid && (
                  <p className="text-[11px] text-error mt-1">{nameValidation.errorMessage}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label 
                    htmlFor="signup-phone-input" 
                    className="font-label-bold text-xs text-on-surface"
                  >
                    Mobile Phone Number
                  </label>
                  <span className="text-[10px] text-on-surface-variant uppercase font-label-bold">
                    Primary User ID
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    call
                  </span>
                  <input
                    id="signup-phone-input"
                    type="tel"
                    required
                    placeholder="e.g. 98400 12345 or +91 98400 12345"
                    value={signupPhone}
                    onChange={(e) => { setSignupPhone(e.target.value); setFormError(null); }}
                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                    className={`w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border rounded-xl text-sm font-sans focus:outline-none focus:ring-2 transition-all ${
                      touched.phone && !signupPhoneInfo.isValid
                        ? 'border-error focus:ring-error/20'
                        : 'border-outline-variant/60 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </div>
                {signupPhoneInfo.isValid && signupPhone.length >= 8 && (
                  <p className="text-[11px] text-tertiary font-label-bold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check</span>
                    <span>Standardized: {signupPhoneInfo.formattedDisplay}</span>
                  </p>
                )}
                {touched.phone && !signupPhoneInfo.isValid && (
                  <p className="text-[11px] text-error mt-1">{signupPhoneInfo.errorMessage}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="signup-password-input" 
                  className="block font-label-bold text-xs text-on-surface mb-1.5"
                >
                  Create Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    lock
                  </span>
                  <input
                    id="signup-password-input"
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters & numbers"
                    value={signupPassword}
                    onChange={(e) => { setSignupPassword(e.target.value); setFormError(null); }}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-sans focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showSignupPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Strength Meter */}
                {signupPassword.length > 0 && (
                  <div className="mt-2 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-on-surface-variant">Strength:</span>
                      <span className="font-label-bold text-on-surface">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`} />
                    </div>
                    {!passwordStrength.isValid && touched.password && (
                      <p className="text-[11px] text-error">{passwordStrength.errors[0]}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Security lock note */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-[11px] text-on-surface-variant leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">
                  lock_clock
                </span>
                <span>
                  <strong>Locked Identifier:</strong> Your mobile number is permanently bound to this recovery profile.
                </span>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span>I agree to the FindBack Trust & Community Security Guidelines.</span>
              </label>

              {/* Submit Button */}
              <Button
                id="btn-signup-submit"
                variant="primary"
                fullWidth
                size="lg"
                type="submit"
                isLoading={isLoading}
              >
                Create Account & Continue
              </Button>
            </form>
          )}

          {/* ======================================================== */}
          {/* LOG IN FORM */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="login-phone-input" 
                  className="block font-label-bold text-xs text-on-surface mb-1.5"
                >
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    call
                  </span>
                  <input
                    id="login-phone-input"
                    type="tel"
                    required
                    placeholder="e.g. 98400 12345 or +91 98400 12345"
                    value={loginPhone}
                    onChange={(e) => { setLoginPhone(e.target.value); setFormError(null); }}
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-sans focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label 
                    htmlFor="login-password-input" 
                    className="font-label-bold text-xs text-on-surface"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotModalOpen(true); setForgotSubmitted(false); }}
                    className="text-[11px] font-label-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    lock
                  </span>
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setFormError(null); }}
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm font-sans focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showLoginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                id="btn-login-submit"
                variant="primary"
                fullWidth
                size="lg"
                type="submit"
                isLoading={isLoading}
              >
                Sign In to FindBack
              </Button>
            </form>
          )}

          {/* Quick Demo Credentials Accordion */}
          <div className="mt-6 pt-5 border-t border-outline-variant/30">
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-outline-variant/30 w-full" />
              <span className="bg-surface-container-lowest px-3 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">
                Instant Demo Sandbox
              </span>
              <div className="border-t border-outline-variant/30 w-full" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-login-finder"
                onClick={() => loginDemo('FINDER')}
                className="p-2.5 rounded-xl border border-outline-variant/40 hover:border-primary text-xs font-label-bold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all flex flex-col items-center gap-1 text-center"
              >
                <span className="material-symbols-outlined text-secondary text-lg">front_hand</span>
                <span>Finder</span>
                <span className="text-[10px] text-on-surface-variant font-normal">+91 98400...</span>
              </button>

              <button
                type="button"
                id="demo-login-owner"
                onClick={() => loginDemo('OWNER')}
                className="p-2.5 rounded-xl border border-outline-variant/40 hover:border-primary text-xs font-label-bold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all flex flex-col items-center gap-1 text-center"
              >
                <span className="material-symbols-outlined text-primary text-lg">search</span>
                <span>Owner</span>
                <span className="text-[10px] text-on-surface-variant font-normal">Search cases</span>
              </button>

              <button
                type="button"
                id="demo-login-hub-staff"
                onClick={() => loginDemo('HUB_STAFF')}
                className="p-2.5 rounded-xl border border-secondary-container/80 text-xs font-label-bold text-secondary bg-secondary-container/10 hover:bg-secondary-container/20 transition-all flex flex-col items-center gap-1 text-center"
              >
                <span className="material-symbols-outlined text-tertiary-container text-lg">hub</span>
                <span>Hub Staff</span>
                <span className="text-[10px] text-secondary font-normal">Officer David</span>
              </button>
            </div>
          </div>

        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-on-surface-variant text-xs font-label-bold py-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-primary filled">verified</span>
            <span>24h Recovery SLA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-secondary filled">lock</span>
            <span>Zero-Knowledge ID</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ======================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-surface-container-lowest w-full max-w-sm rounded-2xl ambient-shadow-modal border border-outline-variant/40 p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-serif text-lg font-bold text-primary">Reset Password</h3>
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl filled">mark_email_read</span>
                </div>
                <h4 className="font-serif text-base font-bold text-on-surface">Instructions Dispatched</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  If an account exists for this phone number, reset instructions have been dispatched via SMS/Email.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Enter your registered phone number. We will send you instructions to securely reset your password.
                </p>

                <div>
                  <label htmlFor="forgot-phone-input" className="block font-label-bold text-xs text-on-surface mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    id="forgot-phone-input"
                    type="tel"
                    required
                    placeholder="+91 98400 12345"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsForgotModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Send Reset Link
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
