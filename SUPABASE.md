# Connecting MenuLink to Supabase

This makes table QR codes / menu links work on **every device** (not just the
browser that created the menu). Until set up, the app keeps running on
`localStorage` exactly as before.

MenuLink **reuses the same Supabase project as StoreLink** ("Birth day") — it just
adds a separate `menus` table, so you don't need a new project.

## 1. Create the table
1. Open the **Birth day** project in Supabase → **SQL Editor → New query**.
2. Paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   (The "destructive operations" warning is expected — it only drops/recreates
   policies, never data. Click Run.)

This creates the `menus` table next to the existing `stores` table.

## 2. Anonymous sign-in
Already enabled for the Birth day project (StoreLink uses it), so there's nothing
to do. If you ever use a fresh project: Authentication → Providers → **Anonymous** → on.

## 3. Keys
The `.env` file is already filled in with the Birth day project's URL + anon key
(same as StoreLink). If you move to a different project, update `.env`:
```
VITE_SUPABASE_URL=https://YOUR-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
Restart `npm run dev` after any change.

## Test it
Create a menu in `/dashboard`, copy its `/menu/:id` link (or scan the QR), and open
it on your phone — it now loads from the cloud. 🎉

## Deploying (Vercel)
Add the same two variables in **Vercel → Project → Settings → Environment Variables**,
then redeploy. Also update the `og:*` URLs in `index.html` to your real Vercel domain.

## How it works
- `src/lib/supabase.js` — client from env vars (or `null` → localStorage fallback).
- `src/hooks/useMenu.js` — signs in anonymously, loads/creates the owner's menu,
  saves changes to the cloud (debounced), mirrors to localStorage.
- `src/pages/Menu.jsx` — fetches a menu by id so any diner can view it.

## Notes & next steps
- Images are base64 in the row for now (fine for a demo); **Supabase Storage** is
  the clean next step.
- Editing across devices needs upgrading anonymous → email login (roadmap step 2).
- Never commit `.env` — it's already in `.gitignore`.
