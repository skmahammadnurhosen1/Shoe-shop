import React, { useState, useEffect } from 'react';
import {
  Truck,
  Receipt,
  MessageSquare,
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Coins,
  FileText,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { StoreSettings } from '../../types';

export const StoreSettingsManagementView: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    shippingFeeINR: 150,
    freeShippingThresholdINR: 1999,
    gstRatePercent: 18,
    gstIncludedInPrice: true,
    taxIdNumber: '27AAACS00001Z5',
    whatsAppConciergeNumber: '+919134280545',
    whatsAppDefaultMessage: 'Hello SOLEFORM team, I would like assistance with footwear sizing and availability.',
    supportEmail: 'concierge@soleform.in',
    storeAddress: 'SOLEFORM Flagship Atelier, Bandra West, Mumbai, Maharashtra 400050',
    currencySymbol: '₹',
    currencyCode: 'INR',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        headers: {
          'x-admin-token': localStorage.getItem('soleform_admin_token') || '',
        },
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings(data.settings);
      } else {
        setErrorMessage(data.error || 'Failed to fetch store settings.');
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
      setErrorMessage('Network error connecting to store settings server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('soleform_admin_token') || '',
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings(data.settings);
        setSuccessMessage('Store operational settings updated and applied across the storefront!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to save store settings.');
      }
    } catch (err) {
      console.error('Error saving store settings:', err);
      setErrorMessage('Network error saving store settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `${settings.currencySymbol}${amount.toLocaleString('en-IN')}`;
  };

  // Sample tax math for preview
  const sampleAmount = 3000;
  const sampleGstRate = settings.gstRatePercent / 100;
  const sampleBasePrice = settings.gstIncludedInPrice
    ? sampleAmount / (1 + sampleGstRate)
    : sampleAmount;
  const sampleGstAmount = settings.gstIncludedInPrice
    ? sampleAmount - sampleBasePrice
    : sampleAmount * sampleGstRate;

  // Clean phone number for WhatsApp link preview
  const cleanPhone = settings.whatsAppConciergeNumber.replace(/[^\d+]/g, '');
  const whatsAppPreviewUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
    settings.whatsAppDefaultMessage
  )}`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 text-[#8C9B32] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#8C8275]">
          Loading Store Operational Settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#FAF8F5] border border-[#DFD8CC] p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#8C9B32] mb-1">
            <Building className="w-4 h-4" />
            <span>Operational Control Center</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#171715]">
            Store Settings, Tax & Concierge Rules
          </h2>
          <p className="text-xs text-[#5A584E] mt-1">
            Manage shipping rules, GST rates, WhatsApp concierge numbers, and invoice headers in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DFD8CC] bg-white text-xs font-semibold text-[#171715] hover:bg-[#F2EFE9] transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#171715] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2C2A29] transition-colors shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#DCE96A]" />
            ) : (
              <Save className="w-4 h-4 text-[#DCE96A]" />
            )}
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="bg-[#DCE96A]/20 border border-[#8C9B32] text-[#3D4811] px-4 py-3 rounded-xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#8C9B32] shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Operational KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DFD8CC] p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#DCE96A]/30 flex items-center justify-center text-[#8C9B32] shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#8C8275]">Free Shipping Limit</div>
            <div className="text-base font-serif font-bold text-[#171715]">
              {formatPrice(settings.freeShippingThresholdINR)}
            </div>
            <div className="text-[10px] text-[#5A584E]">Standard Fee: {formatPrice(settings.shippingFeeINR)}</div>
          </div>
        </div>

        <div className="bg-white border border-[#DFD8CC] p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#171715] flex items-center justify-center text-[#DCE96A] shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#8C8275]">GST Tax Rate</div>
            <div className="text-base font-serif font-bold text-[#171715]">
              {settings.gstRatePercent}% {settings.gstIncludedInPrice ? '(Inclusive)' : '(Exclusive)'}
            </div>
            <div className="text-[10px] text-[#5A584E]">GSTIN: {settings.taxIdNumber || 'Not Set'}</div>
          </div>
        </div>

        <div className="bg-white border border-[#DFD8CC] p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#128C7E] shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#8C8275]">WhatsApp Concierge</div>
            <div className="text-sm font-semibold text-[#171715] truncate max-w-[140px]">
              {settings.whatsAppConciergeNumber}
            </div>
            <div className="text-[10px] text-[#128C7E]">Active Link Ready</div>
          </div>
        </div>

        <div className="bg-white border border-[#DFD8CC] p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#DFD8CC] flex items-center justify-center text-[#171715] shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#8C8275]">Base Currency</div>
            <div className="text-base font-serif font-bold text-[#171715]">
              {settings.currencyCode} ({settings.currencySymbol})
            </div>
            <div className="text-[10px] text-[#5A584E]">India Storefront</div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Shipping Rules */}
        <div className="bg-white border border-[#DFD8CC] rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#DFD8CC] pb-4">
            <div className="p-2.5 rounded-xl bg-[#DCE96A]/20 text-[#8C9B32]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171715]">Shipping & Freight Thresholds</h3>
              <p className="text-xs text-[#5A584E]">
                Configure standard shipping charges and free express air delivery thresholds.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#171715] mb-1">
                Standard Delivery Charge (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#8C8275]">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  value={settings.shippingFeeINR}
                  onChange={(e) =>
                    setSettings({ ...settings, shippingFeeINR: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-full pl-8 pr-4 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#171715]"
                  required
                />
              </div>
              <p className="text-[10px] text-[#8C8275] mt-1">
                Applied to cart orders below the free shipping threshold.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#171715] mb-1">
                Free Express Air Shipping Limit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#8C8275]">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  value={settings.freeShippingThresholdINR}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeShippingThresholdINR: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-full pl-8 pr-4 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#171715]"
                  required
                />
              </div>
              <p className="text-[10px] text-[#8C8275] mt-1">
                Cart subtotals equal to or above this amount receive FREE shipping automatically.
              </p>
            </div>

            {/* Real-time Shipping Calculation Rule Card */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D5] p-4 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-[#171715] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8C9B32]" />
                <span>Storefront Shipping Policy Preview:</span>
              </div>
              <ul className="space-y-1 text-[#5A584E] text-[11px] list-disc list-inside">
                <li>
                  Subtotal under <strong className="text-[#171715]">{formatPrice(settings.freeShippingThresholdINR)}</strong>: Charged{' '}
                  <strong className="text-[#171715]">{formatPrice(settings.shippingFeeINR)}</strong> priority delivery.
                </li>
                <li>
                  Subtotal <strong className="text-[#171715]">{formatPrice(settings.freeShippingThresholdINR)}</strong> or above:{' '}
                  <span className="text-[#8C9B32] font-semibold uppercase">Free Air Express</span> badge activated in Cart & Checkout.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: GST & Business Tax Settings */}
        <div className="bg-white border border-[#DFD8CC] rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#DFD8CC] pb-4">
            <div className="p-2.5 rounded-xl bg-[#171715] text-[#DCE96A]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171715]">GST Tax & Invoicing Rules</h3>
              <p className="text-xs text-[#5A584E]">
                Configure GST percentages, price inclusions, and tax ID numbers for invoices.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#171715] mb-1">
                  GST Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.gstRatePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gstRatePercent: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#171715]"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#8C8275]">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171715] mb-1">
                  Store GSTIN Registration ID
                </label>
                <input
                  type="text"
                  value={settings.taxIdNumber}
                  onChange={(e) => setSettings({ ...settings, taxIdNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. 27AAACS00001Z5"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono font-semibold uppercase focus:outline-none focus:border-[#171715]"
                />
              </div>
            </div>

            {/* Inclusive Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl">
              <div>
                <div className="text-xs font-semibold text-[#171715]">Prices Include GST Tax</div>
                <div className="text-[10px] text-[#5A584E]">
                  Display catalog prices inclusive of GST, with tax breakdown extracted on invoice.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.gstIncludedInPrice}
                onChange={(e) => setSettings({ ...settings, gstIncludedInPrice: e.target.checked })}
                className="w-5 h-5 rounded border-[#DFD8CC] text-[#171715] focus:ring-[#171715] cursor-pointer"
              />
            </div>

            {/* Sample Tax Computation Preview */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D5] p-4 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-[#171715] flex items-center justify-between">
                <span>Sample GST Invoice Breakdown (₹3,000 Item):</span>
                <span className="text-[10px] bg-[#EAE5D9] px-2 py-0.5 rounded text-[#4A493D] font-mono">
                  {settings.gstRatePercent}% GST
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-[#5A584E] font-mono">
                <div className="flex justify-between">
                  <span>Product Catalog Price:</span>
                  <span className="font-semibold text-[#171715]">₹3,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Base Price (Excl. Tax):</span>
                  <span>₹{sampleBasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8C9B32] font-semibold">
                  <span>Estimated GST ({settings.gstRatePercent}%):</span>
                  <span>₹{sampleGstAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp Concierge Settings */}
        <div className="bg-white border border-[#DFD8CC] rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#DFD8CC] pb-4">
            <div className="p-2.5 rounded-xl bg-[#25D366]/20 text-[#128C7E]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171715]">WhatsApp Concierge Integration</h3>
              <p className="text-xs text-[#5A584E]">
                Set the active phone number and pre-filled inquiry text for direct customer chat buttons.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#171715] mb-1">
                Concierge Phone Number (With Country Code)
              </label>
              <input
                type="text"
                value={settings.whatsAppConciergeNumber}
                onChange={(e) => setSettings({ ...settings, whatsAppConciergeNumber: e.target.value })}
                placeholder="+919134280545"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#171715]"
                required
              />
              <p className="text-[10px] text-[#8C8275] mt-1">
                Must include country code (e.g. +91 for India).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#171715] mb-1">
                Default Pre-Filled Chat Message
              </label>
              <textarea
                rows={3}
                value={settings.whatsAppDefaultMessage}
                onChange={(e) => setSettings({ ...settings, whatsAppDefaultMessage: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs focus:outline-none focus:border-[#171715]"
                placeholder="Pre-filled text when customers click WhatsApp Concierge..."
                required
              />
            </div>

            {/* Live WhatsApp Test Button */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#075E54]">Test Live WhatsApp Concierge Link</div>
                <div className="text-[10px] text-[#128C7E]">Click to verify deep link with configured phone & message</div>
              </div>

              <a
                href={whatsAppPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:bg-[#128C7E] transition-colors shadow-xs"
              >
                <span>Launch Test</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 4: Store Contact & Invoice Metadata */}
        <div className="bg-white border border-[#DFD8CC] rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#DFD8CC] pb-4">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFD8CC] text-[#171715]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171715]">Store Contact & Invoice Header</h3>
              <p className="text-xs text-[#5A584E]">
                Brand email address, flagship atelier location, and currency display settings.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#171715] mb-1">
                Support Concierge Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#171715]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#171715] mb-1">
                Store Atelier Address (Invoices & Contact)
              </label>
              <textarea
                rows={2}
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs focus:outline-none focus:border-[#171715]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#171715] mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-bold text-center focus:outline-none focus:border-[#171715]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171715] mb-1">
                  Currency ISO Code
                </label>
                <input
                  type="text"
                  value={settings.currencyCode}
                  onChange={(e) => setSettings({ ...settings, currencyCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD8CC] rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:border-[#171715]"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
