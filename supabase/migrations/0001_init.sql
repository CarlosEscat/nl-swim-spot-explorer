-- NL Swim Spot Explorer — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once the project exists.

-- Core spot table
create table swim_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  province text not null,
  municipality text,
  lat double precision not null,
  lng double precision not null,
  water_type text check (water_type in ('fresh', 'salt')),
  official_status text check (official_status in ('official', 'delisted', 'unofficial')) default 'official',
  is_featured boolean default false, -- true for the curated Amsterdam set
  nearest_rws_station_id text, -- FK-like reference into rws_stations, nullable
  webcam_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Curated facilities + hours (manual for v1)
create table swim_spot_details (
  spot_id uuid primary key references swim_spots(id) on delete cascade,
  has_restrooms boolean,
  has_catering boolean,
  has_lifeguard boolean,
  has_boat_ramp boolean,
  nude_recreation boolean,
  lounging_area boolean,
  access_notes text, -- free text: "open access, no gate" / "staffed 10:00-18:00 May-Sep" etc.
  updated_at timestamptz default now()
);

-- Water quality readings, one row per published measurement
create table water_quality_readings (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references swim_spots(id) on delete cascade,
  measured_at date not null,
  status text check (status in ('good', 'acceptable', 'warning', 'negative_advice', 'banned')),
  source text default 'zwemwater.nl',
  raw_notes text,
  created_at timestamptz default now()
);

-- Small static reference table, seeded once
create table rws_stations (
  id text primary key, -- RWS location code
  name text,
  lat double precision,
  lng double precision
);

-- Dedupe guard: one reading per spot per measurement date per source
create unique index water_quality_readings_spot_date_source
  on water_quality_readings (spot_id, measured_at, source);

create index water_quality_readings_spot_measured
  on water_quality_readings (spot_id, measured_at desc);

create index swim_spots_featured on swim_spots (is_featured) where is_featured;

-- Public read access (site is public; writes go through the service role key only)
alter table swim_spots enable row level security;
alter table swim_spot_details enable row level security;
alter table water_quality_readings enable row level security;
alter table rws_stations enable row level security;

create policy "public read" on swim_spots for select using (true);
create policy "public read" on swim_spot_details for select using (true);
create policy "public read" on water_quality_readings for select using (true);
create policy "public read" on rws_stations for select using (true);
