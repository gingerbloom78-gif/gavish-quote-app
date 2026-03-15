-- Run this in Supabase Dashboard → SQL Editor
-- Creates all tables needed for the Gavish Quote App

create table if not exists quotes (
  id            uuid        primary key,
  quote_number  text        not null,
  date          text        not null default '',
  client_name   text        not null default '',
  client_phone  text        not null default '',
  client_address text       not null default '',
  subject       text        not null default '',
  intro_text    text        not null default '',
  status        text        not null default 'draft',
  line_items    jsonb       not null default '[]',
  notes         text        not null default '',
  subtotal      numeric     not null default 0,
  vat_amount    numeric     not null default 0,
  total         numeric     not null default 0,
  voice_notes   jsonb       not null default '[]',
  template_id   text,
  created_at    timestamptz not null,
  updated_at    timestamptz not null
);

create table if not exists clients (
  id         uuid        primary key,
  name       text        not null,
  phone      text        not null default '',
  address    text        not null default '',
  created_at timestamptz not null
);

create table if not exists custom_items (
  id          uuid    primary key,
  category_id text    not null,
  title       text    not null,
  bullets     jsonb   not null default '[]',
  base_price  numeric,
  unit        text    not null default 'פריט',
  usage_count integer not null default 0,
  last_used   text,
  is_custom   boolean not null default true
);

create table if not exists templates (
  id          uuid        primary key,
  name        text        not null,
  description text        not null default '',
  category_id text,
  line_items  jsonb       not null default '[]',
  created_at  timestamptz not null
);

create table if not exists item_usage (
  item_id     text    primary key,
  usage_count integer not null default 0
);

-- Enable Row Level Security (open access for now — add auth later)
alter table quotes       enable row level security;
alter table clients      enable row level security;
alter table custom_items enable row level security;
alter table templates    enable row level security;
alter table item_usage   enable row level security;

create policy "allow all" on quotes       for all using (true) with check (true);
create policy "allow all" on clients      for all using (true) with check (true);
create policy "allow all" on custom_items for all using (true) with check (true);
create policy "allow all" on templates    for all using (true) with check (true);
create policy "allow all" on item_usage   for all using (true) with check (true);
