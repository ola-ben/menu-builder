-- ───────────────────────────────────────────────────────────────────────────
-- MenuLink — Supabase schema
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Anonymous sign-ins must be ON: Authentication → Providers → Anonymous → Enable.
-- (If you reuse the same project as StoreLink, anonymous auth is already on and
--  this `menus` table sits happily next to the `stores` table.)
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.menus (
  id              text primary key,                 -- the id used in /menu/:id links
  owner_id        uuid not null default auth.uid()  -- the anonymous user who owns it
                    references auth.users (id) on delete cascade,
  name            text  not null default '',
  tagline         text  not null default '',
  whatsapp_number text  not null default '',
  logo_url        text  not null default '',         -- base64 data URL (Phase 1)
  categories      jsonb not null default '[]'::jsonb, -- [{ id, name }]
  items           jsonb not null default '[]'::jsonb, -- [{ id, categoryId, name, priceNaira, description, imageUrl, available, tag }]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- One menu per owner for now (drop this if you later support multiple branches).
create unique index if not exists menus_owner_id_key on public.menus (owner_id);

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.menus enable row level security;

-- Anyone (even logged-out diners at a table) can VIEW a menu — this is what makes
-- the table QR codes work for everyone.
drop policy if exists "Public read" on public.menus;
create policy "Public read" on public.menus
  for select using (true);

-- Only the owner can create their menu.
drop policy if exists "Owner insert" on public.menus;
create policy "Owner insert" on public.menus
  for insert with check (auth.uid() = owner_id);

-- Only the owner can edit their menu.
drop policy if exists "Owner update" on public.menus;
create policy "Owner update" on public.menus
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Only the owner can delete their menu.
drop policy if exists "Owner delete" on public.menus;
create policy "Owner delete" on public.menus
  for delete using (auth.uid() = owner_id);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists menus_touch_updated_at on public.menus;
create trigger menus_touch_updated_at
  before update on public.menus
  for each row execute function public.touch_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- Orders — logged when a diner taps "Order" on a menu.
-- (Named menu_orders so it doesn't clash with StoreLink's `orders` table in the
--  same Supabase project.)
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.menu_orders (
  id            text primary key,
  menu_id       text not null references public.menus (id) on delete cascade,
  items         jsonb not null default '[]'::jsonb, -- [{ name, qty, priceNaira }]
  total         numeric not null default 0,
  customer_note text  not null default '',
  status        text  not null default 'pending',  -- 'pending' | 'fulfilled'
  created_at    timestamptz not null default now()
);
create index if not exists menu_orders_menu_id_idx on public.menu_orders (menu_id, created_at desc);

alter table public.menu_orders enable row level security;

drop policy if exists "Anyone can place a menu order" on public.menu_orders;
create policy "Anyone can place a menu order" on public.menu_orders
  for insert with check (exists (select 1 from public.menus m where m.id = menu_id));

drop policy if exists "Owner reads menu orders" on public.menu_orders;
create policy "Owner reads menu orders" on public.menu_orders
  for select using (exists (select 1 from public.menus m where m.id = menu_orders.menu_id and m.owner_id = auth.uid()));

drop policy if exists "Owner updates menu orders" on public.menu_orders;
create policy "Owner updates menu orders" on public.menu_orders
  for update using (exists (select 1 from public.menus m where m.id = menu_orders.menu_id and m.owner_id = auth.uid()));

drop policy if exists "Owner deletes menu orders" on public.menu_orders;
create policy "Owner deletes menu orders" on public.menu_orders
  for delete using (exists (select 1 from public.menus m where m.id = menu_orders.menu_id and m.owner_id = auth.uid()));

-- ───────────────────────────────────────────────────────────────────────────
-- Billing — free 14-day trial, then "pay to stay live". Publicly READABLE but
-- writable only by the server (no write policies) — diners/owners can't edit it.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.menu_billing (
  menu_id       text primary key references public.menus (id) on delete cascade,
  active        boolean     not null default false,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.menu_billing enable row level security;

drop policy if exists "Public read menu billing" on public.menu_billing;
create policy "Public read menu billing" on public.menu_billing
  for select using (true);

create or replace function public.create_menu_billing()
returns trigger language plpgsql security definer as $$
begin
  insert into public.menu_billing (menu_id) values (new.id) on conflict (menu_id) do nothing;
  return new;
end $$;

drop trigger if exists menus_create_billing on public.menus;
create trigger menus_create_billing
  after insert on public.menus
  for each row execute function public.create_menu_billing();

-- Backfill billing rows for menus that already exist.
insert into public.menu_billing (menu_id)
select id from public.menus on conflict (menu_id) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- Storage — menu-item & logo images (Storage instead of base64-in-the-DB).
-- Shared with StoreLink: both apps live in the same Supabase project and use the
-- same public "images" bucket. These statements are idempotent, so running this
-- (or StoreLink's) schema yields the same bucket + policies. Old base64 data URLs
-- keep working (they're just strings).
-- ───────────────────────────────────────────────────────────────────────────

-- A public bucket: anyone can read images via their URL (menus are public),
-- uploads are gated by the RLS policies below.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Anyone can READ image objects (public menus show them to logged-out diners).
drop policy if exists "Public read images" on storage.objects;
create policy "Public read images" on storage.objects
  for select using (bucket_id = 'images');

-- Signed-in users (incl. anonymous-auth) can UPLOAD, but only inside their own
-- "{uid}/..." folder — so one owner can't overwrite another's images.
drop policy if exists "Owner uploads images" on storage.objects;
create policy "Owner uploads images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Owners can UPDATE / DELETE only their own image objects.
drop policy if exists "Owner updates images" on storage.objects;
create policy "Owner updates images" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owner deletes images" on storage.objects;
create policy "Owner deletes images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
