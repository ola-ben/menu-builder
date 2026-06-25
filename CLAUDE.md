# MenuLink — Project Context & Handoff

This file gives any new Claude Code session the full background on this project.

## What this project is
**MenuLink** — a QR Menu Builder for Nigerian restaurants, bukas and food vendors.
The owner builds a digital menu (categories + items with photos/prices), gets a
**QR code for each table** + a shareable link. Customers scan, browse, add items
to a cart, and send an itemized order to the restaurant's **WhatsApp**.

It's the second product in a "...Link" family. The first was **StoreLink** (a
WhatsApp storefront builder), which itself grew out of **QR Studio** (a QR code
generator). MenuLink deliberately merges those two ideas (QR codes + WhatsApp
ordering) for the food niche.

## Who the owner is
- Solo developer, strong in **React + Vite + Tailwind** (frontend-first).
- Building in public and promoting on **TikTok** (warm, friendly English; also a
  Naija-vibe audience).
- Strategy: a cohesive line of simple tools for Nigerian small businesses, each
  cross-promoting the others.

## Tech stack
React 18 + Vite 5 + Tailwind CSS 3, react-router-dom 6, qrcode.react.
Run with `npm install` then `npm run dev`. Build verified working.

## Current state (MVP, frontend-only)
- Pages: Landing, Dashboard ("My Menu"), public Menu (`/menu/:id`), 404.
- Data (restaurant + categories + items) saved in **localStorage** (`qr-menu:restaurant`).
- Public menu has a **cart** → compiles an itemized WhatsApp order with total.
- Naira formatting + Nigerian phone normalization (`0803…` → `234803…`).
- QR code is downloadable as PNG from the dashboard.
- Light/dark mode, mobile-responsive, `overflow-x: clip` fix applied globally.
- Theme is a warm orange/amber primary + WhatsApp green for order actions.

### Known limitation
No backend — a menu link/QR only opens in the **same browser** that created it.
Fine for demos/TikTok; needs a cloud DB to work for real customers at tables.

## Roadmap (agreed direction)
1. Cloud storage (Supabase or Firebase) so QR codes work for everyone.
2. Restaurant accounts / login.
3. Multiple menus/branches + custom slugs (`/mama-nkechi`).
4. Table numbers encoded in each QR so orders show the table.
5. Order dashboard + **Paystack** (Nigerian standard, NOT Stripe) for online payment.

## Pending content tasks (not code)
- Seed a sample menu (categories + dishes) so it looks full for TikTok.
- TikTok teaser script (warm English; "something's coming" angle).

## Working preferences
- Warm, friendly English for marketing copy.
- Ship the frontend MVP first; don't block on "I need a backend."
- Keep code style consistent with what's here: Tailwind utility classes, small
  reusable components, an `Icon` component for SVGs, hooks for state.
- Optional: re-skin to match StoreLink's editorial "ink/paper" monochrome theme
  for a consistent product line.
