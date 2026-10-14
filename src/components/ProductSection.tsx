import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Loader2, ChevronDown, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, ColorSwatch, Currency } from '../types';

interface ProductSectionProps {
  products: Product[];
  currency: Currency;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color: ColorSwatch, size: number) => void;
  onQuickView: (product: Product) => void;
  onViewAllNewArrivals: () => void;
  activeCategory?: string;
}

const INITIAL_BATCH_COUNT = 8;
const BATCH_INCREMENT = 4;

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  currency,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onViewAllNewArrivals,
  activeCategory = 'all',
}) => {
  // Local state for active selected color swatch per card
  const [selectedColors, setSelectedColors] = useState<Record<string, ColorSwatch>>({});

  // Pagination state: start with initial 8 products
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Reset pagination back to initial batch whenever the active category changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_COUNT);
    setLoadError(null);
  }, [activeCategory]);

  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  const getActiveColor = (product: Product): ColorSwatch => {
    return selectedColors[product.id] || product.colors[0];
  };

  const totalProducts = products.length;
  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < totalProducts;

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setLoadError(null);

    // Simulate smooth asynchronous batch retrieval
    setTimeout(() => {
      try {
        setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, totalProducts));
        setIsLoadingMore(false);
      } catch (err) {
        console.error('Failed to load additional products:', err);
        setLoadError('Failed to load more products. Please try again.');
        setIsLoadingMore(false);
      }
    }, 380);
  };

  return (
    <section id="new-arrivals" className="bg-[#F5F1E8] py-8 sm:py-14 border-t border-[#E8E2D5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#626849]"></span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A7569]">
                CURRENT SELECTION
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-tight text-[#171715]">
              THE NEW ROTATION.
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#7A7569] font-medium hidden md:inline-block">
              Showing {displayedProducts.length} of {totalProducts} styles
            </span>
            <button
              onClick={onViewAllNewArrivals}
              className="text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#626849] inline-flex items-center gap-1 group cursor-pointer"
            >
              <span>VIEW ALL NEW ARRIVALS</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </motion.div>

        {/* Empty state if filtered products is zero */}
        {products.length === 0 ? (
          <div className="bg-[#EBE6DC] rounded-xl p-8 sm:p-12 text-center border border-[#DFD8CC] max-w-md mx-auto my-8">
            <p className="text-sm font-semibold text-[#171715]">No styles found in this category</p>
            <p className="text-xs text-[#7A7569] mt-1 mb-4">Explore our complete rotation or select another category above.</p>
            <button
              onClick={onViewAllNewArrivals}
              className="px-4 py-2 bg-[#171715] text-[#F5F1E8] text-xs font-bold uppercase rounded-md hover:bg-[#626849] transition-colors cursor-pointer"
            >
              Browse All Styles
            </button>
          </div>
        ) : (
          /* Responsive product grid: 2 columns on mobile, 4 columns on desktop */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedProducts.map((product, idx) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const activeColor = getActiveColor(product);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min((idx % 4) * 0.06, 0.24),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full flex flex-col"
                >
                  <div className="h-full flex-1 bg-[#EBE6DC] rounded-xl p-3 sm:p-4 flex flex-col justify-between border border-[#DFD8CC] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#CDC4B5] group relative">
                    {/* Wishlist Heart Top-Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      className={`absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 p-1.5 rounded-full transition-transform active:scale-80 cursor-pointer ${
                        isWishlisted
                          ? 'text-[#C94A38] bg-[#F5F1E8]/70 shadow-xs'
                          : 'text-[#5E5A50] hover:text-[#171715] bg-[#EBE6DC]/80 hover:bg-[#F5F1E8]'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8] ${
                          isWishlisted ? 'fill-[#C94A38]' : 'fill-none'
                        }`}
                      />
                    </button>

                    {/* Product Image Area */}
                    <div
                      onClick={() => onQuickView(product)}
                      className="w-full aspect-[4/3] rounded-lg overflow-hidden relative cursor-pointer bg-[#DFD9CC]/50 flex items-center justify-center"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.isNewArrival && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-[#171715]/85 text-[#F5F1E8] backdrop-blur-xs">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Swatches & Metadata */}
                    <div className="mt-3 flex flex-col flex-grow justify-between">
                      {/* Color Swatches */}
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                        {product.colors.map((color) => {
                          const isSelected = activeColor.name === color.name;
                          return (
                            <button
                              key={color.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedColors((prev) => ({
                                  ...prev,
                                  [product.id]: color,
                                }));
                              }}
                              title={color.name}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-offset-1 ring-offset-[#EBE6DC] ring-[#171715] scale-110'
                                  : 'opacity-80 hover:opacity-100 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                          );
                        })}
                      </div>

                      {/* Name and Department/Category */}
                      <div
                        onClick={() => onQuickView(product)}
                        className="cursor-pointer"
                      >
                        <h3 className="font-bold text-xs sm:text-[15px] text-[#171715] tracking-tight group-hover:text-[#626849] transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-[#7A7569] font-normal mt-0.5 truncate">
                          {product.category}
                        </p>
                      </div>

                      {/* Price and Add to Bag button */}
                      <div className="mt-2.5 pt-2 flex items-center justify-between gap-1 border-t border-[#DFD8CC]/70">
                        <span className="font-bold text-xs sm:text-base text-[#171715]">
                          {formatPrice(product.priceINR)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product, activeColor, product.sizes[1] || 8);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-md border border-[#3C3B37] text-[#171715] hover:bg-[#171715] hover:text-[#F5F1E8] transition-colors cursor-pointer active:scale-95 shrink-0"
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden xs:inline">ADD TO BAG</span>
                          <span className="xs:hidden">ADD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Incremental Load More */}
        {products.length > 0 && hasMore && (
          <div className="mt-10 sm:mt-14 flex flex-col items-center justify-center text-center">
            {/* Error notice if loading failed */}
            {loadError && (
              <div className="mb-3 flex items-center gap-2 text-xs text-[#C94A38]">
                <span>{loadError}</span>
                <button
                  onClick={handleLoadMore}
                  className="underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            {/* Styled LOAD MORE button */}
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md border border-[#171715] bg-[#171715] text-[#F5F1E8] text-xs font-bold uppercase tracking-widest hover:bg-[#626849] hover:border-[#626849] transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5F1E8]" />
                  <span>LOADING MORE...</span>
                </>
              ) : (
                <>
                  <span>LOAD MORE</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
