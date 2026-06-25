# MenuLink — QR Menu Builder 🍲🇳🇬

Turn your restaurant menu into a **QR code for every table**. Customers scan,
browse your dishes with photos and prices, build an order, and send it straight
to your **WhatsApp** in one message. No printing reprints, no app downloads.

Built with **React + Vite + Tailwind CSS**. Part of the "...Link" family
(alongside StoreLink).

---

## ✨ Features

- **Menu builder** — restaurant name, logo, tagline, WhatsApp number.
- **Categories** — group dishes (Rice, Soups, Proteins, Drinks…).
- **Items** — photo (auto-resized), Naira price, description, tag (Popular/Spicy/New), available toggle. Add / edit / delete.
- **Table QR + link** — a scannable QR code (downloadable as PNG) and a shareable link.
- **Public menu** — clean, mobile-first page grouped by category.
- **Cart → WhatsApp order** — guests add items with quantities; one tap sends an itemized order (with total) to your WhatsApp.
- **Light / dark mode**, fully responsive, no horizontal scroll on mobile.
- **No backend, no cost** — everything is saved in the browser (localStorage).

---

## 🚀 Getting started

You need [Node.js](https://nodejs.org) (v18 or newer).

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

Build for production:

```bash
npm run build
npm run preview
```

---

## 🧠 How it works

- The restaurant (details + categories + items) is saved in `localStorage` under
  `qr-menu:restaurant`.
- The public menu page reads that same data, so the QR/link works in the **same
  browser** that created the menu.

### ⚠️ Demo limitation
No backend yet — a menu link/QR only opens on the device that created it. To make
menus work for any customer scanning at a table, add a cloud database (see roadmap).

---

## 🛣️ Roadmap (turning this into a real product)

1. **Cloud storage** (Supabase / Firebase) so QR codes work for real customers.
2. **Accounts** — each restaurant logs in and manages its menu.
3. **Multiple menus / branches** + custom links (`menulink.app/mama-nkechi`).
4. **Table numbers** baked into each QR so orders say which table they came from.
5. **Order dashboard** instead of WhatsApp-only, plus **Paystack** for paying online.

---

## 📁 Project structure

```
src/
  components/   # Navbar, Footer, ItemForm, MenuItemCard, CategoryManager, ShareCard, ImageUpload…
  hooks/        # useMenu, useLocalStorage, useTheme, useToast
  pages/        # Landing, Dashboard, Menu (public), NotFound
  utils/        # format (Naira), whatsapp link + order builders
```

---

Made with care in Nigeria. Your menu, one scan away. 🧡
