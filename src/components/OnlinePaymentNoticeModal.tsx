import React from 'react';
import { X, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Currency } from '../types';

interface OnlinePaymentNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderViaWhatsApp: () => void;
  orderContext?: {
    type: 'single' | 'cart';
    productName?: string;
    selectedSize?: number;
    itemCount?: number;
    totalINR?: number;
  };
  currency?: Currency;
}

export const OnlinePaymentNoticeModal: React.FC<OnlinePaymentNoticeModalProps> = ({
  isOpen,
  onClose,
  onOrderViaWhatsApp,
  orderContext,
  currency,
}) => {
  if (!isOpen) return null;

  const formatPrice = (priceINR: number) => {
    if (!currency || currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#F5F1E8] rounded-2xl border border-[#DFD8CC] shadow-2xl p-6 sm:p-7 text-[#171715] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#7A7569] hover:text-[#171715] hover:bg-[#DFD8CC] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-full bg-[#EBE5DA] border border-[#CDC5B4] flex items-center justify-center text-[#626849] shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#626849] block">
              Notice
            </span>
            <h3 className="font-display font-bold text-base sm:text-lg uppercase tracking-wide text-[#171715] leading-snug">
              ONLINE PAYMENT TEMPORARILY UNAVAILABLE
            </h3>
          </div>
        </div>

        {/* Message */}
        <div className="mt-3.5 space-y-3">
          <p className="text-xs sm:text-sm text-[#5E5A50] leading-relaxed">
            Our online payment gateway is temporarily unavailable. You can still place your order conveniently through WhatsApp.
          </p>

          {/* Context Snippet if available */}
          {orderContext && (
            <div className="bg-[#EBE6DC] rounded-xl p-3 border border-[#DFD8CC] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#7A7569]" />
                <span className="font-semibold text-[#171715] truncate">
                  {orderContext.type === 'single'
                    ? `${orderContext.productName || 'Selected Item'}${orderContext.selectedSize ? ` (UK ${orderContext.selectedSize})` : ''}`
                    : `Shopping Bag (${orderContext.itemCount || 1} items)`}
                </span>
              </div>
              {orderContext.totalINR !== undefined && (
                <span className="font-bold text-[#171715] shrink-0">
                  {formatPrice(orderContext.totalINR)}
                </span>
              )}
            </div>
          )}

          {/* Concierge Benefits Note */}
          <div className="bg-[#FAF6F0] rounded-xl p-3 border border-[#E8E2D5] space-y-1.5 text-[11px] text-[#5E5A50]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              <span>Direct WhatsApp Concierge (+91 91342 80545)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#626849]" />
              <span>Full item specs, size, and delivery address pre-filled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#626849]" />
              <span>Secure order confirmation & assistance by our dispatch team</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          {/* Primary: ORDER VIA WHATSAPP */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOrderViaWhatsApp();
            }}
            className="w-full bg-[#171715] hover:bg-[#1E2E21] border border-[#25D366]/40 text-[#F5F1E8] font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm cursor-pointer group"
          >
            <span className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
              </svg>
            </span>
            <span>ORDER VIA WHATSAPP</span>
          </button>

          {/* Secondary: CONTINUE SHOPPING */}
          <button
            type="button"
            onClick={onClose}
            className="w-full border border-[#CDC4B5] hover:bg-[#EBE5DA] text-[#5E5A50] hover:text-[#171715] font-semibold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer text-center"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </motion.div>
    </div>
  );
};
