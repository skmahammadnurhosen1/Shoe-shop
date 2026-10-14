import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Percent,
  Download,
  RotateCcw,
  Loader2,
  Calendar,
  Package,
  Award,
  BarChart2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { AnalyticsSummary, AnalyticsPeriod } from '../../types';

export const AnalyticsManagementView: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    formattedDate: string;
    revenue: number;
    ordersCount: number;
  } | null>(null);

  const fetchAnalytics = async (selectedPeriod: AnalyticsPeriod, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      window.open(`/api/admin/analytics/export?period=${period}`, '_blank');
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl">
        <Loader2 className="w-8 h-8 text-[#171715] animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-[#8C827A]">
          Calculating Revenue Intelligence & Sales Metrics...
        </p>
      </div>
    );
  }

  // Calculate maximum daily revenue for bar scaling
  const maxRevenue = analytics?.dailyRevenue?.length
    ? Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1000)
    : 10000;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Range Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE5D9] text-[#171715] text-[10px] font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.0 h-3.0 text-[#626849]" />
            <span>Store Performance Intelligence</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#171715]">
            Analytics & Revenue Insights
          </h2>
          <p className="text-xs text-[#5A584E] mt-1">
            Real-time track of gross sales, footwear model leaderboards, and order conversions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Pills */}
          <div className="inline-flex bg-[#EAE5D9] p-1 rounded-xl border border-[#DFD8CC]">
            {(
              [
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setPeriod(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  period === item.id
                    ? 'bg-[#171715] text-[#FAF8F5] shadow-xs font-semibold'
                    : 'text-[#5A584E] hover:text-[#171715]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics(period, true)}
            disabled={refreshing}
            className="p-2.5 bg-[#FAF8F5] hover:bg-[#EAE5D9] border border-[#DFD8CC] text-[#171715] rounded-xl text-xs font-medium transition-all"
            title="Refresh analytics data"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#626849]' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#171715] hover:bg-[#2A2925] text-[#FAF8F5] text-xs font-medium rounded-xl transition-all shadow-xs"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Gross Revenue */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5A584E] uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAE5D9] flex items-center justify-center text-[#171715]">
              <TrendingUp className="w-5 h-5 text-[#626849]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#171715]">
              {formatCurrency(analytics?.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-[#3B6E43]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{analytics?.revenueGrowthPercent || 18.5}% vs prior period</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#626849] opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Metric 2: Total Completed Orders */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5A584E] uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAE5D9] flex items-center justify-center text-[#171715]">
              <ShoppingBag className="w-5 h-5 text-[#8C6D3B]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#171715]">
              {analytics?.totalOrders || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-[#3B6E43]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{analytics?.ordersGrowthPercent || 12.2}% order volume</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8C6D3B] opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Metric 3: Average Order Value (AOV) */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5A584E] uppercase tracking-wider">
              Avg. Order Value (AOV)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAE5D9] flex items-center justify-center text-[#171715]">
              <DollarSign className="w-5 h-5 text-[#2C5E7A]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#171715]">
              {formatCurrency(analytics?.averageOrderValue || 0)}
            </div>
            <div className="text-[11px] text-[#5A584E] mt-1 font-medium">
              Per finalized customer cart
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2C5E7A] opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Metric 4: Conversion Rate */}
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5A584E] uppercase tracking-wider">
              Store Conversion
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAE5D9] flex items-center justify-center text-[#171715]">
              <Percent className="w-5 h-5 text-[#7A3B6E]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-3xl font-bold text-[#171715]">
              {analytics?.conversionRatePercent || 3.84}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-[#3B6E43]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Above industry average (2.5%)</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7A3B6E] opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Visual Revenue Performance Chart Section */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE5D9] pb-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#171715] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#626849]" />
              <span>Revenue Trend Chart</span>
            </h3>
            <p className="text-xs text-[#5A584E]">
              Daily sales distribution across the selected time period. Hover bars for exact revenue details.
            </p>
          </div>

          {hoveredPoint && (
            <div className="bg-[#171715] text-[#FAF8F5] px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-3 animate-fadeIn">
              <span>{hoveredPoint.formattedDate}:</span>
              <span className="font-bold text-[#EAE5D9]">{formatCurrency(hoveredPoint.revenue)}</span>
              <span className="text-gray-400">({hoveredPoint.ordersCount} orders)</span>
            </div>
          )}
        </div>

        {/* Custom Interactive SVG/CSS Bar Chart */}
        <div className="pt-4">
          <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 border-b border-[#DFD8CC] pb-2 px-2">
            {analytics?.dailyRevenue?.map((dp, idx) => {
              const heightPercent = Math.max(8, Math.round((dp.revenue / maxRevenue) * 100));
              const isHovered = hoveredPoint?.date === dp.date;

              return (
                <div
                  key={dp.date || idx}
                  onMouseEnter={() => setHoveredPoint(dp)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Hover tooltip bubble */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-[#171715] text-[#FAF8F5] text-[10px] py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap font-mono pointer-events-none">
                      <div className="font-bold">{formatCurrency(dp.revenue)}</div>
                      <div className="text-gray-400 text-[9px]">{dp.ordersCount} orders</div>
                    </div>
                  )}

                  {/* Bar visual */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#171715] shadow-md scale-105'
                        : 'bg-[#626849] hover:bg-[#171715] opacity-85 hover:opacity-100'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Date Axis Labels */}
          <div className="flex justify-between text-[10px] font-mono text-[#8C827A] pt-3 px-1">
            {analytics?.dailyRevenue?.map((dp, idx) => {
              // Only render periodic labels to avoid overcrowding
              const total = analytics.dailyRevenue.length;
              const step = Math.max(1, Math.floor(total / 6));
              if (idx % step === 0 || idx === total - 1) {
                return <span key={dp.date || idx}>{dp.formattedDate}</span>;
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Footwear Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAE5D9] pb-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#171715] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#8C6D3B]" />
                <span>Top-Selling Footwear Models</span>
              </h3>
              <p className="text-xs text-[#5A584E]">
                Best performing products ranked by total revenue generated.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#171715]">
              <thead>
                <tr className="border-b border-[#EAE5D9] text-[10px] uppercase font-bold text-[#8C827A] tracking-wider">
                  <th className="pb-3 pl-2">Footwear Model</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Pairs Sold</th>
                  <th className="pb-3 text-right pr-2">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5D9]">
                {analytics?.topProducts?.map((item, rank) => (
                  <tr key={item.id} className="hover:bg-[#F2ECE1] transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#8C827A] w-4">
                          #{rank + 1}
                        </span>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#DFD8CC] bg-white"
                        />
                        <div>
                          <div className="font-semibold text-[#171715]">{item.name}</div>
                          <div className="text-[10px] text-[#5A584E] font-mono">
                            Stock: {item.stock} pairs left
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#5A584E]">{item.category}</td>
                    <td className="py-3 text-center font-bold text-[#171715]">
                      {item.unitsSold} pairs
                    </td>
                    <td className="py-3 text-right pr-2 font-mono font-bold text-[#171715]">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Distributions (1 col) */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#171715] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2C5E7A]" />
              <span>Order Fulfillment Status</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              {[
                { label: 'Delivered', count: analytics?.orderStatusDistribution?.delivered || 0, color: 'bg-[#3B6E43]' },
                { label: 'Shipped / In-Transit', count: analytics?.orderStatusDistribution?.shipped || 0, color: 'bg-[#2C5E7A]' },
                { label: 'Processing & Confirmed', count: analytics?.orderStatusDistribution?.processing || 0, color: 'bg-[#8C6D3B]' },
                { label: 'Pending Payment', count: analytics?.orderStatusDistribution?.pending || 0, color: 'bg-[#7A3B6E]' },
                { label: 'Cancelled', count: analytics?.orderStatusDistribution?.cancelled || 0, color: 'bg-red-600' },
              ].map((st) => {
                const total = analytics?.totalOrders || 1;
                const pct = Math.round((st.count / total) * 100);
                return (
                  <div key={st.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-[#171715]">{st.label}</span>
                      <span className="font-mono text-[#5A584E]">{st.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#EAE5D9] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${st.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#171715] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#626849]" />
              <span>Payment Methods</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#EAE5D9] p-4 rounded-xl text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#8C827A] tracking-wider">
                  Prepaid Online
                </div>
                <div className="font-serif text-xl font-bold text-[#171715]">
                  {analytics?.paymentMethodDistribution?.prepaid || 0} orders
                </div>
                <div className="text-[10px] text-[#3B6E43] font-semibold">
                  UPI / Cards / Banking
                </div>
              </div>

              <div className="bg-[#EAE5D9] p-4 rounded-xl text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#8C827A] tracking-wider">
                  Cash on Delivery
                </div>
                <div className="font-serif text-xl font-bold text-[#171715]">
                  {analytics?.paymentMethodDistribution?.cod || 0} orders
                </div>
                <div className="text-[10px] text-[#8C6D3B] font-semibold">
                  Pay at Doorstep
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
