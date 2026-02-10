-- Chat System Schema (Fixed RLS Recursion)

-- Profiles (Extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  status text default 'offline', -- 'online', 'offline', 'busy'
  last_seen timestamp with time zone default now(),
  about text,
  wallpaper_url text,
  force_password_change boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversations
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('direct', 'group')),
  name text, -- For group chats
  group_image_url text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now())
);

-- Conversation Participants
create table if not exists conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_read_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);

-- Messages
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete set null,
  content text not null,
  type text default 'text', -- 'text', 'image', 'file', 'system'
  file_url text,
  is_edited boolean default false,
  reply_to_id uuid references messages(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Message Status (Read Receipts)
create table if not exists message_status (
  message_id uuid references messages(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text default 'delivered', -- 'delivered', 'read'
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (message_id, user_id)
);

-- SECURITY DEFINER Helper to avoid RLS recursion
create or replace function is_conversation_member(_conversation_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from conversation_participants
    where conversation_id = _conversation_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- RLS Policies

-- Profiles
alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Conversations
alter table conversations enable row level security;

create policy "Conversations are viewable by participants"
  on conversations for select
  using (is_conversation_member(id));

create policy "Authenticated users can create conversations"
  on conversations for insert
  with check (auth.role() = 'authenticated');

-- Participants
alter table conversation_participants enable row level security;

create policy "Participants are viewable by conversation members"
  on conversation_participants for select
  using (is_conversation_member(conversation_id));

create policy "Users can add participants"
  on conversation_participants for insert
  with check (auth.role() = 'authenticated');

-- Messages
alter table messages enable row level security;

create policy "Messages are viewable by conversation participants"
  on messages for select
  using (is_conversation_member(conversation_id));

create policy "Participants can insert messages"
  on messages for insert
  with check (is_conversation_member(conversation_id));

-- Realtime
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table conversation_participants;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table message_status;

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create or replace trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute procedure update_updated_at_column();

create or replace trigger update_conversations_updated_at
    before update on conversations
    for each row
    execute procedure update_updated_at_column();

-- Trigger to update conversation last_message_at
create or replace function update_conversation_last_message()
returns trigger as $$
begin
    update conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
    return new;
end;
$$ language 'plpgsql';

create or replace trigger update_conv_last_message
    after insert on messages
    for each row
    execute procedure update_conversation_last_message();

-- Function to handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
