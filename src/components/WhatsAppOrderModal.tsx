import React, { useState } from 'react';
import { 
  X, Check, MapPin, Phone, Mail, User as UserIcon, 
  ArrowRight, ShieldCheck, FileText, CheckCircle2,
  AlertCircle, ChevronDown, Sparkles, Building, Home, Truck, ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, ColorSwatch, Currency, User, Address, CartItem } from '../types';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Either single product order
  product?: Product;
  selectedColor?: ColorSwatch;
  selectedSize?: number;
  quantity?: number;
  // OR shopping cart order
  cartItems?: CartItem[];
  currency: Currency;
  user: User | null;
  addresses: Address[];
  isLoadingAddresses: boolean;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateAddAddress: () => void;
  onNavigateEditAddress?: (address: Address) => void;
  onNavigateUpdateProfile: () => void;
  onOrderCompleted?: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedColor,
  selectedSize,
  quantity = 1,
  cartItems,
  currency,
  user,
  addresses,
  isLoadingAddresses,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateAddAddress,
  onNavigateEditAddress,
  onNavigateUpdateProfile,
  onOrderCompleted,
}) => {
  const [whatsAppBusinessNumber, setWhatsAppBusinessNumber] = useState<string>('919134280545');

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings && data.settings.whatsAppConciergeNumber) {
          const cleaned = data.settings.whatsAppConciergeNumber.replace(/[^\d]/g, '');
          if (cleaned) setWhatsAppBusinessNumber(cleaned);
        }
      })
      .catch(() => {});
  }, []);
  // Find default address or first address
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress ? defaultAddress.id : '');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [showFullPreview, setShowFullPreview] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync selectedAddressId when addresses load
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  if (!isOpen) return null;

  const isCartOrder = Boolean(cartItems && cartItems.length > 0);

  // Format currency helpers
  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  // Pricing calculations
  const totalCartUnits = isCartOrder && cartItems
    ? cartItems.reduce((acc, it) => acc + it.quantity, 0)
    : quantity;

  const totalOrderINR = isCartOrder && cartItems
    ? cartItems.reduce((acc, it) => acc + it.product.priceINR * it.quantity, 0)
    : (product ? product.priceINR * quantity : 0);

  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || defaultAddress;

  // Determine profile readiness
  const isUserAuthenticated = Boolean(user);
  const hasPhone = Boolean(user?.phone && user.phone.trim().length >= 8);
  const hasAddress = addresses.length > 0 && Boolean(activeAddress);
  const isProfileComplete = isUserAuthenticated && hasPhone && hasAddress;

  // Generate SKU identifier helper
  const getProductSku = (prod: Product) => `SF-${prod.id.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;

  // Build formatted WhatsApp message
  const buildWhatsAppMessage = (): string => {
    const customerPhone = user?.phone || activeAddress?.phoneNumber || 'Not provided';
    const recipientPhone = activeAddress?.phoneNumber || customerPhone;

    let addressBlock = '';
    if (activeAddress) {
      const lines = [
        `*Recipient Name:* ${activeAddress.recipientName}`,
        `*Contact Phone:* ${recipientPhone}`,
        `*Address Type:* ${activeAddress.label || 'Home'}`,
        `*House/Building & Street:* ${activeAddress.addressLine1}`,
      ];
      if (activeAddress.locality) lines.push(`*Locality:* ${activeAddress.locality}`);
      if (activeAddress.landmark) lines.push(`*Landmark:* ${activeAddress.landmark}`);
      lines.push(`*City / District:* ${activeAddress.city}${activeAddress.district ? `, ${activeAddress.district}` : ''}`);
      lines.push(`*State / PIN Code:* ${activeAddress.state} - ${activeAddress.pincode}`);
      lines.push(`*Country:* ${activeAddress.country || 'India'}`);
      addressBlock = lines.join('\n');
    } else {
      addressBlock = '_No delivery address attached._';
    }

    const messageLines: string[] = [];

    if (isCartOrder && cartItems && cartItems.length > 0) {
      // Multi-product Shopping Bag Order
      messageLines.push(`*SOLEFORM — ORDER REQUEST (SHOPPING BAG)*`);
      messageLines.push(`---------------------------------`);
      messageLines.push(`*ORDER ITEMS (${cartItems.length} styles, ${totalCartUnits} pairs):*`);
      messageLines.push(``);

      cartItems.forEach((item, index) => {
        const itemSku = getProductSku(item.product);
        const itemLineTotal = item.product.priceINR * item.quantity;
        messageLines.push(
          `${index + 1}. *${item.product.name}* (SKU: ${itemSku})\n` +
          `   • Color: ${item.selectedColor.name}\n` +
          `   • Size: UK ${item.selectedSize}\n` +
          `   • Quantity: ${item.quantity} × ₹${item.product.priceINR.toLocaleString('en-IN')} = ₹${itemLineTotal.toLocaleString('en-IN')}`
        );
        messageLines.push(``);
      });

      messageLines.push(`---------------------------------`);
      messageLines.push(`*Order Subtotal:* ₹${totalOrderINR.toLocaleString('en-IN')}`);
      messageLines.push(`*Shipping Charge:* FREE (Standard Express)`);
      messageLines.push(`*Final Total:* ₹${totalOrderINR.toLocaleString('en-IN')}`);
    } else if (product && selectedColor && selectedSize !== undefined) {
      // Individual Product Order
      const singleSku = getProductSku(product);
      messageLines.push(`*SOLEFORM — ORDER REQUEST*`);
      messageLines.push(`---------------------------------`);
      messageLines.push(`*Product:* ${product.name}`);
      messageLines.push(`*SKU:* ${singleSku}`);
      messageLines.push(`*Color:* ${selectedColor.name}`);
      messageLines.push(`*Size:* UK ${selectedSize}`);
      messageLines.push(`*Quantity:* ${quantity}`);
      messageLines.push(`*Unit Price:* ₹${product.priceINR.toLocaleString('en-IN')}`);
      messageLines.push(`*Line Total:* ₹${totalOrderINR.toLocaleString('en-IN')}`);
      messageLines.push(``);
      messageLines.push(`*Order Subtotal:* ₹${totalOrderINR.toLocaleString('en-IN')}`);
      messageLines.push(`*Shipping Charge:* FREE (Standard Express)`);
      messageLines.push(`*Final Total:* ₹${totalOrderINR.toLocaleString('en-IN')}`);
    } else {
      messageLines.push(`*SOLEFORM — ORDER REQUEST*`);
    }

    messageLines.push(`---------------------------------`);
    messageLines.push(`*CUSTOMER DETAILS:*`);
    messageLines.push(`*Full Name:* ${user?.name || 'Valued Customer'}`);
    messageLines.push(`*Phone:* ${customerPhone}`);
    messageLines.push(`*Email:* ${user?.email || 'Not provided'}`);
    messageLines.push(``);
    messageLines.push(`*DELIVERY DESTINATION:*`);
    messageLines.push(addressBlock);

    if (deliveryNotes.trim()) {
      messageLines.push(``);
      messageLines.push(`*Delivery Notes / Instructions:* ${deliveryNotes.trim()}`);
    }

    messageLines.push(``);
    messageLines.push(`---------------------------------`);
    messageLines.push(`_Kindly verify product availability and share order confirmation and payment link or COD details. Thank you!_`);

    return messageLines.join('\n');
  };

  const formattedMessage = buildWhatsAppMessage();

  const handleLaunchWhatsApp = () => {
    if (!isProfileComplete) return;
    const encoded = encodeURIComponent(formattedMessage);
    const url = `https://wa.me/${whatsAppBusinessNumber}?text=${encoded}`;
    
    // Open WhatsApp link in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    
    if (onOrderCompleted) {
      onOrderCompleted();
    }
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedMessage).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-[#F5F1E8] rounded-[28px] border border-[#DFD8CC] shadow-2xl overflow-hidden my-6 text-[#171715]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-7 pb-4 bg-[#F5F1E8] border-b border-[#E8E2D5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-6.5 h-6.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xl sm:text-2xl text-[#171715] tracking-tight leading-tight">
                Order via WhatsApp
              </h3>
              <p className="text-xs text-[#7A7569] font-medium mt-0.5">
                SOLEFORM Priority Concierge <span className="mx-1">•</span> +91 91342 80545
              </p>
              <p className="text-[11px] text-[#8C8679] mt-0.5">
                Get quick confirmation on WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#EBE6DC] hover:bg-[#E2DCCE] text-[#5E5A50] hover:text-[#171715] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* GATE 1: Unauthenticated User */}
          {!isUserAuthenticated && (
            <div className="bg-[#EAE5DA] border border-[#DDD6C8] rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#171715] text-[#F5F1E8] flex items-center justify-center shadow-xs">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-bold text-lg text-[#171715]">
                  Sign In Required for WhatsApp Orders
                </h4>
                <p className="text-xs text-[#5E5A50] leading-relaxed">
                  WhatsApp direct ordering attaches verified order protection, real-time dispatch tracking, and personal concierge confirmation. Please sign in or register your account to continue.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateLogin();
                  }}
                  className="px-6 py-3.5 rounded-full bg-[#171715] hover:bg-black text-[#F5F1E8] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Log In to Continue
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateRegister();
                  }}
                  className="px-6 py-3.5 rounded-full border border-[#CDC5B4] text-[#171715] hover:bg-[#E2DCCE] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            </div>
          )}

          {/* GATE 2: Incomplete Profile (Missing Phone or Address) */}
          {isUserAuthenticated && (!hasPhone || !hasAddress) && (
            <div className="bg-[#EAE5DA] border border-[#DDD6C8] rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#171715] text-[#DCE96A] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#171715]">
                    Profile Completion Required
                  </h4>
                  <p className="text-xs text-[#5E5A50] mt-1 leading-relaxed">
                    To generate a complete dispatch manifest for our WhatsApp concierge, your profile requires a contact phone number and at least one saved delivery address.
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-[#F5F1E8] rounded-xl p-4 border border-[#DFD8CC] space-y-3 text-xs">
                {/* Phone Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#7A7569]" />
                    <span className="font-semibold text-[#171715]">Contact Phone Number</span>
                  </div>
                  {hasPhone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4D2E]">
                      <Check className="w-4 h-4 text-[#25D366]" /> Added ({user?.phone})
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateUpdateProfile();
                      }}
                      className="text-xs font-bold text-[#C94A38] hover:underline cursor-pointer"
                    >
                      + Add Phone Number
                    </button>
                  )}
                </div>

                <div className="h-px bg-[#DFD8CC]" />

                {/* Address Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7A7569]" />
                    <span className="font-semibold text-[#171715]">Delivery Address</span>
                  </div>
                  {hasAddress ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4D2E]">
                      <Check className="w-4 h-4 text-[#25D366]" /> {addresses.length} Saved
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateAddAddress();
                      }}
                      className="text-xs font-bold text-[#C94A38] hover:underline cursor-pointer"
                    >
                      + Add Delivery Address
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-full border border-[#CDC5B4] text-xs font-semibold text-[#5E5A50] hover:text-[#171715] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {!hasPhone ? (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateUpdateProfile();
                    }}
                    className="px-6 py-3 rounded-full bg-[#171715] hover:bg-black text-[#F5F1E8] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Update Contact Phone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateAddAddress();
                    }}
                    className="px-6 py-3 rounded-full bg-[#171715] hover:bg-black text-[#F5F1E8] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Add Delivery Address</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STATE 3: Complete Profile - Address Selector & WhatsApp Order Confirmation */}
          {isProfileComplete && (
            <>
              {/* Product & Order Summary Section */}
              {isCartOrder && cartItems ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-[#171715] flex items-center gap-2">
                      <ShoppingBag className="w-4.5 h-4.5 text-[#171715]" />
                      <span>Shopping Bag Items ({cartItems.length} styles, {totalCartUnits} pairs)</span>
                    </span>
                    <span className="font-bold text-sm text-[#171715]">
                      Total: {formatPrice(totalOrderINR)}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {cartItems.map((item) => {
                      const itemSku = getProductSku(item.product);
                      return (
                        <div key={item.id} className="bg-[#EAE5DA] rounded-2xl p-4 border border-[#DDD6C8] flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#DDD7C9] overflow-hidden shrink-0 flex items-center justify-center p-2 mx-auto sm:mx-0">
                            <img
                              src={item.selectedColor.imageUrl || item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-contain drop-shadow-sm"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="bg-[#E0DACC] text-[#5E5A50] text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md tracking-wider uppercase">
                                {itemSku}
                              </span>
                              <span className="text-xs text-[#7A7569] font-medium">
                                {item.product.category || "Men's Sneakers"}
                              </span>
                            </div>
                            <h4 className="font-bold text-lg text-[#171715] tracking-tight">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[#5E5A50] flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full inline-block border border-black/15" style={{ backgroundColor: item.selectedColor.hex }} />
                                <strong className="text-[#171715]">{item.selectedColor.name}</strong>
                              </span>
                              <span className="text-[#CDC5B4]">|</span>
                              <span>Size: <strong className="text-[#171715]">UK {item.selectedSize}</strong></span>
                              <span className="text-[#CDC5B4]">|</span>
                              <span>Qty: <strong className="text-[#171715]">{item.quantity}</strong></span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span className="font-bold text-xl text-[#171715]">
                                {formatPrice(item.product.priceINR * item.quantity)}
                              </span>
                              <div className="bg-[#E2ECE0] text-[#1B4D2E] text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                <span>Free Express Delivery</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : product && selectedColor && selectedSize !== undefined ? (
                /* SINGLE PRODUCT ORDER CARD MATCHING REFERENCE IMAGE */
                <div className="bg-[#EAE5DA] rounded-2xl p-4 sm:p-5 border border-[#DDD6C8] flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-center">
                  {/* Image Container */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#DDD7C9] overflow-hidden shrink-0 flex items-center justify-center p-2.5 mx-auto sm:mx-0">
                    <img
                      src={selectedColor.imageUrl || product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform hover:scale-105 duration-200"
                    />
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                    {/* Top Meta Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-[#E0DACC] text-[#5E5A50] text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                        {getProductSku(product)}
                      </span>
                      <span className="text-xs text-[#7A7569] font-medium truncate">
                        {product.category || "Men's Sneakers"}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xl sm:text-2xl text-[#171715] tracking-tight leading-snug">
                      {product.name}
                    </h4>

                    {/* Variant Summary Row */}
                    <div className="flex items-center gap-2 text-xs text-[#5E5A50] flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block border border-black/15 shadow-2xs"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <span className="font-semibold text-[#171715]">{selectedColor.name}</span>
                      </span>
                      <span className="text-[#CDC5B4]">|</span>
                      <span>
                        Size: <strong className="text-[#171715] font-bold">UK {selectedSize}</strong>
                      </span>
                      <span className="text-[#CDC5B4]">|</span>
                      <span>
                        Qty: <strong className="text-[#171715] font-bold">{quantity}</strong>
                      </span>
                    </div>

                    {/* Price & Express Delivery Badge Row */}
                    <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                      <span className="font-bold text-2xl sm:text-3xl text-[#171715] tracking-tight">
                        {formatPrice(totalOrderINR)}
                      </span>

                      <div className="bg-[#E2ECE0] text-[#1B4D2E] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Free Express Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Delivery Address Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-base text-[#171715] flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#171715]" />
                    <span>Select Delivery Address</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateAddAddress();
                    }}
                    className="bg-[#E0DACC] hover:bg-[#D4CEB0] text-[#171715] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-bold">+</span>
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl text-left cursor-pointer transition-all flex flex-col gap-2 relative ${
                          isSelected
                            ? 'bg-[#EAE5DA] border-2 border-[#1E2E21] shadow-2xs'
                            : 'bg-[#EAE5DA]/60 hover:bg-[#EAE5DA] border border-[#DFD8CC]'
                        }`}
                      >
                        {/* Top Row: Radio + Name + Badges + Phone + Edit Chevron */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Custom Radio Circle */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'border-[#1E2E21]' : 'border-[#CDC5B4]'
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1E2E21]" />}
                          </div>

                          <span className="font-bold text-sm sm:text-base text-[#171715]">
                            {addr.recipientName}
                          </span>

                          {/* Label Badge (e.g. HOME / WORK) */}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              addr.label?.toLowerCase() === 'work'
                                ? 'bg-[#E2DCCE] text-[#635E50]'
                                : 'bg-[#D8E2D5] text-[#1E3A24]'
                            }`}
                          >
                            {addr.label || 'HOME'}
                          </span>

                          {/* Default Badge */}
                          {addr.isDefault && (
                            <span className="bg-[#E2DCCE] text-[#635E50] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                              DEFAULT
                            </span>
                          )}

                          {/* Phone Number */}
                          <span className="text-xs text-[#5E5A50] font-mono ml-auto">
                            {addr.phoneNumber}
                          </span>

                          {/* Edit Address Chevron Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateEditAddress) {
                                onClose();
                                onNavigateEditAddress(addr);
                              } else {
                                onClose();
                                onNavigateAddAddress();
                              }
                            }}
                            title="Edit Address"
                            className="p-1 text-[#7A7569] hover:text-[#171715] transition-colors cursor-pointer"
                          >
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                          </button>
                        </div>

                        {/* Address Line */}
                        <div className="flex items-start gap-2 text-xs text-[#5E5A50] pl-7 leading-relaxed">
                          {addr.label?.toLowerCase() === 'work' ? (
                            <Building className="w-3.5 h-3.5 text-[#7A7569] shrink-0 mt-0.5" />
                          ) : (
                            <Home className="w-3.5 h-3.5 text-[#7A7569] shrink-0 mt-0.5" />
                          )}
                          <span>
                            {addr.addressLine1}
                            {addr.locality ? `, ${addr.locality}` : ''}
                            {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}, {addr.city},{' '}
                            {addr.state} - {addr.pincode}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Instructions / Special Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sm text-[#171715] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#171715]" />
                    <span>Delivery Instructions / Special Notes</span>
                  </label>
                  <span className="text-xs text-[#7A7569]">Optional</span>
                </div>

                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Leave with building security, call upon arrival, landmark near gate..."
                  rows={2}
                  className="w-full bg-[#EAE5DA] rounded-2xl border border-[#DFD8CC] p-3.5 text-xs text-[#171715] placeholder-[#A09A8C] focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none resize-none transition-all"
                />
              </div>

              {/* Expandable Review Formatted WhatsApp Message */}
              <div className="border border-[#DFD8CC] rounded-2xl overflow-hidden bg-[#EAE5DA]">
                <button
                  type="button"
                  onClick={() => setShowFullPreview(!showFullPreview)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#171715] hover:bg-[#E2DCCE] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#25D366]" />
                    <span>Review Formatted WhatsApp Message</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7569] transition-transform duration-200 ${
                      showFullPreview ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showFullPreview && (
                  <div className="p-4 border-t border-[#DFD8CC] bg-[#F5F1E8] space-y-3">
                    <div className="p-3 bg-[#EAE5D9] rounded-xl font-mono text-[11px] leading-relaxed text-[#171715] whitespace-pre-wrap max-h-56 overflow-y-auto border border-[#DFD8CC]">
                      {formattedMessage}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="text-xs font-bold text-[#626849] hover:underline cursor-pointer flex items-center gap-1.5"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#3B6E44]" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <span>Copy Message Text</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            {/* Bottom Action Buttons (Stacked matching reference image) */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="w-full bg-[#1E3A2B] hover:bg-[#14271D] text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md active:scale-98 group"
              >
                <span className="w-5 h-5 fill-current text-[#25D366] group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
                  </svg>
                </span>
                <span className="text-sm sm:text-base tracking-wide">Send Order on WhatsApp</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-transparent border border-[#CDC5B4] hover:bg-[#EAE5DA] text-[#171715] font-semibold text-sm py-3.5 px-6 rounded-full transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        </div>
      </motion.div>
    </div>
  );
};
