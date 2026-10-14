export interface ColorSwatch {
  name: string;
  hex: string;
  imageUrl?: string;
}

export type ProductStatus = 'published' | 'hidden' | 'draft' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: string;
  department: 'Men' | 'Women' | 'Unisex' | 'Running' | 'Casual';
  priceINR: number;
  originalPriceINR?: number;
  image: string;
  gallery?: string[];
  colors: ColorSwatch[];
  description: string;
  features?: string[];
  materials?: string;
  careInstructions?: string;
  stockCount?: number;
  lowStockThreshold?: number;
  sku?: string;
  sizes: number[];
  rating: number;
  reviewsCount: number;
  isNewArrival?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  status?: ProductStatus;
  weight?: string;
  dimensions?: string;
  deliveryInfo?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  fitFeedback: 'Runs Small' | 'True to Size' | 'Runs Large';
  isVerifiedBuyer: boolean;
  images?: string[];
  createdAt: string;
  helpfulCount: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: ColorSwatch;
  selectedSize: number;
  quantity: number;
}

export interface OrderDetails {
  orderId: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  items: CartItem[];
  subtotalINR?: number;
  discountINR?: number;
  couponCode?: string;
  shippingINR?: number;
  totalINR: number;
  date: string;
  status: 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface CategoryCard {
  id: string;
  title: string;
  image: string;
  href: string;
}

export interface LookbookCard {
  id: string;
  tag: string;
  headline: string;
  image: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // multiplier from INR
  label: string;
}

export interface NotificationPreferences {
  productUpdates: boolean;
  exclusiveOffers: boolean;
  orderAlerts: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  avatarUrl?: string;
  preferredContact?: 'email' | 'phone' | 'both';
  notificationPreferences?: NotificationPreferences;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  locality: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  label: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  admin?: AdminUser;
  error?: string;
  retryAfterSeconds?: number;
}

// Milestone 2 Operational Types

export type DepartmentType = 'Men' | 'Women' | 'Unisex' | 'All';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  department: DepartmentType;
  image?: string;
  displayOrder: number;
  status: 'active' | 'hidden';
  productCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export type InventoryAdjustmentReason =
  | 'Restock / Shipment Received'
  | 'Inventory Audit Correction'
  | 'Damaged / Defect'
  | 'Store Return'
  | 'Manual Adjustment';

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  adjustedDelta: number;
  newStock: number;
  reason: InventoryAdjustmentReason;
  note?: string;
  adminId: string;
  adminName: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  department?: string;
  image: string;
  priceINR: number;
  stockCount: number;
  lowStockThreshold: number;
  status: 'published' | 'hidden' | 'draft' | 'archived';
  health: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastAdjusted?: string;
}

export type OrderWorkflowStatus =
  | 'Inquired'
  | 'Confirmed'
  | 'In Preparation'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Processing';

export interface AdminOrder {
  orderId: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  source: 'Online Checkout' | 'WhatsApp Order';
  items: CartItem[];
  totalINR: number;
  subtotalINR?: number;
  discountINR?: number;
  couponCode?: string;
  shippingINR?: number;
  date: string;
  status: OrderWorkflowStatus;
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
  updatedAt?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpendINR: number;
  lastOrderDate?: string;
  createdAt: string;
  addressesCount?: number;
  isRegistered: boolean;
}

// Milestone 3: Promotions & Discounts Engine Types

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // percentage (e.g. 10 for 10%) or flat rupee amount (e.g. 500)
  minOrderINR: number;
  maxDiscountINR?: number;
  usageLimit?: number;
  usageCount: number;
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  promotion?: Promotion;
  discountINR: number;
  isFreeShipping: boolean;
  message?: string;
}

// Milestone 4: Customer Reviews & Moderation Types

export type ReviewFitRating = 'Runs Small' | 'True to Size' | 'Runs Large';

export interface OfficialReply {
  adminName: string;
  comment: string;
  createdAt: string;
}

export interface StoredReview {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  fitRating: ReviewFitRating;
  photoUrls?: string[];
  isVerifiedBuyer: boolean;
  status: 'pending' | 'approved' | 'rejected';
  isFeaturedOnHomepage: boolean;
  officialReply?: OfficialReply;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewAggregateStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  fitBreakdown: {
    runsSmallPercent: number;
    trueToSizePercent: number;
    runsLargePercent: number;
  };
}

// Milestone 5: Homepage Content & Lookbook Types

export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
}

export interface LookbookCardItem {
  id: string;
  tag: string;
  headline: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export interface StoredHomepageContent {
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  heroSlides: HeroSlide[];
  lookbookCards: LookbookCardItem[];
  updatedAt?: string;
}

// Milestone 6: Store Settings, Tax Rates & WhatsApp Concierge Types

export interface StoreSettings {
  shippingFeeINR: number;
  freeShippingThresholdINR: number;
  gstRatePercent: number;
  gstIncludedInPrice: boolean;
  taxIdNumber: string;
  whatsAppConciergeNumber: string;
  whatsAppDefaultMessage: string;
  supportEmail: string;
  storeAddress: string;
  currencySymbol: string;
  currencyCode: string;
  updatedAt?: string;
}

// Milestone 7: Analytics, Revenue Insights & Order Sales Reports Types

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface RevenueDataPoint {
  date: string;
  formattedDate: string;
  revenue: number;
  ordersCount: number;
}

export interface TopProductPerformance {
  id: string;
  name: string;
  category: string;
  image: string;
  unitsSold: number;
  revenue: number;
  stock: number;
}

export interface OrderStatusDistribution {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface PaymentMethodDistribution {
  prepaid: number;
  cod: number;
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRatePercent: number;
  revenueGrowthPercent: number;
  ordersGrowthPercent: number;
  dailyRevenue: RevenueDataPoint[];
  topProducts: TopProductPerformance[];
  orderStatusDistribution: OrderStatusDistribution;
  paymentMethodDistribution: PaymentMethodDistribution;
}
