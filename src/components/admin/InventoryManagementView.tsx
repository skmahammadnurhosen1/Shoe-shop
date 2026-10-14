import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  History,
  Sliders,
  ArrowUpDown,
  Tag,
  Loader2,
  FileText,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { InventoryItem, InventoryLog, InventoryAdjustmentReason } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface InventorySummary {
  totalSKUs: number;
  totalUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValuationINR: number;
}

export const InventoryManagementView: React.FC = () => {
  const { adminToken } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'ledger' | 'logs'>('ledger');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [healthFilter, setHealthFilter] = useState<'all' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Adjustment Modal
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<'delta' | 'exact'>('delta');
  const [deltaValue, setDeltaValue] = useState<number>(10);
  const [exactValue, setExactValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<InventoryAdjustmentReason>('Restock / Shipment Received');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState<boolean>(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.inventory || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/inventory/logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load inventory logs:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchLogs();
  }, [adminToken]);

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustMode('delta');
    setDeltaValue(10);
    setExactValue(item.stockCount);
    setAdjustReason('Restock / Shipment Received');
    setAdjustNote('');
    setAdjustError(null);
    setAdjustSuccessMsg(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    setIsSubmittingAdjust(true);
    setAdjustError(null);

    try {
      const payload: any = {
        productId: selectedItemForAdjust.id,
        reason: adjustReason,
        note: adjustNote.trim() || undefined,
      };

      if (adjustMode === 'delta') {
        payload.delta = deltaValue;
      } else {
        payload.newQuantity = exactValue;
      }

      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      setAdjustSuccessMsg(data.message || 'Stock updated successfully');
      await fetchInventory();
      await fetchLogs();

      setTimeout(() => {
        setSelectedItemForAdjust(null);
        setAdjustSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setAdjustError(err.message || 'Adjustment failed');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const categoriesList = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHealth = healthFilter === 'all' || item.health === healthFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesHealth && matchesCategory;
  });

  const lowStockAlertItems = items.filter((i) => i.health === 'Low Stock' || i.health === 'Out of Stock');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A584E] mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#171715] font-semibold">Inventory Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171715]">
            Stock Health & Warehousing
          </h1>
          <p className="text-xs text-[#5A584E] mt-0.5">
            Monitor real-time SKU levels, manage reason-tagged restocks, and track audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchInventory();
              fetchLogs();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#DFD8CC] text-[#171715] bg-[#FAF8F5] hover:bg-[#EAE5D9] text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stock</span>
          </button>
        </div>
      </div>

      {/* Critical Low Stock Alert Banner (if applicable) */}
      {lowStockAlertItems.length > 0 && (
        <div className="bg-[#FAF5EF] border border-[#E8DAC2] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E2D5BA] flex items-center justify-center text-[#8C6D23] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#171715]">
                Reorder Alert: {lowStockAlertItems.length} styles require immediate restocking
              </h3>
              <p className="text-xs text-[#5A584E] mt-0.5">
                Current inventory levels have dropped below your assigned safety buffer threshold (≤ 5 units).
              </p>
            </div>
          </div>
          <button
            onClick={() => setHealthFilter('Low Stock')}
            className="px-3.5 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] transition-colors whitespace-nowrap self-start md:self-auto"
          >
            Filter Low-Stock SKUs
          </button>
        </div>
      )}

      {/* Metrics Strip */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Total Warehouse Units</span>
            <p className="text-2xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
              {summary.totalUnits.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Across {summary.totalSKUs} unique SKUs
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Healthy Stock</span>
            <p className="text-2xl font-serif font-bold text-[#3D4336] mt-1 tabular-nums">
              {summary.inStockCount}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Normal operational buffers
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Low Stock & Depleted</span>
            <p className="text-2xl font-serif font-bold text-[#9A6A1E] mt-1 tabular-nums">
              {summary.lowStockCount + summary.outOfStockCount}
            </p>
            <span className="text-[10px] text-[#9A6A1E] font-mono mt-0.5 block">
              {summary.outOfStockCount} out of stock
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Inventory Valuation</span>
            <p className="text-2xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
              ₹{summary.inventoryValuationINR.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Calculated at retail value
            </span>
          </div>
        </div>
      )}

      {/* Tabs Switcher: Ledger vs Logs */}
      <div className="flex items-center gap-1 bg-[#EAE5D9] p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'ledger'
              ? 'bg-white text-[#171715] shadow-xs'
              : 'text-[#5A584E] hover:text-[#171715]'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stock Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'logs'
              ? 'bg-white text-[#171715] shadow-xs'
              : 'text-[#5A584E] hover:text-[#171715]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Logs ({logs.length})</span>
        </button>
      </div>

      {activeTab === 'ledger' && (
        <>
          {/* Filters Bar */}
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8778]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU code or product title..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] placeholder:text-[#8A8778] focus:outline-none focus:border-[#3D4336]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Health selector */}
              <select
                value={healthFilter}
                onChange={(e: any) => setHealthFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
              >
                <option value="all">All Health States</option>
                <option value="In Stock">In Stock Only</option>
                <option value="Low Stock">Low Stock Buffer Only</option>
                <option value="Out of Stock">Out of Stock Only</option>
              </select>

              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#5A584E] gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#171715]" />
                <span>Reading live inventory balances...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center space-y-2 px-4">
                <p className="font-serif text-base font-bold text-[#171715]">No inventory records found</p>
                <p className="text-xs text-[#5A584E]">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DFD8CC] bg-[#F5F1E8] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Product Style</th>
                      <th className="py-3 px-4">SKU Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Unit Price</th>
                      <th className="py-3 px-4 text-center">Safety Buffer</th>
                      <th className="py-3 px-4 text-center">Stock Level</th>
                      <th className="py-3 px-4 text-center">Stock Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD8CC]">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-[#EAE5D9] border border-[#DFD8CC] shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-[#171715] text-sm">{item.name}</p>
                              <span className="text-[10px] text-[#5A584E] font-mono">ID: {item.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-xs text-[#171715]">
                          {item.sku}
                        </td>

                        <td className="py-3 px-4 text-xs text-[#5A584E]">
                          {item.category}
                        </td>

                        <td className="py-3 px-4 text-center font-mono tabular-nums text-xs text-[#171715]">
                          ₹{item.priceINR.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4 text-center font-mono tabular-nums text-xs text-[#5A584E]">
                          ≤ {item.lowStockThreshold}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${
                              item.stockCount === 0
                                ? 'text-red-700'
                                : item.stockCount <= item.lowStockThreshold
                                ? 'text-[#9A6A1E]'
                                : 'text-[#171715]'
                            }`}
                          >
                            {item.stockCount} units
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                              item.health === 'In Stock'
                                ? 'bg-[#E3E7DE] text-[#3D4336]'
                                : item.health === 'Low Stock'
                                ? 'bg-[#FAF0DC] text-[#8C6418]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.health === 'In Stock' && <CheckCircle2 className="w-3 h-3" />}
                            {item.health === 'Low Stock' && <AlertTriangle className="w-3 h-3" />}
                            {item.health === 'Out of Stock' && <XCircle className="w-3 h-3" />}
                            <span>{item.health}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#DFD8CC] text-[#171715] hover:bg-[#171715] hover:text-[#FAF8F5] text-xs font-semibold rounded-lg transition-colors shadow-xs"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DFD8CC] bg-[#F5F1E8] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#171715]">
                Immutable Inventory Transaction Ledger
              </h3>
              <p className="text-[11px] text-[#5A584E]">
                Reason-tagged adjustment events recorded across all administrative sessions.
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="font-serif text-base font-bold text-[#171715]">No adjustment logs recorded yet</p>
              <p className="text-xs text-[#5A584E]">Adjust stock on any SKU to start recording transaction history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DFD8CC] bg-[#F5F1E8] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-4">Reason Tag</th>
                    <th className="py-3 px-4 text-center">Previous</th>
                    <th className="py-3 px-4 text-center">Adjustment</th>
                    <th className="py-3 px-4 text-center">New Balance</th>
                    <th className="py-3 px-4">Admin Actor</th>
                    <th className="py-3 px-4">Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFD8CC]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#5A584E] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#171715]">{log.productName}</p>
                        <span className="font-mono text-[10px] text-[#8A8778]">{log.sku}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EAE5D9] text-[#171715] text-[11px] font-medium">
                          {log.reason}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono tabular-nums text-[#5A584E]">
                        {log.previousStock}
                      </td>

                      <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold">
                        <span className={log.adjustedDelta >= 0 ? 'text-[#3D4336]' : 'text-red-700'}>
                          {log.adjustedDelta >= 0 ? `+${log.adjustedDelta}` : log.adjustedDelta}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-[#171715]">
                        {log.newStock}
                      </td>

                      <td className="py-3 px-4 text-[#5A584E]">
                        {log.adminName}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-[#5A584E] max-w-xs truncate">
                        {log.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick Adjust Modal */}
      {selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#DFD8CC]">
              <div>
                <h3 className="font-serif text-base font-bold text-[#171715]">
                  Adjust Stock: {selectedItemForAdjust.name}
                </h3>
                <p className="text-xs font-mono text-[#5A584E]">
                  SKU: {selectedItemForAdjust.sku} · Current: {selectedItemForAdjust.stockCount} units
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForAdjust(null)}
                className="p-1 rounded-lg text-[#8A8778] hover:text-[#171715] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              {adjustError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adjustError}</span>
                </div>
              )}

              {adjustSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{adjustSuccessMsg}</span>
                </div>
              )}

              {/* Adjustment Mode Toggle */}
              <div className="flex items-center gap-1 bg-[#EAE5D9] p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setAdjustMode('delta')}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                    adjustMode === 'delta'
                      ? 'bg-white text-[#171715] shadow-xs'
                      : 'text-[#5A584E] hover:text-[#171715]'
                  }`}
                >
                  Relative Delta (+/-)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode('exact')}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                    adjustMode === 'exact'
                      ? 'bg-white text-[#171715] shadow-xs'
                      : 'text-[#5A584E] hover:text-[#171715]'
                  }`}
                >
                  Set Exact Balance
                </button>
              </div>

              {adjustMode === 'delta' ? (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    Units to Add / Deduct
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeltaValue((prev) => prev - 5)}
                      className="px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-semibold hover:bg-[#EAE5D9]"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeltaValue((prev) => prev - 1)}
                      className="px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-semibold hover:bg-[#EAE5D9]"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      required
                      value={deltaValue}
                      onChange={(e) => setDeltaValue(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-sm font-mono text-center font-bold text-[#171715] focus:outline-none focus:border-[#3D4336]"
                    />
                    <button
                      type="button"
                      onClick={() => setDeltaValue((prev) => prev + 1)}
                      className="px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-semibold hover:bg-[#EAE5D9]"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeltaValue((prev) => prev + 10)}
                      className="px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-semibold hover:bg-[#EAE5D9]"
                    >
                      +10
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5A584E] mt-1 font-mono">
                    New resulting balance:{' '}
                    <strong className="text-[#171715]">
                      {Math.max(0, selectedItemForAdjust.stockCount + deltaValue)} units
                    </strong>
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    Exact Physical Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={exactValue}
                    onChange={(e) => setExactValue(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-sm font-mono text-center font-bold text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                  <p className="text-[11px] text-[#5A584E] mt-1 font-mono">
                    Delta variance:{' '}
                    <strong className="text-[#171715]">
                      {exactValue - selectedItemForAdjust.stockCount >= 0 ? '+' : ''}
                      {exactValue - selectedItemForAdjust.stockCount} units
                    </strong>
                  </p>
                </div>
              )}

              {/* Reason Tag Selection (Mandatory) */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                  Reason Tag (Required for Audit Trail) *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as InventoryAdjustmentReason)}
                  className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                >
                  <option value="Restock / Shipment Received">Restock / Shipment Received</option>
                  <option value="Inventory Audit Correction">Inventory Audit Correction</option>
                  <option value="Damaged / Defect">Damaged / Defect</option>
                  <option value="Store Return">Store Return</option>
                  <option value="Manual Adjustment">Manual Adjustment</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                  Internal Audit Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Supplier PO #8491 delivery received, verified box counts."
                  className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFD8CC]">
                <button
                  type="button"
                  onClick={() => setSelectedItemForAdjust(null)}
                  className="px-4 py-2 border border-[#DFD8CC] text-[#5A584E] hover:text-[#171715] text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] disabled:opacity-50"
                >
                  {isSubmittingAdjust && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Commit Stock Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
