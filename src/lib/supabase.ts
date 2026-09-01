import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FoundItem, Hub, User, Verification } from '../types';
import { INITIAL_HUBS, INITIAL_ITEMS } from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistent cache keys for offline-first & dev fallback
const LOCAL_STORAGE_KEY_ITEMS = 'findback_items_store';
const LOCAL_STORAGE_KEY_USER = 'findback_current_user';
const LOCAL_STORAGE_KEY_HUBS = 'findback_hubs_store';
const LOCAL_STORAGE_KEY_VERIFICATIONS = 'findback_verifications_store';

export function getStoredItems(): FoundItem[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading items from localStorage', e);
  }
  return INITIAL_ITEMS;
}

export function saveStoredItems(items: FoundItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.warn('Error writing items to localStorage', e);
  }
}

export function getStoredHubs(): Hub[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_HUBS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading hubs from localStorage', e);
  }
  return INITIAL_HUBS;
}

export function getStoredUser(): User | null {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading user from localStorage', e);
  }
  return null;
}

export function saveStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  } catch (e) {
    console.warn('Error saving user to localStorage', e);
  }
}

export function getStoredVerifications(): Verification[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_VERIFICATIONS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading verifications from localStorage', e);
  }
  return [];
}

export function saveStoredVerifications(verifications: Verification[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_VERIFICATIONS, JSON.stringify(verifications));
  } catch (e) {
    console.warn('Error saving verifications to localStorage', e);
  }
}

/**
 * Upload an item photo to Supabase Storage bucket 'item-photos' or return a local object URL / base64
 */
export async function uploadItemPhoto(file: File): Promise<string> {
  if (supabase && isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('Supabase storage upload failed, falling back to data URL', uploadError);
      } else {
        const { data } = supabase.storage.from('item-photos').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage exception, falling back to data URL', err);
    }
  }

  // Fallback: convert file to local base64/data URL for instant rendering & persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * SQL Migration Script for Supabase setup
 */
export const SUPABASE_SQL_MIGRATION = `
-- ==========================================================
-- FINDBACK DATABASE MIGRATION SCRIPT (PostgreSQL / Supabase)
-- ==========================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Users Table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  role_default text default 'FINDER' check (role_default in ('FINDER', 'OWNER', 'HUB_STAFF', 'ADMIN')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Hubs Table
create table if not exists public.hubs (
  id text primary key,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  hours text not null default '9 PM',
  photo_url text,
  phone text,
  is_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Found Items Table
create table if not exists public.found_items (
  id text primary key default concat('item-', uuid_generate_v4()),
  reporter_id text not null,
  reporter_name text,
  reporter_email text,
  reporter_phone text,
  category text not null check (category in ('Phone', 'Wallet', 'Documents', 'Jewellery', 'Keys', 'Other')),
  item_code text not null unique,
  photo_url text not null,
  lat double precision not null,
  lng double precision not null,
  location_name text default 'Auto-pinned Location',
  hub_id text references public.hubs(id),
  status text not null default 'reported' check (status in ('reported', 'dropped_at_hub', 'listed', 'claimed', 'verified', 'returned')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  dropped_at timestamp with time zone,
  verified_at timestamp with time zone,
  returned_at timestamp with time zone
);

-- 5. Verification Table
create table if not exists public.verification (
  id uuid primary key default uuid_generate_v4(),
  item_id text references public.found_items(id) on delete cascade,
  claimant_id text not null,
  claimant_name text,
  claimant_email text,
  proof_type text not null check (proof_type in ('ID_CARD', 'PURCHASE_RECEIPT', 'IMEI_SERIAL', 'PHOTO_WITH_ITEM', 'SECURITY_QUESTION')),
  id_number_masked text,
  proof_url text,
  review_notes text,
  status text default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Storage Bucket for item-photos
insert into storage.buckets (id, name, public) 
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- 7. Seed verified Hubs
insert into public.hubs (id, name, address, lat, lng, hours, photo_url, phone, is_verified) values
('hub-downtown-01', 'Downtown Civic Hub', '124 Market Street, Suite 200, San Francisco, CA 94105', 37.7908, -122.3995, '9 PM', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', '+1 (415) 555-0192', true),
('hub-southside-02', 'Southside Hub', '850 Mission Bay Blvd, San Francisco, CA 94158', 37.7682, -122.3929, '8 PM', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', '+1 (415) 555-0144', true),
('hub-marina-03', 'Marina Transit Hub', '2150 Lombard Street, San Francisco, CA 94123', 37.7995, -122.4385, '10 PM', 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80', '+1 (415) 555-0178', true),
('hub-chennai-central-04', 'Central Rail & Civic Hub', 'Kannappar Thidal, Periyamet, Chennai, Tamil Nadu 600003', 13.0827, 80.2707, '10 PM', 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', '+91 44 2535 3520', true)
on conflict (id) do nothing;

-- 8. Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.hubs enable row level security;
alter table public.found_items enable row level security;
alter table public.verification enable row level security;

-- Policies for public reading & authenticated updates
create policy "Allow read hubs to everyone" on public.hubs for select using (true);
create policy "Allow read found items to everyone" on public.found_items for select using (true);
create policy "Allow insert found items" on public.found_items for insert with check (true);
create policy "Allow update found items" on public.found_items for update using (true);
`;
