-- ====================================================================
-- KAVORA — 3-Tier Personal Finance Database Schema & Row Level Security
-- ====================================================================
-- Execute this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- It creates all required tables, triggers, and RLS policies for multi-user isolation.

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to automatically create a profile entry when a user signs up via Google OAuth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. MONTHLY BUDGETS TABLE
create table if not exists public.monthly_budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  monthly_income numeric not null default 5000,
  protected_savings numeric not null default 500,
  start_date date not null default current_date,
  period_days integer not null default 30,
  budget_mode text not null default 'fixed' check (budget_mode in ('fixed', 'smart')),
  is_active boolean not null default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.monthly_budgets enable row level security;

create policy "Users can view own monthly budgets"
  on public.monthly_budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own monthly budgets"
  on public.monthly_budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own monthly budgets"
  on public.monthly_budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own monthly budgets"
  on public.monthly_budgets for delete
  using (auth.uid() = user_id);


-- 3. TIER 1: PROTECTED SAVINGS VAULT TRANSACTIONS
create table if not exists public.vault_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('initial', 'deposit', 'withdrawal', 'adjustment')),
  amount numeric not null,
  source text not null,
  note text,
  date date not null default current_date,
  time text default '12:00',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.vault_transactions enable row level security;

create policy "Users can view own vault transactions"
  on public.vault_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own vault transactions"
  on public.vault_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own vault transactions"
  on public.vault_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own vault transactions"
  on public.vault_transactions for delete
  using (auth.uid() = user_id);


-- 4. TIER 2: EXPENSES TABLE
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  category text not null,
  description text,
  date date not null default current_date,
  time text default '12:00',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);


-- 5. SAVINGS GOALS / WISHLIST TABLE
create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  saved_amount numeric not null default 0,
  icon text default '🎯',
  category text default 'General',
  target_date date,
  completed boolean default false,
  linked_tier text not null default 'flexible' check (linked_tier in ('protected', 'flexible')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.savings_goals enable row level security;

create policy "Users can view own savings goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own savings goals"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own savings goals"
  on public.savings_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own savings goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);


-- 6. USER SETTINGS TABLE (PIN, PRIVACY, NOTIFICATIONS)
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  privacy_mode boolean default false,
  pin_enabled boolean default false,
  pin_code text default '1234',
  notification_settings jsonb default '{"morningBudget": true, "eveningReminder": true, "overspendingWarning": true, "overspendingAlert": true, "savingsAchievement": true, "monthEndSummary": true}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.user_settings enable row level security;

create policy "Users can view own user settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own user settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own user settings"
  on public.user_settings for update
  using (auth.uid() = user_id);
