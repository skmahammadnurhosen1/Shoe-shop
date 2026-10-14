import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Mail,
  Phone,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  CheckCircle,
  UserCheck,
  X,
  CreditCard,
} from 'lucide-react';
import { AdminCustomer, AdminOrder, Address } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpendINR: number;
  createdAt: string;
  isRegistered: boolean;
  orders: AdminOrder[];
  addresses: Address[];
}

export const CustomersManagementView: React.FC = () => {
  const { adminToken } = useAdminAuth();

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [summary, setSummary] = useState<{
    totalCustomers: number;
    totalRegistered: number;
    totalGuests: number;
    totalCustomerSpend: number;
    avgOrderValue: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'registered' | 'guests'>('all');

  // Selected Customer Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<CustomerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/admin/customers', window.location.origin);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [adminToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleOpenDetail = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomerDetail(data.customer || null);
      }
    } catch (err) {
      console.error('Failed to fetch customer profile:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (memberFilter === 'registered') return c.isRegistered;
    if (memberFilter === 'guests') return !c.isRegistered;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#5A584E] mb-1">
          <span>Admin</span>
          <span>/</span>
          <span className="text-[#171715] font-semibold">Customer Directory</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171715]">
          Customer Accounts & Lifetime Value
        </h1>
        <p className="text-xs text-[#5A584E] mt-0.5">
          Directory of registered members and guest shoppers with order histories and contact profiles.
        </p>
      </div>

      {/* Metrics Strip */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Total Client Base</span>
            <p className="text-2xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
              {summary.totalCustomers}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Registered & Guest purchasers
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Registered Members</span>
            <p className="text-2xl font-serif font-bold text-[#3D4336] mt-1 tabular-nums">
              {summary.totalRegistered}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Verified customer accounts
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Guest / WhatsApp Buyers</span>
            <p className="text-2xl font-serif font-bold text-[#8A8778] mt-1 tabular-nums">
              {summary.totalGuests}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Direct checkout purchasers
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5A584E]">Average Order Value</span>
            <p className="text-2xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
              ₹{summary.avgOrderValue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#5A584E] font-mono mt-0.5 block">
              Storewide basket average
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8778]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, email, or phone number..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DFD8CC] rounded-lg text-xs text-[#171715] placeholder:text-[#8A8778] focus:outline-none focus:border-[#3D4336]"
          />
        </form>

        <div className="flex items-center gap-1 bg-[#EAE5D9] p-1 rounded-lg">
          <button
            onClick={() => setMemberFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              memberFilter === 'all'
                ? 'bg-white text-[#171715] shadow-xs'
                : 'text-[#5A584E] hover:text-[#171715]'
            }`}
          >
            All Customers
          </button>
          <button
            onClick={() => setMemberFilter('registered')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              memberFilter === 'registered'
                ? 'bg-white text-[#171715] shadow-xs'
                : 'text-[#5A584E] hover:text-[#171715]'
            }`}
          >
            Registered Only
          </button>
          <button
            onClick={() => setMemberFilter('guests')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              memberFilter === 'guests'
                ? 'bg-white text-[#171715] shadow-xs'
                : 'text-[#5A584E] hover:text-[#171715]'
            }`}
          >
            Guests Only
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs font-mono text-[#5A584E] gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#171715]" />
            <span>Loading customer directory...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-2 px-4">
            <p className="font-serif text-base font-bold text-[#171715]">No customers found</p>
            <p className="text-xs text-[#5A584E]">Try adjusting your search query or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DFD8CC] bg-[#F5F1E8] text-[#5A584E] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Profile</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4 text-center">Orders Placed</th>
                  <th className="py-3 px-4 text-center">Lifetime Spend (LTV)</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD8CC]">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => handleOpenDetail(cust.id)}
                    className="hover:bg-white/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAE5D9] border border-[#DFD8CC] flex items-center justify-center font-bold text-xs text-[#171715] shrink-0">
                          {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#171715] text-sm">{cust.name}</p>
                          <span className="font-mono text-[10px] text-[#8A8778]">{cust.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-xs text-[#171715]">{cust.email}</p>
                        <p className="text-[11px] font-mono text-[#5A584E]">{cust.phone || 'No phone'}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
                          cust.isRegistered
                            ? 'bg-[#E3E7DE] text-[#3D4336]'
                            : 'bg-[#EAE5D9] text-[#5A584E]'
                        }`}
                      >
                        {cust.isRegistered ? <UserCheck className="w-3 h-3" /> : null}
                        <span>{cust.isRegistered ? 'Registered Member' : 'Guest Buyer'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono tabular-nums text-xs font-semibold text-[#171715]">
                      {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono tabular-nums text-sm font-bold text-[#171715]">
                      ₹{cust.totalSpendINR.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#5A584E]">
                      {cust.lastOrderDate || cust.createdAt ? (
                        <span>{cust.lastOrderDate || cust.createdAt.slice(0, 10)}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#171715] hover:text-[#3D4336]">
                        <span>Profile</span>
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

      {/* Customer Profile Detail Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#DFD8CC] flex items-center justify-between bg-[#F5F1E8]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#171715]">
                  Customer Profile
                </h3>
                <p className="text-xs text-[#5A584E]">
                  Complete purchase history, delivery addresses, and contact channels.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setSelectedCustomerDetail(null);
                }}
                className="p-1 rounded-lg text-[#8A8778] hover:text-[#171715] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {isLoadingDetail || !selectedCustomerDetail ? (
                <div className="py-16 flex flex-col items-center justify-center text-xs font-mono text-[#5A584E] gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#171715]" />
                  <span>Loading customer details...</span>
                </div>
              ) : (
                <>
                  {/* Summary Card */}
                  <div className="bg-white border border-[#DFD8CC] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#EAE5D9] border border-[#DFD8CC] flex items-center justify-center font-bold text-base text-[#171715] shrink-0">
                        {selectedCustomerDetail.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-bold text-[#171715]">
                            {selectedCustomerDetail.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              selectedCustomerDetail.isRegistered
                                ? 'bg-[#E3E7DE] text-[#3D4336]'
                                : 'bg-[#EAE5D9] text-[#5A584E]'
                            }`}
                          >
                            {selectedCustomerDetail.isRegistered ? 'Member' : 'Guest'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A584E]">{selectedCustomerDetail.email}</p>
                        <p className="text-xs font-mono text-[#5A584E] mt-0.5">
                          {selectedCustomerDetail.phone || 'No phone recorded'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {selectedCustomerDetail.phone && (
                        <a
                          href={`https://wa.me/${selectedCustomerDetail.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {selectedCustomerDetail.email && (
                        <a
                          href={`mailto:${selectedCustomerDetail.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAE5D9] text-[#171715] text-xs font-medium hover:bg-[#DFD8CC] transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* LTV Strip */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4">
                      <span className="text-[11px] font-mono uppercase text-[#5A584E]">Total Orders Placed</span>
                      <p className="text-xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
                        {selectedCustomerDetail.totalOrders}
                      </p>
                    </div>
                    <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl p-4">
                      <span className="text-[11px] font-mono uppercase text-[#5A584E]">Cumulative Spend (LTV)</span>
                      <p className="text-xl font-serif font-bold text-[#171715] mt-1 tabular-nums">
                        ₹{selectedCustomerDetail.totalSpendINR.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="bg-white border border-[#DFD8CC] rounded-xl overflow-hidden">
                    <div className="p-3.5 border-b border-[#DFD8CC] bg-[#F5F1E8] font-mono text-[10px] uppercase text-[#5A584E] flex justify-between">
                      <span>Order History ({selectedCustomerDetail.orders?.length || 0})</span>
                      <span>Status</span>
                    </div>

                    {!selectedCustomerDetail.orders || selectedCustomerDetail.orders.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#5A584E]">
                        No order records found for this profile.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#DFD8CC]">
                        {selectedCustomerDetail.orders.map((ord) => (
                          <div key={ord.orderId} className="p-3.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono font-bold text-[#171715]">
                                #{ord.orderId}
                              </span>
                              <span className="font-mono text-[11px] text-[#5A584E] ml-2">
                                {ord.date}
                              </span>
                              <p className="text-[11px] text-[#5A584E] mt-0.5">
                                {ord.items?.length || 0} items · ₹{(ord.totalINR || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                ord.status === 'Delivered'
                                  ? 'bg-[#E3E7DE] text-[#3D4336]'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-50 text-blue-700'
                                  : ord.status === 'In Preparation'
                                  ? 'bg-[#FAF0DC] text-[#8C6418]'
                                  : 'bg-[#EAE5D9] text-[#171715]'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Saved Addresses */}
                  <div className="bg-white border border-[#DFD8CC] rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-mono uppercase text-[#5A584E] block">
                      Saved Delivery Destinations ({selectedCustomerDetail.addresses?.length || 0})
                    </span>

                    {!selectedCustomerDetail.addresses || selectedCustomerDetail.addresses.length === 0 ? (
                      <p className="text-xs text-[#5A584E]">No saved shipping addresses.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCustomerDetail.addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="p-3 bg-[#FAF8F5] border border-[#DFD8CC] rounded-lg text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#171715]">{addr.recipientName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EAE5D9] text-[#5A584E]">
                                {addr.label}
                              </span>
                            </div>
                            <p className="text-[#5A584E] leading-relaxed line-clamp-2">
                              {addr.addressLine1}
                            </p>
                            <p className="text-[#5A584E] font-mono text-[11px]">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
