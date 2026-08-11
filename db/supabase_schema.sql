-- AI 여행 플래너 — Supabase (PostgreSQL) DDL
-- 참고용 스키마. RLS 정책은 프로젝트 인증 방식에 맞춰 추가할 것.

create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table trips (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references users(id) on delete cascade,
  destination text not null,
  nights int not null,
  days int not null,
  companion_type text not null check (companion_type in ('solo','couple','friends','family')),
  travel_styles text[] not null default '{}',
  pace text not null check (pace in ('tight','normal','relaxed')),
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft','confirmed','completed')),
  created_at timestamptz not null default now()
);

create table trip_members (
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  primary key (trip_id, user_id)
);

-- 일자 단위 컨테이너
create table itineraries (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  day_index int not null,
  date date,
  weather_summary text,
  weather_alert text,
  break_time_alert text,
  unique (trip_id, day_index)
);

-- 장소(코스 상 각 스탑)
create table places (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid not null references itineraries(id) on delete cascade,
  order_index int not null,
  name text not null,
  category text not null check (category in ('sightseeing','food','shopping','healing','hotspot','transit')),
  start_time time,
  duration_label text,
  travel_mode text,
  travel_time_label text,
  lat numeric(9,6),
  lng numeric(9,6),
  place_provider_id text, -- Google Maps / Mapbox place id
  created_at timestamptz not null default now()
);

-- 인플루언서/블로그 리뷰 요약 팁
create table tips (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid not null references places(id) on delete cascade,
  must_try_menu text,
  waiting_tip text,
  break_time_note text,
  discount_note text,
  source_urls text[] default '{}',
  created_at timestamptz not null default now()
);

-- 항공/숙소/렌터카 예약 후보 및 선택
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  category text not null check (category in ('flight','hotel','car')),
  name text not null,
  description text,
  price numeric(12,0) not null default 0,
  is_selected boolean not null default false,
  metadata jsonb default '{}'
);

-- 예상 예산(카테고리별)
create table budget_estimates (
  trip_id uuid not null references trips(id) on delete cascade,
  category text not null check (category in ('flight','hotel','car','food','admission','local_transit')),
  amount numeric(12,0) not null default 0,
  primary key (trip_id, category)
);

-- 실제 지출 및 정산
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  label text not null,
  category text not null,
  amount numeric(12,0) not null,
  payer_id uuid not null references users(id),
  split_type text not null default 'equal' check (split_type in ('equal','ratio')),
  split_ratios jsonb, -- {user_id: ratio} — split_type = 'ratio'일 때 사용
  created_at timestamptz not null default now()
);

-- 여행 전 준비 체크리스트
create table checklist_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  label text not null,
  checked boolean not null default false,
  sort_order int not null default 0
);

-- 맛집/장소 기록 (사진 + 메모 + 별점) — 나중에 추천/재방문 참고용
create table food_logs (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references users(id),
  place_id uuid references places(id), -- 코스 상 장소와 연결(선택)
  name text not null,
  memo text,
  rating smallint check (rating between 1 and 5),
  photo_url text,
  created_at timestamptz not null default now()
);

-- 사용자별 다음 여행 저축 목표
create table savings_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  target_destination text,
  target_amount numeric(12,0) not null,
  target_months int not null,
  created_at timestamptz not null default now()
);

create index idx_places_itinerary on places(itinerary_id);
create index idx_expenses_trip on expenses(trip_id);
create index idx_bookings_trip on bookings(trip_id);
create index idx_food_logs_trip on food_logs(trip_id);
