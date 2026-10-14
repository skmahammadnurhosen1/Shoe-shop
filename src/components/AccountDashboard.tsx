import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  MapPin,
  Heart,
  Package,
  ShoppingBag,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Clock,
  Check,
  X,
  CreditCard,
  Truck,
  ExternalLink,
  ChevronRight,
  Lock,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, ColorSwatch, Currency, CartItem, Address, OrderDetails } from '../types';
import { PRODUCTS } from '../data/shoes';

export type AccountTab =
  | 'overview'
  | 'personal'
  | 'addresses'
  | 'wishlist'
  | 'orders'
  | 'cart'
  | 'settings';

interface AccountDashboardProps {
  initialTab?: AccountTab;
  currency: Currency;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
  onAddToCart: (product: Product, color: ColorSwatch, size: number, quantity?: number) => void;
  onOpenProductDetails: (product: Product, color?: ColorSwatch, size?: number) => void;
  onProceedToCheckout: () => void;
  onBackToShopping: () => void;
  onToast: (msg: string) => void;
  pendingWhatsAppOrder?: {
    product: Product;
    color: ColorSwatch;
    size: number;
    quantity: number;
  } | null;
  onResumeWhatsAppOrder?: () => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  initialTab = 'overview',
  currency,
  wishlistIds,
  onToggleWishlist,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  onAddToCart,
  onOpenProductDetails,
  onProceedToCheckout,
  onBackToShopping,
  onToast,
  pendingWhatsAppOrder,
  onResumeWhatsAppOrder,
}) => {
  const { user, token, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phoneNumber: '',
    addressLine1: '',
    locality: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    label: 'Home' as 'Home' | 'Work' | 'Other',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderDetails | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Personal Info Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileDob, setProfileDob] = useState(user?.dob || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatarUrl || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'both'>(
    user?.preferredContact || 'email'
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Preferences State
  const [notifPreferences, setNotifPreferences] = useState({
    productUpdates: user?.notificationPreferences?.productUpdates ?? true,
    exclusiveOffers: user?.notificationPreferences?.exclusiveOffers ?? true,
    orderAlerts: user?.notificationPreferences?.orderAlerts ?? true,
  });
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fetch Addresses
  useEffect(() => {
    if (!token) return;
    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const res = await fetch('/api/addresses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.addresses) setAddresses(data.addresses);
        }
      } catch (err) {
        console.warn('Error loading addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [token]);

  // Fetch Orders
  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.orders) setOrders(data.orders);
        }
      } catch (err) {
        console.warn('Error loading orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Sync profile state when user updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileDob(user.dob || '');
      setProfileAvatar(user.avatarUrl || '');
      setAvatarPreview(user.avatarUrl || '');
      if (user.preferredContact) setPreferredContact(user.preferredContact);
      if (user.notificationPreferences) setNotifPreferences(user.notificationPreferences);
    }
  }, [user]);

  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return 'SF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Profile completion score calculation
  const calculateProfileCompletion = () => {
    let score = 30; // base account created
    if (user?.avatarUrl) score += 20;
    if (user?.phone) score += 20;
    if (addresses.length > 0) score += 20;
    if (user?.dob) score += 10;
    return Math.min(score, 100);
  };
  const completionPercentage = calculateProfileCompletion();

  // Avatar Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      onToast('Image size must be under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
      setProfileAvatar(result);
      onToast('Avatar updated. Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setProfileAvatar('');
    onToast('Avatar removed. Click "Save Changes" to apply default monogram.');
  };

  // Save Personal Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (!profileName.trim() || profileName.trim().length < 2) {
      setProfileErrorMsg('Full Name must be at least 2 characters.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim() || undefined,
        dob: profileDob || undefined,
        avatarUrl: profileAvatar || undefined,
        preferredContact,
      });

      if (res.success) {
        setProfileSuccessMsg('Personal details saved successfully.');
        onToast('Profile updated successfully.');
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        setProfileErrorMsg(res.error || 'Failed to update profile.');
      }
    } catch {
      setProfileErrorMsg('An error occurred while saving your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Notification Preferences
  const handleSaveNotificationPreferences = async (newPrefs: typeof notifPreferences) => {
    setNotifPreferences(newPrefs);
    setIsSavingNotifs(true);
    try {
      await updateProfile({ notificationPreferences: newPrefs });
      onToast('Notification preferences updated.');
    } catch {
      onToast('Failed to update notifications.');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccessMsg(null);

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.current = 'Please enter your current password.';
    if (!newPassword) {
      errors.new = 'Please enter a new password.';
    } else if (newPassword.length < 8) {
      errors.new = 'New password must be at least 8 characters long.';
    } else if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      errors.new = 'Must contain at least one letter and one number.';
    }
    if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setPasswordSuccessMsg('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onToast('Password updated securely.');
      } else {
        setPasswordErrors({ current: res.error || 'Failed to change password.' });
      }
    } catch {
      setPasswordErrors({ current: 'Network error occurred.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Open Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      recipientName: user?.name || '',
      phoneNumber: user?.phone?.replace(/\D/g, '') || '',
      addressLine1: '',
      locality: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India',
      label: 'Home',
      isDefault: addresses.length === 0,
    });
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      addressLine1: addr.addressLine1,
      locality: addr.locality,
      landmark: addr.landmark || '',
      city: addr.city,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      label: addr.label,
      isDefault: addr.isDefault,
    });
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  // Submit Address
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!addressForm.recipientName.trim()) errors.recipientName = 'Recipient name is required.';
    if (!addressForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (addressForm.phoneNumber.replace(/\D/g, '').length < 10) {
      errors.phoneNumber = 'Enter a valid 10-digit mobile number.';
    }
    if (!addressForm.addressLine1.trim()) errors.addressLine1 = 'House/Building/Street is required.';
    if (!addressForm.city.trim()) errors.city = 'City is required.';
    if (!addressForm.state.trim()) errors.state = 'State is required.';
    if (!addressForm.pincode.trim() || !/^\d{6}$/.test(addressForm.pincode.trim())) {
      errors.pincode = 'Valid 6-digit PIN code required.';
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    setIsSubmittingAddress(true);
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (editingAddress) {
          setAddresses((prev) =>
            prev.map((a) => {
              if (a.id === editingAddress.id) return data.address;
              if (data.address.isDefault) return { ...a, isDefault: false };
              return a;
            })
          );
          onToast('Address updated successfully.');
        } else {
          setAddresses((prev) => {
            const next = data.address.isDefault
              ? prev.map((a) => ({ ...a, isDefault: false }))
              : [...prev];
            return [...next, data.address];
          });
          onToast('New delivery address saved.');
        }
        setIsAddressModalOpen(false);
      } else {
        onToast(data.error || 'Failed to save address.');
      }
    } catch {
      onToast('Network error saving address.');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
        onToast('Default delivery address updated.');
      }
    } catch {
      onToast('Failed to update default address.');
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;

    if (target.isDefault && addresses.length > 1) {
      onToast('Cannot delete default address. Please assign another default address first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this delivery address?')) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        onToast('Address deleted successfully.');
      } else {
        onToast(data.error || 'Could not delete address.');
      }
    } catch {
      onToast('Network error deleting address.');
    }
  };

  // Cancel Order Handler
  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancellingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderToCancel.orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderToCancel.orderId ? { ...o, status: 'Cancelled' } : o))
        );
        if (selectedOrderDetails?.orderId === orderToCancel.orderId) {
          setSelectedOrderDetails((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
        }
        onToast(`Order #${orderToCancel.orderId} was cancelled.`);
        setOrderToCancel(null);
      } else {
        onToast(data.error || 'Could not cancel order.');
      }
    } catch {
      onToast('Failed to cancel order.');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Delete Account Confirmation
  const handleDeleteAccountSubmit = async () => {
    if (deleteConfirmationInput.trim().toUpperCase() !== 'DELETE') {
      onToast('Please type DELETE to confirm account removal.');
      return;
    }
    setIsDeletingAccount(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        onToast('Your account was permanently deleted.');
        onBackToShopping();
      } else {
        onToast(res.error || 'Failed to delete account.');
      }
    } catch {
      onToast('Error deleting account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Wishlist products
  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  // Active orders count
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'Processing' || o.status === 'Confirmed' || o.status === 'Shipped'
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#7A7569] uppercase tracking-[0.18em] font-semibold mb-1">
                <button
                  onClick={onBackToShopping}
                  className="hover:text-[#171715] transition-colors cursor-pointer"
                >
                  STOREFRONT
                </button>
                <span>/</span>
                <span className="text-[#171715]">MY ACCOUNT</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-[0.08em] text-[#171715]">
                Account Dashboard
              </h1>
            </div>

            <button
              onClick={onBackToShopping}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5E5A50] hover:text-[#171715] bg-[#EFEAE0] hover:bg-[#E5DFD4] px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <span>{pendingWhatsAppOrder ? 'Return to Product' : 'Continue Shopping'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* In-progress WhatsApp Order banner */}
          {pendingWhatsAppOrder && (
            <div className="mt-6 bg-[#171715] text-[#F5F1E8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#3C3B37] shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.241-.038.375.289.145.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.45 1.745 1.554 2.138.252.09.467.147.627.199.253.08.483.069.664.042.202-.03.837-.342.955-.672.118-.33.118-.613.083-.672-.034-.058-.127-.093-.271-.165z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2.053 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.062c-1.635 0-3.153-.497-4.42-1.353l-.317-.213-2.963.777.791-2.89-.232-.341A8.04 8.04 0 013.938 12c0-4.453 3.609-8.062 8.062-8.062 4.453 0 8.062 3.609 8.062 8.062z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#DCE96A]">
                    In-Progress WhatsApp Order
                  </div>
                  <div className="text-xs sm:text-sm text-[#F5F1E8] font-medium">
                    {pendingWhatsAppOrder.product.name} (UK {pendingWhatsAppOrder.size}, {pendingWhatsAppOrder.color.name})
                  </div>
                </div>
              </div>
              <button
                onClick={onResumeWhatsAppOrder || onBackToShopping}
                className="px-4 py-2.5 rounded-xl bg-[#DCE96A] hover:bg-[#CAD858] text-[#171715] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-1.5"
              >
                <span>Return to Order & Launch WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* User Welcome Banner with Profile Completion */}
          <div className="mt-6 bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar Monogram or Photo */}
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.name || 'Member'}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#DDD6C8] shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#626849] text-white flex items-center justify-center font-display text-xl sm:text-2xl font-bold tracking-wider shadow-xs">
                    {getInitials(user?.name || 'SF')}
                  </div>
                )}
                <button
                  onClick={() => {
                    setActiveTab('personal');
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  title="Change avatar image"
                  className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#171715] hover:bg-[#2C2E25] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#626849]/15 text-[#626849] px-2.5 py-0.5 rounded-md">
                    ACTIVE MEMBER
                  </span>
                  <span className="text-xs text-[#8C8679] hidden sm:inline">
                    Since {new Date(user?.createdAt || Date.now()).getFullYear()}
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl uppercase tracking-[0.06em] text-[#171715]">
                  {user?.name || 'Soleform Member'}
                </h2>
                <p className="text-xs text-[#5E5A50] mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Profile Completion Widget */}
            <div className="w-full md:w-64 bg-[#F2EDE4] p-4 rounded-xl border border-[#E0D9CB]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#171715] mb-2">
                <span>Profile Completion</span>
                <span className="font-mono text-[#626849]">{completionPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#DDD6C8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#626849] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              {completionPercentage < 100 ? (
                <button
                  onClick={() => setActiveTab(addresses.length === 0 ? 'addresses' : 'personal')}
                  className="mt-2 text-[11px] text-[#626849] hover:underline font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {addresses.length === 0
                      ? '+ Add delivery address'
                      : !user?.phone
                      ? '+ Add phone number'
                      : '+ Complete remaining details'}
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <p className="mt-2 text-[11px] text-[#557A46] font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Your profile is fully completed.</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (Horizontal Scrollable Tabs) */}
        <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2 pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'personal', label: 'Personal Info', icon: UserIcon },
            { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
            { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistIds.length },
            { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
            { id: 'cart', label: 'Bag', icon: ShoppingBag, count: cartItems.length },
            { id: 'settings', label: 'Security', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AccountTab)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#171715] text-white shadow-xs'
                    : 'bg-[#FAF6F0] text-[#5E5A50] hover:text-[#171715] border border-[#E8E2D5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-[#DCE96A] text-[#171715]' : 'bg-[#E8E2D5] text-[#171715]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3 bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl p-4 sticky top-24 shadow-xs">
            <div className="px-4 py-3 border-b border-[#E8E2D5] mb-2">
              <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#7A7569] block">
                NAVIGATION
              </span>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'personal', label: 'Personal Information', icon: UserIcon },
                { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, count: addresses.length },
                { id: 'wishlist', label: 'My Wishlist', icon: Heart, count: wishlistIds.length },
                { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
                { id: 'cart', label: 'My Shopping Bag', icon: ShoppingBag, count: cartItems.length },
                { id: 'settings', label: 'Account & Security', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AccountTab)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#171715] text-white shadow-xs'
                        : 'text-[#47433B] hover:bg-[#EFEAE0] hover:text-[#171715]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#DCE96A] text-[#171715] font-bold'
                            : 'bg-[#EAE4D7] text-[#171715]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 mt-4 border-t border-[#E8E2D5]">
              <button
                onClick={async () => {
                  await logout();
                  onToast('Signed out of SOLEFORM.');
                  onBackToShopping();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-[#C94A38] hover:bg-[#FDF2F0] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-9 bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl p-6 sm:p-10 shadow-xs min-h-[580px]">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5]">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                      Account Overview
                    </h2>
                    <p className="text-xs text-[#5E5A50] mt-1">
                      Quick overview of your orders, saved footwear, and delivery setup.
                    </p>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Card 1: Orders */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="p-5 rounded-xl bg-white border border-[#E0D9CB] hover:border-[#171715]/40 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-3 text-[#7A7569]">
                      <Package className="w-5 h-5 group-hover:text-[#171715] transition-colors" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#626849]">
                        {activeOrdersCount} ACTIVE
                      </span>
                    </div>
                    <div className="font-display text-3xl font-bold text-[#171715]">
                      {orders.length}
                    </div>
                    <div className="text-xs text-[#5E5A50] mt-1 font-medium">Total Orders</div>
                  </div>

                  {/* Card 2: Wishlist */}
                  <div
                    onClick={() => setActiveTab('wishlist')}
                    className="p-5 rounded-xl bg-white border border-[#E0D9CB] hover:border-[#171715]/40 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-3 text-[#7A7569]">
                      <Heart className="w-5 h-5 text-[#C94A38] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C94A38]">
                        SAVED
                      </span>
                    </div>
                    <div className="font-display text-3xl font-bold text-[#171715]">
                      {wishlistIds.length}
                    </div>
                    <div className="text-xs text-[#5E5A50] mt-1 font-medium">Liked Shoes</div>
                  </div>

                  {/* Card 3: Addresses */}
                  <div
                    onClick={() => setActiveTab('addresses')}
                    className="p-5 rounded-xl bg-white border border-[#E0D9CB] hover:border-[#171715]/40 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-3 text-[#7A7569]">
                      <MapPin className="w-5 h-5 group-hover:text-[#171715] transition-colors" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#626849]">
                        DESTINATIONS
                      </span>
                    </div>
                    <div className="font-display text-3xl font-bold text-[#171715]">
                      {addresses.length}
                    </div>
                    <div className="text-xs text-[#5E5A50] mt-1 font-medium">Saved Addresses</div>
                  </div>

                  {/* Card 4: Cart */}
                  <div
                    onClick={() => setActiveTab('cart')}
                    className="p-5 rounded-xl bg-white border border-[#E0D9CB] hover:border-[#171715]/40 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-3 text-[#7A7569]">
                      <ShoppingBag className="w-5 h-5 group-hover:text-[#171715] transition-colors" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#DCE96A] bg-[#171715] px-1.5 py-0.2 rounded font-mono">
                        BAG
                      </span>
                    </div>
                    <div className="font-display text-3xl font-bold text-[#171715]">
                      {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                    </div>
                    <div className="text-xs text-[#5E5A50] mt-1 font-medium">Cart Items</div>
                  </div>
                </div>

                {/* Recent Order Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold tracking-[0.16em] uppercase text-[#171715]">
                      Latest Order Activity
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#626849] hover:underline cursor-pointer"
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  </div>

                  {orders.length > 0 ? (
                    <div className="bg-white border border-[#E0D9CB] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-[#FAF6F0] border border-[#E8E2D5] overflow-hidden shrink-0">
                          {orders[0].items[0]?.product?.image && (
                            <img
                              src={orders[0].items[0].product.image}
                              alt="Product thumbnail"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#171715]">
                              Order #{orders[0].orderId}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                orders[0].status === 'Delivered'
                                  ? 'bg-[#EBF5E9] text-[#2E6B24]'
                                  : orders[0].status === 'Cancelled'
                                  ? 'bg-[#F2F2F2] text-[#7A7569]'
                                  : 'bg-[#FFF6E5] text-[#9E6500]'
                              }`}
                            >
                              {orders[0].status}
                            </span>
                          </div>
                          <p className="text-xs text-[#5E5A50] mt-0.5">
                            Placed on {orders[0].date} · {orders[0].items.length} items · Total:{' '}
                            <span className="font-semibold text-[#171715]">
                              {currency.symbol}
                              {Math.round(orders[0].totalINR * currency.rate).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrderDetails(orders[0]);
                        }}
                        className="text-xs font-bold uppercase tracking-wider bg-[#171715] hover:bg-[#2C2E25] text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Order Details
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E0D9CB] rounded-xl p-8 text-center">
                      <Package className="w-8 h-8 text-[#9E988B] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[#171715]">No orders placed yet</p>
                      <p className="text-xs text-[#7A7569] mt-1 mb-4">
                        Explore our curated collection of considered everyday footwear.
                      </p>
                      <button
                        onClick={onBackToShopping}
                        className="bg-[#171715] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-[#2C2E25] transition-colors cursor-pointer"
                      >
                        Shop Footwear Collection
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary Default Address Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold tracking-[0.16em] uppercase text-[#171715]">
                      Primary Shipping Address
                    </h3>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="text-xs font-bold text-[#626849] hover:underline cursor-pointer"
                    >
                      Manage Addresses ({addresses.length}) →
                    </button>
                  </div>

                  {addresses.find((a) => a.isDefault) ? (
                    (() => {
                      const def = addresses.find((a) => a.isDefault)!;
                      return (
                        <div className="bg-white border border-[#E0D9CB] rounded-xl p-5 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-[#171715]">
                                {def.recipientName}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#626849]/15 text-[#626849] px-2 py-0.2 rounded">
                                {def.label} · DEFAULT
                              </span>
                            </div>
                            <p className="text-xs text-[#5E5A50] leading-relaxed">
                              {def.addressLine1}, {def.locality}
                              {def.landmark && `, near ${def.landmark}`}
                              <br />
                              {def.city}, {def.state} - {def.pincode}, {def.country}
                            </p>
                            <p className="text-xs text-[#7A7569] mt-1">Phone: {def.phoneNumber}</p>
                          </div>
                          <button
                            onClick={() => handleOpenEditAddress(def)}
                            className="text-xs font-semibold text-[#626849] hover:underline p-1 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white border border-[#E0D9CB] rounded-xl p-6 text-center">
                      <p className="text-xs text-[#7A7569] mb-3">No default address saved.</p>
                      <button
                        onClick={handleOpenAddAddress}
                        className="bg-[#171715] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                      >
                        + Add Shipping Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-[#E8E2D5]">
                  <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                    Personal Information
                  </h2>
                  <p className="text-xs text-[#5E5A50] mt-1">
                    Manage your identity details, profile photograph, and preferred communication.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-4 rounded-xl bg-[#EBF5E9] border border-[#CDE5CA] text-[#2E6B24] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-[#C94A38] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div className="p-5 bg-white border border-[#E0D9CB] rounded-xl">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-3">
                      Profile Photograph
                    </label>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-[#DDD6C8] shadow-xs"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#626849] text-white flex items-center justify-center font-display text-2xl font-bold tracking-wider">
                          {getInitials(profileName || 'SF')}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Upload Photo
                          </button>

                          {avatarPreview && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="text-xs font-semibold text-[#C94A38] hover:bg-[#FDF2F0] border border-[#E8E2D5] px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A7569]">
                          PNG, JPG or WEBP formats. Maximum file size 3MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full bg-white border border-[#DDD6C8] text-sm text-[#171715] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#626849] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715]">
                          Email Address
                        </label>
                        <span className="text-[10px] text-[#557A46] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-[#EFEAE0] border border-[#DDD6C8] text-sm text-[#7A7569] rounded-xl px-4 py-3 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-[#8C8679] mt-1">
                        Primary account identifier. Contact concierge for email change requests.
                      </p>
                    </div>
                  </div>

                  {/* Phone & Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#8C8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white border border-[#DDD6C8] text-sm text-[#171715] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#626849] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5">
                        Date of Birth (Optional)
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#8C8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          value={profileDob}
                          onChange={(e) => setProfileDob(e.target.value)}
                          className="w-full bg-white border border-[#DDD6C8] text-sm text-[#171715] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#626849] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-2">
                      Preferred Contact Channel
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['email', 'phone', 'both'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPreferredContact(method)}
                          className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            preferredContact === method
                              ? 'bg-[#171715] text-white border-[#171715]'
                              : 'bg-white text-[#47433B] border-[#DDD6C8] hover:border-[#171715]/40'
                          }`}
                        >
                          {method === 'both' ? 'Email & Phone' : method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-[0.18em] px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>SAVING CHANGES...</span>
                        </>
                      ) : (
                        <span>SAVE CHANGES</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: DELIVERY ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                      Delivery Addresses
                    </h2>
                    <p className="text-xs text-[#5E5A50] mt-1">
                      Save multiple shipping destinations for fast, seamless checkout.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-2 bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <div className="py-12 flex items-center justify-center text-[#7A7569]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white border border-[#E0D9CB] rounded-xl p-10 text-center">
                    <MapPin className="w-10 h-10 text-[#9E988B] mx-auto mb-3" />
                    <h3 className="font-display text-lg uppercase tracking-wide text-[#171715]">
                      No Addresses Saved
                    </h3>
                    <p className="text-xs text-[#7A7569] mt-1 mb-5 max-w-sm mx-auto">
                      Add your home or studio address to enable one-click delivery on your next shoe purchase.
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      + Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-all ${
                          addr.isDefault
                            ? 'border-[#626849] ring-1 ring-[#626849]/30 shadow-xs'
                            : 'border-[#E0D9CB] hover:border-[#171715]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EFEAE0] text-[#171715] px-2.5 py-0.5 rounded">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#626849] text-white px-2 py-0.5 rounded flex items-center gap-1">
                                <Check className="w-3 h-3" /> DEFAULT
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-[#171715]">{addr.recipientName}</h4>
                          <p className="text-xs text-[#5E5A50] mt-1 leading-relaxed">
                            {addr.addressLine1}
                            {addr.locality && `, ${addr.locality}`}
                            {addr.landmark && (
                              <span className="block text-[#8C8679]">Near {addr.landmark}</span>
                            )}
                            <span className="block font-medium text-[#171715]">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </span>
                            <span className="block text-[#8C8679]">{addr.country}</span>
                          </p>

                          <p className="text-xs text-[#7A7569] mt-3 font-medium">
                            Phone: <span className="text-[#171715]">{addr.phoneNumber}</span>
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#E8E2D5] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-xs font-semibold text-[#171715] hover:text-[#626849] transition-colors p-1 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <span className="text-[#DDD6C8]">|</span>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs font-semibold text-[#C94A38] hover:text-[#A93322] transition-colors p-1 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs font-bold text-[#626849] hover:underline cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MY WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5]">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                      Saved Wishlist
                    </h2>
                    <p className="text-xs text-[#5E5A50] mt-1">
                      Your liked designs from the current rotation. Synchronized across devices.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#626849] bg-[#626849]/15 px-2.5 py-1 rounded">
                    {wishlistedProducts.length} ITEMS
                  </span>
                </div>

                {wishlistedProducts.length === 0 ? (
                  <div className="bg-white border border-[#E0D9CB] rounded-xl p-10 text-center">
                    <Heart className="w-10 h-10 text-[#9E988B] mx-auto mb-3" />
                    <h3 className="font-display text-lg uppercase tracking-wide text-[#171715]">
                      No Shoes Saved Yet
                    </h3>
                    <p className="text-xs text-[#7A7569] mt-1 mb-5 max-w-sm mx-auto">
                      Tap the heart icon on any shoe card while browsing to save it to your member rotation.
                    </p>
                    <button
                      onClick={onBackToShopping}
                      className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Browse New Arrivals
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlistedProducts.map((product) => {
                      const convertedPrice = Math.round(product.priceINR * currency.rate);
                      return (
                        <div
                          key={product.id}
                          className="bg-white border border-[#E0D9CB] rounded-xl overflow-hidden flex flex-col justify-between group hover:border-[#171715]/40 transition-all shadow-2xs"
                        >
                          <div>
                            {/* Product Image & Remove Heart button */}
                            <div className="relative aspect-4/3 bg-[#FAF6F0] overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              />
                              <button
                                onClick={() => onToggleWishlist(product.id)}
                                title="Remove from wishlist"
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#C94A38] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                              >
                                <Heart className="w-4 h-4 fill-current" />
                              </button>
                              <div className="absolute bottom-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded text-[#171715]">
                                {product.department}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                              <h4
                                onClick={() => onOpenProductDetails(product)}
                                className="font-display text-base uppercase tracking-wider text-[#171715] hover:text-[#626849] transition-colors cursor-pointer truncate"
                              >
                                {product.name}
                              </h4>
                              <p className="text-xs text-[#7A7569]">{product.category}</p>

                              <div className="mt-2 flex items-center justify-between">
                                <span className="font-bold text-sm text-[#171715]">
                                  {currency.symbol}
                                  {convertedPrice.toLocaleString()}
                                </span>

                                {/* Color dots */}
                                <div className="flex items-center gap-1">
                                  {product.colors.slice(0, 3).map((col) => (
                                    <span
                                      key={col.name}
                                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                                      style={{ backgroundColor: col.hex }}
                                      title={col.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => onOpenProductDetails(product)}
                              className="w-full py-2 text-center text-xs font-semibold text-[#171715] bg-[#EFEAE0] hover:bg-[#E5DFD4] rounded-lg transition-colors cursor-pointer"
                            >
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                onAddToCart(product, product.colors[0], product.sizes[1] || 8, 1);
                              }}
                              className="w-full py-2 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#171715] hover:bg-[#2C2E25] rounded-lg transition-colors cursor-pointer"
                            >
                              Add to Bag
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5]">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                      Order History
                    </h2>
                    <p className="text-xs text-[#5E5A50] mt-1">
                      Track deliveries, view past purchases, and manage order cancellations.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#626849] bg-[#626849]/15 px-2.5 py-1 rounded">
                    {orders.length} TOTAL
                  </span>
                </div>

                {isLoadingOrders ? (
                  <div className="py-12 flex items-center justify-center text-[#7A7569]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-[#E0D9CB] rounded-xl p-10 text-center">
                    <Package className="w-10 h-10 text-[#9E988B] mx-auto mb-3" />
                    <h3 className="font-display text-lg uppercase tracking-wide text-[#171715]">
                      No Orders Found
                    </h3>
                    <p className="text-xs text-[#7A7569] mt-1 mb-5 max-w-sm mx-auto">
                      You haven’t placed any orders yet. Discover our latest footwear and enjoy express complimentary delivery.
                    </p>
                    <button
                      onClick={onBackToShopping}
                      className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Explore Footwear
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const convertedTotal = Math.round(order.totalINR * currency.rate);
                      const canCancel = order.status === 'Processing' || order.status === 'Confirmed';

                      return (
                        <div
                          key={order.orderId}
                          className="bg-white border border-[#E0D9CB] rounded-xl p-5 sm:p-6 transition-all hover:border-[#171715]/30 shadow-2xs"
                        >
                          {/* Header row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E2D5]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-base uppercase tracking-wider font-bold text-[#171715]">
                                  Order #{order.orderId}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                                    order.status === 'Delivered'
                                      ? 'bg-[#EBF5E9] text-[#2E6B24]'
                                      : order.status === 'Cancelled'
                                      ? 'bg-[#F2F2F2] text-[#7A7569]'
                                      : order.status === 'Shipped'
                                      ? 'bg-[#EEF2FF] text-[#3B5998]'
                                      : 'bg-[#FFF6E5] text-[#9E6500]'
                                  }`}
                                >
                                  {order.status === 'Processing' && (
                                    <Clock className="w-3 h-3 animate-pulse" />
                                  )}
                                  {order.status === 'Delivered' && <Check className="w-3 h-3" />}
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#7A7569] mt-0.5">
                                Placed on {order.date} · Paid via {order.paymentMethod}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-base text-[#171715]">
                                {currency.symbol}
                                {convertedTotal.toLocaleString()}
                              </span>
                              <span className="block text-[11px] text-[#7A7569]">
                                {order.items.reduce((acc, i) => acc + i.quantity, 0)} total pairs
                              </span>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="py-4 space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] border border-[#E8E2D5] overflow-hidden shrink-0">
                                    {item.product?.image && (
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-xs text-[#171715]">
                                      {item.product?.name}
                                    </p>
                                    <p className="text-[11px] text-[#7A7569]">
                                      {item.selectedColor?.name} · Size UK {item.selectedSize} · Qty:{' '}
                                      {item.quantity}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-xs font-semibold text-[#171715]">
                                  {currency.symbol}
                                  {Math.round(
                                    (item.product?.priceINR || 0) * item.quantity * currency.rate
                                  ).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action row */}
                          <div className="pt-4 border-t border-[#E8E2D5] flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-[#7A7569] truncate max-w-sm">
                              Ship to: <span className="text-[#171715]">{order.address}</span>
                            </p>

                            <div className="flex items-center gap-2">
                              {canCancel && (
                                <button
                                  onClick={() => setOrderToCancel(order)}
                                  className="text-xs font-semibold text-[#C94A38] hover:bg-[#FDF2F0] border border-[#F5C2BC] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel Order
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Order Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: MY CART */}
            {activeTab === 'cart' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5]">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                      My Shopping Bag
                    </h2>
                    <p className="text-xs text-[#5E5A50] mt-1">
                      Current selections stored in your active shopping rotation.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#626849] bg-[#626849]/15 px-2.5 py-1 rounded">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} ITEMS
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="bg-white border border-[#E0D9CB] rounded-xl p-10 text-center">
                    <ShoppingBag className="w-10 h-10 text-[#9E988B] mx-auto mb-3" />
                    <h3 className="font-display text-lg uppercase tracking-wide text-[#171715]">
                      Your Bag is Empty
                    </h3>
                    <p className="text-xs text-[#7A7569] mt-1 mb-5 max-w-sm mx-auto">
                      Ready to start your rotation? Browse modern casual and performance shoes crafted for everyday comfort.
                    </p>
                    <button
                      onClick={onBackToShopping}
                      className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Shop Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items List */}
                    <div className="bg-white border border-[#E0D9CB] rounded-xl divide-y divide-[#E8E2D5] overflow-hidden">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FAF6F0] border border-[#E8E2D5] overflow-hidden shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div>
                              <h4
                                onClick={() => onOpenProductDetails(item.product, item.selectedColor, item.selectedSize)}
                                className="font-display text-sm sm:text-base uppercase tracking-wider text-[#171715] hover:text-[#626849] cursor-pointer"
                              >
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-[#7A7569]">
                                {item.selectedColor.name} · Size UK {item.selectedSize}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="font-bold text-sm text-[#171715]">
                                  {currency.symbol}
                                  {Math.round(item.product.priceINR * currency.rate).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-[#DDD6C8] rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="px-2.5 py-1 text-xs text-[#5E5A50] hover:bg-[#FAF6F0] cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 text-xs font-bold font-mono text-[#171715]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="px-2.5 py-1 text-xs text-[#5E5A50] hover:bg-[#FAF6F0] cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveFromCart(item.id)}
                              className="text-xs text-[#C94A38] hover:underline p-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary card */}
                    <div className="bg-[#FAF6F0] border border-[#E8E2D5] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-[#7A7569]">Total Estimated Price</div>
                        <div className="font-display text-2xl font-bold text-[#171715]">
                          {currency.symbol}
                          {Math.round(
                            cartItems.reduce((acc, i) => acc + i.product.priceINR * i.quantity, 0) *
                              currency.rate
                          ).toLocaleString()}
                        </div>
                        <span className="text-[11px] text-[#557A46] font-semibold">
                          ✓ Free Express Delivery included
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={onBackToShopping}
                          className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl border border-[#DDD6C8] text-xs font-bold uppercase tracking-wider text-[#171715] hover:bg-white transition-colors cursor-pointer text-center"
                        >
                          Keep Browsing
                        </button>
                        <button
                          onClick={onProceedToCheckout}
                          className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer shadow-xs text-center"
                        >
                          Checkout Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: ACCOUNT SETTINGS & SECURITY */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-[#E8E2D5]">
                  <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-[#171715]">
                    Account & Security
                  </h2>
                  <p className="text-xs text-[#5E5A50] mt-1">
                    Manage password credentials, member notifications, and session access.
                  </p>
                </div>

                {/* Change Password Form */}
                <div className="bg-white border border-[#E0D9CB] rounded-xl p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-[#626849]" />
                    <h3 className="font-display text-lg uppercase tracking-wider text-[#171715]">
                      Change Password
                    </h3>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="mb-4 p-4 rounded-xl bg-[#EBF5E9] border border-[#CDE5CA] text-[#2E6B24] text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    {/* Current Password */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter existing password"
                          className="w-full bg-[#FAF6F0] border border-[#DDD6C8] text-sm text-[#171715] rounded-xl pl-4 pr-11 py-3 focus:ring-2 focus:ring-[#626849] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7569] hover:text-[#171715] p-1 cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.current && (
                        <p className="mt-1 text-xs text-[#C94A38] font-medium">
                          • {passwordErrors.current}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters (letters & numbers)"
                          className="w-full bg-[#FAF6F0] border border-[#DDD6C8] text-sm text-[#171715] rounded-xl pl-4 pr-11 py-3 focus:ring-2 focus:ring-[#626849] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7569] hover:text-[#171715] p-1 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.new && (
                        <p className="mt-1 text-xs text-[#C94A38] font-medium">• {passwordErrors.new}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#171715] mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-[#FAF6F0] border border-[#DDD6C8] text-sm text-[#171715] rounded-xl pl-4 pr-11 py-3 focus:ring-2 focus:ring-[#626849] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A7569] hover:text-[#171715] p-1 cursor-pointer"
                        >
                          {showConfirmPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirm && (
                        <p className="mt-1 text-xs text-[#C94A38] font-medium">
                          • {passwordErrors.confirm}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 mt-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>UPDATING PASSWORD...</span>
                        </>
                      ) : (
                        <span>UPDATE PASSWORD</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white border border-[#E0D9CB] rounded-xl p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[#626849]" />
                    <h3 className="font-display text-lg uppercase tracking-wider text-[#171715]">
                      Notification Preferences
                    </h3>
                  </div>
                  <p className="text-xs text-[#7A7569] mb-5">
                    Choose what updates you wish to receive regarding your footwear rotation.
                  </p>

                  <div className="space-y-4 max-w-lg">
                    {[
                      {
                        key: 'orderAlerts',
                        title: 'Order Status & Shipping Updates',
                        desc: 'Notifications when your shoes are confirmed, packed, and out for delivery.',
                      },
                      {
                        key: 'productUpdates',
                        title: 'New Collection & Seasonal Releases',
                        desc: 'First access to limited colorways and seasonal product drops.',
                      },
                      {
                        key: 'exclusiveOffers',
                        title: 'Member Privileges & Promotions',
                        desc: 'Exclusive discounts and early access to archive sales.',
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-[#FAF6F0] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#171715]">{item.title}</p>
                          <p className="text-[11px] text-[#7A7569] mt-0.5">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifPreferences[item.key as keyof typeof notifPreferences]}
                          onChange={(e) => {
                            handleSaveNotificationPreferences({
                              ...notifPreferences,
                              [item.key]: e.target.checked,
                            });
                          }}
                          className="w-4 h-4 accent-[#626849] rounded mt-1 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone: Delete Account */}
                <div className="bg-[#FDF2F0] border border-[#F5C2BC] rounded-xl p-6 sm:p-7">
                  <div className="flex items-center gap-2 text-[#C94A38] mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-display text-lg uppercase tracking-wider">Danger Zone</h3>
                  </div>
                  <p className="text-xs text-[#7A7569] mb-4">
                    Permanently delete your SOLEFORM member account, saved delivery addresses, and personal profile data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      setDeleteConfirmationInput('');
                      setIsDeleteModalOpen(true);
                    }}
                    className="bg-[#C94A38] hover:bg-[#A93322] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- MODAL: ADD / EDIT ADDRESS --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-5">
              <h3 className="font-display text-xl uppercase tracking-wider text-[#171715]">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-[#7A7569] hover:text-[#171715] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    className={`w-full bg-white border text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849] ${
                      addressErrors.recipientName ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {addressErrors.recipientName && (
                    <p className="text-[10px] text-[#C94A38] mt-0.5">• {addressErrors.recipientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                    placeholder="10-digit mobile"
                    className={`w-full bg-white border text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849] ${
                      addressErrors.phoneNumber ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {addressErrors.phoneNumber && (
                    <p className="text-[10px] text-[#C94A38] mt-0.5">• {addressErrors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                  Flat / House / Building / Street *
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 402, Oakwood Residency"
                  className={`w-full bg-white border text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849] ${
                    addressErrors.addressLine1 ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                  }`}
                />
                {addressErrors.addressLine1 && (
                  <p className="text-[10px] text-[#C94A38] mt-0.5">• {addressErrors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                    placeholder="e.g. Koramangala"
                    className="w-full bg-white border border-[#DDD6C8] text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="e.g. Near BDA Complex"
                    className="w-full bg-white border border-[#DDD6C8] text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className={`w-full bg-white border text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849] ${
                      addressErrors.city ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {addressErrors.city && (
                    <p className="text-[10px] text-[#C94A38] mt-0.5">• {addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className={`w-full bg-white border text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849] ${
                      addressErrors.state ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {addressErrors.state && (
                    <p className="text-[10px] text-[#C94A38] mt-0.5">• {addressErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="6 digits"
                    className={`w-full bg-white border text-xs text-[#171715] rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#626849] ${
                      addressErrors.pincode ? 'border-[#C94A38]' : 'border-[#DDD6C8]'
                    }`}
                  />
                  {addressErrors.pincode && (
                    <p className="text-[10px] text-[#C94A38] mt-0.5">• {addressErrors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Label & Default checkbox */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#171715] uppercase tracking-wider">
                    Label:
                  </span>
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        addressForm.label === lbl
                          ? 'bg-[#171715] text-white'
                          : 'bg-[#EFEAE0] text-[#5E5A50] hover:bg-[#E5DFD4]'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-[#171715] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="accent-[#626849] rounded"
                  />
                  <span>Set as default address</span>
                </label>
              </div>

              {/* Modal footer */}
              <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5E5A50] hover:text-[#171715] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAddress}
                  className="bg-[#171715] hover:bg-[#2C2E25] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingAddress ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ORDER DETAILS --- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#626849] block">
                  ORDER SUMMARY
                </span>
                <h3 className="font-display text-xl uppercase tracking-wider text-[#171715]">
                  Order #{selectedOrderDetails.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-[#7A7569] hover:text-[#171715] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Status and dates */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E0D9CB]">
                <div>
                  <span className="text-[10px] text-[#7A7569] uppercase font-bold tracking-wider block">
                    Current Status
                  </span>
                  <span className="font-bold text-sm text-[#171715]">
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#7A7569] uppercase font-bold tracking-wider block">
                    Ordered Date
                  </span>
                  <span className="text-xs text-[#5E5A50]">{selectedOrderDetails.date}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171715] mb-2">
                  Items in this order
                </h4>
                <div className="bg-white border border-[#E0D9CB] rounded-xl divide-y divide-[#E8E2D5] overflow-hidden">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#FAF6F0] border border-[#E8E2D5] overflow-hidden shrink-0">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171715]">{item.product?.name}</p>
                          <p className="text-[11px] text-[#7A7569]">
                            {item.selectedColor?.name} · Size UK {item.selectedSize} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#171715]">
                        {currency.symbol}
                        {Math.round(
                          (item.product?.priceINR || 0) * item.quantity * currency.rate
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address and Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white border border-[#E0D9CB] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7569] block mb-1">
                    Shipping Address
                  </span>
                  <p className="font-semibold text-[#171715]">{selectedOrderDetails.customerName}</p>
                  <p className="text-[#5E5A50] leading-relaxed mt-0.5">
                    {selectedOrderDetails.address}
                    <br />
                    {selectedOrderDetails.city}, {selectedOrderDetails.state} -{' '}
                    {selectedOrderDetails.pincode}
                  </p>
                  <p className="text-[#7A7569] mt-1">Phone: {selectedOrderDetails.phone}</p>
                </div>

                <div className="p-3.5 bg-white border border-[#E0D9CB] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7569] block mb-1">
                    Payment Method
                  </span>
                  <p className="font-semibold text-[#171715]">{selectedOrderDetails.paymentMethod}</p>
                  <p className="text-[#5E5A50] mt-1">
                    Payment verified & processed securely via SOLEFORM Gateway.
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-[#F2EDE4] rounded-xl border border-[#E0D9CB] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5E5A50]">
                  <span>Item Subtotal</span>
                  <span>
                    {currency.symbol}
                    {Math.round(selectedOrderDetails.totalINR * currency.rate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#5E5A50]">
                  <span>Express Courier Shipping</span>
                  <span className="text-[#557A46] font-semibold">FREE</span>
                </div>
                <div className="pt-2 border-t border-[#DDD6C8] flex justify-between font-bold text-sm text-[#171715]">
                  <span>Total Amount Paid</span>
                  <span>
                    {currency.symbol}
                    {Math.round(selectedOrderDetails.totalINR * currency.rate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-[#E8E2D5] mt-5 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="bg-[#171715] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIRM ORDER CANCELLATION --- */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] border border-[#E8E2D5] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#C94A38] mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-display text-lg uppercase tracking-wider">Cancel Order</h3>
            </div>
            <p className="text-xs text-[#5E5A50] leading-relaxed mb-4">
              Are you sure you want to cancel order #{orderToCancel.orderId}? The items will be returned to inventory and any processed payment will be credited back via original method.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
              <button
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5E5A50] hover:text-[#171715] cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                disabled={isCancellingOrder}
                className="bg-[#C94A38] hover:bg-[#A93322] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isCancellingOrder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE ACCOUNT CONFIRMATION --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] border border-[#F5C2BC] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#C94A38] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-display text-lg uppercase tracking-wider">
                Permanent Account Deletion
              </h3>
            </div>
            <p className="text-xs text-[#5E5A50] leading-relaxed mb-4">
              This action is permanent and cannot be reversed. All your saved addresses, order records, and profile details will be completely wiped from the database.
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#171715] mb-1.5">
                Type <span className="font-mono text-[#C94A38]">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-white border border-[#DDD6C8] text-sm text-[#171715] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#C94A38] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5E5A50] hover:text-[#171715] cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountSubmit}
                disabled={isDeletingAccount || deleteConfirmationInput.trim().toUpperCase() !== 'DELETE'}
                className="bg-[#C94A38] hover:bg-[#A93322] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
