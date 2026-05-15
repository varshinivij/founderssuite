create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null check (type in ('experience', 'problem', 'story')),
  title text not null,
  description text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  story_id uuid references stories(id) on delete set null,
  name text not null,
  domain text,
  status text not null default 'idle' check (status in ('active', 'idle', 'paused')),
  match_criteria text,
  filled_forms int not null default 0,
  success_rate numeric not null default 0,
  epsilon numeric not null default 0.5,
  policy_steps int not null default 0,
  trained boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists agents_user_idx on agents(user_id);
create index if not exists stories_user_idx on stories(user_id);

alter table stories enable row level security;
alter table agents enable row level security;

drop policy if exists "service_role_all" on stories;
drop policy if exists "service_role_all" on agents;

create policy "service_role_all" on stories for all using (true);
create policy "service_role_all" on agents for all using (true);
