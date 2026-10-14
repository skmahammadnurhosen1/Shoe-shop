import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Ruler } from 'lucide-react';
import { Product, ColorSwatch, Currency } from '../types';
import { SizeGuideModal } from './SizeGuideModal';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, color: ColorSwatch, size: number) => void;
  onViewDetails?: (product: Product, color: ColorSwatch, size: number) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  currency,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorSwatch>(product ? product.colors[0] : { name: '', hex: '' });
  const [selectedSize, setSelectedSize] = useState<number>(product ? (product.sizes[1] || product.sizes[0]) : 8);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[1] || product.sizes[0]);
    }
  }, [product]);

  // Lock body scroll and listen for Escape key while modal is open
  useEffect(() => {
    if (!product) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleAdd = () => {
    onAddToCart(product, selectedColor, selectedSize);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product quick view"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#F5F1E8] rounded-2xl max-w-3xl lg:max-w-4xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#DFD8CC] relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Pinned at top-right of modal card with high z-index and comfortable 44px touch target on mobile */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          title="Close (Esc)"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-[#5E5A50] hover:text-[#171715] rounded-full bg-[#F5F1E8]/95 sm:bg-[#F5F1E8]/90 hover:bg-[#EBE5DA] backdrop-blur-xs border border-[#DDD6C8] shadow-xs hover:shadow-sm transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#171715]/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Independently scrollable modal content so close button stays accessible across any scroll depth */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Product Image */}
            <div className="bg-[#EBE6DC] p-6 flex items-center justify-center relative min-h-[220px] sm:min-h-[280px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 w-auto object-contain rounded-xl drop-shadow-md"
            />
          </div>

          {/* Right: Product Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-[#7A7569] mb-1">
                <span>{product.category}</span>
                <div className="flex items-center gap-1 text-[#171715]">
                  <Star className="w-3.5 h-3.5 fill-[#171715]" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-[#8C8679]">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Title & Price */}
              <h3 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-[#171715]">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-1 mb-4">
                <span className="font-bold text-xl text-[#171715]">
                  {formatPrice(product.priceINR)}
                </span>
                {product.originalPriceINR && (
                  <span className="text-xs text-[#8C8679] line-through">
                    {formatPrice(product.originalPriceINR)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#5E5A50] leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Color Swatches */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-[#171715] block mb-1.5">
                  Color: <span className="text-[#7A7569] font-normal">{selectedColor.name}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((color) => {
                    const active = selectedColor.name === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          active
                            ? 'ring-2 ring-offset-2 ring-[#171715] scale-110'
                            : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-[#171715] mb-1.5">
                  <span>Size (UK / India)</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#7A7569] font-normal underline hover:text-[#171715] transition-colors cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'bg-[#171715] text-[#F5F1E8] border-[#171715]'
                          : 'bg-white/80 text-[#171715] border-[#CDC5B4] hover:border-[#171715]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Add to bag, View Details & Wishlist */}
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex items-center gap-2 flex-1 sm:flex-[1.4] min-w-0">
                  <button
                    onClick={handleAdd}
                    className="flex-1 min-w-0 whitespace-nowrap bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap font-bold">ADD TO BAG</span>
                  </button>

                  {/* Wishlist button on mobile (placed beside Add to Bag) */}
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    aria-label="Wishlist toggle"
                    className={`sm:hidden w-11 h-11 shrink-0 rounded-full border border-[#CDC5B4] hover:border-[#171715] flex items-center justify-center transition-colors cursor-pointer ${
                      isWishlisted ? 'text-[#C94A38] border-[#C94A38]' : 'text-[#171715]'
                    }`}
                  >
                    <Heart
                      className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-[#C94A38]' : 'fill-none'}`}
                    />
                  </button>
                </div>

                {onViewDetails && (
                  <button
                    onClick={() => {
                      onViewDetails(product, selectedColor, selectedSize);
                      onClose();
                    }}
                    className="flex-1 sm:flex-[1.1] min-w-0 whitespace-nowrap border border-[#171715] hover:bg-[#171715] hover:text-[#F5F1E8] text-[#171715] font-bold text-xs uppercase tracking-wider py-3.5 px-3.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <span className="whitespace-nowrap font-bold">VIEW DETAILS</span>
                    <span className="text-sm leading-none">→</span>
                  </button>
                )}

                {/* Wishlist button on desktop (placed at end of row) */}
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Wishlist toggle"
                  className={`hidden sm:flex w-11 h-11 shrink-0 rounded-full border border-[#CDC5B4] hover:border-[#171715] items-center justify-center transition-colors cursor-pointer ${
                    isWishlisted ? 'text-[#C94A38] border-[#C94A38]' : 'text-[#171715]'
                  }`}
                >
                  <Heart
                    className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-[#C94A38]' : 'fill-none'}`}
                  />
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-4 pt-4 border-t border-[#DFD8CC] grid grid-cols-3 gap-2 text-[10px] text-[#7A7569]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#171715]" />
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#171715]" />
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#171715]" />
                  <span>100% Authentic</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        </div>

      </div>

      {/* Embedded Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        selectedSize={selectedSize}
        onSelectSize={(sz) => setSelectedSize(sz)}
      />
    </div>
  );
};
