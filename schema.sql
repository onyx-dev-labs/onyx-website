-- NyxUs Dev Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category text not null, -- 'Web', 'Data', 'Security', etc.
  tech_stack text[] default '{}',
  image_url text,
  live_link text,
  github_link text,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Members Table
create table if not exists team_members (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  bio text,
  avatar_url text,
  social_links jsonb default '{}',
  display_order int default 0,
  parent_id uuid references team_members(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Chat Table (for Admin Dashboard)
create table if not exists team_chat (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users(id), -- Optional link to auth user if applicable
  sender_name text not null,
  sender_role text default 'Agent',
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Site Configuration Table (CMS)
create table if not exists site_config (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique, -- e.g. 'home_hero_title', 'site_colors'
  value jsonb not null,
  section text not null, -- 'home', 'seo', 'theme'
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Row Level Security (RLS) Policies

-- Projects: Public read, Admin write
alter table projects enable row level security;

create policy "Projects are viewable by everyone"
  on projects for select
  using (true);

create policy "Projects are insertable by authenticated users only"
  on projects for insert
  with check (auth.role() = 'authenticated');

create policy "Projects are updatable by authenticated users only"
  on projects for update
  using (auth.role() = 'authenticated');

create policy "Projects are deletable by authenticated users only"
  on projects for delete
  using (auth.role() = 'authenticated');

-- Team Members: Public read, Admin write
alter table team_members enable row level security;

create policy "Team members are viewable by everyone"
  on team_members for select
  using (true);

create policy "Team members are insertable by authenticated users only"
  on team_members for insert
  with check (auth.role() = 'authenticated');

create policy "Team members are updatable by authenticated users only"
  on team_members for update
  using (auth.role() = 'authenticated');

create policy "Team members are deletable by authenticated users only"
  on team_members for delete
  using (auth.role() = 'authenticated');

-- Team Chat: Authenticated read/write only (Private)
alter table team_chat enable row level security;

create policy "Chat is viewable by authenticated users only"
  on team_chat for select
  using (auth.role() = 'authenticated');

create policy "Chat is insertable by authenticated users only"
  on team_chat for insert
  with check (auth.role() = 'authenticated');

-- Site Config: Public read, Admin write
alter table site_config enable row level security;

create policy "Site config is viewable by everyone"
  on site_config for select
  using (true);

create policy "Site config is insertable by authenticated users only"
  on site_config for insert
  with check (auth.role() = 'authenticated');

create policy "Site config is updatable by authenticated users only"
  on site_config for update
  using (auth.role() = 'authenticated');

create policy "Site config is deletable by authenticated users only"
  on site_config for delete
  using (auth.role() = 'authenticated');


-- Realtime
-- Enable realtime for team_chat to support the operational hub
alter publication supabase_realtime add table team_chat;
