import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  Check,
  X,
  Trash2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  TrendingUp,
  Pin,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { StoredReview } from '../../types';

interface ReviewStats {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
  featuredCount: number;
  avgRating: number;
}

export const ReviewsManagementView: React.FC = () => {
  const { adminToken } = useAdminAuth();

  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    pendingCount: 0,
    approvedCount: 0,
    featuredCount: 0,
    avgRating: 5.0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Official Reply Modal State
  const [replyingReview, setReplyingReview] = useState<StoredReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Lightbox Image Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setErrorMessage(data.error || 'Failed to retrieve customer reviews.');
      }
    } catch {
      setErrorMessage('Network error while connecting to reviews moderation server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchReviews();
    }
  }, [adminToken, statusFilter, searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        fetchReviews();
      } else {
        alert(data.error || 'Failed to update review status.');
      }
    } catch {
      alert('Network error while updating review status.');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/featured`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, isFeaturedOnHomepage: data.isFeaturedOnHomepage } : r
          )
        );
        fetchReviews();
      } else {
        alert(data.error || 'Failed to update homepage featured state.');
      }
    } catch {
      alert('Network error while updating featured status.');
    }
  };

  const handleDeleteReview = async (id: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete review from ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        fetchReviews();
      } else {
        alert(data.error || 'Failed to delete review.');
      }
    } catch {
      alert('Network error while deleting review.');
    }
  };

  const handleOpenReplyModal = (review: StoredReview) => {
    setReplyingReview(review);
    setReplyText(review.officialReply?.comment || '');
    setReplyError(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    if (!replyText.trim()) {
      setReplyError('Please write an official reply comment.');
      return;
    }

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/admin/reviews/${replyingReview.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ comment: replyText.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyingReview(null);
        fetchReviews();
      } else {
        setReplyError(data.error || 'Failed to post official response.');
      }
    } catch {
      setReplyError('Network error while posting response.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-8 select-none sm:select-auto font-sans antialiased text-[#171715]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#7A776D] block">
            SOCIAL PROOF & MODERATION
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#171715]">
            Customer Reviews & Feedback
          </h2>
          <p className="text-xs text-[#5A584E] mt-1 max-w-xl">
            Approve verified customer reviews, moderate lifestyle photos, post official brand replies, and feature customer stories on the Homepage Wall.
          </p>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Pending Approval
            </span>
            <AlertCircle className="w-4 h-4 text-[#C94A38]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-[#7A776D] font-mono">
              / {stats.totalReviews} total
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Requires moderation check
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Approved Live
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#52792B]" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              {stats.approvedCount}
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Published on shoe detail pages
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Homepage Wall Pinned
            </span>
            <Pin className="w-4 h-4 text-[#3D4336]" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              {stats.featuredCount}
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Featured social proof gallery
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Average Store Rating
            </span>
            <TrendingUp className="w-4 h-4 text-[#3D4336]" />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              {stats.avgRating}
            </span>
            <Star className="w-5 h-5 fill-[#C2A238] text-[#C2A238]" />
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Overall footwear satisfaction score
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviewer name, shoe model, or comment text..."
            className="w-full pl-9 pr-4 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#8A8679] focus:outline-none focus:border-[#171715]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs shrink-0">
          {[
            { id: 'pending', label: `Pending (${stats.pendingCount})` },
            { id: 'approved', label: `Approved (${stats.approvedCount})` },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: `All (${stats.totalReviews})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                statusFilter === tab.id
                  ? 'bg-[#171715] text-[#FAF8F5] shadow-xs'
                  : 'text-[#5A584E] hover:text-[#171715]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl py-20 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#171715] mx-auto" />
            <p className="text-xs text-[#7A776D] font-mono">Loading reviews queue...</p>
          </div>
        ) : errorMessage ? (
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-[#C94A38] mx-auto" />
            <p className="text-xs text-[#C94A38]">{errorMessage}</p>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl"
            >
              Retry Connection
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl py-20 text-center space-y-3 px-4">
            <Star className="w-8 h-8 text-[#9C988D] mx-auto stroke-[1.5]" />
            <h4 className="font-serif text-lg font-semibold text-[#171715]">
              No reviews in this view
            </h4>
            <p className="text-xs text-[#7A776D] max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? 'All customer submissions have been moderated! Great job.'
                : 'Try clearing your search term or switching status tabs.'}
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isApproved = rev.status === 'approved';
            const isPending = rev.status === 'pending';
            const isRejected = rev.status === 'rejected';

            return (
              <div
                key={rev.id}
                className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 relative transition hover:border-[#CDC5B4]"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5D9] pb-4">
                  <div className="flex items-center gap-3">
                    {/* Footwear Thumbnail */}
                    {rev.productImage && (
                      <img
                        src={rev.productImage}
                        alt={rev.productName}
                        className="w-12 h-12 object-cover rounded-xl bg-white border border-[#DFD8CC] shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#171715]">
                          {rev.productName}
                        </span>
                        <span className="text-[10px] text-[#7A776D] font-mono">
                          ({rev.productId})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5A584E] mt-0.5">
                        <span className="font-semibold text-[#171715]">{rev.userName}</span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3D4336] bg-[#DCE96A]/30 px-2 py-0.5 rounded-full border border-[#8C9B32]/30">
                            <ShieldCheck className="w-3 h-3 text-[#3D4336]" />
                            Verified Buyer
                          </span>
                        )}
                        <span className="text-[#9C988D]">·</span>
                        <span className="text-[11px] text-[#7A776D]">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Status Badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#F5F1E8] px-2.5 py-1 rounded-xl border border-[#DFD8CC]">
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
                      <span className="font-mono text-xs font-bold text-[#171715] ml-1">
                        {rev.rating}.0
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg border ${
                        isApproved
                          ? 'bg-[#52792B]/10 text-[#3D4336] border-[#52792B]/30'
                          : isPending
                          ? 'bg-[#C2A238]/10 text-[#7C6314] border-[#C2A238]/30 animate-pulse'
                          : 'bg-[#C94A38]/10 text-[#991B1B] border-[#C94A38]/30'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2">
                  <h4 className="font-serif font-semibold text-sm text-[#171715]">
                    {rev.title}
                  </h4>
                  <p className="text-xs text-[#3D3C36] leading-relaxed">
                    {rev.comment}
                  </p>

                  <div className="pt-1 flex items-center gap-3 text-[11px] text-[#5A584E]">
                    <span>
                      Fit Gauge:{' '}
                      <strong className="text-[#171715] font-semibold">
                        {rev.fitRating}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Photos Grid if present */}
                {rev.photoUrls && rev.photoUrls.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A776D] block mb-2">
                      Customer Photo Attachments ({rev.photoUrls.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rev.photoUrls.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Customer review photo ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-xl border border-[#DFD8CC] cursor-pointer hover:opacity-90 transition"
                            onClick={() => setPreviewImage(photo)}
                          />
                          <button
                            onClick={() => setPreviewImage(photo)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Support Reply Box */}
                {rev.officialReply && (
                  <div className="bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#171715] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#3D4336]" />
                        {rev.officialReply.adminName}
                      </span>
                      <span className="text-[10px] text-[#7A776D] font-mono">
                        {new Date(rev.officialReply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A584E] pl-5">
                      {rev.officialReply.comment}
                    </p>
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-[#EAE5D9] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Approve / Reject buttons */}
                    {!isApproved && (
                      <button
                        onClick={() => handleUpdateStatus(rev.id, 'approved')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-[#DCE96A]" />
                        <span>APPROVE & PUBLISH</span>
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAE5D9] hover:bg-[#DFD8CC] text-[#171715] text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>
                    )}

                    {/* Toggle Homepage Wall */}
                    {isApproved && (
                      <button
                        onClick={() => handleToggleFeatured(rev.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                          rev.isFeaturedOnHomepage
                            ? 'bg-[#3D4336] text-[#FAF8F5] border-[#3D4336]'
                            : 'bg-[#F5F1E8] text-[#171715] border-[#DFD8CC] hover:bg-[#EAE5D9]'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>
                          {rev.isFeaturedOnHomepage ? 'PINNED TO WALL' : 'PIN TO HOMEPAGE WALL'}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReplyModal(rev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE5D9] text-[#171715] text-xs font-semibold rounded-xl border border-[#DFD8CC] transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#5A584E]" />
                      <span>
                        {rev.officialReply ? 'EDIT OFFICIAL REPLY' : 'OFFICIAL REPLY'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeleteReview(rev.id, rev.userName)}
                      title="Delete review permanently"
                      className="p-1.5 text-[#7A776D] hover:text-[#C94A38] hover:bg-[#FDF2F2] rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-start justify-between border-b border-[#DFD8CC] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A776D]">
                  SOLEFORM CONCIERGE RESPONSE
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#171715] mt-0.5">
                  Reply to {replyingReview.userName}
                </h3>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-1.5 text-[#7A776D] hover:text-[#171715] rounded-lg hover:bg-[#EAE5D9] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {replyError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{replyError}</span>
              </div>
            )}

            <div className="bg-[#F5F1E8] p-3.5 rounded-xl border border-[#DFD8CC] text-xs text-[#5A584E]">
              <p className="font-semibold text-[#171715] mb-1">
                Customer Comment ({replyingReview.productName}):
              </p>
              <p className="italic">"{replyingReview.comment}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Official Support Response *
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="e.g. Thank you for your feedback! Our customer care team is delighted you love the cushioning."
                  className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  disabled={isSubmittingReply}
                  className="px-4 py-2 bg-[#EAE5D9] hover:bg-[#DFD8CC] text-[#171715] font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="px-6 py-2 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] font-semibold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingReply ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>POSTING...</span>
                    </>
                  ) : (
                    <span>POST RESPONSE</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Customer photo enlarged"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
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
