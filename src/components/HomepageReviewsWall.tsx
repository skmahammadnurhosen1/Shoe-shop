import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, ArrowRight, Eye, X } from 'lucide-react';
import { StoredReview } from '../types';

interface HomepageReviewsWallProps {
  onSelectProduct?: (productId: string) => void;
}

export const HomepageReviewsWall: React.FC<HomepageReviewsWallProps> = ({
  onSelectProduct,
}) => {
  const [featuredReviews, setFeaturedReviews] = useState<StoredReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/reviews/featured');
        const data = await res.json();
        if (data.success) {
          setFeaturedReviews(data.reviews || []);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (isLoading || featuredReviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#F5F1E8] border-t border-b border-[#DFD8CC] font-sans antialiased text-[#171715]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A776D] block">
            ON FEET · REAL COMMUNITY FEEDBACK
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#171715]">
            Worn & Approved by the Collective
          </h2>
          <p className="text-xs text-[#5A584E] leading-relaxed">
            Real customer photos, sizing notes, and long-distance comfort reviews from verified SOLEFORM owners.
          </p>
        </div>

        {/* Featured Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredReviews.map((rev) => {
            const hasPhoto = rev.photoUrls && rev.photoUrls.length > 0;
            const mainPhoto = hasPhoto ? rev.photoUrls![0] : rev.productImage;

            return (
              <div
                key={rev.id}
                className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:border-[#CDC5B4]"
              >
                {/* Image Section */}
                <div className="relative aspect-4/3 overflow-hidden bg-[#EAE5D9]">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto}
                      alt={`Customer photo for ${rev.productName}`}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-500"
                      onClick={() => setActivePhoto(mainPhoto)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#7A776D]">
                      <Star className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-[#171715]/80 backdrop-blur-xs text-[#FAF8F5] px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#C2A238] text-[#C2A238]" />
                    <span>{rev.rating}.0</span>
                  </div>

                  {rev.isVerifiedBuyer && (
                    <div className="absolute top-3 right-3 bg-[#FAF8F5]/90 backdrop-blur-xs text-[#3D4336] px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1 border border-[#3D4336]/20">
                      <ShieldCheck className="w-3 h-3 text-[#3D4336]" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-[#171715] line-clamp-1">
                      "{rev.title}"
                    </h4>
                    <p className="text-xs text-[#5A584E] line-clamp-3 mt-1 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DFD8CC]/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#171715] block">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] text-[#7A776D]">
                        Fit: {rev.fitRating}
                      </span>
                    </div>

                    {onSelectProduct && (
                      <button
                        onClick={() => onSelectProduct(rev.productId)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#171715] hover:text-[#52792B] transition cursor-pointer"
                      >
                        <span>View Shoe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh]">
            <img
              src={activePhoto}
              alt="Enlarged customer photo"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
