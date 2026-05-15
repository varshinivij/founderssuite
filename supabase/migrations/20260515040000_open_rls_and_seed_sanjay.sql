-- Open RLS on all tables so authenticated + anon reads work
-- (service_all policy = using(true) allows every role)

do $$ begin
  -- users
  if not exists (
    select 1 from pg_policies where tablename = 'users' and policyname = 'service_all'
  ) then
    create policy "service_all" on users for all using (true) with check (true);
  end if;

  -- founder_profiles
  if not exists (
    select 1 from pg_policies where tablename = 'founder_profiles' and policyname = 'service_all'
  ) then
    create policy "service_all" on founder_profiles for all using (true) with check (true);
  end if;

  -- tester_profiles
  if not exists (
    select 1 from pg_policies where tablename = 'tester_profiles' and policyname = 'service_all'
  ) then
    create policy "service_all" on tester_profiles for all using (true) with check (true);
  end if;

  -- validation_forms
  if not exists (
    select 1 from pg_policies where tablename = 'validation_forms' and policyname = 'service_all'
  ) then
    create policy "service_all" on validation_forms for all using (true) with check (true);
  end if;

  -- matches
  if not exists (
    select 1 from pg_policies where tablename = 'matches' and policyname = 'service_all'
  ) then
    create policy "service_all" on matches for all using (true) with check (true);
  end if;
end $$;

-- Sanjay's public user row (auth account already exists)
insert into users (id, email, name, role) values
  ('83cce30f-58be-40ec-99e1-8a37787b6c26', 'itsmesmarathe@gmail.com', 'Sanjay Marathe', 'founder')
on conflict (id) do update set role = 'founder', name = 'Sanjay Marathe';

insert into founder_profiles (id, company_name, company_description, industry_tags) values
  ('83cce30f-58be-40ec-99e1-8a37787b6c26', 'FounderSuite', 'AI-powered customer discovery platform', ARRAY['SaaS', 'AI'])
on conflict (id) do nothing;

-- Validation form owned by Sanjay
insert into validation_forms (id, founder_id, title, description, target_profile, status, stage) values
  (
    '00000000-0000-0000-0000-000000000102',
    '83cce30f-58be-40ec-99e1-8a37787b6c26',
    'Customer Discovery · AI Workflow Intelligence',
    'Validating whether operators in regulated industries feel the pain of post-meeting insight extraction.',
    'Operators and product leaders who run customer discovery interviews at least 4× per quarter.',
    'open',
    'problem_discovery'
  )
on conflict (id) do update set founder_id = '83cce30f-58be-40ec-99e1-8a37787b6c26';

-- Matches: all 5 seeded testers against Sanjay's form
insert into matches (id, tester_id, form_id, score, status) values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000102', 0.94, 'pending'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', 0.87, 'pending'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000102', 0.91, 'pending'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000102', 0.76, 'pending'),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000102', 0.89, 'pending')
on conflict (id) do nothing;
