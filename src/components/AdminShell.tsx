import React from 'react';
import { ShieldCheck, LogOut, ExternalLink, UserCheck, Clock, Key } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminShellProps {
  onNavigateStore?: () => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({ onNavigateStore }) => {
  const { adminUser, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans antialiased text-[#171715] flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-[#FAF8F5] border-b border-[#DFD8CC] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-semibold tracking-tight text-[#171715]">
              SOLEFORM
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#EAE5D9] text-[#4A493D] rounded border border-[#DFD8CC]">
              ADMIN CONSOLE
            </span>
          </div>

          {/* Admin User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#171715]">
                {adminUser?.name || 'Administrator'}
              </span>
              <span className="text-[11px] font-mono text-[#7A776D]">
                {adminUser?.email}
              </span>
            </div>

            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#4A493D] text-[#FAF8F5] rounded">
              {adminUser?.role?.toUpperCase() || 'ADMIN'}
            </span>

            {onNavigateStore && (
              <button
                onClick={onNavigateStore}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A493D] hover:text-[#171715] transition rounded-lg hover:bg-[#EAE5D9]"
              >
                <span>View Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOG OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Verification Card */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(23,23,21,0.04)] space-y-8">
          {/* Header Title with Security Icon */}
          <div className="flex items-start justify-between gap-4 border-b border-[#DFD8CC] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EEF2E6] border border-[#CBD5C0] rounded-full text-[#3D4F28] text-xs font-medium mb-3">
                <span className="w-2 h-2 rounded-full bg-[#52792B] animate-pulse"></span>
                <span>AUTHENTICATED SESSION ACTIVE</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#171715]">
                SOLEFORM Administrative Shell
              </h1>
              <p className="mt-1 text-sm text-[#5A584E]">
                Administrative identity confirmed via server-side scrypt credentials & token verification.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#EAE5D9] border border-[#DFD8CC] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#3D4336]" />
            </div>
          </div>

          {/* Session Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#DFD8CC] flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-[#4A493D] mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#7A776D]">
                  AUTHENTICATED AS
                </span>
                <span className="text-sm font-semibold text-[#171715] block mt-0.5">
                  {adminUser?.email}
                </span>
                <span className="text-xs text-[#5A584E]">
                  Role: {adminUser?.role?.toUpperCase()} ({adminUser?.name})
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#DFD8CC] flex items-start gap-3">
              <Key className="w-5 h-5 text-[#4A493D] mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#7A776D]">
                  SESSION TOKEN STATUS
                </span>
                <span className="text-sm font-semibold text-[#171715] block mt-0.5">
                  Cryptographically Verified
                </span>
                <span className="text-xs text-[#5A584E]">
                  Protected against brute-force & timing attacks
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#DFD8CC] flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#4A493D] mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#7A776D]">
                  LOGIN TIMESTAMP
                </span>
                <span className="text-xs font-mono text-[#171715] block mt-0.5">
                  {adminUser?.lastLoginAt
                    ? new Date(adminUser.lastLoginAt).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
                <span className="text-xs text-[#5A584E]">
                  24-hour server session duration
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#DFD8CC] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4A493D] mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#7A776D]">
                  SECURITY PERIMETER
                </span>
                <span className="text-sm font-semibold text-[#171715] block mt-0.5">
                  Isolated Admin Store
                </span>
                <span className="text-xs text-[#5A584E]">
                  Separate from customer records & registration
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Note */}
          <div className="p-5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#4A493D] font-semibold mb-2">
              DASHBOARD MODULE STATUS
            </h2>
            <p className="text-xs text-[#5A584E] leading-relaxed">
              Step 1 of the admin dashboard project is complete. The secure administrator authentication endpoint, rate limiter, scrypt hashing, and login interface are fully active. Further admin modules (orders, shoes catalogue, and inventory controls) will be developed in the next project phases.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {onNavigateStore && (
              <button
                onClick={onNavigateStore}
                className="px-5 py-2.5 border border-[#DFD8CC] hover:bg-[#EAE5D9] text-[#171715] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 text-center"
              >
                RETURN TO STOREFRONT
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 text-center shadow-sm"
            >
              LOG OUT OF ADMIN CONSOLE
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
