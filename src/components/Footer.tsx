import React from 'react';
import { Instagram, Facebook, Youtube, Globe, ShieldCheck } from 'lucide-react';
import { CURRENCIES } from '../data/shoes';
import { Currency } from '../types';

interface FooterProps {
  currentCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
  onSelectCategory: (category: string) => void;
  onOpenSizeGuide?: () => void;
  onShowToast?: (msg: string) => void;
  onNavigateAuth?: () => void;
  onNavigateAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentCurrency,
  onSelectCurrency,
  onSelectCategory,
  onOpenSizeGuide,
  onShowToast,
  onNavigateAuth,
  onNavigateAdmin,
}) => {
  const handleNavigateAdmin = () => {
    if (onNavigateAdmin) {
      onNavigateAdmin();
    } else {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  return (
    <footer className="bg-[#171715] text-[#ECE7DE] pt-12 pb-8 border-t border-[#292825]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Brand Header Strip: SOLEFORM logo, Tagline & Neatly Grouped Social Media Icons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-8 border-b border-[#292825]">
          <div>
            <span className="font-display font-bold text-2xl sm:text-3xl tracking-[0.22em] uppercase text-white block">
              SOLEFORM
            </span>
            <p className="text-xs text-[#9E988B] mt-1 font-normal leading-relaxed">
              Considered footwear for everyday movement.
            </p>
          </div>

          {/* Neatly aligned Social Media Icons */}
          <div className="flex items-center gap-2.5 text-[#9E988B]">
            <a
              href="#instagram"
              aria-label="Instagram"
              onClick={(e) => e.preventDefault()}
              className="w-8.5 h-8.5 rounded-full border border-[#2E2D28] bg-[#1E1D1A] flex items-center justify-center hover:text-white hover:border-[#F5F1E8] transition-colors cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <a
              href="#facebook"
              aria-label="Facebook"
              onClick={(e) => e.preventDefault()}
              className="w-8.5 h-8.5 rounded-full border border-[#2E2D28] bg-[#1E1D1A] flex items-center justify-center hover:text-white hover:border-[#F5F1E8] transition-colors cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
            </a>

            <a
              href="#youtube"
              aria-label="YouTube"
              onClick={(e) => e.preventDefault()}
              className="w-8.5 h-8.5 rounded-full border border-[#2E2D28] bg-[#1E1D1A] flex items-center justify-center hover:text-white hover:border-[#F5F1E8] transition-colors cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
            </a>

            {/* Pinterest */}
            <a
              href="#pinterest"
              aria-label="Pinterest"
              onClick={(e) => e.preventDefault()}
              className="w-8.5 h-8.5 rounded-full border border-[#2E2D28] bg-[#1E1D1A] flex items-center justify-center hover:text-white hover:border-[#F5F1E8] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.49.02-3.56.14-.98.92-3.9 1.1-4.7-.28-.56-.46-1.3-.46-2.18 0-2.04 1.18-3.56 2.66-3.56 1.25 0 1.86.94 1.86 2.07 0 1.26-.8 3.14-1.22 4.88-.35 1.46.73 2.65 2.17 2.65 2.6 0 4.61-2.74 4.61-6.7 0-3.5-2.52-5.95-6.11-5.95-4.16 0-6.6 3.12-6.6 6.34 0 1.25.48 2.6 1.09 3.33.12.15.14.28.1.51-.11.45-.35 1.45-.4 1.64-.06.27-.22.33-.5.2-1.85-.86-3-3.55-3-5.72 0-4.66 3.39-8.94 9.77-8.94 5.13 0 9.11 3.66 9.11 8.54 0 5.1-3.21 9.2-7.67 9.2-1.5 0-2.91-.78-3.39-1.7l-.92 3.53c-.34 1.3-1.26 2.92-1.88 3.92A11.98 11.98 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Structured Middle Grid:
            On mobile: balanced 2-column grid for SHOP and HELP, with ABOUT and Currency cleanly placed beneath
            On desktop: elegant 4-column balanced layout */}
        <div className="py-8 grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-8">
          
          {/* Shop */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              SHOP
            </h4>
            <ul className="space-y-2 text-xs text-[#9E988B]">
              {['New Arrivals', 'Men', 'Women', 'Sneakers', 'Running', 'Sale'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onSelectCategory(item)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              HELP
            </h4>
            <ul className="space-y-2 text-xs text-[#9E988B]">
              {['FAQs', 'Shipping', 'Returns', 'Size Guide', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item === 'Size Guide' && onOpenSizeGuide) {
                        onOpenSizeGuide();
                      } else {
                        const infoMap: Record<string, string> = {
                          FAQs: 'Frequently Asked Questions: All SOLEFORM shoes feature orthotic arch support, water-resistant treatments, and modular insoles.',
                          Shipping: 'Free express courier shipping across India on orders over ₹1,999. Arrives in 2-4 business days.',
                          Returns: '30-day effortless returns and complimentary size exchanges in original packaging.',
                          Contact: 'Customer Concierge: concierge@soleform.com | Monday–Saturday, 9am–7pm IST.',
                        };
                        const message = infoMap[item] || `${item}: Free shipping over ₹1,999, 30-day returns & exchanges.`;
                        if (onShowToast) {
                          onShowToast(message);
                        }
                      }
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
              {onNavigateAuth && (
                <li>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateAuth();
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left text-[#DCE96A]"
                  >
                    Member Account
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigateAdmin();
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left text-[#9E988B] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#DCE96A]" />
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              ABOUT
            </h4>
            <ul className="space-y-2 text-xs text-[#9E988B]">
              {['Our Story', 'Lookbook', 'Journal'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    onClick={(e) => e.preventDefault()}
                    className="hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Country & Currency Selector */}
          <div className="lg:col-span-3 col-span-2 sm:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              LOCATION & CURRENCY
            </h4>
            <p className="text-[11px] text-[#8C8679] mb-2 leading-tight">
              Prices update dynamically across all products and checkout.
            </p>

            <div className="relative">
              <select
                value={currentCurrency.code}
                onChange={(e) => {
                  const curr = CURRENCIES[e.target.value];
                  if (curr) onSelectCurrency(curr);
                }}
                className="w-full bg-[#201F1B] text-[#ECE7DE] text-xs rounded-xl px-3.5 py-2.5 border border-[#3A3831] focus:outline-none focus:border-[#DCE96A] cursor-pointer appearance-none transition-colors"
              >
                {Object.values(CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-[#171715]">
                    {curr.label}
                  </option>
                ))}
              </select>

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9E988B]">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 border-t border-[#292825] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7569]">
          <div className="flex items-center gap-4">
            <span>© 2026 SOLEFORM. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="#cookies"
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors"
            >
              Cookies
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateAdmin();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#262520] hover:bg-[#38362F] text-[#DCE96A] hover:text-[#FAF8F5] rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border border-[#3A3830]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#DCE96A]" />
              Admin Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
