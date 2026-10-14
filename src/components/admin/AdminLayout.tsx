import React, { useState } from 'react';
import {
  AdminSidebar,
  AdminSection,
} from './AdminSidebar';
import { AdminTopNav } from './AdminTopNav';
import { DashboardView } from './DashboardView';
import { ProductManagementView } from './ProductManagementView';
import { CategoriesManagementView } from './CategoriesManagementView';
import { InventoryManagementView } from './InventoryManagementView';
import { OrdersManagementView } from './OrdersManagementView';
import { CustomersManagementView } from './CustomersManagementView';
import { PromotionsManagementView } from './PromotionsManagementView';
import { ReviewsManagementView } from './ReviewsManagementView';
import { HomepageManagementView } from './HomepageManagementView';
import { StoreSettingsManagementView } from './StoreSettingsManagementView';
import { AnalyticsManagementView } from './AnalyticsManagementView';
import {
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  Layout,
  Tag,
  Star,
  Image as ImageIcon,
  Settings,
  ArrowRight,
  Package,
} from 'lucide-react';

interface AdminLayoutProps {
  onNavigateStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateStore }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [openCreateProduct, setOpenCreateProduct] = useState<boolean>(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  const handleAddNewProductShortcut = () => {
    setActiveSection('products');
    setOpenCreateProduct(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans antialiased text-[#171715] flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setOpenCreateProduct(false);
          if (sec !== 'products') {
            setProductCategoryFilter('all');
          }
        }}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        onNavigateStore={onNavigateStore}
      />

      {/* Main Administrative Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav
          activeSection={activeSection}
          onOpenMobile={() => setIsOpenMobile(true)}
          onNavigateStore={onNavigateStore}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'dashboard' && (
            <DashboardView
              onNavigateProducts={() => setActiveSection('products')}
              onAddNewProduct={handleAddNewProductShortcut}
              onNavigateOrders={() => setActiveSection('orders')}
              onNavigateInventory={() => setActiveSection('inventory')}
              onNavigateCustomers={() => setActiveSection('customers')}
              onNavigateCategories={() => setActiveSection('categories')}
              onNavigateAnalytics={() => setActiveSection('analytics')}
              onNavigateStore={onNavigateStore}
            />
          )}

          {activeSection === 'products' && (
            <ProductManagementView
              onNavigateStore={onNavigateStore}
              openCreateOnMount={openCreateProduct}
              initialCategoryFilter={productCategoryFilter}
            />
          )}

          {/* Categories & Collections Section */}
          {activeSection === 'categories' && (
            <CategoriesManagementView
              onNavigateProductsWithCategory={(catName) => {
                setProductCategoryFilter(catName);
                setActiveSection('products');
              }}
              onNavigateStore={onNavigateStore}
            />
          )}

          {/* Inventory Control Section */}
          {activeSection === 'inventory' && (
            <InventoryManagementView />
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <OrdersManagementView />
          )}

          {/* Customers Section */}
          {activeSection === 'customers' && (
            <CustomersManagementView />
          )}

          {/* Homepage Content Section */}
          {activeSection === 'homepage' && (
            <HomepageManagementView />
          )}

          {/* Promotions Section */}
          {activeSection === 'promotions' && (
            <PromotionsManagementView />
          )}

          {/* Reviews Section */}
          {activeSection === 'reviews' && (
            <ReviewsManagementView />
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <AnalyticsManagementView />
          )}

          {/* Media Library Section */}
          {activeSection === 'media' && (
            <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-8 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#EAE5D9] flex items-center justify-center mx-auto text-[#4A493D]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#171715]">
                Media Library
              </h3>
              <p className="text-xs text-[#5A584E] max-w-md mx-auto leading-relaxed">
                Uploaded footwear imagery is saved directly into public/uploads with permanent static URLs. Media can be uploaded and organized inside the product form.
              </p>
              <button
                onClick={() => setActiveSection('products')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#171715] text-[#FAF8F5] text-xs font-semibold rounded-xl"
              >
                <span>Upload Product Images</span>
              </button>
            </div>
          )}

          {/* Store Settings Section */}
          {activeSection === 'settings' && (
            <StoreSettingsManagementView />
          )}
        </main>
      </div>
    </div>
  );
};
