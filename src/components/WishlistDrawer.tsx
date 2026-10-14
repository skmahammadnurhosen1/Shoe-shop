import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Product, Currency } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  currency: Currency;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveWishlist,
  onAddToCart,
  currency,
}) => {
  if (!isOpen) return null;

  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F5F1E8] shadow-2xl flex flex-col border-l border-[#E5DECة]">
          
          <div className="p-5 sm:p-6 border-b border-[#E8E2D5] flex items-center justify-between">
            <h3 className="font-display font-bold text-xl uppercase tracking-wider text-[#171715]">
              SAVED WISHLIST ({wishlistProducts.length})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-[#5E5A50] hover:text-[#171715] rounded-full hover:bg-[#EBE5DA]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-[#7A7569] text-sm">No shoes saved yet. Tap the heart on any shoe to save it here.</p>
                <button
                  onClick={onClose}
                  className="bg-[#171715] text-[#F5F1E8] text-xs uppercase font-bold tracking-wider px-6 py-2.5 rounded-full"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#EBE5DA] rounded-xl p-3.5 flex gap-3.5 border border-[#E0D9CB]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-white shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-sm text-[#171715]">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveWishlist(product.id)}
                          className="text-[#8C8679] hover:text-[#C94A38] p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#7A7569]">{product.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DFD8CC]/60">
                      <span className="font-bold text-sm text-[#171715]">
                        {formatPrice(product.priceINR)}
                      </span>
                      <button
                        onClick={() => {
                          onAddToCart(product);
                          onRemoveWishlist(product.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#171715] text-white hover:bg-black"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
