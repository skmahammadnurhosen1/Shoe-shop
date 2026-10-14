import React from 'react';
import { Menu, ExternalLink, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminSection } from './AdminSidebar';

interface AdminTopNavProps {
  activeSection: AdminSection;
  onOpenMobile: () => void;
  onNavigateStore: () => void;
}

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard: { title: 'Store Overview', subtitle: 'Real-time catalogue, order and customer activity' },
  products: { title: 'Product Management', subtitle: 'Manage footwear styles, pricing, variants, and visibility' },
  categories: { title: 'Categories & Collections', subtitle: 'Organize shoes by department, series, and season' },
  inventory: { title: 'Inventory Control', subtitle: 'Track unit quantities, low-stock alerts, and restocking' },
  orders: { title: 'Order Management', subtitle: 'Process storefront and WhatsApp direct order requests' },
  customers: { title: 'Customer Directory', subtitle: 'Review member profiles, contact info, and order histories' },
  homepage: { title: 'Homepage Content', subtitle: 'Manage hero slides, lookbook showcases, and announcements' },
  promotions: { title: 'Promotions & Discounts', subtitle: 'Configure percentage discounts, sales, and promo codes' },
  reviews: { title: 'Reviews Moderation', subtitle: 'Approve, moderate, and inspect customer verified reviews' },
  analytics: { title: 'Analytics & Revenue Insights', subtitle: 'Track gross sales performance, footwear model leaderboards, and order conversions' },
  media: { title: 'Media Library', subtitle: 'Inspect and manage uploaded product imagery and assets' },
  settings: { title: 'Store Settings', subtitle: 'Configure currency, WhatsApp number, and brand preferences' },
};

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  activeSection,
  onOpenMobile,
  onNavigateStore,
}) => {
  const { adminUser, logout } = useAdminAuth();
  const meta = SECTION_TITLES[activeSection] || { title: 'Admin Console', subtitle: 'SOLEFORM Management' };

  return (
    <header className="bg-[#FAF8F5] border-b border-[#DFD8CC] sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 text-[#4A493D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-xl transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A776D] hidden sm:inline">
                CONSOLE /
              </span>
              <h1 className="text-base sm:text-lg font-serif font-semibold text-[#171715] truncate">
                {meta.title}
              </h1>
            </div>
            <p className="text-[11px] text-[#5A584E] truncate hidden sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View Storefront Button */}
          <button
            onClick={onNavigateStore}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#171715] bg-[#F5F1E8] hover:bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl transition cursor-pointer"
          >
            <span>View Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#7A776D]" />
          </button>

          {/* Admin Role Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2E6] border border-[#CBD5C0] rounded-lg text-[#3D4F28] text-[10px] font-mono font-semibold tracking-wider uppercase">
            <Shield className="w-3 h-3" />
            <span>{adminUser?.role || 'ADMIN'}</span>
          </div>

          {/* Logout Action */}
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOG OUT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
