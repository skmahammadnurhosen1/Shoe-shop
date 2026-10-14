import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onBackToStore: () => void;
  onAuthSuccess: (userName: string, isNewAccount: boolean) => void;
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToStore,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Register
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Validation & Submission states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick switch tab
  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrors({});
    setGeneralError(null);
  };

  // Login Validation
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!loginEmail.trim()) {
      newErrors.loginEmail = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      newErrors.loginEmail = 'Please enter a valid email address.';
    }

    if (!loginPassword) {
      newErrors.loginPassword = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register Validation
  const validateRegister = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!registerName.trim()) {
      newErrors.registerName = 'Please enter your full name.';
    } else if (registerName.trim().length < 2) {
      newErrors.registerName = 'Name must be at least 2 characters.';
    }

    if (!registerEmail.trim()) {
      newErrors.registerEmail = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.trim())) {
      newErrors.registerEmail = 'Please enter a valid email address.';
    }

    if (!registerPassword) {
      newErrors.registerPassword = 'Please enter a password.';
    } else if (registerPassword.length < 8) {
      newErrors.registerPassword = 'Password must be at least 8 characters long.';
    } else if (!/[A-Za-z]/.test(registerPassword) || !/[0-9]/.test(registerPassword)) {
      newErrors.registerPassword = 'Password must contain at least one letter and one number.';
    }

    if (!registerConfirmPassword) {
      newErrors.registerConfirmPassword = 'Please confirm your password.';
    } else if (registerPassword !== registerConfirmPassword) {
      newErrors.registerConfirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateLogin() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        onAuthSuccess(loginEmail.split('@')[0], false);
      } else {
        setGeneralError(result.error || 'Invalid email address or password. Please try again.');
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateRegister() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await register(
        registerName,
        registerEmail,
        registerPassword,
        registerConfirmPassword
      );

      if (result.success) {
        onAuthSuccess(registerName.trim(), true);
      } else {
        setGeneralError(result.error || 'Could not create account. Please check your details.');
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F1E8] flex flex-col justify-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        
        {/* Navigation & Back to Store */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.16em] text-[#5E5A50] hover:text-[#171715] transition-colors py-2 px-1 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Store</span>
          </button>

          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#7A7569]">
            SOLEFORM ACCOUNT
          </div>
        </div>

        {/* Main Split Grid Card */}
        <div className="bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left / Primary Form Area */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            
            {/* Header / Brand identity */}
            <div className="mb-8">
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#626849] block mb-2">
                AUTHENTICATION
              </span>
              <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-[0.08em] text-[#171715]">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="text-sm text-[#5E5A50] mt-2 font-normal">
                {mode === 'login'
                  ? 'Access your saved orders, curated wishlist, and member benefits.'
                  : 'Join SOLEFORM for streamlined checkout and tailored footwear updates.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[#E8E2D5] mb-8" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 pb-3 text-center text-xs font-bold tracking-[0.18em] uppercase transition-all cursor-pointer relative ${
                  mode === 'login'
                    ? 'text-[#171715]'
                    : 'text-[#8C8679] hover:text-[#171715]'
                }`}
              >
                LOG IN
                {mode === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171715]" />
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => handleSwitchMode('register')}
                className={`flex-1 pb-3 text-center text-xs font-bold tracking-[0.18em] uppercase transition-all cursor-pointer relative ${
                  mode === 'register'
                    ? 'text-[#171715]'
                    : 'text-[#8C8679] hover:text-[#171715]'
                }`}
              >
                REGISTER
                {mode === 'register' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171715]" />
                )}
              </button>
            </div>

            {/* General Error Banner */}
            {generalError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-[#C94A38] text-xs flex items-start gap-3 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{generalError}</span>
              </div>
            )}

            {/* -------------------- LOGIN FORM -------------------- */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-5">
                {/* Field 1: Email Address */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (errors.loginEmail) {
                        setErrors((prev) => ({ ...prev, loginEmail: '' }));
                      }
                    }}
                    placeholder="e.g. alex@example.com"
                    className={`w-full bg-white border text-sm text-[#171715] placeholder-[#A39D90] rounded-xl px-4 py-3.5 transition-all focus:ring-2 focus:ring-[#626849] focus:border-[#626849] focus:outline-none ${
                      errors.loginEmail ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {errors.loginEmail && (
                    <p className="mt-1.5 text-xs text-[#C94A38] flex items-center gap-1 font-medium">
                      <span>•</span> {errors.loginEmail}
                    </p>
                  )}
                </div>

                {/* Field 2: Password with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715]"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (errors.loginPassword) {
                          setErrors((prev) => ({ ...prev, loginPassword: '' }));
                        }
                      }}
                      placeholder="Enter your password"
                      className={`w-full bg-white border text-sm text-[#171715] placeholder-[#A39D90] rounded-xl pl-4 pr-11 py-3.5 transition-all focus:ring-2 focus:ring-[#626849] focus:border-[#626849] focus:outline-none ${
                        errors.loginPassword ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7569] hover:text-[#171715] transition-colors p-1 cursor-pointer focus:outline-none"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.loginPassword && (
                    <p className="mt-1.5 text-xs text-[#C94A38] flex items-center gap-1 font-medium">
                      <span>•</span> {errors.loginPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#171715] hover:bg-[#2C2E25] active:bg-[#000000] text-white py-4 px-6 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>LOGGING IN...</span>
                    </>
                  ) : (
                    <span>LOG IN</span>
                  )}
                </button>

                {/* Switch link */}
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-xs text-[#5E5A50] hover:text-[#171715] transition-colors font-medium cursor-pointer"
                  >
                    Don’t have an account?{' '}
                    <span className="font-bold underline text-[#171715] hover:text-[#626849]">
                      Create an account
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              /* -------------------- REGISTER FORM -------------------- */
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                
                {/* Field 1: Full Name */}
                <div>
                  <label
                    htmlFor="register-name"
                    className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={registerName}
                    onChange={(e) => {
                      setRegisterName(e.target.value);
                      if (errors.registerName) {
                        setErrors((prev) => ({ ...prev, registerName: '' }));
                      }
                    }}
                    placeholder="e.g. Maya Lin"
                    className={`w-full bg-white border text-sm text-[#171715] placeholder-[#A39D90] rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[#626849] focus:border-[#626849] focus:outline-none ${
                      errors.registerName ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {errors.registerName && (
                    <p className="mt-1 text-xs text-[#C94A38] flex items-center gap-1 font-medium">
                      <span>•</span> {errors.registerName}
                    </p>
                  )}
                </div>

                {/* Field 2: Email Address */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (errors.registerEmail) {
                        setErrors((prev) => ({ ...prev, registerEmail: '' }));
                      }
                    }}
                    placeholder="name@example.com"
                    className={`w-full bg-white border text-sm text-[#171715] placeholder-[#A39D90] rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[#626849] focus:border-[#626849] focus:outline-none ${
                      errors.registerEmail ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {errors.registerEmail && (
                    <p className="mt-1 text-xs text-[#C94A38] flex items-center gap-1 font-medium">
                      <span>•</span> {errors.registerEmail}
                    </p>
                  )}
                </div>

                {/* Field 3: Password with Independent Toggle */}
                <div>
                  <label
                    htmlFor="register-password"
                    className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      name="new-password"
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        if (errors.registerPassword) {
                          setErrors((prev) => ({ ...prev, registerPassword: '' }));
                        }
                      }}
                      placeholder="Minimum 8 characters (letters & numbers)"
                      className={`w-full bg-white border text-sm text-[#171715] placeholder-[#A39D90] rounded-xl pl-4 pr-11 py-3 transition-all focus:ring-2 focus:ring-[#626849] focus:border-[#626849] focus:outline-none ${
                        errors.registerPassword ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7569] hover:text-[#171715] transition-colors p-1 cursor-pointer focus:outline-none"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.registerPassword ? (
                    <p className="mt-1 text-xs text-[#C94A38] flex items-center gap-1 font-medium">
                      <span>•</span> {errors.registerPassword}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#7A7569]">
                      Must contain at least 8 characters with letters and numbers.
                    </p>
                  )}
                </div>

                {/* Field 4: Confirm Password with Independent Toggle */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      name="confirm-password"
                      autoComplete="new-password"
                      value={registerConfirmPassword}
                      onChange={(e) => {
                        setRegisterConfirmPassword(e.target.value);
                        if (errors.registerConfirmPassword) {
                          setErrors((prev) => ({ ...prev, registerConfirmPassword: '' }));
                        }
                      }}
                      placeholder="Re-enter your password"
                      className={`w-full bg-white border text-sm text-[#171715] placeholder-[#A39D90] rounded-xl pl-4 pr-11 py-3 transition-all focus:ring-2 focus:ring-[#626849] focus:border-[#626849] focus:outline-none ${
                        errors.registerConfirmPassword ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                      aria-label={showRegisterConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7569] hover:text-[#171715] transition-colors p-1 cursor-pointer focus:outline-none"
                    >
                      {showRegisterConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.registerConfirmPassword && (
                    <p className="mt-1 text-xs text-[#C94A38] flex items-center gap-1 font-medium">
                      <span>•</span> {errors.registerConfirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#171715] hover:bg-[#2C2E25] active:bg-[#000000] text-white py-4 px-6 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : (
                    <span>CREATE ACCOUNT</span>
                  )}
                </button>

                {/* Switch link */}
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs text-[#5E5A50] hover:text-[#171715] transition-colors font-medium cursor-pointer"
                  >
                    Already have an account?{' '}
                    <span className="font-bold underline text-[#171715] hover:text-[#626849]">
                      Log in
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Privacy and Trust Assurance (No 3rd party providers, email & password only) */}
            <div className="mt-8 pt-6 border-t border-[#E8E2D5] flex items-center justify-center gap-2 text-[11px] text-[#7A7569]">
              <ShieldCheck className="w-4 h-4 text-[#626849]" />
              <span>Direct, secure email-based authentication. Your data is never shared.</span>
            </div>
          </div>

          {/* Right / Photographic Lifestyle Column (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-[#2A2D23] overflow-hidden flex-col justify-between p-10 text-white">
            {/* Background Lifestyle Image */}
            <img
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=85"
              alt="Person in olive trousers and casual sneakers on natural stone steps"
              className="absolute inset-0 w-full h-full object-cover object-[center_35%] opacity-75"
            />
            {/* Elegant dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1F17] via-[#2A2D23]/50 to-transparent" />

            {/* Top brand accent */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-display uppercase tracking-[0.24em] text-sm text-white/90">
                SOLEFORM
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] bg-white/15 px-2.5 py-1 rounded-full text-white/90 backdrop-blur-xs">
                MEMBER ACCESS
              </span>
            </div>

            {/* Bottom editorial quote and perks */}
            <div className="relative z-10 space-y-6">
              <blockquote className="space-y-2">
                <p className="font-display uppercase text-2xl tracking-[0.06em] leading-snug text-white">
                  “EVERYDAY FOOTWEAR CRAFTED FOR NATURAL MOMENTUM.”
                </p>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  Simple forms, resilient materials, and versatile silhouettes designed to move effortlessly with your daily routine.
                </p>
              </blockquote>

              {/* Member privileges list */}
              <div className="pt-4 border-t border-white/20 space-y-2.5 text-xs text-white/90 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DCE96A] shrink-0" />
                  <span>Express checkout with saved delivery details</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DCE96A] shrink-0" />
                  <span>Permanent wishlist synchronization across devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DCE96A] shrink-0" />
                  <span>First access to seasonal drops and limited editions</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
