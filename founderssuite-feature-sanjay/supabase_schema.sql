-- Run this in your Supabase SQL editor

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  room_name text unique not null,
  title text,
  created_at timestamptz default now()
);

create table if not exists transcripts (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  speaker text not null,
  text text not null,
  timestamp_ms bigint,
  created_at timestamptz default now()
);

create index if not exists transcripts_meeting_id_idx on transcripts(meeting_id);
create index if not exists transcripts_timestamp_idx on transcripts(timestamp_ms);

create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade unique,
  report jsonb not null,
  created_at timestamptz default now()
);

create table if not exists meeting_contexts (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade unique,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists memory_chunks (
  id text primary key,
  workspace_id text not null default 'default',
  meeting_id uuid references meetings(id) on delete cascade,
  source text not null,
  speaker text,
  text text not null,
  topic text,
  entity_ids jsonb not null default '[]'::jsonb,
  timestamp_ms bigint,
  confidence numeric default 0,
  created_at timestamptz default now()
);

create table if not exists entities (
  id text primary key,
  workspace_id text not null default 'default',
  type text not null,
  name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists relationships (
  id text primary key,
  workspace_id text not null default 'default',
  source text not null references entities(id) on delete cascade,
  target text not null references entities(id) on delete cascade,
  type text not null,
  meeting_id uuid references meetings(id) on delete set null,
  confidence numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists browser_sessions (
  id text primary key,
  workspace_id text not null default 'default',
  target_url text,
  task text,
  status text not null,
  current_url text,
  requires_approval boolean default false,
  action_log jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists memory_chunks_workspace_idx on memory_chunks(workspace_id);
create index if not exists entities_workspace_idx on entities(workspace_id);
create index if not exists relationships_workspace_idx on relationships(workspace_id);

-- Enable Row Level Security (set up policies per your auth model)
alter table meetings enable row level security;
alter table transcripts enable row level security;
alter table summaries enable row level security;
alter table meeting_contexts enable row level security;
alter table memory_chunks enable row level security;
alter table entities enable row level security;
alter table relationships enable row level security;
alter table browser_sessions enable row level security;

-- Allow service role full access (used by the API server)
create policy "service_role_all" on meetings for all using (true);
create policy "service_role_all" on transcripts for all using (true);
create policy "service_role_all" on summaries for all using (true);
create policy "service_role_all" on meeting_contexts for all using (true);
create policy "service_role_all" on memory_chunks for all using (true);
create policy "service_role_all" on entities for all using (true);
create policy "service_role_all" on relationships for all using (true);
create policy "service_role_all" on browser_sessions for all using (true);
