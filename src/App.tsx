/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HeroBenefitsStrip } from './components/HeroBenefitsStrip';
import { CategorySection } from './components/CategorySection';
import { ProductSection } from './components/ProductSection';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AuthPage } from './components/AuthPage';
import { AccountDashboard, AccountTab } from './components/AccountDashboard';
import { EditorialBanner } from './components/EditorialBanner';
import { BenefitsStrip } from './components/BenefitsStrip';
import { LookbookSection } from './components/LookbookSection';
import { HomepageReviewsWall } from './components/HomepageReviewsWall';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Toast } from './components/Toast';
import { PRODUCTS, CURRENCIES } from './data/shoes';
import { CartItem, Product, ColorSwatch, Currency, OrderDetails } from './types';

function MainApp() {
  const { user, token } = useAuth();

  // View routing state: 'home' | 'product-details' | 'checkout' | 'auth' | 'account'
  const [currentView, setCurrentView] = useState<
    'home' | 'product-details' | 'checkout' | 'auth' | 'account'
  >('home');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [accountTab, setAccountTab] = useState<AccountTab>('overview');

  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedProductColor, setSelectedProductColor] = useState<ColorSwatch | undefined>(undefined);
  const [selectedProductSize, setSelectedProductSize] = useState<number | undefined>(undefined);

  // WhatsApp Order State preservation
  const [pendingWhatsAppOrder, setPendingWhatsAppOrder] = useState<{
    product: Product;
    color: ColorSwatch;
    size: number;
    quantity: number;
  } | null>(null);
  const [autoOpenWhatsAppModal, setAutoOpenWhatsAppModal] = useState<boolean>(false);

  // Live Storefront products synchronized with server database
  const [storeProducts, setStoreProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setStoreProducts(data.products);
          }
        }
      } catch (err) {
        console.warn('Using initial product cache:', err);
      }
    };
    fetchLiveProducts();
  }, []);

  // Currency state (defaults to INR ₹ matching SOLEFORM identity)
  const [currency, setCurrency] = useState<Currency>(CURRENCIES.INR);

  // Cart state: Initialized with 2 items to match the "2" badge in reference screenshot
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-init-1',
      product: PRODUCTS[0], // Form Runner 01
      selectedColor: PRODUCTS[0].colors[0], // Olive Green
      selectedSize: 9,
      quantity: 1,
    },
    {
      id: 'cart-init-2',
      product: PRODUCTS[1], // Everyday Court Low
      selectedColor: PRODUCTS[1].colors[0], // Muted Olive
      selectedSize: 8,
      quantity: 1,
    },
  ]);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<string[]>(['form-runner-01']);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Feedback toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Cart actions
  const handleAddToCart = (product: Product, color: ColorSwatch, size: number, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor.name === color.name &&
          item.selectedSize === size
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        const newItem: CartItem = {
          id: `cart-${product.id}-${color.name}-${size}-${Date.now()}`,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added ${quantity > 1 ? `${quantity} × ` : ''}${product.name} (UK ${size}) to bag.`);
  };

  const handleOrderNow = (product: Product, color: ColorSwatch, size: number, quantity: number = 1) => {
    handleAddToCart(product, color, size, quantity);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Open Dedicated Product Details Page
  const handleOpenProductDetails = (product: Product, color?: ColorSwatch, size?: number) => {
    setSelectedProductDetails(product);
    setSelectedProductColor(color || product.colors[0]);
    setSelectedProductSize(size || product.sizes[1] || product.sizes[0]);
    setQuickViewProduct(null);
    setCurrentView('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wishlist actions
  const handleToggleWishlist = (productId: string) => {
    const isSaved = wishlistIds.includes(productId);
    if (isSaved) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      showToast('Removed item from your wishlist.');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      showToast('Added item to your saved wishlist.');
    }
  };

  const handleRemoveWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  // Category selection handler
  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (currentView !== 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById('new-arrivals');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAccount = (tab: AccountTab = 'overview') => {
    setAccountTab(tab);
    if (!user) {
      navigateToAuth('login');
      showToast('Please sign in to access your member account dashboard.');
      return;
    }
    setCurrentView('account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered products list
  const filteredProducts = storeProducts.filter((p) => {
    if (activeCategory === 'all' || activeCategory === 'New Arrivals') return true;
    if (activeCategory === 'Sale') return p.isSale || p.originalPriceINR !== undefined;
    if (activeCategory === 'Men') return p.department === 'Men' || p.department === 'Unisex';
    if (activeCategory === 'Women') return p.department === 'Women' || p.department === 'Unisex';
    if (activeCategory === 'Sneakers' || activeCategory === 'Everyday Sneakers') {
      return p.category.includes('Sneakers') || p.category.includes('Casual');
    }
    if (activeCategory === 'Running' || activeCategory === 'Running Shoes') {
      return p.category.includes('Running') || p.department === 'Running';
    }
    if (activeCategory === 'Casual Essentials') {
      return p.category.includes('Casual');
    }
    if (activeCategory === 'Classic Styles') {
      return p.category.includes('Casual') || p.category.includes('Sneakers') || p.id === 'canvas-essential';
    }
    return true;
  });

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistedProducts = storeProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#171715] flex flex-col font-sans selection:bg-[#DCE96A] selection:text-[#171715]">
      {/* 1. Header & Navigation */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={handleSelectCategory}
        activeCategory={activeCategory}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAuth={() => navigateToAuth('login')}
        onNavigateAccount={navigateToAccount}
        onSignOutToast={(userName) => {
          showToast(`Signed out of SOLEFORM. See you soon, ${userName}!`);
          if (currentView === 'account') {
            setCurrentView('home');
          }
        }}
      />

      {/* Breadcrumb Navigation Bar (appears on Product Details or Account page) */}
      {currentView === 'product-details' && selectedProductDetails ? (
        <Breadcrumbs
          items={[
            {
              label: 'Home',
              onClick: () => {
                setCurrentView('home');
                setActiveCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
            },
            {
              label: selectedProductDetails.department,
              onClick: () => {
                handleSelectCategory(selectedProductDetails.department);
              },
            },
            {
              label: selectedProductDetails.name,
              active: true,
            },
          ]}
        />
      ) : currentView === 'account' ? (
        <Breadcrumbs
          items={[
            {
              label: 'Home',
              onClick: () => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
            },
            {
              label: 'My Account',
              onClick: () => {
                setAccountTab('overview');
              },
            },
            {
              label:
                accountTab === 'overview'
                  ? 'Overview'
                  : accountTab === 'personal'
                  ? 'Personal Information'
                  : accountTab === 'addresses'
                  ? 'Delivery Addresses'
                  : accountTab === 'wishlist'
                  ? 'Saved Wishlist'
                  : accountTab === 'orders'
                  ? 'Order History'
                  : accountTab === 'cart'
                  ? 'Shopping Bag'
                  : 'Account & Security',
              active: true,
            },
          ]}
        />
      ) : null}

      {/* Main Content Area based on current view */}
      <main className="flex-1">
        {currentView === 'auth' ? (
          /* Dedicated User Authentication Page */
          <AuthPage
            initialMode={authInitialMode}
            onBackToStore={() => {
              if (pendingWhatsAppOrder) {
                setSelectedProductDetails(pendingWhatsAppOrder.product);
                setSelectedProductColor(pendingWhatsAppOrder.color);
                setSelectedProductSize(pendingWhatsAppOrder.size);
                setCurrentView('product-details');
              } else {
                setCurrentView('home');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAuthSuccess={(userName, isNewAccount) => {
              if (pendingWhatsAppOrder) {
                setSelectedProductDetails(pendingWhatsAppOrder.product);
                setSelectedProductColor(pendingWhatsAppOrder.color);
                setSelectedProductSize(pendingWhatsAppOrder.size);
                setAutoOpenWhatsAppModal(true);
                setCurrentView('product-details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(
                  isNewAccount
                    ? `Welcome to SOLEFORM, ${userName}! Resuming your WhatsApp order.`
                    : `Welcome back, ${userName}! Resuming your WhatsApp order.`
                );
              } else {
                setCurrentView('account');
                setAccountTab('overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(
                  isNewAccount
                    ? `Welcome to SOLEFORM, ${userName}! Your account is now active.`
                    : `Welcome back, ${userName}!`
                );
              }
            }}
          />
        ) : currentView === 'account' ? (
          /* Complete My Account / Profile Dashboard */
          user ? (
            <AccountDashboard
              initialTab={accountTab}
              currency={currency}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onAddToCart={handleAddToCart}
              onOpenProductDetails={handleOpenProductDetails}
              onProceedToCheckout={() => {
                setCurrentView('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToShopping={() => {
                if (pendingWhatsAppOrder) {
                  setSelectedProductDetails(pendingWhatsAppOrder.product);
                  setSelectedProductColor(pendingWhatsAppOrder.color);
                  setSelectedProductSize(pendingWhatsAppOrder.size);
                  setAutoOpenWhatsAppModal(true);
                  setCurrentView('product-details');
                } else {
                  setCurrentView('home');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onToast={showToast}
              pendingWhatsAppOrder={pendingWhatsAppOrder}
              onResumeWhatsAppOrder={() => {
                if (pendingWhatsAppOrder) {
                  setSelectedProductDetails(pendingWhatsAppOrder.product);
                  setSelectedProductColor(pendingWhatsAppOrder.color);
                  setSelectedProductSize(pendingWhatsAppOrder.size);
                  setAutoOpenWhatsAppModal(true);
                  setCurrentView('product-details');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          ) : (
            <AuthPage
              initialMode="login"
              onBackToStore={() => {
                if (pendingWhatsAppOrder) {
                  setSelectedProductDetails(pendingWhatsAppOrder.product);
                  setSelectedProductColor(pendingWhatsAppOrder.color);
                  setSelectedProductSize(pendingWhatsAppOrder.size);
                  setCurrentView('product-details');
                } else {
                  setCurrentView('home');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAuthSuccess={(userName) => {
                if (pendingWhatsAppOrder) {
                  setSelectedProductDetails(pendingWhatsAppOrder.product);
                  setSelectedProductColor(pendingWhatsAppOrder.color);
                  setSelectedProductSize(pendingWhatsAppOrder.size);
                  setAutoOpenWhatsAppModal(true);
                  setCurrentView('product-details');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  showToast(`Welcome back, ${userName}! Resuming your WhatsApp order.`);
                } else {
                  setCurrentView('account');
                  setAccountTab('overview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  showToast(`Welcome back, ${userName}!`);
                }
              }}
            />
          )
        ) : currentView === 'product-details' && selectedProductDetails ? (
          /* Dedicated Product Details Page */
          <ProductDetailsPage
            product={selectedProductDetails}
            currency={currency}
            isWishlisted={wishlistIds.includes(selectedProductDetails.id)}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
            onBack={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            initialColor={selectedProductColor}
            initialSize={selectedProductSize}
            onSelectProduct={(p) => handleOpenProductDetails(p)}
            allProducts={PRODUCTS}
            onNavigateLogin={() => {
              setAuthInitialMode('login');
              setCurrentView('auth');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateRegister={() => {
              setAuthInitialMode('register');
              setCurrentView('auth');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateAddAddress={() => {
              setAccountTab('addresses');
              setCurrentView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateUpdateProfile={() => {
              setAccountTab('personal');
              setCurrentView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToast={showToast}
            onWhatsAppOrderInitiated={(details) => {
              setPendingWhatsAppOrder(details);
            }}
            autoOpenWhatsAppModal={autoOpenWhatsAppModal}
          />
        ) : currentView === 'checkout' ? (
          /* Dedicated Checkout / Order Page */
          <CheckoutPage
            items={cartItems}
            currency={currency}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onBackToShopping={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOrderSuccess={(order: OrderDetails) => {
              // Persist order to server backend
              fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(order),
              }).catch((err) => console.warn('Could not persist order:', err));

              handleClearCart();
              showToast(`Order ${order.orderId} placed successfully!`);
            }}
            onViewOrders={() => {
              setAccountTab('orders');
              setCurrentView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Main Storefront Home View */
          <>
            {/* Hero Section */}
            <HeroSection
              onShopNewArrivals={() => handleSelectCategory('New Arrivals')}
              onExploreAllShoes={() => handleSelectCategory('all')}
            />

            {/* Separate Hero Benefits Strip */}
            <HeroBenefitsStrip />

            {/* "FIND YOUR FIT." Category Section */}
            <CategorySection onSelectCategory={handleSelectCategory} />

            {/* "THE NEW ROTATION." Product Section */}
            <ProductSection
              products={filteredProducts}
              currency={currency}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={(prod, col, sz) => handleAddToCart(prod, col, sz, 1)}
              onQuickView={(p) => setQuickViewProduct(p)}
              onViewAllNewArrivals={() => handleSelectCategory('all')}
              activeCategory={activeCategory}
            />

            {/* Full-width Editorial Lifestyle Banner */}
            <EditorialBanner
              onExploreCollection={() => handleSelectCategory('all')}
            />

            {/* Three-Column Horizontal Benefits Strip */}
            <BenefitsStrip />

            {/* "YOUR DAILY ROTATION." Lookbook Section */}
            <LookbookSection
              onExploreLookbook={() => {
                showToast('Opening 2026 SOLEFORM Lookbook series.');
                handleSelectCategory('all');
              }}
            />

            {/* Customer Social Proof Wall & Real Reviews */}
            <HomepageReviewsWall
              onSelectProduct={(productId) => {
                const targetProd = storeProducts.find((p) => p.id === productId) || PRODUCTS[0];
                setSelectedProductDetails(targetProd);
                setSelectedProductColor(targetProd.colors[0]);
                setSelectedProductSize(8);
                setCurrentView('product-details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Newsletter Section */}
            <NewsletterSection onSuccessToast={showToast} />
          </>
        )}
      </main>

      {/* Charcoal Footer */}
      <Footer
        currentCurrency={currency}
        onSelectCurrency={setCurrency}
        onSelectCategory={handleSelectCategory}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onShowToast={showToast}
        onNavigateAuth={() => navigateToAccount('overview')}
        onNavigateAdmin={() => {
          window.history.pushState({}, '', '/admin');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />

      {/* Interactive Drawers & Modals */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        selectedSize={selectedProductSize}
        onSelectSize={(sz) => setSelectedProductSize(sz)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        currency={currency}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistedProducts}
        onRemoveWishlist={handleRemoveWishlist}
        onAddToCart={(p) => handleAddToCart(p, p.colors[0], p.sizes[1] || 8, 1)}
        currency={currency}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={storeProducts}
        onSelectProduct={(p) => handleOpenProductDetails(p)}
        currency={currency}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        currency={currency}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(prod, col, sz) => handleAddToCart(prod, col, sz, 1)}
        onViewDetails={(prod, col, sz) => handleOpenProductDetails(prod, col, sz)}
      />

      {/* Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function AdminRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center font-sans antialiased text-[#171715]">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-[#5A584E]">
          <Loader2 className="w-4 h-4 animate-spin text-[#171715]" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AdminLayout
        onNavigateStore={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />
    );
  }

  return (
    <AdminLoginPage
      onLoginSuccess={() => {
        window.history.pushState({}, '', '/admin');
      }}
    />
  );
}

export default function App() {
  const [isAdminPath, setIsAdminPath] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminPath(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdminPath) {
    return (
      <AdminAuthProvider>
        <AdminRoute />
      </AdminAuthProvider>
    );
  }

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
