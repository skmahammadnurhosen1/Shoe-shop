# Admin Product Details Page Implementation Plan

A dedicated, comprehensive "View Details" workspace in the Admin Panel for individual products. Administrators can view core product specifications, stock metrics, customer reviews moderation, order log history, and trigger edit/delete actions from a unified dashboard view.

> [!IMPORTANT] Confirmed User Preferences
> - **Navigation Access**: Click "View Details" or the product row in the Admin Products table to navigate to the product detail view.
> - **Reviews & Order History Layout**: Organized into structured tabs (Details/Specs, Customer Reviews, Order History, Stock Audit) with client-side search, rating filters, and review moderation actions.
> - **Edit Functionality**: Opening the Product Edit modal directly from the detail view and refreshing product specifications upon saving.

---

## 1. Overview & Core Concept

### What It Does
Provides store administrators with a single, dedicated detail view for any footwear model in the catalog. Rather than switching between separate inventory tables, order lists, and moderation feeds, admins can select any product to inspect:
- **Core Product Specs & Media**: High-res image gallery, pricing, category, department, SKU, sizes, materials, care instructions, and SEO tags.
- **Customer Reviews & Feedback**: Complete review list with reviewer name, rating breakdown, fit feedback, photo uploads, verified buyer status, official reply status, and instant moderation actions (approve, reject, delete review).
- **Order History Log**: Filterable purchase history log showing customer names, order IDs, purchase dates, quantity ordered, unit price, order workflow status, and source (Online vs. WhatsApp).
- **Quick Action Bar**: One-click actions to open the Edit Product Modal, toggle publication status (Published / Hidden / Draft / Archived), or safely delete/archive the product with confirmation.

### Target Audience / Persona
Store managers, catalog administrators, and customer support leads managing shoe inventory, review authenticity, and fulfillment performance.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Navigating to Product Details**:
   - In the Admin Panel under the **Products** or **Inventory** tab, clicking on any product row or a dedicated **"View Details"** button slides open or renders the Product Details View.
   - Includes a top breadcrumb bar (`Admin Panel / Products / [Product Name]`) with a clean `< Back to Products` navigation button.

2. **Inspecting Specs & Inventory**:
   - The top banner features a hero product badge showing current publication status (Published / Low Stock / Out of Stock), pricing in active currency, total lifetime units sold, and average star rating.
   - A 2-column layout displays the color swatches, gallery thumbnails, stock count, SKU, size distribution, materials, and care instructions.

3. **Managing Customer Reviews**:
   - Under the **Reviews** tab, admins view aggregate rating stats (5-star breakdown, fit feedback percentage) and individual review cards.
   - Admins can filter by rating (e.g., 1-Star to 5-Star) or moderation status (Pending, Approved, Rejected).
   - Direct action buttons on each review card allow admins to approve, reject, delete inappropriate reviews, or add an official store response.

4. **Tracking Order History**:
   - Under the **Order History** tab, admins inspect a high-density tabular list of all orders containing this specific product model.
   - Admins can search by customer name or order ID, filter by status (Processing, Shipped, Delivered, Cancelled), and click to jump directly to order details.

5. **Editing and Modifying Product**:
   - Clicking **"Edit Product"** opens the product editor modal pre-populated with all product fields. Upon saving, the details view automatically updates without requiring a page reload.

### Visual Identity & Theme
- **Aesthetic Direction**: Clean, editorial SaaS admin console matching the Charcoal & Bone brand posture.
- **Color Palette**: Off-white/slate canvas (`#F8FAFC`), crisp white surface cards with 1px subtle borders (`#E2E8F0`), deep slate typography (`#0F172A`), and semantic accents (Emerald `#059669` for published/in-stock, Amber `#D97706` for low stock/pending reviews, Rose `#E11D48` for deletion actions).
- **Typography**: Clean display typography (`Plus Jakarta Sans` / `Outfit`) for product headlines and clean tabular numerals (`font-mono tabular-nums`) for prices, stock levels, SKUs, and order metrics.
- **Tabs & Controls**: Segmented clean control bar (`Details & Specs`, `Customer Reviews`, `Order History`, `Inventory Logs`) with smooth active state indicators.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Dedicated View with Back Navigation vs Modal Side Drawer
- **Chosen Approach**: Render a full-bleed dedicated detail workspace view within the Admin Panel with a top breadcrumb trail (`< Back to Products`).
- **Why**: Allows ample viewport space for side-by-side spec cards, full customer review threads, and wide order log data tables without cramped vertical scrolling in a narrow side drawer.

### Decision 2: Contextual Review & Order Synthesis
- **Chosen Approach**: Filter stored reviews and historical orders dynamically by `productId` across the shared React state store.
- **Why**: Guarantees real-time consistency. Moderating a review or updating an order status from the details view instantly reflects across all other admin tabs (e.g., Reviews Moderation tab and Orders tab).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Admin Navigation Context                        │
│   ┌─────────────────────────┐        ┌─────────────────────────────┐   │
│   │ Admin Products List     │ ────>  │ Admin Product Details View  │   │
│   └─────────────────────────┘        └─────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Product Details Workspace                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Product Header & Action Bar (Edit, Status Toggle, Delete)         │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Segmented Navigation Tabs: Specs | Reviews | Orders | Stock Logs │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Active Tab Viewport:                                             │  │
│  │  ├─ Specs: Gallery, Price, Stock, Sizes, Materials, Care, SEO   │  │
│  │  ├─ Reviews: Rating Breakdown, Fit Meter, Review List, Moderate │  │
│  │  ├─ Orders: Historical Customer Log, Status, Date, Source        │  │
│  │  └─ Stock Logs: Audit Trail of Stock Adjustments                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          State & Data Stores                           │
│  ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │ Products Store  │    │ Reviews Store    │    │ Orders Store     │   │
│  └─────────────────┘    └──────────────────┘    └──────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model Integrations
1. **Product Entity**: `Product` interface (`id`, `name`, `category`, `priceINR`, `stockCount`, `sku`, `sizes`, `colors`, `description`, `materials`, `careInstructions`, `status`, `gallery`).
2. **Review Synthesis**: `StoredReview` entity filtered by `productId == activeProduct.id`. Provides moderation methods (`onApproveReview`, `onRejectReview`, `onDeleteReview`, `onAddReply`).
3. **Order History Synthesis**: `AdminOrder` entity filtered where `order.items.some(item => item.product.id == activeProduct.id)`. Calculates lifetime product metrics (total revenue generated, units purchased).
4. **Edit & Delete Action Handlers**:
   - `onUpdateProduct(updatedProduct)`: Persists edit updates.
   - `onDeleteProduct(productId)`: Safely prompts confirmation before removing or archiving the product and returning to the products table.

---

## Verification Plan

### Manual Verification Steps
1. Navigate to Admin Panel -> Products tab -> Click "View Details" on any product.
2. Verify all core product info (specs, gallery, stock, size distribution, materials) renders clearly.
3. Switch to the **Reviews** tab: verify list of product reviews, filter by rating/status, and test moderation/delete actions.
4. Switch to the **Order History** tab: verify historical orders containing this product are listed with date, customer name, quantity, and status.
5. Click **"Edit Product"**: verify modal opens pre-filled, make a change, save, and confirm details view updates immediately.
6. Verify build compilation using `compile_applet`.
