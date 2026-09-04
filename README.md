# FindBack — Lost & Found Network 🌐🔍

FindBack is a modern, high-integrity Lost & Found web application connecting finders and owners through a secure, verified local hub drop-off and recovery network.

---

## 🚀 Architecture & Tech Stack

- **Framework**: React 19 (TypeScript) + Vite
- **Styling**: Tailwind CSS v4 mapped directly to the Google Stitch design system tokens:
  - **Deep Trust Blue**: `#022448`
  - **Warm Amber-Gold**: `#FDB244` / `#835400`
  - **Reunion Green**: `#00422B` / `#A4F3CA`
  - **Surface & Backgrounds**: `#FAF9FC` (Warm Neutral)
  - **Typography**: *Source Serif 4* (headings & quotes) + *Inter* (labels, buttons, tables)
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth, Storage) + Offline-first fallback local state.
- **QR Code Engine**: `qrcode.react` generating downloadable PNG tags.
- **Map & Geolocation**: Haversine distance engine, tile layer switcher (vector, satellite, terrain), and GPS auto-pinning.

---

## 📱 Implemented Flows & Features

### 1. Authentication & Security Pipeline (Gated Entry)
- **Primary Identity Credential**: Full Name, Mobile Phone Number (standardized E.164), and Password.
- **Supabase Auth Strategy**: Uses Supabase Auth's native email/password engine with a deterministic email derivation formula (`{e164_digits}@phone.findback.network`). This provides instantaneous, cryptographically secure password authentication without incurring third-party SMS gateway per-message costs.
- **Permanent Phone Number Constraint**: Once an account is registered, the phone number serves as a permanent, immutable user identifier bound to the user profile and case ledger.
- **Password Strength Engine**: Real-time evaluation (length, character variety, numeric presence) with a multi-step visual strength meter.
- **Forgot Password Dispatch**: Non-enumerating reset dispatch ensuring accounts cannot be crawled or identified by unauthenticated actors.
- **Route Session Gating**: Unauthenticated users are systematically directed to the Sign-Up / Sign-In screen before reaching Role Selection or creating reports.

### 2. Finder Journey (Fully Operational)
1. **Role Selection (`/`)**: High-contrast cards for "I Found Something" and "I Lost Something", plus active case resume banners.
2. **Report a Found Item**: Camera capture / file gallery picker, category chips (Phone, Wallet, Documents, Jewellery, Keys, Other), interactive map with GPS auto-detection, landmark editor, and optional details.
3. **Drop-Off at Nearest Hub**: Real-time Haversine nearest-hub calculation against verified partner hubs (Velachery, T. Nagar, Adyar, Anna Nagar, Central Rail in Chennai + SF Civic Hubs), walking distance & time calculator, directions trigger, and drop-off confirmation.
4. **Tag Generated**: Unique `FB-XXXX-L` code generator, scannable QR code canvas, download PNG tag, and web share integration.
5. **Item Received & Recovery Timeline**: Multi-stage visual status timeline (`reported` → `dropped_at_hub` → `listed` → `claimed` → `verified` → `returned`) with live sync simulation.

### 2. Verified Hubs in Chennai Operations Grid
- **Velachery Civic Hub**: 100 Feet Bypass Rd (`12.9756, 80.2207`)
- **T. Nagar Commercial Hub**: 74 Usman Road (`13.0418, 80.2341`)
- **Adyar Transit Hub**: 28 Lattice Bridge Rd (`13.0012, 80.2565`)
- **Anna Nagar Central Hub**: 2nd Avenue Roundtana (`13.0850, 80.2101`)
- **Central Rail & Civic Hub**: Kannappar Thidal (`13.0827, 80.2707`)

---

## 🗄️ Supabase PostgreSQL Migration Script

To set up your Supabase project, execute the following SQL script in your Supabase SQL Editor:

```sql
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

-- 7. Seed verified Chennai & Civic Hubs
insert into public.hubs (id, name, address, lat, lng, hours, photo_url, phone, is_verified) values
('hub-chennai-velachery-01', 'Velachery Civic Hub', '100 Feet Bypass Rd, Velachery, Chennai, Tamil Nadu 600042', 12.9756, 80.2207, '10 PM', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', '+91 44 2244 5566', true),
('hub-chennai-tnagar-02', 'T. Nagar Commercial Hub', '74 Usman Road, T. Nagar, Chennai, Tamil Nadu 600017', 13.0418, 80.2341, '10 PM', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', '+91 44 2434 1122', true),
('hub-chennai-adyar-03', 'Adyar Transit Hub', '28 Lattice Bridge Rd, Adyar, Chennai, Tamil Nadu 600020', 13.0012, 80.2565, '9 PM', 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80', '+91 44 2491 3344', true),
('hub-chennai-annanagar-04', 'Anna Nagar Central Hub', '2nd Avenue, Roundtana, Anna Nagar, Chennai, Tamil Nadu 600040', 13.0850, 80.2101, '10 PM', 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', '+91 44 2621 7788', true),
('hub-chennai-central-05', 'Central Rail & Civic Hub', 'Kannappar Thidal, Periyamet, Chennai, Tamil Nadu 600003', 13.0827, 80.2707, '11 PM', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80', '+91 44 2535 3520', true),
('hub-downtown-01', 'Downtown Civic Hub (SF)', '124 Market Street, Suite 200, San Francisco, CA 94105', 37.7908, -122.3995, '9 PM', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80', '+1 (415) 555-0192', true)
on conflict (id) do nothing;

-- 8. Row Level Security Policies
alter table public.users enable row level security;
alter table public.hubs enable row level security;
alter table public.found_items enable row level security;
alter table public.verification enable row level security;

create policy "Allow read hubs to everyone" on public.hubs for select using (true);
create policy "Allow read found items to everyone" on public.found_items for select using (true);
create policy "Allow insert found items" on public.found_items for insert with check (true);
create policy "Allow update found items" on public.found_items for update using (true);
```

---

## 🧪 Testing & Verification

Run the test suite:
```bash
npm run test
```

Run TypeScript linting:
```bash
npm run lint
```

Build production bundle:
```bash
npm run build
```

---

## 🚢 Next Milestones
- **Owner Flow**: Item search directory, claim submission with masked ID verification.
- **Hub Staff Console**: QR scanning check-in, identity document verification queue.
- **Payment & Escrow**: Razorpay UPI finder reward release.
