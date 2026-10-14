import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Plus,
  X,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { Product, StoredReview, ReviewAggregateStats, ReviewFitRating } from '../types';

interface ProductReviewsProps {
  product: Product;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [stats, setStats] = useState<ReviewAggregateStats>({
    averageRating: 5.0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    fitBreakdown: { runsSmallPercent: 0, trueToSizePercent: 100, runsLargePercent: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Write Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [fitInput, setFitInput] = useState<ReviewFitRating>('True to Size');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Lightbox Modal
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const fetchProductReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/product/${product.id}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // Keep initial fallback states
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchProductReviews();
    }
  }, [product.id]);

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    if (photoUrls.length >= 3) return;
    setPhotoUrls([...photoUrls, photoUrlInput.trim()]);
    setPhotoUrlInput('');
  };

  const handleRemovePhotoUrl = (idx: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nameInput.trim()) {
      setFormError('Please provide your name.');
      return;
    }

    if (!commentInput.trim()) {
      setFormError('Please write your review thoughts.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          userName: nameInput.trim(),
          userEmail: emailInput.trim(),
          rating: ratingInput,
          title: titleInput.trim() || `${ratingInput}-Star Footwear Review`,
          comment: commentInput.trim(),
          fitRating: fitInput,
          photoUrls: photoUrls,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          // Reset form
          setNameInput('');
          setEmailInput('');
          setTitleInput('');
          setCommentInput('');
          setPhotoUrls([]);
        }, 2000);
      } else {
        setFormError(data.error || 'Failed to submit review.');
      }
    } catch {
      setFormError('Network error while submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-8 border-t border-[#DFD8CC] font-sans antialiased text-[#171715]">
      {/* Header & Overall Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#F5F1E8] p-6 sm:p-8 rounded-3xl border border-[#DFD8CC]">
        {/* Left Score Box */}
        <div className="flex items-center gap-6">
          <div className="text-center sm:text-left">
            <span className="font-serif text-5xl font-bold text-[#171715] tracking-tight">
              {stats.averageRating.toFixed(1)}
            </span>
            <div className="flex items-center gap-1 my-1 justify-center sm:justify-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(stats.averageRating)
                      ? 'fill-[#C2A238] text-[#C2A238]'
                      : 'text-[#DFD8CC]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[#5A584E] font-medium block">
              Based on {stats.totalReviews} verified reviews
            </span>
          </div>

          {/* Sizing Fit Sentiment Indicator */}
          <div className="hidden sm:block border-l border-[#DFD8CC] pl-6 space-y-1.5 min-w-[200px]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D] block">
              CUSTOMER FIT ASSESSMENT
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#5A584E]">
                <span>True to Size</span>
                <span className="font-bold text-[#171715]">
                  {stats.fitBreakdown.trueToSizePercent}%
                </span>
              </div>
              <div className="w-full bg-[#EAE5D9] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3D4336] h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.fitBreakdown.trueToSizePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Call To Action */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider rounded-2xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>WRITE A REVIEW</span>
          </button>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#7A776D] font-mono">
            Loading verified reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#F5F1E8] rounded-2xl p-8 text-center space-y-2 border border-[#DFD8CC]">
            <Star className="w-6 h-6 text-[#7A776D] mx-auto stroke-[1.5]" />
            <h4 className="font-serif text-base font-semibold text-[#171715]">
              Be the first to review {product.name}
            </h4>
            <p className="text-xs text-[#5A584E]">
              Share your fit experience, comfort rating, and footwear styling tips with the SOLEFORM collective.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F5F1E8] rounded-2xl p-5 sm:p-6 border border-[#DFD8CC] space-y-3"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#171715]">
                      {rev.userName}
                    </span>
                    {rev.isVerifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3D4336] bg-[#DCE96A]/30 px-2 py-0.5 rounded-full border border-[#8C9B32]/30">
                        <ShieldCheck className="w-3 h-3 text-[#3D4336]" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#7A776D] block mt-0.5">
                    Fit Rating: <strong className="text-[#171715]">{rev.fitRating}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'fill-[#C2A238] text-[#C2A238]'
                          : 'text-[#DFD8CC]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h5 className="font-serif font-semibold text-sm text-[#171715]">
                  {rev.title}
                </h5>
                <p className="text-xs text-[#3D3C36] leading-relaxed mt-1">
                  {rev.comment}
                </p>
              </div>

              {/* Photos Gallery if attached */}
              {rev.photoUrls && rev.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {rev.photoUrls.map((photo, idx) => (
                    <div key={idx} className="relative group cursor-pointer" onClick={() => setActivePhoto(photo)}>
                      <img
                        src={photo}
                        alt={`Customer review ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-xl border border-[#DFD8CC] group-hover:opacity-90 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Official Brand Response */}
              {rev.officialReply && (
                <div className="bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl p-3 text-xs space-y-1 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171715] flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#3D4336]" />
                      {rev.officialReply.adminName}
                    </span>
                    <span className="text-[10px] text-[#7A776D] font-mono">
                      Official Response
                    </span>
                  </div>
                  <p className="text-[#5A584E] pl-4">{rev.officialReply.comment}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-[#DFD8CC] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A776D]">
                  CUSTOMER FEEDBACK
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#171715] mt-0.5">
                  Write a Review for {product.name}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A776D] hover:text-[#171715] rounded-lg hover:bg-[#EAE5D9] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-[#DCE96A] text-[#171715] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-serif text-xl font-semibold text-[#171715]">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs text-[#5A584E] max-w-xs mx-auto">
                  Your feedback has been submitted and sent to our team for moderation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-2">
                    Overall Satisfaction *
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starVal = idx + 1;
                      const isHighlighted = starVal <= (hoverRating || ratingInput);
                      return (
                        <button
                          type="button"
                          key={starVal}
                          onClick={() => setRatingInput(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition transform active:scale-95 cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              isHighlighted
                                ? 'fill-[#C2A238] text-[#C2A238]'
                                : 'text-[#DFD8CC]'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="font-mono text-xs font-bold text-[#171715] ml-2">
                      {ratingInput}.0 Stars
                    </span>
                  </div>
                </div>

                {/* Sizing Fit Rating Selector */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    How Did This Shoe Fit?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Runs Small', 'True to Size', 'Runs Large'] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setFitInput(opt)}
                        className={`p-2.5 rounded-xl border text-center font-medium text-xs transition cursor-pointer ${
                          fitInput === opt
                            ? 'bg-[#171715] text-[#FAF8F5] border-[#171715]'
                            : 'bg-[#F5F1E8] text-[#171715] border-[#DFD8CC] hover:bg-[#EAE5D9]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Arjun Mehta"
                      className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                      Email Address (Private)
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. arjun@example.com"
                      className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                    Headline / Summary Title
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="e.g. Impeccable leather quality and all-day comfort"
                    className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                    Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Describe comfort, sole flexibility, leather texture, and how you style them..."
                    className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>

                {/* Photo Upload Simulator */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                    Add Footwear Photo URL (Optional, max 3)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      placeholder="Paste image URL (e.g. https://...)"
                      className="flex-1 px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      disabled={photoUrls.length >= 3}
                      className="px-3 py-2 bg-[#EAE5D9] hover:bg-[#DFD8CC] text-[#171715] font-semibold text-xs rounded-xl transition disabled:opacity-50"
                    >
                      Add Photo
                    </button>
                  </div>

                  {photoUrls.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {photoUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt="Uploaded preview"
                            className="w-12 h-12 object-cover rounded-lg border border-[#DFD8CC]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoUrl(idx)}
                            className="absolute -top-1 -right-1 bg-[#C94A38] text-white rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 border-t border-[#DFD8CC] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#EAE5D9] text-[#171715] font-semibold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] font-semibold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>SUBMITTING...</span>
                      </>
                    ) : (
                      <span>SUBMIT REVIEW</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[85vh]">
            <img
              src={activePhoto}
              alt="Customer photo enlarged"
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
    </div>
  );
};
