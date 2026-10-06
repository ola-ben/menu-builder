-- ───────────────────────────────────────────────────────────────────────────
-- MenuLink — Customer Reviews Schema
-- Run in Supabase SQL Editor to enable customer reviews for restaurant menus.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.menu_reviews (
  id           uuid primary key default gen_random_uuid(),
  menu_id      text not null references public.menus (id) on delete cascade,
  item_id      text,                               -- optional: link review to specific dish
  author_name  text not null default 'Verified Diner',
  rating       smallint not null check (rating between 1 and 5),
  comment      text not null default '',
  verified     boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Index for fast queries by menu_id
create index if not exists menu_reviews_menu_id_idx on public.menu_reviews (menu_id);
create index if not exists menu_reviews_created_at_idx on public.menu_reviews (created_at desc);

-- Row-Level Security
alter table public.menu_reviews enable row level security;

-- Anyone can view reviews for a menu
drop policy if exists "Public read reviews" on public.menu_reviews;
create policy "Public read reviews" on public.menu_reviews
  for select using (true);

-- Any customer / diner can submit a review
drop policy if exists "Public insert reviews" on public.menu_reviews;
create policy "Public insert reviews" on public.menu_reviews
  for insert with check (true);

-- Restaurant owners can moderate / delete reviews on their own menu
drop policy if exists "Owner manage reviews" on public.menu_reviews;
create policy "Owner manage reviews" on public.menu_reviews
  for delete using (
    exists (
      select 1 from public.menus
      where menus.id = menu_reviews.menu_id
      and menus.owner_id = auth.uid()
    )
  );
