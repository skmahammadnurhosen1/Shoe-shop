import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  Layout,
  Tag,
  Star,
  Image as ImageIcon,
  Settings,
  BarChart2,
  LogOut,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'homepage'
  | 'promotions'
  | 'reviews'
  | 'analytics'
  | 'media'
  | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onNavigateStore: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile,
  onNavigateStore,
}) => {
  const { adminUser, logout } = useAdminAuth();

  const navItems: { id: AdminSection; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'homepage', label: 'Homepage Content', icon: Layout },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart2 },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const handleSelect = (section: AdminSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#FAF8F5] border-r border-[#DFD8CC]">
      {/* Top Brand Header */}
      <div>
        <div className="px-6 py-5 border-b border-[#DFD8CC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-semibold tracking-tight text-[#171715]">
              SOLEFORM
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-[#EAE5D9] text-[#4A493D] rounded border border-[#DFD8CC]">
              ADMIN
            </span>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-[#7A776D] hover:text-[#171715] rounded-lg transition"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#171715] text-[#FAF8F5] shadow-sm font-semibold'
                    : 'text-[#4A493D] hover:bg-[#EAE5D9] hover:text-[#171715]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF8F5]' : 'text-[#5A584E]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-[#EAE5D9] text-[#171715]">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile & Store Link */}
      <div className="p-4 border-t border-[#DFD8CC] bg-[#F5F1E8] space-y-3">
        {/* View Storefront Shortcut */}
        <button
          onClick={onNavigateStore}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#FAF8F5] hover:bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl text-xs font-medium text-[#171715] transition cursor-pointer"
        >
          <span className="truncate">View Public Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#7A776D] shrink-0" />
        </button>

        {/* User Badge & Logout */}
        <div className="flex items-center justify-between pt-1">
          <div className="min-w-0 flex-1 mr-2">
            <span className="block text-xs font-semibold text-[#171715] truncate">
              {adminUser?.name || 'Administrator'}
            </span>
            <span className="block text-[11px] font-mono text-[#7A776D] truncate">
              {adminUser?.email}
            </span>
          </div>

          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-2 text-[#7A776D] hover:text-[#991B1B] hover:bg-[#FDF2F2] rounded-xl transition duration-150 cursor-pointer"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
