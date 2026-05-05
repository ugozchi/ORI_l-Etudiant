create table if not exists profiles (
  user_id text primary key,
  name text not null,
  city text not null,
  level text not null,
  interests jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  mobility boolean not null default false,
  target_diploma text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  scores jsonb,
  strengths_data jsonb,
  is_complete boolean default false,
  tests_retake_count integer default 0
);

create table if not exists fair_likes (
  user_id text not null,
  fair_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, fair_id)
);

create table if not exists fair_tickets (
  ticket_id text primary key,
  user_id text not null,
  fair_id text not null,
  fair_name text not null,
  date text not null,
  city text not null,
  address text not null,
  quantity integer not null default 1,
  total_price_eur numeric(10,2) not null,
  status text not null default 'paid',
  created_at timestamptz default now()
);
