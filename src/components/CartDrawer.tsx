import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Check, Tag, Loader2 } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { OnlinePaymentNoticeModal } from './OnlinePaymentNoticeModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  currency: Currency;
  onClearCart: () => void;
  onProceedToCheckout?: () => void;
  onOrderCartViaWhatsApp?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  currency,
  onClearCart,
  onProceedToCheckout,
  onOrderCartViaWhatsApp,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountINR: number;
    isFreeShipping: boolean;
    message: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState(false);

  const [storeSettings, setStoreSettings] = useState<{
    freeShippingThresholdINR: number;
    shippingFeeINR: number;
  }>({
    freeShippingThresholdINR: 1999,
    shippingFeeINR: 150,
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setStoreSettings({
              freeShippingThresholdINR: data.settings.freeShippingThresholdINR,
              shippingFeeINR: data.settings.shippingFeeINR,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rawSubtotalINR = cartItems.reduce(
    (sum, item) => sum + item.product.priceINR * item.quantity,
    0
  );

  const discountINR = appliedCoupon ? appliedCoupon.discountINR : 0;
  const netSubtotalINR = Math.max(0, rawSubtotalINR - discountINR);

  const freeShippingThresholdINR = storeSettings.freeShippingThresholdINR;
  const isFreeShipping =
    (appliedCoupon && appliedCoupon.isFreeShipping) ||
    rawSubtotalINR >= freeShippingThresholdINR ||
    rawSubtotalINR === 0;

  const shippingINR = isFreeShipping ? 0 : storeSettings.shippingFeeINR;
  const grandTotalINR = netSubtotalINR + shippingINR;

  const formatPrice = (amountINR: number) => {
    if (currency.code === 'INR') {
      return `₹${amountINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(amountINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);

    const trimmed = promoCodeInput.trim().toUpperCase();
    if (!trimmed) {
      setPromoError('Please enter a coupon code.');
      return;
    }

    setPromoLoading(true);
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, subtotalINR: rawSubtotalINR }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountINR: data.discountINR,
          isFreeShipping: data.isFreeShipping,
          message: data.message,
        });
        setPromoCodeInput('');
      } else {
        setPromoError(data.message || 'Invalid promotional code.');
      }
    } catch {
      setPromoError('Unable to validate promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F5F1E8] shadow-2xl flex flex-col border-l border-[#E5DECة]">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E2D5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl uppercase tracking-wider text-[#171715]">
                SHOPPING BAG
              </h3>
              <span className="bg-[#DCE96A] text-[#171715] text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-1.5 text-[#5E5A50] hover:text-[#171715] rounded-full hover:bg-[#EBE5DA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="bg-[#ECE6DA] px-6 py-2.5 border-b border-[#DFD8CB] text-xs">
            {isFreeShipping ? (
              <span className="text-[#3A5328] font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
                You unlocked Free Express Shipping!
              </span>
            ) : (
              <span className="text-[#5E5A50]">
                Add {formatPrice(freeShippingThresholdINR - rawSubtotalINR)} more for Free Shipping.
              </span>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-[#7A7569] text-sm">Your shopping bag is currently empty.</p>
                <button
                  onClick={onClose}
                  className="bg-[#171715] text-[#F5F1E8] text-xs uppercase font-bold tracking-wider px-6 py-2.5 rounded-full hover:bg-black transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#EBE5DA] rounded-xl p-3 flex gap-3 border border-[#E0D9CB]"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-white shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-sm text-[#171715] leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          aria-label="Remove item"
                          className="text-[#8C8679] hover:text-[#C94A38] transition-colors p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#7A7569] mt-0.5">
                        <span>Size UK {item.selectedSize}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#DFD8CC]/60">
                      <span className="font-bold text-xs sm:text-sm text-[#171715]">
                        {formatPrice(item.product.priceINR * item.quantity)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#CDC5B4] rounded-md bg-[#F5F1E8]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs text-[#171715] hover:bg-[#EBE5DA] rounded-l-md transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#171715]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs text-[#171715] hover:bg-[#EBE5DA] rounded-r-md transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E8E2D5] bg-[#EFEAE0] space-y-3">
              {/* Promo code area */}
              {appliedCoupon ? (
                <div className="bg-[#EEF2E6] border border-[#CBD5C0] rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#52792B]" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#3D4F28] uppercase tracking-wide">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] text-[#52792B] font-medium">Applied</span>
                      </div>
                      <p className="text-[10px] text-[#5A584E]">{appliedCoupon.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    title="Remove coupon"
                    className="p-1 text-[#7A776D] hover:text-[#C94A38] rounded-md transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. WELCOME10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      disabled={promoLoading}
                      className="bg-white border border-[#CDC5B4] text-xs rounded-xl px-3 py-2 flex-1 focus:outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans placeholder:text-[#8C8679]"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="bg-[#171715] hover:bg-black text-[#FAF8F5] text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shrink-0"
                    >
                      {promoLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </form>
                  {promoError && (
                    <p className="text-[11px] text-[#C94A38] leading-tight px-0.5">{promoError}</p>
                  )}
                </div>
              )}

              {/* Subtotals */}
              <div className="space-y-1.5 text-xs text-[#635F55] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#171715]">{formatPrice(rawSubtotalINR)}</span>
                </div>
                {discountINR > 0 && (
                  <div className="flex justify-between text-[#3A5328] font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountINR)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Express Shipping</span>
                  <span className="font-medium text-[#171715]">
                    {isFreeShipping ? 'FREE' : formatPrice(150)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold text-[#171715] pt-2 border-t border-[#DFD8CC]">
                  <span>Total Amount</span>
                  <span>{formatPrice(grandTotalINR)}</span>
                </div>
              </div>

              {/* Primary Action: PROCEED TO CHECKOUT (intercepted with outage modal) */}
              <button
                onClick={() => {
                  setIsPaymentNoticeOpen(true);
                }}
                className="w-full bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer mt-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct Alternative: ORDER VIA WHATSAPP */}
              <button
                onClick={() => {
                  onClose();
                  if (onOrderCartViaWhatsApp) onOrderCartViaWhatsApp();
                }}
                className="w-full bg-[#171715] hover:bg-[#1E2E21] border border-[#25D366]/40 text-[#F5F1E8] font-bold text-xs uppercase tracking-widest py-3.5 rounded-full flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm cursor-pointer group mt-2"
              >
                <span className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
                  </svg>
                </span>
                <span>ORDER VIA WHATSAPP</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C8679] pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Priority personal order fulfillment via WhatsApp concierge</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Online Payment Temporarily Unavailable Notice Modal */}
      <OnlinePaymentNoticeModal
        isOpen={isPaymentNoticeOpen}
        onClose={() => setIsPaymentNoticeOpen(false)}
        currency={currency}
        orderContext={{
          type: 'cart',
          itemCount: cartItems.length,
          totalINR: grandTotalINR,
        }}
        onOrderViaWhatsApp={() => {
          setIsPaymentNoticeOpen(false);
          onClose();
          if (onOrderCartViaWhatsApp) onOrderCartViaWhatsApp();
        }}
      />
    </div>
  );
};
