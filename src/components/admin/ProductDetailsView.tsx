import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
  PackageX,
  AlertTriangle,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Pin,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Tag,
  Layers,
  Calendar,
  User,
  Phone,
  Mail,
  Box,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Product, ProductStatus } from '../../types';
import { ProductFormModal } from './ProductFormModal';

interface StoredReview {
  id: string;
  productId: string;
  productName?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  fitRating?: string;
  photoUrls?: string[];
  isVerifiedBuyer?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  isFeaturedOnHomepage?: boolean;
  officialReply?: {
    adminName: string;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
}

interface ProductOrderHistoryItem {
  orderId: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  itemsCount: number;
  subtotalINR: number;
  orderTotalINR: number;
  selectedSize?: string | number;
  selectedColor?: string;
}

interface InventoryAuditLogItem {
  id: string;
  previousStock: number;
  adjustedDelta: number;
  newStock: number;
  reason: string;
  note?: string;
  adminName: string;
  createdAt: string;
}

interface ProductDetailsMetrics {
  totalUnitsSold: number;
  totalRevenueINR: number;
  totalOrdersCount: number;
  avgRating: number;
  reviewsCount: number;
  currentStock: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface ProductDetailsViewProps {
  productId: string;
  onBack: () => void;
  onNavigateStore?: () => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  productId,
  onBack,
  onNavigateStore,
}) => {
  const { adminToken } = useAdminAuth();

  // Core product details state
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [orderHistory, setOrderHistory] = useState<ProductOrderHistoryItem[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryAuditLogItem[]>([]);
  const [metrics, setMetrics] = useState<ProductDetailsMetrics | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab: 'specs' | 'reviews' | 'orders' | 'inventory'
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'orders' | 'inventory'>('specs');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Gallery preview
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string>('');

  // Reviews Tab Filters & Moderation
  const [reviewSearch, setReviewSearch] = useState<string>('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('all');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState<string | null>(null);

  // Order History Tab Filters
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const fetchProductDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setReviews(data.reviews || []);
        setOrderHistory(data.orderHistory || []);
        setInventoryLogs(data.inventoryLogs || []);
        setMetrics(data.metrics || null);
        if (data.product?.image) {
          setSelectedGalleryImage(data.product.image);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to fetch product details.');
      }
    } catch {
      setError('Network communication error fetching product data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Toggle Publication Status
  const handleToggleStatus = async () => {
    if (!product) return;
    const nextStatus: ProductStatus = product.status === 'hidden' ? 'published' : 'hidden';
    try {
      const res = await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-[#Type]': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProduct((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      }
    } catch (err) {
      console.error('Failed to update product status:', err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!product) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        onBack();
      } else {
        alert('Failed to archive product.');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = async () => {
    if (!product) return;
    try {
      const dupPayload = {
        ...product,
        name: `${product.name} (Copy)`,
        sku: `${product.sku || 'SKU'}-COPY-${Math.floor(100 + Math.random() * 900)}`,
        status: 'draft',
      };
      delete (dupPayload as any).id;

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(dupPayload),
      });

      if (res.ok) {
        alert('Product duplicated successfully as Draft!');
        onBack();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to duplicate product.');
      }
    } catch (err) {
      console.error('Error duplicating product:', err);
    }
  };

  // Review Status Patch
  const handleUpdateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  // Toggle Review Homepage Feature
  const handleToggleReviewFeatured = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/featured`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, isFeaturedOnHomepage: Boolean(data.isFeaturedOnHomepage) }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle review featured status:', err);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setConfirmDeleteReviewId(null);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Submit Official Reply to Review
  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ comment: replyText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, officialReply: data.review.officialReply } : r))
        );
        setReplyingReviewId(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      (r.title && r.title.toLowerCase().includes(reviewSearch.toLowerCase()));

    const matchesStatus =
      reviewStatusFilter === 'all' || r.status === reviewStatusFilter;

    const matchesRating =
      reviewRatingFilter === 'all' || String(r.rating) === reviewRatingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  // Filtered Orders History
  const filteredOrders = orderHistory.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus =
      orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Export Order History to CSV
  const handleExportOrdersCSV = () => {
    if (orderHistory.length === 0) return;
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Size', 'Color', 'Quantity', 'Subtotal (INR)', 'Order Status', 'Source'];
    const rows = filteredOrders.map((o) => [
      o.orderId,
      `"${o.date}"`,
      `"${o.customerName}"`,
      o.email,
      o.phone,
      o.selectedSize || 'N/A',
      o.selectedColor || 'N/A',
      o.itemsCount,
      o.subtotalINR,
      o.status,
      o.source,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${product?.slug || 'product'}-order-history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#7A776D]" />
        <p className="text-sm font-medium text-[#5A584E]">Loading product workspace details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#4A493D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products Catalogue</span>
        </button>

        <div className="p-8 bg-[#FDF2F2] border border-[#FCA5A5] rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#991B1B] mx-auto" />
          <h3 className="font-semibold text-sm text-[#991B1B]">
            Product Details Unavailable
          </h3>
          <p className="text-xs text-[#7F1D1D] max-w-md mx-auto">
            {error || 'The requested footwear record could not be found or has been archived.'}
          </p>
          <button
            onClick={fetchProductDetails}
            className="px-4 py-2 bg-[#991B1B] text-white text-xs font-semibold rounded-xl hover:bg-[#7F1D1D] transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#FAF8F5] border border-[#DFD8CC] hover:bg-[#EAE5D9] text-[#171715] rounded-xl transition cursor-pointer shadow-xs"
            title="Back to Catalogue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-[#EAE5D9] text-[#4A493D] text-[10px] font-mono rounded font-semibold uppercase">
                SKU: {product.sku || 'N/A'}
              </span>
              <span className="px-2 py-0.5 bg-[#EEF2E6] text-[#3D4F28] text-[10px] font-mono rounded font-semibold">
                {product.category}
              </span>
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold cursor-pointer transition ${
                  product.status === 'published' || !product.status
                    ? 'bg-[#EEF2E6] text-[#3D4F28] hover:bg-[#CBD5C0]'
                    : product.status === 'hidden'
                    ? 'bg-[#F5F1E8] text-[#7A776D] border border-[#DFD8CC] hover:bg-[#EAE5D9]'
                    : 'bg-[#FEF3C7] text-[#92400E]'
                }`}
              >
                {product.status === 'published' || !product.status ? (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171715] mt-1">
              {product.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateStore && (
            <button
              onClick={onNavigateStore}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-[#4A493D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-xl text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </button>
          )}

          <button
            onClick={handleDuplicateProduct}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] text-[#4A493D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-xl text-xs font-semibold transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171715] text-[#FAF8F5] hover:bg-[#2A2925] rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </button>

          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 bg-[#FDF2F2] border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FCA5A5] rounded-xl transition cursor-pointer"
            title="Archive Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Key Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A776D]">
            <span className="text-[11px] font-mono uppercase font-semibold">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#3D4F28]" />
          </div>
          <div className="text-xl font-serif font-bold text-[#171715] mt-1 font-mono">
            ₹{(metrics?.totalRevenueINR || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#5A584E]">
            From {metrics?.totalOrdersCount || 0} order(s)
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A776D]">
            <span className="text-[11px] font-mono uppercase font-semibold">Units Sold</span>
            <ShoppingBag className="w-4 h-4 text-[#4A493D]" />
          </div>
          <div className="text-xl font-serif font-bold text-[#171715] mt-1 font-mono">
            {metrics?.totalUnitsSold || 0} pair(s)
          </div>
          <span className="text-[11px] text-[#5A584E]">Lifetime volume</span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A776D]">
            <span className="text-[11px] font-mono uppercase font-semibold">Customer Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-serif font-bold text-[#171715]">
              {metrics?.avgRating || 5.0}
            </span>
            <span className="text-xs text-[#7A776D]">/ 5.0</span>
          </div>
          <span className="text-[11px] text-[#5A584E]">
            {metrics?.reviewsCount || reviews.length} customer review(s)
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#7A776D]">
            <span className="text-[11px] font-mono uppercase font-semibold">Current Stock</span>
            {metrics?.stockStatus === 'Out of Stock' ? (
              <PackageX className="w-4 h-4 text-[#991B1B]" />
            ) : metrics?.stockStatus === 'Low Stock' ? (
              <AlertTriangle className="w-4 h-4 text-[#92400E]" />
            ) : (
              <PackageCheck className="w-4 h-4 text-[#3D4F28]" />
            )}
          </div>
          <div className="text-xl font-serif font-bold text-[#171715] mt-1 font-mono">
            {product.stockCount} in stock
          </div>
          <span
            className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded mt-0.5 ${
              metrics?.stockStatus === 'Out of Stock'
                ? 'bg-[#FDF2F2] text-[#991B1B]'
                : metrics?.stockStatus === 'Low Stock'
                ? 'bg-[#FEF3C7] text-[#92400E]'
                : 'bg-[#EEF2E6] text-[#3D4F28]'
            }`}
          >
            {metrics?.stockStatus || 'In Stock'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-[#DFD8CC] flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('specs')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'specs'
              ? 'border-[#171715] text-[#171715]'
              : 'border-transparent text-[#7A776D] hover:text-[#171715]'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Product Specifications</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'border-[#171715] text-[#171715]'
              : 'border-transparent text-[#7A776D] hover:text-[#171715]'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Customer Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#171715] text-[#171715]'
              : 'border-transparent text-[#7A776D] hover:text-[#171715]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order History ({orderHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-[#171715] text-[#171715]'
              : 'border-transparent text-[#7A776D] hover:text-[#171715]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Stock & Audit Logs ({inventoryLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT SPECIFICATIONS & MEDIA */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gallery & Imagery Preview */}
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                Main Image Display
              </h3>
              <div className="aspect-square rounded-xl bg-[#EAE5D9] overflow-hidden border border-[#DFD8CC]">
                <img
                  src={selectedGalleryImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div>
                  <span className="block text-[11px] font-mono text-[#7A776D] mb-2">
                    Gallery Assets ({galleryImages.length})
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedGalleryImage(imgUrl)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border cursor-pointer shrink-0 transition ${
                          selectedGalleryImage === imgUrl
                            ? 'border-[#171715] ring-2 ring-[#171715]/20'
                            : 'border-[#DFD8CC] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Pricing Summary Card */}
            <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                Pricing & GST Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#DFD8CC]/60">
                  <span className="text-[#5A584E]">Selling Price (Inclusive of GST):</span>
                  <span className="font-mono font-bold text-[#171715] text-sm">
                    ₹{product.priceINR.toLocaleString('en-IN')}
                  </span>
                </div>
                {product.originalPriceINR && (
                  <div className="flex justify-between items-center py-1 border-b border-[#DFD8CC]/60">
                    <span className="text-[#5A584E]">MSRP / Original Price:</span>
                    <span className="font-mono text-[#7A776D] line-through">
                      ₹{product.originalPriceINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {product.originalPriceINR && (
                  <div className="flex justify-between items-center py-1 border-b border-[#DFD8CC]/60">
                    <span className="text-[#5A584E]">Discount Offered:</span>
                    <span className="font-mono font-semibold text-[#3D4F28]">
                      {Math.round(
                        ((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100
                      )}
                      % OFF
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#5A584E]">Calculated GST (12% Included):</span>
                  <span className="font-mono text-[#171715]">
                    ₹{Math.round((product.priceINR * 12) / 112).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-6 shadow-xs space-y-6">
              {/* Product Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                  Product Overview & Story
                </h3>
                <p className="text-xs text-[#4A493D] leading-relaxed whitespace-pre-line">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {/* Color Options & Shoe Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#DFD8CC]">
                {/* Colors */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                    Available Colorways
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.colors && product.colors.length > 0 ? (
                      product.colors.map((c, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs font-medium text-[#171715]"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[#7A776D]">Standard Colorway</span>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                    Available Shoe Sizes (UK/IND)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map((sz, i) => (
                        <span
                          key={i}
                          className="w-9 h-9 rounded-xl bg-[#F5F1E8] border border-[#DFD8CC] flex items-center justify-center font-mono text-xs font-semibold text-[#171715]"
                        >
                          {sz}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7A776D]">Standard Sizing</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="pt-4 border-t border-[#DFD8CC] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                  Materials, Craftsmanship & Dimensions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#DFD8CC]/80">
                    <span className="block font-mono text-[10px] text-[#7A776D] uppercase">
                      Materials
                    </span>
                    <span className="font-semibold text-[#171715]">
                      {product.materials || 'Premium Sustainable Components'}
                    </span>
                  </div>

                  <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#DFD8CC]/80">
                    <span className="block font-mono text-[10px] text-[#7A776D] uppercase">
                      Weight
                    </span>
                    <span className="font-semibold text-[#171715]">
                      {product.weight || 'Approx. 340g (Single Shoe)'}
                    </span>
                  </div>

                  <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#DFD8CC]/80">
                    <span className="block font-mono text-[10px] text-[#7A776D] uppercase">
                      Care Instructions
                    </span>
                    <span className="font-semibold text-[#171715]">
                      {product.careInstructions || 'Wipe clean with a damp microfiber cloth.'}
                    </span>
                  </div>

                  <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#DFD8CC]/80">
                    <span className="block font-mono text-[10px] text-[#7A776D] uppercase">
                      Dimensions
                    </span>
                    <span className="font-semibold text-[#171715]">
                      {product.dimensions || '32 cm x 20 cm x 12 cm'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features Checklist */}
              {product.features && product.features.length > 0 && (
                <div className="pt-4 border-t border-[#DFD8CC] space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                    Highlight Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#4A493D]">
                        <CheckCircle2 className="w-4 h-4 text-[#3D4F28] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Information */}
              <div className="pt-4 border-t border-[#DFD8CC] space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#5A584E]">
                  Search Engine Optimization (SEO)
                </h3>
                <div className="p-3.5 bg-[#F5F1E8] rounded-xl border border-[#DFD8CC] space-y-1">
                  <span className="block text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer">
                    {product.seoTitle || product.name} | SOLEFORM
                  </span>
                  <span className="block text-[11px] text-[#15803D]">
                    https://soleform.in/product/{product.slug || product.id}
                  </span>
                  <p className="text-[11px] text-[#5A584E]">
                    {product.seoDescription || product.description?.slice(0, 160) || 'Discover engineered comfort.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="font-semibold text-sm text-[#171715]">
                  Customer Reviews Moderation Queue
                </h3>
                <span className="px-2 py-0.5 bg-[#EAE5D9] text-[#4A493D] rounded-full text-[10px] font-mono font-semibold">
                  {reviews.length} Total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A776D]" />
                <input
                  type="text"
                  placeholder="Search reviewer name or feedback..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#7A776D] outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
              >
                <option value="all">All Moderation Statuses</option>
                <option value="approved">Approved & Live</option>
                <option value="pending">Pending Moderation</option>
                <option value="rejected">Rejected / Hidden</option>
              </select>

              {/* Rating Filter */}
              <select
                value={reviewRatingFilter}
                onChange={(e) => setReviewRatingFilter(e.target.value)}
                className="px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl space-y-2">
              <Star className="w-8 h-8 text-[#7A776D] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#171715]">No customer reviews match criteria</p>
              <p className="text-xs text-[#5A584E]">
                Reviews submitted by customers will appear here for administrator review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`bg-[#FAF8F5] border rounded-2xl p-5 shadow-xs space-y-4 transition ${
                    rev.status === 'pending'
                      ? 'border-[#FCD34D] bg-[#FEF3C7]/20'
                      : rev.status === 'rejected'
                      ? 'border-[#FCA5A5] opacity-80'
                      : 'border-[#DFD8CC]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#171715] text-[#FAF8F5] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#171715]">
                            {rev.userName}
                          </span>
                          {rev.isVerifiedBuyer && (
                            <span className="px-2 py-0.5 bg-[#EEF2E6] text-[#3D4F28] rounded text-[10px] font-mono font-semibold">
                              Verified Buyer
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              rev.status === 'approved'
                                ? 'bg-[#EEF2E6] text-[#3D4F28]'
                                : rev.status === 'pending'
                                ? 'bg-[#FEF3C7] text-[#92400E]'
                                : 'bg-[#FDF2F2] text-[#991B1B]'
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#7A776D] block">
                          {rev.userEmail || 'No email'} • {new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating & Fit */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-[#DFD8CC]'
                            }`}
                          />
                        ))}
                      </div>
                      {rev.fitRating && (
                        <span className="px-2.5 py-1 bg-[#F5F1E8] border border-[#DFD8CC] rounded-lg text-[11px] font-mono text-[#4A493D]">
                          Fit: {rev.fitRating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-1 text-xs">
                    <h4 className="font-semibold text-sm text-[#171715]">{rev.title}</h4>
                    <p className="text-[#4A493D] leading-relaxed">{rev.comment}</p>
                  </div>

                  {/* User Photo Attachments */}
                  {rev.photoUrls && rev.photoUrls.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      {rev.photoUrls.map((photo, i) => (
                        <a key={i} href={photo} target="_blank" rel="noopener noreferrer">
                          <img
                            src={photo}
                            alt="Customer upload"
                            className="w-16 h-16 object-cover rounded-xl border border-[#DFD8CC] hover:opacity-90 transition"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Official Store Support Reply */}
                  {rev.officialReply && (
                    <div className="p-3.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#5A584E]">
                        <span className="font-semibold text-[#171715] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#171715]" />
                          Response from {rev.officialReply.adminName}
                        </span>
                        <span className="text-[10px]">
                          {new Date(rev.officialReply.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[#4A493D] italic">{rev.officialReply.comment}</p>
                    </div>
                  )}

                  {/* Reply Editor Box */}
                  {replyingReviewId === rev.id && (
                    <div className="p-4 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl space-y-3">
                      <span className="block font-semibold text-xs text-[#171715]">
                        Write Official Support Response
                      </span>
                      <textarea
                        rows={2}
                        placeholder="Thank you for your feedback! We are delighted..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingReviewId(null)}
                          className="px-3 py-1.5 text-xs text-[#5A584E] hover:text-[#171715]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitReply(rev.id)}
                          disabled={isSubmittingReply}
                          className="px-4 py-1.5 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#2A2925] transition"
                        >
                          {isSubmittingReply ? 'Posting...' : 'Post Official Reply'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Review Action Toolbar */}
                  <div className="pt-3 border-t border-[#DFD8CC] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#EEF2E6] text-[#3D4F28] hover:bg-[#CBD5C0] rounded-xl font-semibold transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Review</span>
                        </button>
                      )}

                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateReviewStatus(rev.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F1E8] text-[#7A776D] hover:bg-[#EAE5D9] rounded-xl font-semibold transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject / Hide</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleReviewFeatured(rev.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                          rev.isFeaturedOnHomepage
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#F5F1E8] text-[#5A584E] hover:bg-[#EAE5D9]'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{rev.isFeaturedOnHomepage ? 'Pinned to Home' : 'Pin to Home'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText(rev.officialReply?.comment || '');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F1E8] text-[#4A493D] hover:bg-[#EAE5D9] rounded-xl font-semibold transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{rev.officialReply ? 'Edit Reply' : 'Official Reply'}</span>
                      </button>
                    </div>

                    <div>
                      {confirmDeleteReviewId === rev.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#991B1B]">Confirm Delete?</span>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="px-2.5 py-1 bg-[#991B1B] text-white rounded-lg text-[11px] font-semibold"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteReviewId(null)}
                            className="px-2.5 py-1 text-[#5A584E] text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteReviewId(rev.id)}
                          className="p-1.5 text-[#7A776D] hover:text-[#991B1B] hover:bg-[#FDF2F2] rounded-lg transition cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDER HISTORY LOG */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters & CSV Export Bar */}
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#171715]" />
                <h3 className="font-semibold text-sm text-[#171715]">
                  Order History Log ({orderHistory.length})
                </h3>
              </div>

              <button
                onClick={handleExportOrdersCSV}
                disabled={orderHistory.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171715] text-[#FAF8F5] hover:bg-[#2A2925] disabled:opacity-50 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7A776D]" />
                <input
                  type="text"
                  placeholder="Search order ID, customer name, email, or phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#7A776D] outline-none"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
              >
                <option value="all">All Order Statuses</option>
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="in preparation">In Preparation</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table of Orders */}
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl space-y-2">
              <ShoppingBag className="w-8 h-8 text-[#7A776D] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#171715]">No order records found</p>
              <p className="text-xs text-[#5A584E]">
                When customers purchase this footwear item, complete order logs will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F1E8] border-b border-[#DFD8CC] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Selection</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD8CC]">
                    {filteredOrders.map((o, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F1E8]/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#171715]">
                          {o.orderId}
                        </td>
                        <td className="py-3 px-4 text-[#5A584E] whitespace-nowrap">
                          {o.date}
                        </td>
                        <td className="py-3 px-4">
                          <span className="block font-semibold text-[#171715]">
                            {o.customerName}
                          </span>
                          <span className="block text-[11px] text-[#7A776D]">
                            {o.email || o.phone}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#4A493D]">
                          Size {o.selectedSize || 'Standard'} • {o.selectedColor || 'Default'}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          {o.itemsCount}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#171715]">
                          ₹{o.subtotalINR.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              o.status === 'Delivered'
                                ? 'bg-[#EEF2E6] text-[#3D4F28]'
                                : o.status === 'Cancelled'
                                ? 'bg-[#FDF2F2] text-[#991B1B]'
                                : 'bg-[#FEF3C7] text-[#92400E]'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#5A584E]">
                          {o.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STOCK & INVENTORY AUDIT LOGS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#171715]">
                  Inventory Audit Ledger & History
                </h3>
                <p className="text-xs text-[#5A584E]">
                  Record of manual stock corrections, shipments received, and sales deductions.
                </p>
              </div>
              <span className="px-3 py-1 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-semibold text-[#171715]">
                Current Stock: {product.stockCount}
              </span>
            </div>

            {inventoryLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7A776D] space-y-1">
                <Layers className="w-6 h-6 mx-auto opacity-50 mb-1" />
                <p className="font-semibold text-[#171715]">No inventory adjustments logged yet</p>
                <p>When stock levels are updated in the inventory panel, logs will be appended here.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#DFD8CC]">
                {inventoryLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            log.adjustedDelta >= 0
                              ? 'bg-[#EEF2E6] text-[#3D4F28]'
                              : 'bg-[#FDF2F2] text-[#991B1B]'
                          }`}
                        >
                          {log.adjustedDelta >= 0 ? `+${log.adjustedDelta}` : log.adjustedDelta}
                        </span>
                        <span className="font-semibold text-[#171715]">{log.reason}</span>
                      </div>
                      <p className="text-[11px] text-[#5A584E]">
                        Stock changed: <span className="font-mono">{log.previousStock}</span> →{' '}
                        <span className="font-mono font-semibold">{log.newStock}</span>
                        {log.note && <span className="italic"> • Note: "{log.note}"</span>}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-[#7A776D] shrink-0">
                      <span className="block font-medium text-[#171715]">{log.adminName}</span>
                      <span>{new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          product={product}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => {
            setIsEditModalOpen(false);
            fetchProductDetails();
          }}
        />
      )}

      {/* Confirm Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#991B1B] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#171715]">
                Archive "{product.name}"?
              </h3>
              <p className="text-xs text-[#5A584E]">
                This will set the product status to archived and hide it from the customer storefront. Existing customer orders and transaction records will be safely preserved.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#DFD8CC]">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4A493D] hover:bg-[#EAE5D9] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-[#991B1B] text-white text-xs font-semibold rounded-xl hover:bg-[#7F1D1D] transition"
              >
                Yes, Archive Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
