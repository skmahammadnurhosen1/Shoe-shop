import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  ArrowUpDown,
  Check,
  X,
  Upload,
  AlertCircle,
  ExternalLink,
  Loader2,
  Package,
} from 'lucide-react';
import { AdminCategory, DepartmentType } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface CategoriesManagementViewProps {
  onNavigateProductsWithCategory?: (categoryName: string) => void;
  onNavigateStore?: () => void;
}

export const CategoriesManagementView: React.FC<CategoriesManagementViewProps> = ({
  onNavigateProductsWithCategory,
  onNavigateStore,
}) => {
  const { adminToken } = useAdminAuth();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<AdminCategory | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    department: DepartmentType;
    image: string;
    displayOrder: number;
    status: 'active' | 'hidden';
  }>({
    name: '',
    slug: '',
    description: '',
    department: 'Unisex',
    image: '',
    displayOrder: 1,
    status: 'active',
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [adminToken]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      department: 'Unisex',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=85',
      displayOrder: categories.length + 1,
      status: 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      department: cat.department || 'Unisex',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 1,
      status: cat.status || 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingCategory) {
      const autoSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const endpoint = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      await fetchCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        setDeleteConfirmCat(null);
        await fetchCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleToggleStatus = async (cat: AdminCategory) => {
    const nextStatus = cat.status === 'active' ? 'hidden' : 'active';
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept =
      selectedDepartment === 'all' ||
      (cat.department && cat.department.toLowerCase() === selectedDepartment.toLowerCase());

    return matchesSearch && matchesDept;
  });

  const totalAssignedProducts = categories.reduce(
    (sum, c) => sum + (c.productCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A584E] mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#171715] font-semibold">Categories & Collections</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171715]">
            Taxonomy & Merchandising
          </h1>
          <p className="text-xs text-[#5A584E] mt-0.5">
            Organize products into departments, seasonals, and high-conversion storefront collections.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Total Categories</span>
          <p className="text-2xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
            {categories.length}
          </p>
        </div>
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Active on Storefront</span>
          <p className="text-2xl font-serif font-bold text-[#3D4336] mt-1 tabular-nums">
            {categories.filter((c) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Hidden / Seasonal</span>
          <p className="text-2xl font-serif font-bold text-[#8A8778] mt-1 tabular-nums">
            {categories.filter((c) => c.status === 'hidden').length}
          </p>
        </div>
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Assigned Products</span>
          <p className="text-2xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
            {totalAssignedProducts}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8778]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name, slug or description..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] placeholder:text-[#8A8778] focus:outline-none focus:border-[#3D4336]"
          />
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#EAE5D9] p-1 rounded-lg shrink-0 overflow-x-auto">
          {['all', 'Men', 'Women', 'Unisex'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedDepartment.toLowerCase() === dept.toLowerCase()
                  ? 'bg-white text-[#171715] shadow-xs'
                  : 'text-[#5A584E] hover:text-[#171715]'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#5A584E] gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#171715]" />
            <span>Loading categories catalog...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAE5D9] flex items-center justify-center mx-auto text-[#4A493D]">
              <FolderTree className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#171715]">
              No categories found
            </h3>
            <p className="text-xs text-[#5A584E] max-w-sm mx-auto">
              {searchQuery
                ? `No matching categories for "${searchQuery}". Try adjusting your search term.`
                : 'Start by creating your first footwear category.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Category</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFD8CC] bg-[#F5F1E8] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Assigned SKUs</th>
                  <th className="py-3 px-4 text-center">Display Order</th>
                  <th className="py-3 px-4 text-center">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD8CC]">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#EAE5D9] border border-[#DFD8CC] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#EAE5D9] border border-[#DFD8CC] flex items-center justify-center shrink-0 text-[#8A8778]">
                            <FolderTree className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#171715] text-sm">{cat.name}</p>
                          <p className="text-[11px] text-[#5A584E] line-clamp-1 max-w-xs">
                            {cat.description || 'No description entered'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs text-[#5A584E]">
                        {cat.department || 'Unisex'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#8A8778]">
                      /{cat.slug}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onNavigateProductsWithCategory?.(cat.name)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAE5D9] text-[#171715] hover:bg-[#171715] hover:text-[#FAF8F5] transition-colors font-mono tabular-nums text-xs"
                        title="Click to view products in this category"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{cat.productCount || 0}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums text-xs text-[#5A584E]">
                      #{cat.displayOrder || 1}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          cat.status === 'active'
                            ? 'bg-[#E3E7DE] text-[#3D4336] hover:bg-[#d5dccf]'
                            : 'bg-[#EAE5D9] text-[#8A8778] hover:bg-[#DFD8CC]'
                        }`}
                      >
                        {cat.status === 'active' ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9] transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCat(cat)}
                          className="p-1.5 rounded-lg text-[#8A8778] hover:text-[#B91C1C] hover:bg-red-50 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#DFD8CC]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#171715]">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-xs text-[#5A584E]">
                  Configure taxonomy details, URL slug, and storefront banner.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8A8778] hover:text-[#171715] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Men's Sneakers"
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. mens-sneakers"
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-mono text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                </div>
              </div>

              {/* Department & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value as DepartmentType }))}
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="All">All Departments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    Display Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short editorial summary for collection header..."
                  className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                  Hero Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-9 h-9 rounded-lg object-cover border border-[#DFD8CC] shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Status Radio */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1.5">
                  Visibility Status
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
                      className="accent-[#171715]"
                    />
                    <span>Active (Visible on store)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'hidden'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'hidden' }))}
                      className="accent-[#171715]"
                    />
                    <span>Hidden (Draft / Seasonal)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFD8CC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#DFD8CC] text-[#5A584E] hover:text-[#171715] text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#171715]">
                Delete "{deleteConfirmCat.name}"?
              </h3>
              <p className="text-xs text-[#5A584E] mt-1 leading-relaxed">
                This will remove the category from store taxonomies. Assigned products ({deleteConfirmCat.productCount || 0}) will remain in the catalogue but may need a new category assignment.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 border border-[#DFD8CC] text-[#5A584E] hover:text-[#171715] text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmCat.id)}
                className="px-4 py-2 bg-red-700 text-white text-xs font-semibold rounded-xl hover:bg-red-800"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
