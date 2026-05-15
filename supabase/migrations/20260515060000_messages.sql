create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists messages_match_idx on messages(match_id);
create index if not exists messages_created_idx on messages(match_id, created_at);

alter table messages enable row level security;
create policy "service_all" on messages for all using (true) with check (true);

alter publication supabase_realtime add table messages;
