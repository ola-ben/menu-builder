# StoreLink Onboarding & Architecture Blueprint 🛍️🇳🇬

Welcome! This document serves as a complete reference and handoff guide detailing how **StoreLink** (`naija-storefront`) was built, structured, and configured. Since your next project, **MenuLink** (`qr-menu-builder`), shares the exact same tech stack and database project, you can use this blueprint to replicate the onboarding flows, database hooks, AI features, and payment controls.

---

## 🛠️ The Tech Stack
Both projects run on:
- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3 (for styling) + React Router 6 (routing)
- **Database / Sync**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Anonymous Sign-In (frictionless onboarding)
- **AI Chatbot**: Groq Cloud (Llama 3.3-70b-versatile via serverless function)
- **Deployment**: Vercel (rewrites, redirects, and API endpoints)
- **PWA**: `vite-plugin-pwa` (installable banners on iOS/Android, offline service workers)

---

## 📁 Key Files & Core Architectures in StoreLink

### 1. Offline-First Sync (`useStore.js` Hook)
The hook [useStore.js](file:///c:/Users/olabe/OneDrive/Desktop/New%20folder/naija-storefront/src/hooks/useStore.js) is the heart of the app. It manages store details, adds products, and syncs updates to Supabase while caching them in `localStorage`.
- **How onboarding works**:
  1. On mount, it attempts an **anonymous login** using Supabase: `ensureSession()`.
  2. It queries `stores` by the owner's user ID.
  3. If a database record exists, it updates the local state.
  4. If NO record exists in the database, it **migrates** the local storage state to the cloud (so users don't lose any progress they made before signing up).
- **CamelCase to SnakeCase mapping**:
  - `fromRow(row)` and `toRow(store, ownerId)` map app fields to database columns. Note that the entire `products` list is serialized as a JSON column in PostgreSQL! This means adding new product fields (like `tag`) requires NO database migration!

### 2. Multi-Item WhatsApp Checkout
Checkouts are handled by building a custom WhatsApp deep link.
- **Normalization**: WhatsApp numbers are cleaned and formatted (e.g. converting `080...` to `+23480...`) in `src/utils/format.js`.
- **Format**: `src/utils/whatsapp.js` builds a message showing:
  - List of items with quantities.
  - Price formatting (Naira currency formatting).
  - A summary total.
  - The delivery instructions.

### 3. Order Logs & Dashboard Tracking
When a user clicks "Order", we send them to WhatsApp, but we *also* log the order to Supabase.
- **File**: `src/utils/orders.js`.
- **Logic**: It inserts a record into the `orders` table containing the items, quantity, total price, and status (`pending`/`fulfilled`).
- **Dashboard UI**: The dashboard features an **Orders Panel** where vendors can view orders, see order totals, and click to mark them as fulfilled (which updates the database).

### 4. Floating AI Chatbot (`ChatWidget.jsx`)
A floating widget appears at the bottom-right of the screen for vendors.
- **Vercel Serverless Function**: `api/assist.js` and `api/_assistant.js`.
- **System Prompt**: Feeds the AI chatbot the store name, description, active products list, and recent order history.
- **Vite Dev Server Middleware**: In `vite.config.js`, a middleware mock handles `POST /api/assist` locally during development since Vercel serverless functions don't run under normal Vite dev servers.

### 5. Installable PWA
Configured using `vite-plugin-pwa` to cache resources offline.
- **Manifest**: Located in `/public/manifest.webmanifest`.
- **iOS/Android install prompts**: The component `InstallPrompt.jsx` displays a custom banner. On iOS, it guides the user to tap "Share" and "Add to Home Screen" (since Safari doesn't support automatic install prompts). On Android, it binds to the browser's `beforeinstallprompt` event.

### 6. Dynamic Tags & "Click to View..." Overlay (Latest Update)
- **Tags**: A text input field in `ProductForm.jsx` lets vendors type things like "New Arrival" or "15% discount". This gets saved in the JSON array of products.
- **Card Badge**: In `ProductCard.jsx`, if the product has a tag, it renders on the top right. To avoid clashing with the shop-selection checkbox, the tag dynamically shifts left (`right-11`) if the checkbox is active.
- **Click Overlay**: A `"click to view..."` hint appears on the bottom-right of the image container. It is set to `opacity-70` by default and transitions to `opacity-100` on card hover.

---

## 🎨 Design Language & Style Translation (StoreLink ➡️ MenuLink)

While StoreLink uses an **editorial, sharp-cornered ink/paper** design, MenuLink uses a **warm, rounded, appetizing** design language. 

Because `ink` and `paper` are not defined in MenuLink's Tailwind config, **do not copy StoreLink's CSS classes directly**. Use this styling translation:

### 1. Product/Dish Tags
- **StoreLink (Sharp corners, red highlight)**:
  ```javascript
  <span className={`absolute z-10 bg-rose-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 pointer-events-none ${tagClass}`}>
    {product.tag}
  </span>
  ```
- **MenuLink (Rounded corners, brand orange highlight)**:
  ```javascript
  <span className={`absolute z-10 bg-brand-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm pointer-events-none ${tagClass}`}>
    {product.tag}
  </span>
  ```

### 2. "Click to view..." Image Overlay
- **StoreLink (Uses `ink`/`paper` colors)**:
  ```javascript
  <span className="absolute bottom-2 right-2 pointer-events-none z-10 bg-ink/60 text-paper/90 dark:bg-paper/60 dark:text-ink/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-opacity duration-300 opacity-70 group-hover:opacity-100">
    click to view...
  </span>
  ```
- **MenuLink (Uses standard `slate` colors + rounded corners)**:
  ```javascript
  <span className="absolute bottom-2 right-2 pointer-events-none z-10 bg-slate-900/60 text-slate-50 dark:bg-white/60 dark:text-slate-950 px-2 py-0.5 rounded-md font-mono text-[9px] uppercase tracking-wider transition-opacity duration-300 opacity-70 group-hover:opacity-100">
    click to view...
  </span>
  ```

### Key Differences Summary:
- **Corners**: StoreLink badges have sharp, square edges. MenuLink uses `rounded-md` or `rounded-lg` badges to match its overall round card design.
- **Colors**: StoreLink uses `bg-rose-600` or custom monochrome tokens. MenuLink should use `bg-brand-600` (which resolves to dynamic brand orange `#ea580c`) and standard Tailwind `slate` tokens.

---

## 🗄️ Database Setup (Supabase "Birth day" Project)
Both projects share the same Supabase project but use namespaced tables:

| StoreLink Table | MenuLink Table | Purpose |
| :--- | :--- | :--- |
| `stores` | `menus` | Store/Menu profile (slug, name, theme, WhatsApp number, JSON array of products/dishes) |
| `orders` | `menu_orders` | Tracks customer orders placed through the app |
| `store_billing` | `menu_billing` | Tracks the 14-day free trial and active subscription states |

### Row Level Security (RLS) Rules:
1. **Insert/Select/Update/Delete (Owner)**: Users can only write/modify rows where `owner_id = auth.uid()`.
2. **Public Select (Visitors)**: Anyone can read details of a store or menu where the ID matches, provided the vendor's billing profile is active.

---

## 🚀 How to build MenuLink (`qr-menu-builder`)

Follow this checklist to build MenuLink using StoreLink as your blueprint:

### 1. Run the database schema
1. Go to your **Supabase dashboard** -> **Birth day** project.
2. Open the **SQL Editor**.
3. Open the file `supabase/schema.sql` inside the `qr-menu-builder` folder.
4. Copy and run the SQL commands. This creates:
   - The `menus` table (similar to `stores`).
   - The `menu_orders` table (similar to `orders`).
   - The `menu_billing` table (similar to `store_billing`).
   - The trigger function that automatically creates a `menu_billing` record when a new `menus` row is inserted.

### 2. Configure Environment Variables
Create a `.env` file in the root of `qr-menu-builder` (referencing `.env.example`) and fill in:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Replace Styling Tokens
While StoreLink uses an **editorial ink/paper** design style (black, white, near-creme colors):
- Configure `qr-menu-builder/tailwind.config.js` to use your orange/amber/warm food color palette.
- Replace key UI colors to fit a modern restaurant aesthetic.

### 4. Deploying Dynamic Link Previews (Open Graph Images)
Use the same dynamic serverless rewrites we documented for StoreLink:
1. Open `vercel.json` in `qr-menu-builder` and add a rewrite for `/menus/:slug`:
   ```json
   {
     "rewrites": [
       { "source": "/menus/:slug", "destination": "/api/share?slug=:slug" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. Create an `api/share.js` that queries the `menus` table in Supabase instead of `stores`.

---

## 🛠️ Handy Billing Commands (SQL Console)
To manually manage client trials or paid subscriptions on both apps:

```sql
-- List all active storefronts
select id, name from public.stores;

-- List all active menus
select id, name from public.menus;

-- Activate a MenuLink customer for 30 days:
update public.menu_billing 
set active=true, expires_at=now() + interval '30 days' 
where menu_id='YOUR-MENU-ID';

-- Cancel/Suspend a StoreLink customer's page (redirects clients to billing page):
update public.store_billing 
set active=false, expires_at=null, trial_ends_at=now() - interval '1 day' 
where store_id='YOUR-STORE-ID';
```

---

Good luck building MenuLink! If you need details on any code segment, check `src/hooks/useStore.js` and `src/components/ProductCard.jsx` in the `naija-storefront` folder. 💚🇳🇬
