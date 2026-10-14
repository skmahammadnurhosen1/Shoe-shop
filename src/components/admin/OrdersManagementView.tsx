import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  MessageCircle,
  Globe,
  ExternalLink,
  Printer,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  X,
  FileText,
  User,
  Plus,
} from 'lucide-react';
import { AdminOrder, OrderWorkflowStatus } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const OrdersManagementView: React.FC = () => {
  const { adminToken } = useAdminAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [counts, setCounts] = useState<{
    total: number;
    inquired: number;
    confirmed: number;
    inPreparation: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    whatsapp: number;
    online: number;
  }>({
    total: 0,
    inquired: 0,
    confirmed: 0,
    inPreparation: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    whatsapp: 0,
    online: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for Detail Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<OrderWorkflowStatus>('Confirmed');
  const [editCourier, setEditCourier] = useState<string>('');
  const [editTracking, setEditTracking] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<boolean>(false);

  // Manual WhatsApp Order Modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState<string>('');
  const [newOrderPhone, setNewOrderPhone] = useState<string>('');
  const [newOrderEmail, setNewOrderEmail] = useState<string>('');
  const [newOrderAddress, setNewOrderAddress] = useState<string>('');
  const [newOrderCity, setNewOrderCity] = useState<string>('Bengaluru');
  const [newOrderState, setNewOrderState] = useState<string>('Karnataka');
  const [newOrderPincode, setNewOrderPincode] = useState<string>('560001');
  const [newOrderNotes, setNewOrderNotes] = useState<string>('Inquired via WhatsApp concierge.');
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/admin/orders', window.location.origin);
      if (activeStatusTab !== 'all') url.searchParams.set('status', activeStatusTab);
      if (activeSourceFilter !== 'all') url.searchParams.set('source', activeSourceFilter);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [adminToken, activeStatusTab, activeSourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditCourier(order.courierName || '');
    setEditTracking(order.trackingNumber || '');
    setEditNotes(order.notes || '');
    setStatusUpdateSuccess(false);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: editStatus,
          courierName: editCourier,
          trackingNumber: editTracking,
          notes: editNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setStatusUpdateSuccess(true);
        await fetchOrders();
        setTimeout(() => setStatusUpdateSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleCreateWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          customerName: newOrderCustomer,
          phone: newOrderPhone,
          email: newOrderEmail,
          address: newOrderAddress,
          city: newOrderCity,
          state: newOrderState,
          pincode: newOrderPincode,
          notes: newOrderNotes,
          source: 'WhatsApp Order',
          totalINR: 2899,
          items: [
            {
              id: `item-${Date.now()}`,
              product: {
                id: 'form-runner-01',
                name: 'Form Runner 01',
                category: "Men's Sneakers",
                priceINR: 2899,
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=85',
              },
              selectedColor: { name: 'Olive Green', hex: '#626849' },
              selectedSize: 8,
              quantity: 1,
            },
          ],
        }),
      });

      if (res.ok) {
        setIsNewOrderModalOpen(false);
        setNewOrderCustomer('');
        setNewOrderPhone('');
        setNewOrderEmail('');
        setNewOrderAddress('');
        await fetchOrders();
      }
    } catch (err) {
      console.error('Failed to create WhatsApp order:', err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Status progression stages definition
  const stages: { key: OrderWorkflowStatus; label: string }[] = [
    { key: 'Inquired', label: '1. Inquired' },
    { key: 'Confirmed', label: '2. Confirmed' },
    { key: 'In Preparation', label: '3. In Prep' },
    { key: 'Shipped', label: '4. Shipped' },
    { key: 'Delivered', label: '5. Delivered' },
  ];

  const getStageIndex = (status: OrderWorkflowStatus) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A584E] mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#171715] font-semibold">Orders & Fulfillment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171715]">
            Order Management & Dispatch
          </h1>
          <p className="text-xs text-[#5A584E] mt-0.5">
            5-stage fulfillment pipeline unifying online checkouts and WhatsApp concierge orders.
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record WhatsApp Order</span>
        </button>
      </div>

      {/* 5-Stage Status Filter Tabs with Counts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DFD8CC]">
        <button
          onClick={() => setActiveStatusTab('all')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'all'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>All Orders</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.total}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('Inquired')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'Inquired'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>Inquired</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.inquired}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('Confirmed')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'Confirmed'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>Confirmed</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.confirmed}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('In Preparation')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'In Preparation'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>In Preparation</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.inPreparation}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('Shipped')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'Shipped'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>Shipped</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.shipped}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('Delivered')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'Delivered'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>Delivered</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.delivered}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusTab('Cancelled')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeStatusTab === 'Cancelled'
              ? 'bg-[#171715] text-[#FAF8F5]'
              : 'text-[#5A584E] hover:text-[#171715] hover:bg-[#EAE5D9]'
          }`}
        >
          <span>Cancelled</span>
          <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-black/20">
            {counts.cancelled}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8778]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, customer, email, tracking..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] placeholder:text-[#8A8778] focus:outline-none focus:border-[#3D4336]"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-[#EAE5D9] p-1 rounded-lg">
            <button
              onClick={() => setActiveSourceFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeSourceFilter === 'all'
                  ? 'bg-white text-[#171715] shadow-xs'
                  : 'text-[#5A584E] hover:text-[#171715]'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setActiveSourceFilter('Online Checkout')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeSourceFilter === 'Online Checkout'
                  ? 'bg-white text-[#171715] shadow-xs'
                  : 'text-[#5A584E] hover:text-[#171715]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Online ({counts.online})</span>
            </button>
            <button
              onClick={() => setActiveSourceFilter('WhatsApp Order')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeSourceFilter === 'WhatsApp Order'
                  ? 'bg-white text-[#171715] shadow-xs'
                  : 'text-[#5A584E] hover:text-[#171715]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp ({counts.whatsapp})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#5A584E] gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#171715]" />
            <span>Fetching store orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2 px-4">
            <p className="font-serif text-base font-bold text-[#171715]">No orders match criteria</p>
            <p className="text-xs text-[#5A584E]">
              {searchQuery ? `No records found for "${searchQuery}".` : 'No orders in this status category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFD8CC] bg-[#F5F1E8] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 text-center">Total Amount</th>
                  <th className="py-3 px-4 text-center">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD8CC]">
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    onClick={() => handleOpenOrderDetails(order)}
                    className="hover:bg-white/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#171715]">
                          {order.orderId}
                        </span>
                        <p className="font-mono text-[11px] text-[#5A584E] mt-0.5">
                          {order.date}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[#171715]">{order.customerName}</p>
                        <p className="text-[11px] text-[#5A584E] font-mono">{order.phone || order.email}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                          order.source === 'WhatsApp Order'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#EAE5D9] text-[#171715]'
                        }`}
                      >
                        {order.source === 'WhatsApp Order' ? (
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Globe className="w-3 h-3 text-[#5A584E]" />
                        )}
                        <span>{order.source || 'Online'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {order.items && order.items[0]?.product?.image && (
                          <img
                            src={order.items[0].product.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover border border-[#DFD8CC] shrink-0"
                          />
                        )}
                        <span className="text-xs text-[#171715] line-clamp-1">
                          {order.items && order.items.length > 0
                            ? `${order.items[0].product?.name || 'Item'} ${
                                order.items.length > 1 ? `(+${order.items.length - 1} more)` : ''
                              }`
                            : '0 items'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-sm text-[#171715]">
                      ₹{(order.totalINR || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-[#E3E7DE] text-[#3D4336]'
                            : order.status === 'Shipped'
                            ? 'bg-blue-50 text-blue-700'
                            : order.status === 'In Preparation'
                            ? 'bg-[#FAF0DC] text-[#8C6418]'
                            : order.status === 'Confirmed'
                            ? 'bg-purple-50 text-purple-700'
                            : order.status === 'Inquired'
                            ? 'bg-[#EAE5D9] text-[#5A584E]'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#171715] hover:text-[#3D4336]">
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Modal / Slide-over */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#DFD8CC] flex items-center justify-between bg-[#F5F1E8]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-mono text-lg font-bold text-[#171715]">
                    Order #{selectedOrder.orderId}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      selectedOrder.source === 'WhatsApp Order'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#EAE5D9] text-[#171715]'
                    }`}
                  >
                    {selectedOrder.source || 'Online'}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#5A584E] mt-0.5">
                  Placed on {selectedOrder.date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg border border-[#DFD8CC] text-[#5A584E] hover:text-[#171715] hover:bg-white transition-colors"
                  title="Print Packing Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg text-[#8A8778] hover:text-[#171715] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* 5-Step Visual Progress Bar */}
              <div className="bg-white border border-[#DFD8CC] rounded-xl p-4">
                <span className="text-[11px] font-mono uppercase text-[#5A584E] block mb-3">
                  Fulfillment Progression (5-Stage Model)
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {stages.map((stg, i) => {
                    const currentIdx = getStageIndex(selectedOrder.status);
                    const isCompleted = i <= currentIdx && selectedOrder.status !== 'Cancelled';
                    const isCurrent = i === currentIdx;

                    return (
                      <div key={stg.key} className="space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-colors ${
                            isCompleted
                              ? 'bg-[#3D4336]'
                              : selectedOrder.status === 'Cancelled'
                              ? 'bg-red-200'
                              : 'bg-[#EAE5D9]'
                          }`}
                        />
                        <span
                          className={`text-[11px] font-mono block ${
                            isCurrent
                              ? 'font-bold text-[#171715]'
                              : isCompleted
                              ? 'text-[#3D4336]'
                              : 'text-[#8A8778]'
                          }`}
                        >
                          {stg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Control Section */}
              <div className="bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-[#171715]">
                    Update Workflow Status
                  </h4>
                  {statusUpdateSuccess && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">
                      Next Workflow Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as OrderWorkflowStatus)}
                      className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-semibold text-[#171715] focus:outline-none focus:border-[#3D4336]"
                    >
                      <option value="Inquired">1. Inquired</option>
                      <option value="Confirmed">2. Confirmed</option>
                      <option value="In Preparation">3. In Preparation</option>
                      <option value="Shipped">4. Shipped</option>
                      <option value="Delivered">5. Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">
                      Courier / Delivery Partner
                    </label>
                    <input
                      type="text"
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      placeholder="e.g. BlueDart Express"
                      className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">
                      Tracking / AWB Number
                    </label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="e.g. BD-994821034"
                      className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-mono text-[#171715] focus:outline-none focus:border-[#3D4336]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">
                    Internal Dispatch Notes
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add special packaging remarks or courier details..."
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveStatus}
                    disabled={isUpdatingStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] disabled:opacity-50 transition-colors"
                  >
                    {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Commit Status Update</span>
                  </button>
                </div>
              </div>

              {/* Customer and Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-[#DFD8CC] rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#5A584E] block">
                    Customer Information
                  </span>
                  <p className="font-semibold text-sm text-[#171715]">{selectedOrder.customerName}</p>
                  <p className="text-xs text-[#5A584E]">{selectedOrder.email || 'No email provided'}</p>
                  <p className="text-xs text-[#5A584E] font-mono">{selectedOrder.phone}</p>

                  {selectedOrder.phone && (
                    <a
                      href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors mt-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="bg-white border border-[#DFD8CC] rounded-xl p-4 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#5A584E] block">
                    Shipping Destination
                  </span>
                  <p className="text-xs text-[#171715] font-medium leading-relaxed">
                    {selectedOrder.address || 'Address pending verification'}
                  </p>
                  <p className="text-xs text-[#5A584E]">
                    {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                  </p>
                  <p className="text-[11px] font-mono text-[#8A8778] pt-1">
                    Payment: {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="bg-white border border-[#DFD8CC] rounded-xl overflow-hidden">
                <div className="p-3.5 border-b border-[#DFD8CC] bg-[#F5F1E8] font-mono text-[10px] uppercase text-[#5A584E] flex justify-between">
                  <span>Line Items</span>
                  <span>Quantity & Subtotal</span>
                </div>
                <div className="divide-y divide-[#DFD8CC]">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-[#EAE5D9] border border-[#DFD8CC] shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-sm text-[#171715]">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-[#5A584E]">
                            Color: {item.selectedColor?.name || 'Standard'} · Size: UK {item.selectedSize || 8}
                          </p>
                          <p className="text-[11px] font-mono text-[#8A8778]">
                            Unit Price: ₹{(item.product?.priceINR || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs text-[#5A584E]">
                          Qty: {item.quantity || 1}
                        </span>
                        <p className="font-mono text-sm font-bold text-[#171715] tabular-nums mt-0.5">
                          ₹{((item.product?.priceINR || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-[#F5F1E8] border-t border-[#DFD8CC] flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-[#5A584E]">Total Order Amount</span>
                  <span className="font-mono text-base font-bold text-[#171715] tabular-nums">
                    ₹{(selectedOrder.totalINR || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Tracking Info Box if Shipped */}
              {selectedOrder.trackingNumber && (
                <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5A584E] block">
                      Dispatched via {selectedOrder.courierName || 'Courier'}
                    </span>
                    <p className="font-mono font-bold text-sm text-[#171715] mt-0.5">
                      AWB: {selectedOrder.trackingNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyTracking(selectedOrder.trackingNumber!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFD8CC] rounded-lg text-xs font-semibold hover:bg-[#EAE5D9]"
                  >
                    {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTracking ? 'Copied' : 'Copy AWB'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual WhatsApp Order Creation Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#DFD8CC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#171715]">
                  Log New WhatsApp Order
                </h3>
                <p className="text-xs text-[#5A584E]">
                  Create an order record from a WhatsApp concierge inquiry.
                </p>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-lg text-[#8A8778] hover:text-[#171715] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWhatsAppOrder} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderCustomer}
                    onChange={(e) => setNewOrderCustomer(e.target.value)}
                    placeholder="e.g. Aditi Rao"
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newOrderPhone}
                    onChange={(e) => setNewOrderPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-mono text-[#171715] focus:outline-none focus:border-[#3D4336]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={newOrderEmail}
                  onChange={(e) => setNewOrderEmail(e.target.value)}
                  placeholder="aditi@example.com"
                  className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#5A584E] mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={newOrderAddress}
                  onChange={(e) => setNewOrderAddress(e.target.value)}
                  placeholder="Apartment, Street, Landmark..."
                  className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] focus:outline-none focus:border-[#3D4336]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">City</label>
                  <input
                    type="text"
                    value={newOrderCity}
                    onChange={(e) => setNewOrderCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">State</label>
                  <input
                    type="text"
                    value={newOrderState}
                    onChange={(e) => setNewOrderState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#5A584E] mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={newOrderPincode}
                    onChange={(e) => setNewOrderPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs font-mono text-[#171715]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFD8CC]">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 border border-[#DFD8CC] text-[#5A584E] hover:text-[#171715] text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#3D4336] disabled:opacity-50"
                >
                  {isCreatingOrder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
