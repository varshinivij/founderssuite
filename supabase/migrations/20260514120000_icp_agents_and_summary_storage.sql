alter table if exists summaries
  add column if not exists status text not null default 'ready',
  add column if not exists model text,
  add column if not exists generated_by text default 'api',
  add column if not exists generated_at timestamptz default now();

create table if not exists icp_agents (
  id text primary key,
  workspace_id text not null default 'default',
  name text not null,
  target_customer text not null,
  market text,
  pains text,
  buying_triggers text,
  objections text,
  voice_id text,
  reinforcement_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists agent_feedback (
  id uuid primary key default gen_random_uuid(),
  agent_id text references icp_agents(id) on delete cascade,
  workspace_id text not null default 'default',
  signal text not null,
  note text not null,
  created_at timestamptz default now()
);

alter table if exists browser_sessions
  add column if not exists agent_id text,
  add column if not exists survey_goal text;

create index if not exists icp_agents_workspace_idx on icp_agents(workspace_id);
create index if not exists agent_feedback_agent_idx on agent_feedback(agent_id);

alter table icp_agents enable row level security;
alter table agent_feedback enable row level security;

drop policy if exists "service_role_all" on icp_agents;
drop policy if exists "service_role_all" on agent_feedback;
create policy "service_role_all" on icp_agents for all using (true);
create policy "service_role_all" on agent_feedback for all using (true);
