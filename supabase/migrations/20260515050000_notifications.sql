create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null default 'match_invite',
  title text not null,
  body text,
  match_id uuid references matches(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_read_idx on notifications(user_id, read);

alter table notifications enable row level security;
create policy "service_all" on notifications for all using (true) with check (true);

alter publication supabase_realtime add table notifications;
