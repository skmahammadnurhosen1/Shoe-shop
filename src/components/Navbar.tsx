import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ArrowRight, Globe, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  onNavigateHome?: () => void;
  onNavigateAuth?: () => void;
  onNavigateAccount?: (tab?: any) => void;
  onSignOutToast?: (userName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onSelectCategory,
  activeCategory,
  onNavigateHome,
  onNavigateAuth,
  onNavigateAccount,
  onSignOutToast,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: 'New Arrivals', filter: 'New Arrivals' },
    { label: 'Men', filter: 'Men' },
    { label: 'Women', filter: 'Women' },
    { label: 'Sneakers', filter: 'Sneakers' },
    { label: 'Running', filter: 'Running' },
    { label: 'Sale', filter: 'Sale', isSale: true },
  ];

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountDropdownOpen(false);
      }
    };

    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountDropdownOpen]);

  const handleNavClick = (filter: string) => {
    onSelectCategory(filter);
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenSearch();
  };

  const handleAccountClick = () => {
    if (user) {
      setAccountDropdownOpen((prev) => !prev);
    } else if (onNavigateAuth) {
      onNavigateAuth();
    }
  };

  const handleSignOut = async () => {
    const userName = user?.name || 'Member';
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    if (onSignOutToast) {
      onSignOutToast(userName);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const [announcement, setAnnouncement] = useState<{ enabled: boolean; text: string }>({
    enabled: true,
    text: 'COMPLIMENTARY PRIORITY EXPRESS AIR SHIPPING ON ORDERS OVER ₹1,999 · FREE RETURNS & SIZE EXCHANGES',
  });

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch('/api/homepage');
        const data = await res.json();
        if (data.success && data.announcementBar) {
          setAnnouncement({
            enabled: Boolean(data.announcementBar.enabled),
            text: data.announcementBar.text || '',
          });
        }
      } catch {
        // Fall back to default
      }
    };
    fetchAnnouncement();
  }, []);

  return (
    <>
      {/* Dynamic Top Announcement Banner Ticker */}
      {announcement.enabled && announcement.text && (
        <div className="bg-[#171715] text-[#FAF8F5] text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest uppercase py-2 px-4 text-center border-b border-[#2A2A26] overflow-hidden whitespace-nowrap text-ellipsis">
          {announcement.text}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#F5F1E8] border-b border-[#E8E2D5] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
              }}
              className="group flex flex-col text-left focus:outline-none cursor-pointer"
            >
              <span className="font-display font-bold text-2xl sm:text-3xl tracking-[0.22em] uppercase text-[#171715] transition-opacity group-hover:opacity-85">
                SOLEFORM
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.24em] uppercase text-[#5E5A50] -mt-1 font-medium">
                CONSIDERED FOOTWEAR
              </span>
            </button>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => {
              const isActive = activeCategory.toLowerCase() === link.filter.toLowerCase();
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.filter)}
                  className={`relative py-2 text-xs font-bold tracking-[0.16em] uppercase transition-colors cursor-pointer ${
                    link.isSale
                      ? 'text-[#C94A38] font-semibold hover:text-[#A93322]'
                      : isActive
                      ? 'text-[#171715] font-semibold'
                      : 'text-[#5E5A50] hover:text-[#171715]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171715] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Search + Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search bar input representation */}
            <form
              onSubmit={handleSearchSubmit}
              onClick={onOpenSearch}
              className="hidden sm:flex items-center relative cursor-pointer"
            >
              <input
                type="text"
                readOnly
                placeholder="Search shoes..."
                value={searchValue}
                className="bg-transparent border border-[#DDD6C8] hover:border-[#171715]/40 text-[#171715] placeholder-[#9E988B] text-xs rounded-full pl-4 pr-9 py-2 w-36 lg:w-48 transition-all focus:outline-none cursor-pointer"
              />
              <Search className="w-3.5 h-3.5 text-[#5E5A50] absolute right-3 pointer-events-none" />
            </form>

            {/* Mobile search trigger */}
            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className="sm:hidden p-2 text-[#171715] hover:opacity-75 transition-opacity cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.6]" />
            </button>

            {/* Account Icon & Dropdown on Desktop */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              {user ? (
                /* Authenticated User Button */
                <button
                  aria-label={`Member profile: ${user.name}`}
                  onClick={handleAccountClick}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-[#EAE4D7] transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-[#626849] text-white flex items-center justify-center text-[11px] font-bold tracking-tight shadow-2xs group-hover:bg-[#4E533A] transition-colors">
                    {getInitials(user.name)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5E5A50] group-hover:text-[#171715] transition-transform" />
                </button>
              ) : (
                /* Guest User Sign In Trigger */
                <button
                  aria-label="Sign In or Register"
                  onClick={handleAccountClick}
                  className="p-2 text-[#171715] hover:opacity-75 transition-opacity cursor-pointer"
                  title="Sign In or Register"
                >
                  <User className="w-5 h-5 stroke-[1.6]" />
                </button>
              )}

              {/* Account Dropdown Menu */}
              {user && accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FAF6F0] rounded-xl border border-[#E8E2D5] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Card */}
                  <div
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      if (onNavigateAccount) onNavigateAccount('overview');
                    }}
                    className="px-4 py-3 border-b border-[#E8E2D5] hover:bg-[#EFEAE0] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-[0.18em] bg-[#626849]/15 text-[#626849] px-2 py-0.5 rounded">
                        SOLEFORM MEMBER
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#171715] truncate">{user.name}</p>
                    <p className="text-xs text-[#7A7569] truncate">{user.email}</p>
                    <span className="text-[10px] text-[#626849] font-semibold mt-1 inline-block">
                      View Profile Dashboard →
                    </span>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        if (onNavigateAccount) onNavigateAccount('overview');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#171715] hover:bg-[#EFEAE0] transition-colors cursor-pointer"
                    >
                      My Account Overview
                    </button>

                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        if (onNavigateAccount) onNavigateAccount('orders');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#47433B] hover:bg-[#EFEAE0] hover:text-[#171715] transition-colors cursor-pointer"
                    >
                      My Orders & Tracking
                    </button>

                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        if (onNavigateAccount) onNavigateAccount('addresses');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#47433B] hover:bg-[#EFEAE0] hover:text-[#171715] transition-colors cursor-pointer"
                    >
                      Delivery Addresses
                    </button>

                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        if (onNavigateAccount) onNavigateAccount('wishlist');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#47433B] hover:bg-[#EFEAE0] hover:text-[#171715] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Saved Wishlist</span>
                      <span className="text-[11px] font-bold text-[#C94A38]">{wishlistCount}</span>
                    </button>

                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onOpenCart();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#47433B] hover:bg-[#EFEAE0] hover:text-[#171715] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Shopping Bag</span>
                      <span className="text-[11px] font-bold text-[#626849]">{cartCount}</span>
                    </button>
                  </div>

                  {/* Divider & Sign Out */}
                  <div className="border-t border-[#E8E2D5] pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#C94A38] hover:bg-[#FDF2F0] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              aria-label="Wishlist"
              onClick={onOpenWishlist}
              className="p-2 text-[#171715] hover:opacity-75 transition-opacity relative cursor-pointer"
            >
              <Heart className="w-5 h-5 stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C94A38] rounded-full" />
              )}
            </button>

            {/* Cart Bag Icon with lime count badge */}
            <button
              aria-label="Shopping Bag"
              onClick={onOpenCart}
              className="p-2 text-[#171715] hover:opacity-75 transition-opacity relative cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#DCE96A] text-[#171715] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#171715]/20 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="md:hidden p-2 text-[#171715] hover:opacity-75 transition-opacity cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </header>

      {/* Premium Right-Side Slide-In Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
          {/* Dark Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Right Slide-in Panel */}
          <div className="absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-[#F5F1E8] shadow-2xl flex flex-col justify-between border-l border-[#DFD8CC] animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div>
              <div className="p-6 border-b border-[#E8E2D5] flex items-center justify-between">
                <span className="font-display font-bold text-2xl tracking-[0.24em] uppercase text-[#171715]">
                  SOLEFORM
                </span>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-[#5E5A50] hover:text-[#171715] rounded-full hover:bg-[#EBE5DA] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Row */}
              <div className="px-6 py-4 bg-[#EFEAE0] border-b border-[#E2DDD0] grid grid-cols-4 gap-2 text-center">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/70 hover:bg-white text-xs text-[#171715] transition-colors"
                >
                  <Search className="w-4 h-4 text-[#5E5A50]" />
                  <span className="text-[10px] font-medium">Search</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWishlist();
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/70 hover:bg-white text-xs text-[#171715] transition-colors relative"
                >
                  <Heart className="w-4 h-4 text-[#5E5A50]" />
                  <span className="text-[10px] font-medium">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-2 w-2 h-2 bg-[#C94A38] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/70 hover:bg-white text-xs text-[#171715] transition-colors relative"
                >
                  <ShoppingBag className="w-4 h-4 text-[#5E5A50]" />
                  <span className="text-[10px] font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-2 bg-[#DCE96A] text-[#171715] text-[9px] font-bold px-1 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user) {
                      if (onNavigateAccount) onNavigateAccount('overview');
                    } else if (onNavigateAuth) {
                      onNavigateAuth();
                    }
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-colors ${
                    user ? 'bg-[#626849] text-white' : 'bg-white/70 hover:bg-white text-[#171715]'
                  }`}
                >
                  <User className={`w-4 h-4 ${user ? 'text-white' : 'text-[#5E5A50]'}`} />
                  <span className="text-[10px] font-medium truncate max-w-full">
                    {user ? 'Account' : 'Sign In'}
                  </span>
                </button>
              </div>

              {/* Member Status Card in Drawer */}
              <div className="p-4 mx-6 my-4 rounded-xl bg-white/80 border border-[#E0D9CB]">
                {user ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#626849] bg-[#626849]/10 px-2 py-0.5 rounded">
                        ACTIVE MEMBER
                      </span>
                      <ShieldCheck className="w-4 h-4 text-[#626849]" />
                    </div>
                    <p className="text-sm font-bold text-[#171715]">{user.name}</p>
                    <p className="text-xs text-[#7A7569] mb-3">{user.email}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onNavigateAccount) onNavigateAccount('overview');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-[#171715] text-white text-xs font-bold uppercase tracking-wider text-center cursor-pointer"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full py-2 px-3 rounded-lg bg-[#FAF6F0] hover:bg-[#FDF2F0] text-xs font-semibold text-[#C94A38] border border-[#E8E2D5] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-[#171715] mb-1">SOLEFORM Membership</p>
                    <p className="text-[11px] text-[#7A7569] mb-3 leading-relaxed">
                      Sign in or create an account for express checkout and saved wishlist access.
                    </p>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onNavigateAuth) onNavigateAuth();
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer text-center"
                    >
                      Log In / Register
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Items List */}
              <nav className="p-6 space-y-1">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7A7569] block mb-3">
                  Shop Categories
                </span>

                {navLinks.map((link) => {
                  const isActive = activeCategory.toLowerCase() === link.filter.toLowerCase();
                  return (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.filter)}
                      className={`w-full py-3.5 px-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#EAE4D7] text-[#171715] font-bold'
                          : 'hover:bg-[#EBE5DA] text-[#47433B]'
                      }`}
                    >
                      <span className={`text-sm tracking-wide ${link.isSale ? 'text-[#C94A38] font-bold' : ''}`}>
                        {link.label}
                      </span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-[#E8E2D5] bg-[#EFEAE0] space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#5E5A50]">
                <Globe className="w-4 h-4 text-[#171715]" />
                <span className="font-semibold text-[#171715]">India (INR ₹)</span>
                <span className="text-[#8C8679]">· Free Shipping &gt; ₹1,999</span>
              </div>

              <p className="text-[11px] text-[#7A7569] leading-tight">
                Considered footwear for everyday movement.
              </p>

              <div className="pt-2 text-[10px] text-[#8C8679]">
                © 2026 SOLEFORM. All rights reserved.
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
