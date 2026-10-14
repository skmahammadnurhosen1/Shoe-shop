import React, { useState, useEffect } from 'react';
import {
  Package,
  Eye,
  EyeOff,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Product } from '../../types';

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  hiddenProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
}

interface DashboardViewProps {
  onNavigateProducts: () => void;
  onAddNewProduct: () => void;
  onNavigateOrders: () => void;
  onNavigateStore: () => void;
  onNavigateInventory?: () => void;
  onNavigateCustomers?: () => void;
  onNavigateCategories?: () => void;
  onNavigateAnalytics?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateProducts,
  onAddNewProduct,
  onNavigateOrders,
  onNavigateStore,
  onNavigateInventory,
  onNavigateCustomers,
  onNavigateCategories,
  onNavigateAnalytics,
}) => {
  const { adminToken } = useAdminAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setLowStockItems(data.lowStockItems || []);
          setRecentOrders(data.recentOrders || []);
        }
      } else {
        setError('Failed to load store statistics.');
      }
    } catch {
      setError('Network error while connecting to administrative metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [adminToken]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Shortcuts */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(23,23,21,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5A584E] font-semibold block mb-1">
            EXECUTIVE OVERVIEW
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#171715]">
            SOLEFORM Store Performance
          </h2>
          <p className="mt-1 text-xs text-[#5A584E] max-w-xl">
            Live catalog availability, inventory status, and order processing tracked from server records.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNavigateAnalytics}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#626849] hover:bg-[#4E5338] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm"
          >
            <BarChart2 className="w-4 h-4" />
            <span>ANALYTICS & REPORTS</span>
          </button>

          <button
            onClick={onAddNewProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ADD PRODUCT</span>
          </button>

          <button
            onClick={onNavigateProducts}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EAE5D9] border border-[#DFD8CC] text-[#171715] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#4A493D]" />
            <span>MANAGE CATALOG</span>
          </button>

          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2.5 text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9] border border-[#DFD8CC] rounded-xl transition cursor-pointer"
            aria-label="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {error && (
        <div className="p-4 bg-[#FDF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div
          onClick={onNavigateProducts}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">TOTAL PRODUCTS</span>
            <Package className="w-4 h-4 text-[#4A493D] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715]">
            {isLoading ? '...' : stats?.totalProducts || 0}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">Active catalog styles</span>
        </div>

        {/* Published & Visible */}
        <div
          onClick={onNavigateProducts}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">PUBLISHED IN STORE</span>
            <Eye className="w-4 h-4 text-[#3D4F28]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#3D4F28]">
            {isLoading ? '...' : stats?.publishedProducts || 0}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">Visible to storefront shoppers</span>
        </div>

        {/* Hidden / Draft */}
        <div
          onClick={onNavigateProducts}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">HIDDEN / DRAFTS</span>
            <EyeOff className="w-4 h-4 text-[#7A776D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#7A776D]">
            {isLoading ? '...' : stats?.hiddenProducts || 0}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">Not visible in catalogue</span>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={onNavigateInventory || onNavigateProducts}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">LOW / OUT OF STOCK</span>
            <AlertTriangle className="w-4 h-4 text-[#B45309] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#B45309]">
            {isLoading ? '...' : (stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">
            {stats?.outOfStockProducts || 0} out of stock (Open Ledger)
          </span>
        </div>

        {/* Orders Placed */}
        <div
          onClick={onNavigateOrders}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">TOTAL ORDERS</span>
            <ShoppingBag className="w-4 h-4 text-[#4A493D] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715]">
            {isLoading ? '...' : stats?.totalOrders || 0}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">
            {stats?.pendingOrders || 0} pending processing
          </span>
        </div>

        {/* Customer Directory */}
        <div
          onClick={onNavigateCustomers}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">REGISTERED USERS</span>
            <Users className="w-4 h-4 text-[#4A493D] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#171715]">
            {isLoading ? '...' : stats?.totalCustomers || 0}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">Accounts in database</span>
        </div>

        {/* Out of Stock Dedicated */}
        <div
          onClick={onNavigateInventory || onNavigateProducts}
          className="p-5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A584E] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">DEPLETED INVENTORY</span>
            <XCircle className="w-4 h-4 text-[#991B1B] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#991B1B]">
            {isLoading ? '...' : stats?.outOfStockProducts || 0}
          </div>
          <span className="text-[11px] text-[#5A584E] mt-1 block">Unavailable for purchase</span>
        </div>

        {/* Storefront Status */}
        <div className="p-5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl shadow-[0_2px_12px_rgba(23,23,21,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5A584E]">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] font-medium">STORE INTEGRATION</span>
            <TrendingUp className="w-4 h-4 text-[#3D4F28]" />
          </div>
          <div className="my-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2E6] text-[#3D4F28] rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#52792B] animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <button
            onClick={onNavigateStore}
            className="text-[11px] font-medium text-[#171715] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Preview storefront</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Two Column Section: Low Stock Inventory & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(23,23,21,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#171715]">
                Low Stock Thresholds
              </h3>
              <p className="text-[11px] text-[#5A584E]">
                Products requiring replenishment
              </p>
            </div>
            <button
              onClick={onNavigateInventory || onNavigateProducts}
              className="text-xs font-semibold text-[#171715] hover:text-[#4A493D] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center bg-[#F5F1E8] rounded-xl border border-dashed border-[#DFD8CC]">
              <p className="text-xs text-[#5A584E]">
                All catalog inventory is well-stocked above thresholds.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DFD8CC] overflow-hidden">
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg bg-[#EAE5D9] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-[#171715] truncate">
                        {item.name}
                      </span>
                      <span className="block text-[10px] font-mono text-[#7A776D]">
                        SKU: {item.sku || 'N/A'} • {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        item.stockCount === 0
                          ? 'bg-[#FDF2F2] text-[#991B1B] border border-[#FCA5A5]'
                          : 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                      }`}
                    >
                      {item.stockCount === 0 ? 'OUT OF STOCK' : `${item.stockCount} units remaining`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(23,23,21,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#171715]">
                Recent Customer Orders
              </h3>
              <p className="text-[11px] text-[#5A584E]">
                Recorded purchases and WhatsApp orders
              </p>
            </div>
            <button
              onClick={onNavigateOrders}
              className="text-xs font-semibold text-[#171715] hover:text-[#4A493D] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center bg-[#F5F1E8] rounded-xl border border-dashed border-[#DFD8CC]">
              <p className="text-xs text-[#5A584E]">
                No customer orders recorded yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DFD8CC] overflow-hidden">
              {recentOrders.map((order) => (
                <div key={order.orderId} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#171715]">
                        #{order.orderId}
                      </span>
                      <span className="text-[10px] text-[#7A776D] font-mono">
                        {order.date}
                      </span>
                    </div>
                    <span className="block text-[11px] text-[#5A584E] truncate">
                      {order.customerName} • {order.items?.length || 1} item(s)
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-mono font-semibold text-[#171715]">
                      ₹{order.totalINR?.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.2 text-[9px] font-mono rounded ${
                        order.status === 'Confirmed' || order.status === 'Delivered'
                          ? 'bg-[#EEF2E6] text-[#3D4F28]'
                          : order.status === 'Cancelled'
                          ? 'bg-[#FDF2F2] text-[#991B1B]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
