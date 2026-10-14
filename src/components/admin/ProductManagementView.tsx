import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Product, ProductStatus } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { ProductDetailsView } from './ProductDetailsView';

interface ProductManagementViewProps {
  onNavigateStore: () => void;
  openCreateOnMount?: boolean;
  initialCategoryFilter?: string;
  initialDetailProductId?: string;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  onNavigateStore,
  openCreateOnMount = false,
  initialCategoryFilter = 'all',
  initialDetailProductId,
}) => {
  const { adminToken } = useAdminAuth();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Detail View State
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialDetailProductId || null
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'price' | 'stock'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(openCreateOnMount);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedStockStatus !== 'all') params.append('stockStatus', selectedStockStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        setError('Failed to load products catalogue.');
      }
    } catch {
      setError('Network communication error fetching products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedStatus, selectedStockStatus, sortBy, sortOrder]);

  useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== 'all') {
      setSelectedCategory(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle Visibility Status (Published <-> Hidden)
  const handleToggleStatus = async (product: Product) => {
    const nextStatus: ProductStatus = product.status === 'hidden' ? 'published' : 'hidden';
    try {
      const res = await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete / Archive Product
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: '',
      name: `${product.name} (Copy)`,
      sku: `${product.sku || 'SF'}-COPY-${Math.floor(10 + Math.random() * 90)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingProduct(duplicated);
    setIsModalOpen(true);
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkSetStatus = async (status: ProductStatus) => {
    for (const id of selectedIds) {
      await fetch(`/api/admin/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
    }
    fetchProducts();
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
    }
    fetchProducts();
    setSelectedIds([]);
    setConfirmBulkDelete(false);
  };

  // Categories list extracted from data
  const categoryOptions = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  // Pagination calculation
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);  if (selectedProductId) {
    return (
      <ProductDetailsView
        productId={selectedProductId}
        onBack={() => {
          setSelectedProductId(null);
          fetchProducts();
        }}
        onNavigateStore={onNavigateStore}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#171715]">
            Product Catalog
          </h2>
          <p className="text-xs text-[#5A584E] mt-0.5">
            {products.length} footwear styles configured in database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-4 shadow-[0_2px_12px_rgba(23,23,21,0.02)] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A776D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, or category..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] placeholder-[#9C988D] focus:ring-1 focus:ring-[#3D4336] outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Publication Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
            <option value="draft">Draft</option>
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock (≤ 5)</option>
            <option value="out-of-stock">Out of Stock (0)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock Level</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>

        {/* Bulk Action Strip (When items selected) */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-[#DFD8CC] flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            <span className="font-medium text-[#171715]">
              {selectedIds.length} product(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkSetStatus('published')}
                className="px-3 py-1.5 bg-[#EEF2E6] text-[#3D4F28] hover:bg-[#CBD5C0] rounded-lg font-semibold transition"
              >
                Publish Selected
              </button>
              <button
                onClick={() => handleBulkSetStatus('hidden')}
                className="px-3 py-1.5 bg-[#EAE5D9] text-[#4A493D] hover:bg-[#DFD8CC] rounded-lg font-semibold transition"
              >
                Hide Selected
              </button>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-3 py-1.5 bg-[#FDF2F2] text-[#991B1B] hover:bg-[#FCA5A5] rounded-lg font-semibold transition"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B]">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(23,23,21,0.02)]">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#7A776D] mb-2" />
            <p className="text-xs text-[#5A584E]">Loading catalogue records...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-semibold text-[#171715]">No products found</p>
            <p className="text-xs text-[#5A584E]">
              Try adjusting your search queries or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedStockStatus('all');
              }}
              className="text-xs font-semibold text-[#171715] underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] border-b border-[#DFD8CC] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="cursor-pointer text-[#171715]"
                    >
                      {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-[#7A776D]" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD8CC]">
                {paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = Number(p.stockCount) > 0 && Number(p.stockCount) <= Number(p.lowStockThreshold || 5);
                  const isOutOfStock = Number(p.stockCount) === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#F5F1E8]/60 transition ${
                        isSelected ? 'bg-[#EEF2E6]/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleSelectId(p.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#171715]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#7A776D]" />
                          )}
                        </button>
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedProductId(p.id)}
                          className="flex items-center gap-3 text-left group cursor-pointer"
                          title="Click to view full product details"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl bg-[#EAE5D9] border border-[#DFD8CC] shrink-0 group-hover:scale-105 transition"
                          />
                          <div className="min-w-0">
                            <span className="block font-semibold text-[#171715] group-hover:underline truncate">
                              {p.name}
                            </span>
                            <span className="block text-[11px] text-[#7A776D] truncate">
                              {p.department} • {p.colors?.length || 1} color(s)
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#4A493D]">
                        {p.sku || 'N/A'}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-[#4A493D]">
                        {p.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-semibold text-[#171715]">
                          ₹{p.priceINR?.toLocaleString('en-IN')}
                        </span>
                        {p.originalPriceINR && (
                          <span className="block text-[10px] text-[#7A776D] line-through">
                            ₹{p.originalPriceINR.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              isOutOfStock
                                ? 'bg-[#FDF2F2] text-[#991B1B] border border-[#FCA5A5]'
                                : isLowStock
                                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                                : 'bg-[#EEF2E6] text-[#3D4F28]'
                            }`}
                          >
                            {isOutOfStock ? 'OUT OF STOCK' : `${p.stockCount} in stock`}
                          </span>
                        </div>
                      </td>

                      {/* Publication Status Badge */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          title="Click to toggle publish/hide"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition ${
                            !p.status || p.status === 'published'
                              ? 'bg-[#EEF2E6] text-[#3D4F28] hover:bg-[#CBD5C0]'
                              : p.status === 'hidden'
                              ? 'bg-[#F5F1E8] text-[#7A776D] border border-[#DFD8CC] hover:bg-[#EAE5D9]'
                              : 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]'
                          }`}
                        >
                          {!p.status || p.status === 'published' ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : p.status === 'hidden' ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          ) : (
                            <span>Draft</span>
                          )}
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedProductId(p.id)}
                            title="View full product details & metrics"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#171715] text-[#FAF8F5] hover:bg-[#2A2925] rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            title="Edit product"
                            className="p-1.5 text-[#4A493D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            title="Duplicate product"
                            className="p-1.5 text-[#4A493D] hover:text-[#171715] hover:bg-[#EAE5D9] rounded-lg transition cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            title="Archive / Delete product"
                            className="p-1.5 text-[#7A776D] hover:text-[#991B1B] hover:bg-[#FDF2F2] rounded-lg transition"
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

        {/* Pagination Bar */}
        {products.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-[#DFD8CC] bg-[#FAF8F5] flex items-center justify-between">
            <span className="text-xs text-[#5A584E]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, products.length)} of {products.length} footwear styles
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 border border-[#DFD8CC] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EAE5D9]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-semibold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 border border-[#DFD8CC] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EAE5D9]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Single Product Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#991B1B]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-semibold text-[#171715]">
                Confirm Product Archival
              </h3>
            </div>
            <p className="text-xs text-[#5A584E] leading-relaxed">
              Are you sure you want to delete this product? It will be safely archived and hidden from the public storefront, while preserving past order records.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-[#DFD8CC] rounded-xl text-xs font-semibold hover:bg-[#EAE5D9]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(confirmDeleteId)}
                className="px-4 py-2 bg-[#991B1B] text-white rounded-xl text-xs font-semibold hover:bg-[#7F1D1D]"
              >
                Archive Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#991B1B]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-semibold text-[#171715]">
                Delete {selectedIds.length} Products
              </h3>
            </div>
            <p className="text-xs text-[#5A584E] leading-relaxed">
              This action will archive all {selectedIds.length} selected items and remove them from public category listings.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 border border-[#DFD8CC] rounded-xl text-xs font-semibold hover:bg-[#EAE5D9]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-[#991B1B] text-white rounded-xl text-xs font-semibold hover:bg-[#7F1D1D]"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={() => {
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};
