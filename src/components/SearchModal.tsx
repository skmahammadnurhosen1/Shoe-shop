import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Product, Currency } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  currency: Currency;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  currency,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? products
    : products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );

  const formatPrice = (priceINR: number) => {
    if (currency.code === 'INR') {
      return `₹${priceINR.toLocaleString('en-IN')}`;
    }
    const converted = Math.round(priceINR * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
      <div className="bg-[#F5F1E8] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#DFD8CC] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D5] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#635F55]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by shoe name, category, or style (e.g. 'Runner', 'Court', 'Canvas')..."
            className="flex-1 bg-transparent text-[#171715] placeholder-[#9E988B] text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#7A7569] hover:text-[#171715]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#5E5A50] hover:text-[#171715] rounded-full hover:bg-[#EBE5DA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Tags */}
        <div className="px-5 py-2.5 bg-[#EFEAE0] border-b border-[#E4DDD0] flex items-center gap-2 overflow-x-auto text-xs text-[#5E5A50]">
          <span className="font-semibold text-[#171715]">Popular:</span>
          {['Runner 01', 'Court Low', 'Velocity', 'Canvas', 'Olive', 'All-Black'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white/70 hover:bg-white text-[#171715] transition-colors shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="text-xs text-[#7A7569] font-medium mb-2">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'} found
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#7A7569]">
              No shoes matched “{query}”. Try searching for “Runner” or “Casual”.
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#EBE5DA] hover:bg-[#E2DDD0] border border-[#DFD8CC] cursor-pointer transition-colors"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#171715] truncate">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-[#7A7569]">{prod.category}</p>
                  <p className="text-xs text-[#5E5A50] line-clamp-1 mt-0.5">
                    {prod.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-[#171715]">
                    {formatPrice(prod.priceINR)}
                  </span>
                  <span className="block text-[10px] text-[#626849] font-semibold mt-0.5">
                    View →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
