import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLoginPageProps {
  onLoginSuccess?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Timer countdown for active rate-limit lockout
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setErrorMessage(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Reset error
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(trimmedEmail, password);

      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
        if (res.retryAfterSeconds) {
          setLockoutSeconds(res.retryAfterSeconds);
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-center items-center px-4 py-12 select-none sm:select-auto font-sans antialiased text-[#171715]">
      {/* Container Card */}
      <div className="w-full max-w-[420px] bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(23,23,21,0.06)]">
        {/* Brand Logo & Heading */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <span className="font-serif text-3xl font-semibold tracking-tight text-[#171715] block">
              SOLEFORM
            </span>
          </div>
          <h1 className="mt-2 text-xs font-mono font-medium tracking-[0.25em] text-[#5A584E] uppercase">
            ADMIN LOGIN
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Error Notice */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl text-left"
            >
              <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
              <div className="text-xs text-[#991B1B] leading-relaxed">
                <p>{errorMessage}</p>
                {isLocked && (
                  <p className="mt-1 font-mono font-medium">
                    Try again in: {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] font-semibold tracking-[0.15em] text-[#171715] uppercase mb-2"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isLocked}
              placeholder="name@soleform.com"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-sm text-[#171715] placeholder-[#9C988D] focus:outline-none focus:border-[#3D4336] focus:ring-1 focus:ring-[#3D4336] transition duration-150 disabled:bg-[#F2EDE4] disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-semibold tracking-[0.15em] text-[#171715] uppercase mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isLocked}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-11 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-sm text-[#171715] placeholder-[#9C988D] focus:outline-none focus:border-[#3D4336] focus:ring-1 focus:ring-[#3D4336] transition duration-150 disabled:bg-[#F2EDE4] disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || isLocked}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A776D] hover:text-[#171715] focus:outline-none transition p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Log In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full py-3.5 px-6 bg-[#171715] hover:bg-[#2A2A26] active:bg-[#000000] text-[#FAF8F5] font-semibold text-xs tracking-[0.2em] uppercase rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                  <span>LOGGING IN...</span>
                </>
              ) : (
                <span>LOG IN</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Subtle security posture indicator */}
      <div className="mt-8 text-center">
        <p className="text-[11px] font-mono tracking-wider text-[#7A776D] uppercase">
          SOLEFORM SECURE ADMINISTRATIVE PORTAL
        </p>
      </div>
    </div>
  );
};
