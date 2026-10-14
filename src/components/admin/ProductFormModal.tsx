import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Product, ColorSwatch, ProductStatus } from '../../types';

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

const CATEGORY_OPTIONS = [
  "Men's Sneakers",
  "Men's Casual",
  "Men's Running",
  "Women's Sneakers",
  "Women's Running",
  "Women's Casual",
  "Classic Styles",
  "Everyday Essentials",
];

const DEPARTMENT_OPTIONS = ['Men', 'Women', 'Unisex', 'Running', 'Casual'] as const;

const AVAILABLE_SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { adminToken } = useAdminAuth();

  const isEditing = Boolean(product);

  // Form State
  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [category, setCategory] = useState(product?.category || "Men's Sneakers");
  const [availableCategories, setAvailableCategories] = useState<string[]>(CATEGORY_OPTIONS);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            const names = data.categories.map((c: any) => c.name);
            const combined = Array.from(new Set([...CATEGORY_OPTIONS, ...names]));
            if (product?.category && !combined.includes(product.category)) {
              combined.push(product.category);
            }
            setAvailableCategories(combined);
          }
        }
      } catch {
        // Fallback to CATEGORY_OPTIONS
      }
    };
    fetchCategories();
  }, [product]);

  const [department, setDepartment] = useState<'Men' | 'Women' | 'Unisex' | 'Running' | 'Casual'>(
    product?.department || 'Men'
  );
  const [priceINR, setPriceINR] = useState<number | ''>(product?.priceINR ?? 2999);
  const [originalPriceINR, setOriginalPriceINR] = useState<number | ''>(product?.originalPriceINR ?? '');
  const [stockCount, setStockCount] = useState<number | ''>(product?.stockCount ?? 15);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(
    product?.lowStockThreshold ?? 5
  );
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'published');
  const [isFeatured, setIsFeatured] = useState<boolean>(product?.isFeatured || false);

  // Imagery
  const [mainImage, setMainImage] = useState<string>(
    product?.image || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=85'
  );
  const [gallery, setGallery] = useState<string[]>(product?.gallery || [mainImage]);

  // Description & Details
  const [description, setDescription] = useState(
    product?.description || 'Thoughtfully engineered silhouette for all-day comfort and timeless movement.'
  );
  const [materials, setMaterials] = useState(
    product?.materials || 'Upper: Recycled engineered mesh & nubuck suede. Midsole: Cushion EVA foam.'
  );
  const [careInstructions, setCareInstructions] = useState(
    product?.careInstructions || 'Spot clean with lukewarm water and mild cloth. Air dry.'
  );
  const [features, setFeatures] = useState<string[]>(
    product?.features || [
      'Ergonomic dual-density cushioning',
      'Breathable reinforced upper',
      'High-traction rubber outsole',
    ]
  );
  const [newFeatureText, setNewFeatureText] = useState('');

  // Variants (Sizes & Colors)
  const [sizes, setSizes] = useState<number[]>(product?.sizes || [7, 8, 9, 10, 11]);
  const [colors, setColors] = useState<ColorSwatch[]>(
    product?.colors || [
      { name: 'Olive Green', hex: '#626849' },
      { name: 'Sand Cream', hex: '#DDD2BC' },
    ]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#4A493D');

  // Metadata
  const [weight, setWeight] = useState(product?.weight || '320g per shoe (UK 8)');
  const [dimensions, setDimensions] = useState(product?.dimensions || '30 x 20 x 12 cm');
  const [deliveryInfo, setDeliveryInfo] = useState(
    product?.deliveryInfo || 'Dispatched within 24-48 hours. Express delivery across India in 3-5 business days.'
  );
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription || '');

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'variants' | 'details' | 'seo'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate SKU & Slug if empty
  const handleNameBlur = () => {
    if (!sku && name.trim()) {
      const acronym = name
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);
      setSku(`SF-${acronym || 'SHOE'}-${Math.floor(100 + Math.random() * 900)}`);
    }
    if (!slug && name.trim()) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Toggle shoe size
  const handleToggleSize = (size: number) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  // Add Color Swatch
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  // Remove Color Swatch
  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Feature Item
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  // Remove Feature Item
  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Image File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            data: base64,
            filename: file.name,
          }),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          if (target === 'main') {
            setMainImage(data.url);
            if (!gallery.includes(data.url)) {
              setGallery((prev) => [data.url, ...prev]);
            }
          } else {
            setGallery((prev) => [...prev, data.url]);
          }
        } else {
          setFormError(data.error || 'Failed to upload image.');
        }
      } catch {
        setFormError('Network error uploading image.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Product name is required.');
      setActiveTab('basic');
      return;
    }

    if (!sku.trim()) {
      setFormError('Unique SKU identifier is required.');
      setActiveTab('basic');
      return;
    }

    if (priceINR === '' || Number(priceINR) < 0) {
      setFormError('Please provide a valid regular price in INR.');
      setActiveTab('pricing');
      return;
    }

    if (sizes.length === 0) {
      setFormError('Select at least one shoe size.');
      setActiveTab('variants');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      slug: slug.trim() || undefined,
      category: category.trim(),
      department,
      priceINR: Number(priceINR),
      originalPriceINR: originalPriceINR ? Number(originalPriceINR) : undefined,
      stockCount: stockCount === '' ? 0 : Number(stockCount),
      lowStockThreshold: lowStockThreshold === '' ? 5 : Number(lowStockThreshold),
      status,
      isFeatured,
      image: mainImage,
      gallery: gallery.length > 0 ? gallery : [mainImage],
      description: description.trim(),
      materials: materials.trim() || undefined,
      careInstructions: careInstructions.trim() || undefined,
      features,
      sizes,
      colors,
      weight: weight.trim() || undefined,
      dimensions: dimensions.trim() || undefined,
      deliveryInfo: deliveryInfo.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    try {
      const url = isEditing && product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = isEditing && product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSaved(data.product);
        onClose();
      } else {
        setFormError(data.error || 'Failed to save product details.');
      }
    } catch {
      setFormError('Network communication error while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#DFD8CC] flex items-center justify-between bg-[#F5F1E8]">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#171715]">
              {isEditing && product ? `Edit Product: ${product.name}` : 'Add New Footwear Style'}
            </h2>
            <p className="text-[11px] text-[#5A584E]">
              {isEditing && product
                ? `ID: ${product.id} • SKU: ${product.sku || 'N/A'}`
                : 'Create and configure a new product for the SOLEFORM catalogue.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7A776D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-xl transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="px-6 border-b border-[#DFD8CC] bg-[#FAF8F5] flex overflow-x-auto gap-4 text-xs font-semibold scrollbar-none">
          {[
            { id: 'basic', label: '1. Basic Info' },
            { id: 'pricing', label: '2. Pricing & Stock' },
            { id: 'media', label: '3. Media & Imagery' },
            { id: 'variants', label: '4. Sizes & Colors' },
            { id: 'details', label: '5. Specifications' },
            { id: 'seo', label: '6. Visibility & SEO' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 tracking-wider whitespace-nowrap uppercase cursor-pointer transition ${
                activeTab === tab.id
                  ? 'border-[#171715] text-[#171715]'
                  : 'border-transparent text-[#7A776D] hover:text-[#171715]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {formError && (
            <div className="p-3.5 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="e.g. Form Runner 02"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:ring-1 focus:ring-[#3D4336] focus:border-[#3D4336] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    SKU Identifier *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SF-RUN-02-OLV"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono uppercase text-[#171715] focus:ring-1 focus:ring-[#3D4336] focus:border-[#3D4336] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:ring-1 focus:ring-[#3D4336] focus:border-[#3D4336] outline-none"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:ring-1 focus:ring-[#3D4336] focus:border-[#3D4336] outline-none"
                  >
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="form-runner-02"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono text-[#171715] focus:ring-1 focus:ring-[#3D4336] focus:border-[#3D4336] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Full Product Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the footwear design, ergonomics, and daily feel..."
                  className="w-full p-3 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:ring-1 focus:ring-[#3D4336] focus:border-[#3D4336] outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Regular Price (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#7A776D]">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={priceINR}
                      onChange={(e) => setPriceINR(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="2999"
                      required
                      className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono font-semibold text-[#171715] focus:ring-1 focus:ring-[#3D4336] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Original Price / Compare At (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#7A776D]">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={originalPriceINR}
                      onChange={(e) => setOriginalPriceINR(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="3499 (optional strike-through)"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono text-[#171715] focus:ring-1 focus:ring-[#3D4336] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Current Stock Quantity (Total Units) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="15"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono font-semibold text-[#171715] focus:ring-1 focus:ring-[#3D4336] outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#7A776D]">
                    Set to 0 to mark as Sold Out on the storefront.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono text-[#171715] focus:ring-1 focus:ring-[#3D4336] outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#7A776D]">
                    Triggers warning banner on admin dashboard when stock dips below this number.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & IMAGERY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Main Image */}
              <div className="p-4 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl space-y-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715]">
                  Primary Product Card Image
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={mainImage}
                    alt="Main preview"
                    className="w-24 h-24 object-cover rounded-xl border border-[#DFD8CC] bg-[#FAF8F5] shrink-0"
                  />
                  <div className="space-y-2 flex-1 w-full">
                    <input
                      type="url"
                      value={mainImage}
                      onChange={(e) => setMainImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-lg text-xs font-mono text-[#171715] outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] rounded-lg text-[11px] font-semibold cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, 'main')}
                          className="hidden"
                        />
                      </label>
                      {isUploading && (
                        <span className="text-[11px] text-[#5A584E] flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#171715]">
                    Gallery Showcases ({gallery.length})
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAE5D9] hover:bg-[#DFD8CC] text-[#171715] rounded-lg text-xs font-semibold cursor-pointer transition">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'gallery')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gallery.map((imgUrl, idx) => (
                    <div key={idx} className="relative group border border-[#DFD8CC] rounded-xl overflow-hidden bg-[#FAF8F5]">
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMainImage(imgUrl)}
                          title="Set as Main"
                          className="p-1 bg-white rounded text-[10px] text-[#171715] font-semibold"
                        >
                          Main
                        </button>
                        <button
                          type="button"
                          onClick={() => setGallery((prev) => prev.filter((_, i) => i !== idx))}
                          title="Remove"
                          className="p-1 bg-white text-red-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {mainImage === imgUrl && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#171715] text-[#FAF8F5] text-[9px] font-mono rounded">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIZES & COLORS */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-2">
                  Available UK/India Footwear Sizes *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSelected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`w-11 h-11 rounded-xl text-xs font-mono font-semibold transition cursor-pointer flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#171715] text-[#FAF8F5] border-[#171715]'
                            : 'bg-[#FAF8F5] text-[#171715] border-[#DFD8CC] hover:bg-[#EAE5D9]'
                        }`}
                      >
                        UK {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-3 pt-3 border-t border-[#DFD8CC]">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715]">
                  Color Variations & Swatches
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  {colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                      <span className="font-medium text-[#171715]">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-[#7A776D] hover:text-red-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 p-0.5 rounded-xl border border-[#DFD8CC] bg-white cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color Name (e.g. Forest Green)"
                    className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3.5 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl"
                  >
                    Add Swatch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DETAILS & MATERIALS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Composition & Materials
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="Upper: 65% Recycled Ripstop Nylon, 35% Nubuck Suede..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                  Care & Maintenance Instructions
                </label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="Spot clean with cold water and soft brush..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                />
              </div>

              {/* Features Bullet List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715]">
                  Bullet Highlights ({features.length})
                </label>
                <div className="space-y-1.5">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F5F1E8] rounded-xl text-xs text-[#171715]">
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-[#7A776D] hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Add highlight (e.g. Dual-density antimicrobial insole)"
                    className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VISIBILITY & SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715]">
                  Catalogue Publication Status *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'published', label: 'Published', desc: 'Visible on storefront' },
                    { val: 'hidden', label: 'Hidden', desc: 'Invisible to shoppers' },
                    { val: 'draft', label: 'Draft', desc: 'Work in progress' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setStatus(opt.val as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        status === opt.val
                          ? 'bg-[#171715] text-[#FAF8F5] border-[#171715]'
                          : 'bg-[#FAF8F5] text-[#171715] border-[#DFD8CC]'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{opt.label}</span>
                      <span className="block text-[10px] opacity-70 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Flag */}
              <div className="flex items-center justify-between p-4 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl">
                <div>
                  <span className="block text-xs font-semibold text-[#171715]">
                    Feature on Homepage
                  </span>
                  <span className="block text-[10px] text-[#5A584E]">
                    Promote this shoe style within hero lookbooks and featured sections.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 accent-[#171715] rounded cursor-pointer"
                />
              </div>

              {/* SEO Tags */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={`${name || 'Footwear'} | SOLEFORM Considered Footwear`}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Search engine summary text..."
                    className="w-full p-3 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#DFD8CC] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-transparent hover:bg-[#EAE5D9] text-[#171715] text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.15em] rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
