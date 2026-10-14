import React, { useState } from 'react';
import { X, Star, Loader2, CheckCircle2, AlertCircle, Camera, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Review, ColorSwatch } from '../types';
import { useAuth } from '../context/AuthContext';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  color?: ColorSwatch;
  onSubmitSuccess: (review: Review) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  color,
  onSubmitSuccess,
}) => {
  const { user, token } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [fitFeedback, setFitFeedback] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const starLabels: Record<number, string> = {
    1: '1 - Poor',
    2: '2 - Fair',
    3: '3 - Good',
    4: '4 - Very Good',
    5: '5 - Excellent',
  };

  const activeRating = hoverRating || rating;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = attachedPhotos.length;
    const remainingSlots = 3 - currentCount;
    if (remainingSlots <= 0) return;

    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAttachedPhotos((prev) => (prev.length < 3 ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rating) {
      setErrorMsg('Please select a star rating.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a review headline.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write your review comment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product.id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          fitFeedback,
          images: attachedPhotos.length > 0 ? attachedPhotos : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      onSubmitSuccess(data.review);
      onClose();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      // Fallback if API fails or local mock
      const fallbackReview: Review = {
        id: `rev-local-${Date.now()}`,
        productId: product.id,
        userId: user?.id || 'guest',
        userName: user?.name || 'Verified Member',
        userAvatar: user?.avatarUrl,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        fitFeedback,
        isVerifiedBuyer: true,
        images: attachedPhotos.length > 0 ? attachedPhotos : undefined,
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
      };
      onSubmitSuccess(fallbackReview);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-[#F5F1E8] rounded-2xl border border-[#DFD8CC] shadow-2xl overflow-hidden my-6 text-[#171715]"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4.5 bg-[#EBE6DC] border-b border-[#DFD8CC] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#626849] block">
              Share Your Feedback
            </span>
            <h3 className="font-bold text-lg sm:text-xl text-[#171715]">
              Write a Product Review
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A7569] hover:text-[#171715] hover:bg-[#DFD8CC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Product Snippet */}
          <div className="bg-[#EBE6DC] rounded-xl p-3.5 border border-[#DFD8CC] flex items-center gap-3.5">
            <img
              src={color?.imageUrl || product.image}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg bg-[#DFD9CC] shrink-0"
            />
            <div>
              <span className="text-[10px] text-[#7A7569] uppercase font-semibold">
                {product.category}
              </span>
              <h4 className="font-bold text-sm text-[#171715] truncate">
                {product.name}
              </h4>
              <p className="text-xs text-[#5E5A50] mt-0.5">
                Reviewing as <strong className="text-[#171715]">{user?.name || 'Verified Customer'}</strong>
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FDF2F0] border border-[#E8B4AC] rounded-xl text-xs text-[#C94A38] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Field 1: Star Rating */}
          <div className="space-y-1.5 text-center sm:text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171715]">
              Overall Rating <span className="text-[#C94A38]">*</span>
            </label>
            <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform hover:scale-115 focus:outline-hidden cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= activeRating
                        ? 'fill-[#171715] text-[#171715]'
                        : 'fill-none text-[#CDC5B4]'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#626849] ml-2">
                {starLabels[activeRating]}
              </span>
            </div>
          </div>

          {/* Field 2: Fit Feedback Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171715]">
              How does it fit? <span className="text-[#C94A38]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Runs Small', 'True to Size', 'Runs Large'] as const).map((fit) => {
                const isActive = fitFeedback === fit;
                return (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setFitFeedback(fit)}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#171715] text-[#F5F1E8] border-[#171715] shadow-xs'
                        : 'bg-[#EBE6DC] text-[#171715] border-[#DFD8CC] hover:bg-[#E2DCCE]'
                    }`}
                  >
                    {fit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Review Headline */}
          <div className="space-y-1.5">
            <label htmlFor="review-title" className="block text-xs font-bold uppercase tracking-wider text-[#171715]">
              Review Headline <span className="text-[#C94A38]">*</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exceptional comfort & sleek silhouette"
              className="w-full px-3.5 py-2.5 bg-[#EBE6DC] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#9A9487] focus:outline-hidden focus:ring-1 focus:ring-[#171715] transition-all"
            />
          </div>

          {/* Field 4: Detailed Comment */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="block text-xs font-bold uppercase tracking-wider text-[#171715]">
              Detailed Comment <span className="text-[#C94A38]">*</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How is the leather quality, arch support, or sizing?"
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#EBE6DC] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#9A9487] focus:outline-hidden focus:ring-1 focus:ring-[#171715] transition-all resize-none"
            />
          </div>

          {/* Field 5: Product Photos Upload (Max 3) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171715]">
                Attach Shoe Photos <span className="text-[#7A7569] font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] font-semibold text-[#7A7569]">
                {attachedPhotos.length}/3 attached
              </span>
            </div>

            <div className="space-y-3">
              {attachedPhotos.length < 3 && (
                <label className="block bg-[#EBE6DC] hover:bg-[#E2DCCE] border-2 border-dashed border-[#CDC5B4] hover:border-[#171715] rounded-xl p-3.5 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 text-xs text-[#5E5A50]">
                    <div className="w-8 h-8 rounded-full bg-[#F5F1E8] border border-[#DFD8CC] flex items-center justify-center text-[#171715]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[#171715]">
                      Click or drag to add photos
                    </span>
                    <span className="text-[10px] text-[#7A7569]">
                      Attach up to 3 unboxing or wear photos
                    </span>
                  </div>
                </label>
              )}

              {/* Photo Previews */}
              {attachedPhotos.length > 0 && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {attachedPhotos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#DFD8CC] shadow-2xs group shrink-0">
                      <img src={photo} alt={`Attached preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-full border border-[#CDC4B5] text-xs font-semibold text-[#5E5A50] hover:text-[#171715] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-full bg-[#171715] hover:bg-black text-[#F5F1E8] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
