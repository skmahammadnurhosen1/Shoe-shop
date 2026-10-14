import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Heart, ShoppingBag, Zap, Star, ShieldCheck, 
  Truck, RotateCcw, Check, Sparkles, AlertCircle, Ruler, Sparkle, CheckCircle2, Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, ColorSwatch, Currency, Address, Review } from '../types';
import { PRODUCTS } from '../data/shoes';
import { SizeGuideModal } from './SizeGuideModal';
import { WhatsAppOrderModal } from './WhatsAppOrderModal';
import { OnlinePaymentNoticeModal } from './OnlinePaymentNoticeModal';
import { WriteReviewModal } from './WriteReviewModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { useAuth } from '../context/AuthContext';

interface ProductDetailsPageProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  wishlistIds?: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, color: ColorSwatch, size: number, quantity: number) => void;
  onOrderNow: (product: Product, color: ColorSwatch, size: number, quantity: number) => void;
  onBack: () => void;
  initialColor?: ColorSwatch;
  initialSize?: number;
  onSelectProduct?: (product: Product) => void;
  allProducts?: Product[];
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateAddAddress?: () => void;
  onNavigateUpdateProfile?: () => void;
  onToast?: (message: string) => void;
  onWhatsAppOrderInitiated?: (details: { product: Product; color: ColorSwatch; size: number; quantity: number }) => void;
  autoOpenWhatsAppModal?: boolean;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  currency,
  isWishlisted,
  wishlistIds = [],
  onToggleWishlist,
  onAddToCart,
  onOrderNow,
  onBack,
  initialColor,
  initialSize,
  onSelectProduct,
  allProducts,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateAddAddress,
  onNavigateUpdateProfile,
  onToast,
  onWhatsAppOrderInitiated,
  autoOpenWhatsAppModal = false,
}) => {
  const { user, token } = useAuth();
  const [selectedColor, setSelectedColor] = useState<ColorSwatch>(initialColor || product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<number>(initialSize || product.sizes[1] || product.sizes[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  // WhatsApp Ordering & Payment Notice state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(autoOpenWhatsAppModal);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState<boolean>(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);

  // Fetch updated user addresses when token is available or modal is opened
  useEffect(() => {
    let isMounted = true;
    const fetchAddresses = async () => {
      if (!token) {
        setUserAddresses([]);
        return;
      }
      setIsLoadingAddresses(true);
      try {
        const res = await fetch('/api/addresses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.addresses) {
            setUserAddresses(data.addresses);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch addresses:', err);
      } finally {
        if (isMounted) setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [token, isWhatsAppModalOpen]);

  // Sync state when product changes
  useEffect(() => {
    setSelectedColor(initialColor || product.colors[0]);
    setSelectedSize(initialSize || product.sizes[1] || product.sizes[0]);
    setQuantity(1);
    setActiveImage(product.image);
  }, [product, initialColor, initialSize]);

  // Product Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);

  // Photo Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxUser, setLightboxUser] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const handleOpenLightbox = (images: string[], index: number, userName: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxUser(userName);
    setIsLightboxOpen(true);
  };

  // Fetch reviews for current product
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (isMounted && data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Failed to load product reviews:', err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // Review calculations
  const totalReviewsCount = reviews.length;
  const avgRating = useMemo(() => {
    if (totalReviewsCount === 0) return product.rating ? product.rating.toFixed(1) : '4.9';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / totalReviewsCount).toFixed(1);
  }, [reviews, totalReviewsCount, product.rating]);

  const recommendationPercent = useMemo(() => {
    if (totalReviewsCount === 0) return 96;
    const recommended = reviews.filter((r) => r.rating >= 4).length;
    return Math.round((recommended / totalReviewsCount) * 100);
  }, [reviews, totalReviewsCount]);

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    return counts;
  }, [reviews]);

  const fitPercentages = useMemo(() => {
    if (totalReviewsCount === 0) return { 'Runs Small': 10, 'True to Size': 82, 'Runs Large': 8 };
    const counts = { 'Runs Small': 0, 'True to Size': 0, 'Runs Large': 0 };
    reviews.forEach((r) => {
      if (counts[r.fitFeedback] !== undefined) counts[r.fitFeedback]++;
    });
    return {
      'Runs Small': Math.round((counts['Runs Small'] / totalReviewsCount) * 100),
      'True to Size': Math.round((counts['True to Size'] / totalReviewsCount) * 100),
      'Runs Large': Math.round((counts['Runs Large'] / totalReviewsCount) * 100),
    };
  }, [reviews, totalReviewsCount]);

  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    if (selectedStarFilter !== 'all') {
      const starNum = Number(selectedStarFilter);
      list = list.filter((r) => r.rating === starNum);
    }
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }, [reviews, selectedStarFilter, sortBy]);

  const handleHelpful = async (reviewId: string) => {
    try {
      fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' }).catch(() => {});
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
      );
      if (onToast) onToast('Thank you for your feedback!');
    } catch (err) {
      console.error('Error marking review helpful:', err);
    }
  };

  // Similarity logic based on product category
  const similarProducts = useMemo(() => {
    const list = allProducts || PRODUCTS;
    // Exclude the current product
    const otherProducts = list.filter((p) => p.id !== product.id);

    // 1. Exact category matches (e.g. "Men's Sneakers")
    const exactCategoryMatches = otherProducts.filter(
      (p) => p.category.trim().toLowerCase() === product.category.trim().toLowerCase()
    );

    // 2. Partial category overlap or matching department
    const categoryKeywords = product.category
      .toLowerCase()
      .split(/[\s,'/]+/)
      .filter((w) => w.length > 2 && w !== 'men' && w !== 'women');

    const relatedMatches = otherProducts.filter((p) => {
      if (exactCategoryMatches.some((m) => m.id === p.id)) return false;
      const otherCat = p.category.toLowerCase();
      const sharesKeyword = categoryKeywords.some((word) => otherCat.includes(word));
      const sharesDepartment = p.department && product.department && p.department === product.department;
      return sharesKeyword || sharesDepartment;
    });

    // 3. Fallback items to ensure 4 recommendations
    const remaining = otherProducts.filter(
      (p) =>
        !exactCategoryMatches.some((m) => m.id === p.id) &&
        !relatedMatches.some((m) => m.id === p.id)
    );

    return [...exactCategoryMatches, ...relatedMatches, ...remaining].slice(0, 4);
  }, [product, allProducts]);

  const images = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleOrderNow = () => {
    // Online checkout is temporarily disabled. Display payment outage modal leading to WhatsApp.
    setIsPaymentNoticeOpen(true);
  };

  const stock = product.stockCount ?? 12;

  return (
    <div className="bg-[#F5F1E8] min-h-screen py-6 sm:py-10 text-[#171715]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Back Action */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E2D5]">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#626849] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to footwear collection</span>
          </button>

          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7569]">
            SKU: {product.sku || `SF-${product.id}`}
          </span>
        </div>

        {/* Main Grid: Gallery on left, details on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative rounded-2xl overflow-hidden bg-[#EAE4D7] border border-[#DFD8CC] aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center p-6 sm:p-10 shadow-xs">
              <img
                src={activeImage}
                alt={`${product.name} featured photograph`}
                className="w-full h-full object-cover object-center transition-all duration-500 rounded-xl"
              />
              
              {/* Category pill subtle */}
              <div className="absolute top-4 left-4 bg-[#171715]/80 text-[#F5F1E8] backdrop-blur-xs text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                {product.category}
              </div>

              {/* Wishlist Button floating */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Toggle Wishlist"
                className={`absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-xs shadow-xs transition-transform active:scale-90 cursor-pointer ${
                  isWishlisted ? 'text-[#C94A38]' : 'text-[#171715] hover:text-[#C94A38]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#C94A38]' : 'fill-none'}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`rounded-xl overflow-hidden aspect-[4/3] bg-[#EAE4D7] border-2 transition-all cursor-pointer ${
                      activeImage === img
                        ? 'border-[#171715] ring-2 ring-[#171715]/20 scale-98'
                        : 'border-[#DFD8CC] hover:border-[#171715]/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Features & Materials Highlights */}
            <div className="bg-[#EBE6DC] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC] space-y-6 mt-8">
              <div>
                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-[#171715] mb-3">
                  Craft & Construction Highlights
                </h3>
                {product.features && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#5E5A50]">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#626849] shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {product.materials && (
                <div className="pt-4 border-t border-[#DFD8CC]/80">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#171715] mb-1">
                    Material Composition
                  </h4>
                  <p className="text-xs text-[#5E5A50] leading-relaxed">
                    {product.materials}
                  </p>
                </div>
              )}

              {product.careInstructions && (
                <div className="pt-4 border-t border-[#DFD8CC]/80">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#171715] mb-1">
                    Care Guidelines
                  </h4>
                  <p className="text-xs text-[#5E5A50] leading-relaxed">
                    {product.careInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Buying Configuration */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#7A7569] mb-2">
                  <span className="font-semibold uppercase tracking-wider">{product.department}</span>
                  <div className="flex items-center gap-1.5 text-[#171715]">
                    <Star className="w-4 h-4 fill-[#171715]" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-[#8C8679]">({product.reviewsCount} customer reviews)</span>
                  </div>
                </div>

                <h1 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-tight text-[#171715] leading-[0.95]">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="font-bold text-2xl sm:text-3xl text-[#171715]">
                    {formatPrice(product.priceINR)}
                  </span>
                  {product.originalPriceINR && (
                    <span className="text-sm text-[#8C8679] line-through">
                      {formatPrice(product.originalPriceINR)}
                    </span>
                  )}
                  {product.originalPriceINR && (
                    <span className="bg-[#DCE96A] text-[#171715] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Save {Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100)}%
                    </span>
                  )}
                </div>

                {/* Stock Indicator */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#528C4A] animate-pulse" />
                  <span className="font-semibold text-[#3D6936]">
                    In Stock ({stock} pairs remaining)
                  </span>
                  <span className="text-[#8C8679]">· Ready to dispatch in 24 hours</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-[#E8E2D5]">
                <p className="text-sm text-[#5E5A50] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              <div className="pt-4 border-t border-[#E8E2D5]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171715]">
                    Colorway: <span className="text-[#626849] font-normal normal-case">{selectedColor.name}</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {product.colors.map((color) => {
                    const active = selectedColor.name === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`group flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all cursor-pointer ${
                          active
                            ? 'border-[#171715] bg-[#E8E2D5]'
                            : 'border-[#DFD8CC] hover:border-[#171715]/40 bg-white/50'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium text-[#171715]">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div className="pt-4 border-t border-[#E8E2D5]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171715]">
                    Select Size (UK / India)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7A7569] underline cursor-pointer hover:text-[#171715] transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size & Fit Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#171715] text-[#F5F1E8] border-[#171715] shadow-xs'
                            : 'bg-white/70 text-[#171715] border-[#DFD8CC] hover:border-[#171715]'
                        }`}
                      >
                        UK {size}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#7A7569] mt-2">
                  True to size fit. If you fall between half sizes, we recommend sizing up.
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="pt-4 border-t border-[#E8E2D5] flex items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#171715]">
                  Quantity
                </label>
                <div className="flex items-center border border-[#CDC5B4] rounded-lg bg-white/80">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm text-[#171715] hover:bg-[#EBE5DA] rounded-l-lg transition-colors font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-[#171715]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="px-3 py-1.5 text-sm text-[#171715] hover:bg-[#EBE5DA] rounded-r-lg transition-colors font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: ADD TO CART & ORDER NOW */}
              <div className="pt-6 border-t border-[#E8E2D5] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* ADD TO CART */}
                  <button
                    onClick={handleAddToCart}
                    className="bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider py-4 rounded-full flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </button>

                  {/* ORDER NOW */}
                  <button
                    onClick={handleOrderNow}
                    className="bg-[#DCE96A] hover:bg-[#CAD858] text-[#171715] font-bold text-xs uppercase tracking-wider py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-[#171715]" />
                    <span>ORDER NOW</span>
                  </button>
                </div>

                {/* ORDER VIA WHATSAPP - Positioned directly beneath ADD TO BAG and BUY NOW */}
                <button
                  type="button"
                  onClick={() => {
                    if (onWhatsAppOrderInitiated) {
                      onWhatsAppOrderInitiated({
                        product,
                        color: selectedColor,
                        size: selectedSize,
                        quantity,
                      });
                    }
                    setIsWhatsAppModalOpen(true);
                  }}
                  className="w-full bg-[#171715] hover:bg-[#1E2E21] border border-[#25D366]/40 text-[#F5F1E8] font-bold text-xs uppercase tracking-widest py-4 rounded-full flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm cursor-pointer group"
                >
                  <span className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
                    </svg>
                  </span>
                  <span>ORDER VIA WHATSAPP</span>
                </button>

                <div className="text-center space-y-1">
                  <span className="text-[11px] text-[#8C8679] block">
                    Total: <strong className="text-[#171715] font-bold">{formatPrice(product.priceINR * quantity)}</strong> (Free Express Shipping included)
                  </span>
                  <span className="text-[10px] text-[#626849] font-medium flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                    Priority personal concierge dispatch via WhatsApp (9134280545)
                  </span>
                </div>
              </div>

              {/* Assurance Trust Strip */}
              <div className="pt-6 border-t border-[#E8E2D5] grid grid-cols-3 gap-2 text-center text-[11px] text-[#7A7569]">
                <div className="flex flex-col items-center gap-1 p-2 bg-[#EBE6DC] rounded-xl border border-[#DFD8CC]">
                  <Truck className="w-4 h-4 text-[#171715]" />
                  <span className="font-semibold text-[#171715]">Free Shipping</span>
                  <span className="text-[10px]">On all prepaid orders</span>
                </div>

                <div className="flex flex-col items-center gap-1 p-2 bg-[#EBE6DC] rounded-xl border border-[#DFD8CC]">
                  <RotateCcw className="w-4 h-4 text-[#171715]" />
                  <span className="font-semibold text-[#171715]">30-Day Returns</span>
                  <span className="text-[10px]">Hassle-free exchange</span>
                </div>

                <div className="flex flex-col items-center gap-1 p-2 bg-[#EBE6DC] rounded-xl border border-[#DFD8CC]">
                  <ShieldCheck className="w-4 h-4 text-[#171715]" />
                  <span className="font-semibold text-[#171715]">Authentic</span>
                  <span className="text-[10px]">Crafted with care</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* You May Also Like Section */}
        {similarProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-[#DFD8CC]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#7A7569] block mb-1">
                  Curated Pairings
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-[#171715]">
                  You May Also Like
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5E5A50] max-w-md">
                Footwear with similar {product.category.toLowerCase()} design language, crafted for daily comfort and quiet versatility.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((rec, index) => {
                const isRecWishlisted = wishlistIds.includes(rec.id);
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35, delay: index * 0.07 }}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(rec);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#EBE6DC] rounded-xl p-3 sm:p-4 border border-[#DFD8CC] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#CDC4B5] group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Container with Wishlist */}
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative bg-[#DFD9CC]/50 flex items-center justify-center mb-3">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(rec.id);
                          }}
                          aria-label={isRecWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-[#F5F1E8]/90 backdrop-blur-xs border border-[#DFD8CC]/80 flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                            isRecWishlisted ? 'text-[#C94A38]' : 'text-[#5E5A50] hover:text-[#171715]'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 stroke-[1.8] ${
                              isRecWishlisted ? 'fill-[#C94A38]' : 'fill-none'
                            }`}
                          />
                        </button>

                        {/* Similarity indicator badge */}
                        {rec.category.toLowerCase() === product.category.toLowerCase() && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#171715]/80 text-[#F5F1E8] backdrop-blur-xs">
                            Same Category
                          </span>
                        )}
                      </div>

                      {/* Category & Color Swatches Preview */}
                      <div className="flex items-center justify-between text-xs text-[#7A7569] mb-1.5">
                        <span className="truncate pr-2 font-medium">{rec.category}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {rec.colors.slice(0, 3).map((col) => (
                            <span
                              key={col.name}
                              className="w-2.5 h-2.5 rounded-full border border-black/15"
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-sm sm:text-[15px] text-[#171715] tracking-tight group-hover:text-[#626849] transition-colors line-clamp-1">
                        {rec.name}
                      </h3>
                    </div>

                    {/* Price and Rating */}
                    <div className="mt-3 pt-2.5 border-t border-[#DFD8CC]/70 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-[#171715]">
                        <Star className="w-3 h-3 fill-[#171715]" />
                        <span className="font-semibold">{rec.rating}</span>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#171715]">
                          {formatPrice(rec.priceINR)}
                        </span>
                        {rec.originalPriceINR && (
                          <span className="text-[10px] text-[#8C8679] line-through">
                            {formatPrice(rec.originalPriceINR)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* CUSTOMER REVIEWS SECTION */}
        <section className="mt-16 pt-12 border-t border-[#E8E2D5]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#626849]" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A7569]">
                  VERIFIED FEEDBACK
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tight text-[#171715]">
                CUSTOMER REVIEWS.
              </h2>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  if (onToast) onToast('Please sign in to submit a review.');
                  if (onNavigateLogin) onNavigateLogin();
                } else {
                  setIsWriteReviewOpen(true);
                }
              }}
              className="px-6 py-3.5 rounded-full bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs self-start sm:self-auto shrink-0 flex items-center gap-2"
            >
              <Star className="w-4 h-4 fill-[#F5F1E8]" />
              <span>WRITE A REVIEW</span>
            </button>
          </div>

          {/* RATING BREAKDOWN HERO BOX */}
          <div className="bg-[#EBE6DC] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC] grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center mb-10">
            {/* Column 1: Overall Average & Rec % */}
            <div className="text-center md:text-left space-y-2 md:border-r border-[#DFD8CC] md:pr-6">
              <div className="font-display font-bold text-5xl sm:text-6xl text-[#171715] tracking-tight">
                {avgRating} <span className="text-2xl text-[#8C8679] font-sans font-normal">/ 5</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-[#171715]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(Number(avgRating)) ? 'fill-[#171715] text-[#171715]' : 'fill-none text-[#CDC5B4]'}`}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-[#5E5A50] pt-1">
                Based on {totalReviewsCount} customer reviews
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8E2D5] text-[#1E3A24] text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                <span>{recommendationPercent}% of customers recommend this pair</span>
              </div>
            </div>

            {/* Column 2: 5-Star to 1-Star Progress Bars */}
            <div className="space-y-2.5 md:border-r border-[#DFD8CC] md:px-6">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars] || 0;
                const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedStarFilter(selectedStarFilter === String(stars) ? 'all' : String(stars))}
                    className="w-full flex items-center gap-3 text-xs hover:opacity-80 transition-opacity cursor-pointer group"
                  >
                    <span className="w-12 font-bold text-[#171715] text-left shrink-0 group-hover:underline">
                      {stars} Stars
                    </span>
                    <div className="flex-1 h-2.5 bg-[#DFD9CC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#171715] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[#7A7569] font-mono text-[11px]">
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Column 3: Fit Perception Gauge */}
            <div className="space-y-3 text-center md:text-left md:pl-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171715] block">
                Customer Fit Feedback
              </span>
              <div className="bg-[#F5F1E8] rounded-xl p-3.5 border border-[#DFD8CC] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5E5A50] font-medium">
                  <span>True to Size</span>
                  <strong className="text-[#171715] font-bold">{fitPercentages['True to Size']}%</strong>
                </div>
                <div className="w-full h-2.5 bg-[#DFD9CC] rounded-full overflow-hidden flex">
                  <div className="bg-[#8C8679] h-full" style={{ width: `${fitPercentages['Runs Small']}%` }} title="Runs Small" />
                  <div className="bg-[#171715] h-full" style={{ width: `${fitPercentages['True to Size']}%` }} title="True to Size" />
                  <div className="bg-[#626849] h-full" style={{ width: `${fitPercentages['Runs Large']}%` }} title="Runs Large" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#7A7569] pt-1 font-medium">
                  <span>Small ({fitPercentages['Runs Small']}%)</span>
                  <span>True to Size ({fitPercentages['True to Size']}%)</span>
                  <span>Large ({fitPercentages['Runs Large']}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER TABS & SORT TOOLBAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8E2D5]">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedStarFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedStarFilter === 'all'
                    ? 'bg-[#171715] text-[#F5F1E8]'
                    : 'bg-[#EBE6DC] text-[#5E5A50] hover:bg-[#E2DCCE] hover:text-[#171715]'
                }`}
              >
                All Reviews ({reviews.length})
              </button>

              {[5, 4, 3, 2, 1].map((s) => {
                const count = starCounts[s] || 0;
                const isActive = selectedStarFilter === String(s);
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStarFilter(isActive ? 'all' : String(s))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#171715] text-[#F5F1E8]'
                        : 'bg-[#EBE6DC] text-[#5E5A50] hover:bg-[#E2DCCE] hover:text-[#171715]'
                    }`}
                  >
                    <span>{s}★</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-[#7A7569]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
                className="bg-[#EBE6DC] border border-[#DFD8CC] text-xs font-bold text-[#171715] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#171715] cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* REVIEWS LIST */}
          {filteredReviews.length === 0 ? (
            <div className="bg-[#EBE6DC] rounded-2xl p-8 text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A7569]">
                No reviews match the selected filter
              </p>
              <button
                onClick={() => setSelectedStarFilter('all')}
                className="text-xs text-[#171715] font-bold underline hover:text-[#626849] cursor-pointer"
              >
                Clear filters to see all reviews
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#EBE6DC] rounded-2xl p-5 sm:p-6 border border-[#DFD8CC] space-y-3 transition-all hover:border-[#CDC5B4]"
                >
                  {/* Card Header: Avatar, Name, Verified Badge, Rating, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFD8CC] pb-3">
                    <div className="flex items-center gap-3">
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-full object-cover border border-[#CDC5B4]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#171715] text-[#F5F1E8] font-bold text-xs flex items-center justify-center">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#171715]">{rev.userName}</span>
                          {rev.isVerifiedBuyer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#D8E2D5] text-[#1E3A24] px-2 py-0.5 rounded-md">
                              <Check className="w-3 h-3 text-[#25D366]" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#7A7569]">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Stars & Fit Tag */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 text-[#171715]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= rev.rating ? 'fill-[#171715] text-[#171715]' : 'fill-none text-[#CDC5B4]'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#F5F1E8] text-[#5E5A50] rounded-md border border-[#DFD8CC]">
                        Fit: {rev.fitFeedback}
                      </span>
                    </div>
                  </div>

                  {/* Title & Comment */}
                  <div className="space-y-1.5 pt-1">
                    <h4 className="font-bold text-base text-[#171715]">
                      {rev.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5E5A50] leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Customer Attached Photos Grid */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {rev.images.map((imgUrl, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() => handleOpenLightbox(rev.images!, imgIdx, rev.userName)}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[#DFD8CC] shadow-2xs hover:opacity-90 transition-all cursor-pointer group shrink-0"
                            title="Click to view full photo"
                          >
                            <img
                              src={imgUrl}
                              alt={`Customer photo ${imgIdx + 1} for ${product.name}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="p-1 rounded-full bg-black/60 text-white">
                                <Camera className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Helpful Counter */}
                  <div className="pt-2 flex items-center justify-between text-xs text-[#7A7569]">
                    <span className="text-[11px]">Was this review helpful?</span>
                    <button
                      onClick={() => handleHelpful(rev.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F1E8] hover:bg-[#E2DCCE] border border-[#DFD8CC] text-[#171715] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <span>👍 Yes</span>
                      <span className="text-[#626849] font-bold">({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        product={product}
        color={selectedColor}
        onSubmitSuccess={(newReview) => {
          setReviews((prev) => [newReview, ...prev]);
          if (onToast) onToast('Thank you! Your review has been published.');
        }}
      />

      {/* Footwear Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        selectedSize={selectedSize}
        onSelectSize={(newSize) => setSelectedSize(newSize)}
      />

      {/* WhatsApp Direct Ordering Modal */}
      <WhatsAppOrderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        quantity={quantity}
        currency={currency}
        user={user}
        addresses={userAddresses}
        isLoadingAddresses={isLoadingAddresses}
        onNavigateLogin={() => {
          if (onNavigateLogin) onNavigateLogin();
        }}
        onNavigateRegister={() => {
          if (onNavigateRegister) onNavigateRegister();
        }}
        onNavigateAddAddress={() => {
          if (onNavigateAddAddress) onNavigateAddAddress();
        }}
        onNavigateEditAddress={() => {
          if (onNavigateAddAddress) onNavigateAddAddress();
        }}
        onNavigateUpdateProfile={() => {
          if (onNavigateUpdateProfile) onNavigateUpdateProfile();
        }}
        onOrderCompleted={() => {
          if (onToast) onToast('Opening WhatsApp with your order details...');
        }}
      />

      {/* Online Payment Temporarily Unavailable Notice Modal */}
      <OnlinePaymentNoticeModal
        isOpen={isPaymentNoticeOpen}
        onClose={() => setIsPaymentNoticeOpen(false)}
        currency={currency}
        orderContext={{
          type: 'single',
          productName: product.name,
          selectedSize,
          totalINR: product.priceINR * quantity,
        }}
        onOrderViaWhatsApp={() => {
          if (onWhatsAppOrderInitiated) {
            onWhatsAppOrderInitiated({
              product,
              color: selectedColor,
              size: selectedSize,
              quantity,
            });
          }
          setIsWhatsAppModalOpen(true);
        }}
      />

      {/* Full-Screen Photo Lightbox Viewer */}
      <PhotoLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        userName={lightboxUser}
        reviewTitle={product.name}
      />
    </div>
  );
};
