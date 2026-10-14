import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard, 
  Smartphone, Banknote, ShoppingBag, Trash2, AlertCircle, Tag, Loader2, X 
} from 'lucide-react';
import { CartItem, Currency, OrderDetails } from '../types';
import { OnlinePaymentNoticeModal } from './OnlinePaymentNoticeModal';

interface CheckoutPageProps {
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onBackToShopping: () => void;
  onOrderSuccess: (order: OrderDetails) => void;
  onOrderViaWhatsApp?: () => void;
  onViewOrders?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onBackToShopping,
  onOrderSuccess,
  onOrderViaWhatsApp,
  onViewOrders,
}) => {
  // Form fields
  const [formData, setFormData] = useState({
    fullName: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    phone: '+91 98765 43210',
    address: '42, Heritage Ridge, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    paymentMethod: 'UPI',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountINR: number;
    isFreeShipping: boolean;
    message: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [storeSettings, setStoreSettings] = useState<{
    freeShippingThresholdINR: number;
    shippingFeeINR: number;
    gstRatePercent: number;
    gstIncludedInPrice: boolean;
    taxIdNumber: string;
  }>({
    freeShippingThresholdINR: 1999,
    shippingFeeINR: 150,
    gstRatePercent: 18,
    gstIncludedInPrice: true,
    taxIdNumber: '27AAACS00001Z5',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setStoreSettings({
            freeShippingThresholdINR: data.settings.freeShippingThresholdINR,
            shippingFeeINR: data.settings.shippingFeeINR,
            gstRatePercent: data.settings.gstRatePercent,
            gstIncludedInPrice: data.settings.gstIncludedInPrice,
            taxIdNumber: data.settings.taxIdNumber,
          });
        }
      })
      .catch(() => {});
  }, []);

  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const rawSubtotalINR = items.reduce(
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

  // Calculate included GST amount
  const gstRateDecimal = storeSettings.gstRatePercent / 100;
  const netBaseINR = storeSettings.gstIncludedInPrice
    ? netSubtotalINR / (1 + gstRateDecimal)
    : netSubtotalINR;
  const includedGstINR = storeSettings.gstIncludedInPrice
    ? netSubtotalINR - netBaseINR
    : netSubtotalINR * gstRateDecimal;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      return;
    }
    // Online payment gateway is temporarily disabled. Display payment outage modal.
    setIsPaymentNoticeOpen(true);
  };

  // Order Confirmed View
  if (completedOrder) {
    return (
      <div className="bg-[#F5F1E8] min-h-screen py-10 sm:py-16 text-[#171715]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-[#EBE6DC] rounded-3xl p-8 sm:p-12 border border-[#DFD8CC] shadow-sm text-center">
            
            <div className="w-16 h-16 bg-[#DCE96A] text-[#171715] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#626849] block mb-2">
              Order Confirmed
            </span>

            <h1 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-tight text-[#171715]">
              THANK YOU FOR YOUR ORDER.
            </h1>

            <p className="mt-3 text-sm text-[#5E5A50] max-w-lg mx-auto">
              Your order <strong className="text-[#171715]">{completedOrder.orderId}</strong> has been successfully placed. We are preparing your pairs for shipment.
            </p>

            {/* Order Details Receipt Box */}
            <div className="bg-[#F5F1E8] rounded-2xl p-6 border border-[#DFD8CC] text-left mt-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E2DDD0] text-xs">
                <span className="text-[#7A7569]">Order Reference:</span>
                <span className="font-bold text-[#171715]">{completedOrder.orderId}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#E2DDD0] text-xs">
                <span className="text-[#7A7569]">Recipient:</span>
                <span className="font-medium text-[#171715]">{completedOrder.customerName} ({completedOrder.phone})</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#E2DDD0] text-xs">
                <span className="text-[#7A7569]">Delivery Address:</span>
                <span className="font-medium text-[#171715] text-right">{completedOrder.address}, {completedOrder.city}, {completedOrder.state} {completedOrder.pincode}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#E2DDD0] text-xs">
                <span className="text-[#7A7569]">Payment Method:</span>
                <span className="font-medium text-[#171715]">{completedOrder.paymentMethod}</span>
              </div>

              {/* Items List */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#171715] block mb-3">
                  Purchased Items ({completedOrder.items.length})
                </span>
                <div className="space-y-3">
                  {completedOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-white shrink-0"
                        />
                        <div>
                          <span className="font-bold text-[#171715] block">{it.product.name}</span>
                          <span className="text-[#7A7569]">UK {it.selectedSize} · {it.selectedColor.name} · Qty: {it.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#171715]">
                        {formatPrice(it.product.priceINR * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2DDD0] flex justify-between items-center">
                <span className="font-bold text-sm text-[#171715]">Total Amount Paid</span>
                <span className="font-bold text-lg text-[#171715]">
                  {formatPrice(completedOrder.totalINR)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C8679] mt-6">
              This is a frontend demonstration store. No real transaction has occurred.
            </p>

            <div className="mt-8">
              <button
                onClick={onBackToShopping}
                className="bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full transition-all cursor-pointer shadow-sm"
              >
                Continue Shopping
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Active Checkout View
  return (
    <div className="bg-[#F5F1E8] min-h-screen py-8 sm:py-12 text-[#171715]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Link */}
        <div className="mb-6 pb-4 border-b border-[#E8E2D5] flex items-center justify-between">
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#626849] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Shopping</span>
          </button>

          <span className="font-display font-bold text-xl tracking-[0.2em] uppercase text-[#171715]">
            SOLEFORM CHECKOUT
          </span>
        </div>

        {/* Online Payment Unavailable Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-[#EAE5DA] border border-[#CDC5B4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#171715] text-[#DCE96A] flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#171715]">
                ONLINE PAYMENT TEMPORARILY UNAVAILABLE
              </h4>
              <p className="text-xs text-[#5E5A50] mt-0.5 leading-relaxed">
                Our online payment gateway is temporarily unavailable. You can still place your order conveniently through WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOrderViaWhatsApp) onOrderViaWhatsApp();
              else setIsPaymentNoticeOpen(true);
            }}
            className="px-6 py-3 rounded-full bg-[#171715] hover:bg-[#1E2E21] border border-[#25D366]/40 text-[#F5F1E8] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer transition-all self-stretch sm:self-auto shrink-0 shadow-xs group"
          >
            <span className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
              </svg>
            </span>
            <span>ORDER VIA WHATSAPP</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#EBE6DC] rounded-3xl p-12 text-center max-w-lg mx-auto border border-[#DFD8CC]">
            <ShoppingBag className="w-12 h-12 text-[#7A7569] mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl uppercase text-[#171715] mb-2">
              Your bag is empty
            </h2>
            <p className="text-xs text-[#5E5A50] mb-6">
              Add some footwear before proceeding to checkout.
            </p>
            <button
              onClick={onBackToShopping}
              className="bg-[#171715] text-[#F5F1E8] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left 7 Cols: Customer Info & Address */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* 1. Contact Info */}
              <div className="bg-[#EBE6DC] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC]">
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#171715] mb-4">
                  1. Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Email Address * (for order tracking)
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="bg-[#EBE6DC] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC]">
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#171715] mb-4">
                  2. Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Street Address / Flat / Building *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      PIN / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-white/90 border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5E5A50] font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                      Country
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="India"
                      className="w-full bg-black/5 border border-[#CDC5B4] rounded-xl px-3.5 py-2.5 text-xs text-[#5E5A50]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-[#EBE6DC] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC]">
                <h2 className="font-display font-bold text-xl uppercase tracking-wider text-[#171715] mb-4">
                  3. Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { id: 'UPI', label: 'UPI / Google Pay', icon: Smartphone },
                    { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = formData.paymentMethod === method.id;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#171715] bg-[#F5F1E8] shadow-xs'
                            : 'border-[#CDC5B4] bg-white/60 hover:bg-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#171715]' : 'text-[#7A7569]'}`} />
                        <span className={`font-bold ${isSelected ? 'text-[#171715]' : 'text-[#5E5A50]'}`}>
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Order Summary & Review */}
            <div className="lg:col-span-5">
              <div className="bg-[#EBE6DC] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC] sticky top-24 space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-[#DFD8CC]">
                  <h3 className="font-display font-bold text-xl uppercase tracking-wider text-[#171715]">
                    Order Summary
                  </h3>
                  <span className="text-xs text-[#7A7569] font-semibold">
                    {items.reduce((s, i) => s + i.quantity, 0)} Items
                  </span>
                </div>

                {/* Items in Summary with +/- and Remove */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#F5F1E8] p-3 rounded-xl border border-[#DFD8CC] flex gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-white shrink-0"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#171715] leading-tight">
                              {item.product.name}
                            </h4>
                            <span className="text-[11px] text-[#7A7569]">
                              UK {item.selectedSize} · {item.selectedColor.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#8C8679] hover:text-[#C94A38] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#DFD8CC]/60 text-xs">
                          <span className="font-bold text-[#171715]">
                            {formatPrice(item.product.priceINR * item.quantity)}
                          </span>

                          {/* Stepper */}
                          <div className="flex items-center border border-[#CDC5B4] rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="px-2 py-0.5 text-xs hover:bg-[#EBE5DA] rounded-l-md font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-[#171715]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="px-2 py-0.5 text-xs hover:bg-[#EBE5DA] rounded-r-md font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input Section */}
                <div className="pt-4 border-t border-[#DFD8CC]">
                  {appliedCoupon ? (
                    <div className="bg-[#DCE96A]/20 border border-[#8C9B32] rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#3A5328]" />
                        <div>
                          <span className="font-mono font-bold text-[#171715] block">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] text-[#3A5328] font-medium">
                            {appliedCoupon.message}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[#8C8679] hover:text-[#C94A38] text-xs font-bold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="space-y-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                            placeholder="Enter Promo Code (e.g. WELCOME10)"
                            className="w-full bg-white border border-[#CDC5B4] focus:border-[#171715] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none placeholder:font-sans placeholder:normal-case"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={promoLoading}
                          className="bg-[#171715] text-[#F5F1E8] hover:bg-black font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                        >
                          {promoLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'APPLY'
                          )}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-[#C94A38] font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{promoError}</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Subtotals & Grand Total */}
                <div className="space-y-2 text-xs pt-4 border-t border-[#DFD8CC] text-[#5E5A50]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#171715]">{formatPrice(rawSubtotalINR)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#3A5328] font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Discount ({appliedCoupon.code})
                      </span>
                      <span className="font-bold">
                        -{formatPrice(appliedCoupon.discountINR)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Standard Express Delivery</span>
                    <span className="font-bold text-[#171715]">
                      {isFreeShipping ? 'FREE' : formatPrice(shippingINR)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-[#8C8275] italic pt-1 border-t border-dashed border-[#E5DEC3]">
                    <span>Includes {storeSettings.gstRatePercent}% GST Tax:</span>
                    <span>{formatPrice(Math.round(includedGstINR))}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-[#DFD8CC] text-base text-[#171715]">
                    <span className="font-display font-bold uppercase text-lg">Total Amount</span>
                    <div className="text-right">
                      <span className="font-display font-bold text-2xl text-[#171715] block">
                        {formatPrice(grandTotalINR)}
                      </span>
                      {storeSettings.taxIdNumber && (
                        <span className="text-[10px] text-[#8C8275] font-mono block">
                          GSTIN: {storeSettings.taxIdNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider py-4 rounded-full transition-all active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'PROCESSING ORDER...' : 'PLACE ORDER NOW'}
                </button>

                {/* Direct WhatsApp Ordering Alternative */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOrderViaWhatsApp) onOrderViaWhatsApp();
                    else setIsPaymentNoticeOpen(true);
                  }}
                  className="w-full bg-[#171715] hover:bg-[#1E2E21] border border-[#25D366]/40 text-[#F5F1E8] font-bold text-xs uppercase tracking-widest py-4 rounded-full flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm cursor-pointer group mt-2"
                >
                  <span className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
                    </svg>
                  </span>
                  <span>ORDER VIA WHATSAPP</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#8C8679] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#171715]" />
                  <span>256-Bit SSL Encrypted Checkout · 30-Day Guarantee</span>
                </div>

              </div>
            </div>

          </form>
        )}

      </div>

      {/* Online Payment Temporarily Unavailable Notice Modal */}
      <OnlinePaymentNoticeModal
        isOpen={isPaymentNoticeOpen}
        onClose={() => setIsPaymentNoticeOpen(false)}
        currency={currency}
        orderContext={{
          type: 'cart',
          itemCount: items.length,
          totalINR: grandTotalINR,
        }}
        onOrderViaWhatsApp={() => {
          setIsPaymentNoticeOpen(false);
          if (onOrderViaWhatsApp) onOrderViaWhatsApp();
        }}
      />
    </div>
  );
};
