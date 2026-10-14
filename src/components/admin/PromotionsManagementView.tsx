import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Percent,
  Banknote,
  Truck,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Promotion, DiscountType } from '../../types';

interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  totalRedemptions: number;
  totalSavingsINR: number;
}

interface PromotionFormData {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderINR: number;
  maxDiscountINR?: number;
  usageLimit?: number;
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
}

const DEFAULT_FORM: PromotionFormData = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderINR: 1500,
  maxDiscountINR: 1000,
  usageLimit: 500,
  status: 'active',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
};

export const PromotionsManagementView: React.FC = () => {
  const { adminToken } = useAdminAuth();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats>({
    totalPromotions: 0,
    activePromotions: 0,
    totalRedemptions: 0,
    totalSavingsINR: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DiscountType>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy feedback tracking
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchPromotions = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/promotions', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setErrorMessage(data.error || 'Failed to retrieve promotions list.');
      }
    } catch {
      setErrorMessage('Network error while connecting to promotions service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchPromotions();
    }
  }, [adminToken]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleToggleStatus = async (promo: Promotion) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
        );
        setStats((prev) => ({
          ...prev,
          activePromotions: promo.status === 'active' ? prev.activePromotions - 1 : prev.activePromotions + 1,
        }));
      }
    } catch {
      alert('Failed to update promotion status.');
    }
  };

  const handleDeletePromotion = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete promo code "${code}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        fetchPromotions();
      } else {
        alert(data.error || 'Failed to delete promotion.');
      }
    } catch {
      alert('Network error while deleting promotion.');
    }
  };

  const handleOpenCreateModal = (preset?: Partial<PromotionFormData>) => {
    setEditingPromoId(null);
    setFormError(null);
    setFormData({
      ...DEFAULT_FORM,
      ...preset,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingPromoId(promo.id);
    setFormError(null);
    setFormData({
      code: promo.code,
      title: promo.title,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderINR: promo.minOrderINR || 0,
      maxDiscountINR: promo.maxDiscountINR,
      usageLimit: promo.usageLimit,
      status: promo.status,
      startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedCode = formData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!trimmedCode) {
      setFormError('Please enter a valid coupon code (letters and numbers only).');
      return;
    }

    if (!formData.title.trim()) {
      setFormError('Please provide a campaign title.');
      return;
    }

    if (formData.discountType !== 'free_shipping' && Number(formData.discountValue) <= 0) {
      setFormError('Please specify a positive discount value.');
      return;
    }

    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        code: trimmedCode,
        discountValue: formData.discountType === 'free_shipping' ? 150 : Number(formData.discountValue),
        minOrderINR: Number(formData.minOrderINR) || 0,
        maxDiscountINR: formData.maxDiscountINR ? Number(formData.maxDiscountINR) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      const url = editingPromoId
        ? `/api/admin/promotions/${editingPromoId}`
        : '/api/admin/promotions';
      const method = editingPromoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        setFormError(data.error || 'Failed to save promotion campaign.');
      }
    } catch {
      setFormError('Network error while saving promotion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter promotions locally for fast snappy responsiveness
  const filteredPromotions = promotions.filter((promo) => {
    if (statusFilter !== 'all' && promo.status !== statusFilter) return false;
    if (typeFilter !== 'all' && promo.discountType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        promo.code.toLowerCase().includes(q) ||
        promo.title.toLowerCase().includes(q) ||
        (promo.description && promo.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 select-none sm:select-auto font-sans antialiased text-[#171715]">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#7A776D] block">
            MARKETING & CONVERSION
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#171715]">
            Promotions & Discounts Engine
          </h2>
          <p className="text-xs text-[#5A584E] mt-1 max-w-xl">
            Configure percentage codes, flat rupee vouchers, and express shipping waivers redeemable across storefront checkout and concierge WhatsApp inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE PROMOTION</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Active Campaigns
            </span>
            <Tag className="w-4 h-4 text-[#3D4336]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              {stats.activePromotions}
            </span>
            <span className="text-[11px] text-[#7A776D] font-mono">
              / {stats.totalPromotions} total
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Live and valid in checkout
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Total Redemptions
            </span>
            <TrendingUp className="w-4 h-4 text-[#3D4336]" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              {stats.totalRedemptions.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Coupons applied across orders
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Shopper Savings
            </span>
            <Banknote className="w-4 h-4 text-[#3D4336]" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              ₹{stats.totalSavingsINR.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Total discount value granted
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A776D]">
              Avg Cart Threshold
            </span>
            <Layers className="w-4 h-4 text-[#3D4336]" />
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#171715]">
              ₹1,999
            </span>
          </div>
          <span className="text-[11px] text-[#5A584E] block mt-1">
            Storewide free express baseline
          </span>
        </div>
      </div>

      {/* Quick Preset Templates Strip */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#52792B]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#171715]">
              Quick Campaign Presets
            </h4>
          </div>
          <span className="text-[11px] text-[#7A776D] font-mono">
            Click to pre-fill template
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() =>
              handleOpenCreateModal({
                code: 'WELCOME10',
                title: 'Welcome 10% Off First Pair',
                description: '10% discount on first footwear purchase over ₹1,500.',
                discountType: 'percentage',
                discountValue: 10,
                minOrderINR: 1500,
                maxDiscountINR: 1000,
                usageLimit: 500,
              })
            }
            className="text-left p-3.5 bg-[#F5F1E8] hover:bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl transition duration-150 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#171715]">WELCOME10</span>
              <Percent className="w-3.5 h-3.5 text-[#5A584E]" />
            </div>
            <p className="text-[11px] text-[#5A584E] mt-1 line-clamp-1">
              10% Off · Min ₹1,500 · First-time shoppers
            </p>
          </button>

          <button
            onClick={() =>
              handleOpenCreateModal({
                code: 'SOLE500',
                title: 'Festival Privilege ₹500 Off',
                description: 'Flat ₹500 deduction on orders exceeding ₹3,000.',
                discountType: 'fixed_amount',
                discountValue: 500,
                minOrderINR: 3000,
                maxDiscountINR: 500,
                usageLimit: 250,
              })
            }
            className="text-left p-3.5 bg-[#F5F1E8] hover:bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl transition duration-150 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#171715]">SOLE500</span>
              <Banknote className="w-3.5 h-3.5 text-[#5A584E]" />
            </div>
            <p className="text-[11px] text-[#5A584E] mt-1 line-clamp-1">
              Flat ₹500 off · Min ₹3,000 cart value
            </p>
          </button>

          <button
            onClick={() =>
              handleOpenCreateModal({
                code: 'FREESHIP',
                title: 'Complimentary Express Air Delivery',
                description: 'Waive ₹150 express courier fee on any footwear order.',
                discountType: 'free_shipping',
                discountValue: 150,
                minOrderINR: 0,
                usageLimit: 1000,
              })
            }
            className="text-left p-3.5 bg-[#F5F1E8] hover:bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl transition duration-150 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#171715]">FREESHIP</span>
              <Truck className="w-3.5 h-3.5 text-[#5A584E]" />
            </div>
            <p className="text-[11px] text-[#5A584E] mt-1 line-clamp-1">
              Free Express Air Delivery · No minimum cart required
            </p>
          </button>
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
            placeholder="Search code, title, or campaign terms..."
            className="w-full pl-9 pr-4 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#8A8679] focus:outline-none focus:border-[#171715]"
          />
        </div>

        {/* Filter segment */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center p-1 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer capitalize text-[11px] ${
                  statusFilter === s
                    ? 'bg-[#171715] text-[#FAF8F5] shadow-xs'
                    : 'text-[#5A584E] hover:text-[#171715]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Type filter tabs */}
          <div className="flex items-center p-1 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'percentage', label: 'Percent %' },
              { id: 'fixed_amount', label: 'Flat ₹' },
              { id: 'free_shipping', label: 'Free Delivery' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                  typeFilter === t.id
                    ? 'bg-[#171715] text-[#FAF8F5] shadow-xs'
                    : 'text-[#5A584E] hover:text-[#171715]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Promotions Table */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#171715] mx-auto" />
            <p className="text-xs text-[#7A776D] font-mono">Loading promotion campaigns...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-[#C94A38] mx-auto" />
            <p className="text-xs text-[#C94A38]">{errorMessage}</p>
            <button
              onClick={fetchPromotions}
              className="px-4 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <Tag className="w-8 h-8 text-[#9C988D] mx-auto stroke-[1.5]" />
            <h4 className="font-serif text-lg font-semibold text-[#171715]">
              No promotions found
            </h4>
            <p className="text-xs text-[#7A776D] max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search terms or filter selection.'
                : 'Create your first promotional code to start rewarding shoppers.'}
            </p>
            <button
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Promotion</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DFD8CC] bg-[#F5F1E8] text-[10px] font-mono uppercase tracking-wider text-[#7A776D]">
                  <th className="py-3 px-4 font-medium">Coupon Code</th>
                  <th className="py-3 px-4 font-medium">Campaign / Description</th>
                  <th className="py-3 px-4 font-medium">Discount Rate</th>
                  <th className="py-3 px-4 font-medium">Order Terms</th>
                  <th className="py-3 px-4 font-medium">Redemptions</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD8CC] text-xs">
                {filteredPromotions.map((promo) => {
                  const isCopied = copiedCode === promo.code;
                  const isActive = promo.status === 'active';

                  return (
                    <tr key={promo.id} className="hover:bg-[#F5F1E8]/50 transition-colors">
                      {/* Code with Copy */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold tracking-wider bg-[#EAE5D9] px-2.5 py-1 rounded-lg border border-[#DFD8CC] text-[#171715]">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            title="Copy code to clipboard"
                            className="p-1 text-[#7A776D] hover:text-[#171715] transition cursor-pointer"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-[#52792B]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-4 px-4">
                        <div className="max-w-xs sm:max-w-sm">
                          <span className="font-semibold text-[#171715] block">
                            {promo.title}
                          </span>
                          <span className="text-[11px] text-[#5A584E] line-clamp-1 mt-0.5">
                            {promo.description || 'No description provided.'}
                          </span>
                        </div>
                      </td>

                      {/* Discount Rate */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-[#171715]">
                        {promo.discountType === 'percentage' && (
                          <div className="flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5 text-[#52792B]" />
                            <span>{promo.discountValue}% off</span>
                            {promo.maxDiscountINR && (
                              <span className="text-[10px] text-[#7A776D] font-mono">
                                (Max ₹{promo.maxDiscountINR.toLocaleString('en-IN')})
                              </span>
                            )}
                          </div>
                        )}
                        {promo.discountType === 'fixed_amount' && (
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5 text-[#3D4F28]" />
                            <span>₹{promo.discountValue.toLocaleString('en-IN')} flat</span>
                          </div>
                        )}
                        {promo.discountType === 'free_shipping' && (
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#3D4F28]" />
                            <span>Free Express Air</span>
                          </div>
                        )}
                      </td>

                      {/* Order Terms */}
                      <td className="py-4 px-4 whitespace-nowrap text-[#5A584E] text-[11px]">
                        <div>
                          {promo.minOrderINR > 0 ? (
                            <span>Min Cart: ₹{promo.minOrderINR.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-[#7A776D]">No Minimum Cart</span>
                          )}
                        </div>
                        {promo.endDate && (
                          <div className="text-[10px] text-[#7A776D] font-mono mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Exp: {new Date(promo.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>

                      {/* Redemptions */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs">
                          <span className="font-semibold text-[#171715]">{promo.usageCount}</span>
                          {promo.usageLimit ? (
                            <span className="text-[#7A776D]"> / {promo.usageLimit}</span>
                          ) : (
                            <span className="text-[#7A776D]"> (Unlimited)</span>
                          )}
                        </div>
                      </td>

                      {/* Status Switch */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(promo)}
                          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                        >
                          {isActive ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-[#52792B]" />
                              <span className="text-[#3D4F28] font-semibold text-[11px]">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-[#9C988D]" />
                              <span className="text-[#7A776D] text-[11px]">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(promo)}
                            title="Edit campaign terms"
                            className="p-1.5 text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePromotion(promo.id, promo.code)}
                            title="Delete promotion"
                            className="p-1.5 text-[#5A584E] hover:text-[#C94A38] hover:bg-[#FDF2F2] rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#DFD8CC] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A776D]">
                  {editingPromoId ? 'CAMPAIGN CONFIGURATION' : 'NEW PROMOTIONAL CAMPAIGN'}
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#171715] mt-0.5">
                  {editingPromoId ? `Edit ${formData.code}` : 'Create Promotion Code'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A776D] hover:text-[#171715] rounded-lg hover:bg-[#EAE5D9] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3.5 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl flex items-start gap-2.5 text-xs text-[#991B1B]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Row 1: Code and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                      })
                    }
                    placeholder="e.g. WELCOME10"
                    className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-bold text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  >
                    <option value="active">Active (Redeemable Now)</option>
                    <option value="inactive">Inactive (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Welcome 10% Off First Footwear Pair"
                  className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Description / Customer Terms
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Valid on all sneakers and runners. Cannot be combined with other offers."
                  className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                />
              </div>

              {/* Discount Type Selector Cards */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Discount Model *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'percentage', label: 'Percentage Off', icon: Percent, desc: 'e.g. 10% or 20% off subtotal' },
                    { id: 'fixed_amount', label: 'Flat Rupee Voucher', icon: Banknote, desc: 'e.g. ₹500 flat deduction' },
                    { id: 'free_shipping', label: 'Free Express Shipping', icon: Truck, desc: 'Waive express shipping fee' },
                  ].map((model) => {
                    const Icon = model.icon;
                    const isSelected = formData.discountType === model.id;
                    return (
                      <button
                        type="button"
                        key={model.id}
                        onClick={() => setFormData({ ...formData, discountType: model.id as any })}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#171715] text-[#FAF8F5] border-[#171715] shadow-xs'
                            : 'bg-[#F5F1E8] text-[#171715] border-[#DFD8CC] hover:bg-[#EAE5D9]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#DCE96A]' : 'text-[#5A584E]'}`} />
                          <span className="font-semibold text-xs">{model.label}</span>
                        </div>
                        <p className={`text-[10px] mt-1 ${isSelected ? 'text-[#DFD8CC]' : 'text-[#7A776D]'}`}>
                          {model.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Values row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.discountType !== 'free_shipping' ? (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                      {formData.discountType === 'percentage' ? 'Percentage Discount (%) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formData.discountType === 'percentage' ? '100' : '50000'}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-semibold text-[#171715] focus:outline-none focus:border-[#171715]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                      Shipping Fee Waived
                    </label>
                    <input
                      type="text"
                      disabled
                      value="₹150 (Standard Express Shipping Waived)"
                      className="w-full px-3.5 py-2.5 bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl text-xs text-[#5A584E]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Minimum Cart Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.minOrderINR}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderINR: Number(e.target.value) })
                    }
                    placeholder="0 for no minimum"
                    className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>
              </div>

              {/* Advanced row: Max Cap & Usage limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                      Maximum Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.maxDiscountINR || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountINR: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Leave empty for uncapped"
                      className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Usage Capacity Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#DFD8CC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-[#EAE5D9] hover:bg-[#DFD8CC] text-[#171715] font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] font-semibold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>{editingPromoId ? 'UPDATE PROMOTION' : 'CREATE CAMPAIGN'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
