-- Sanjay's auth account already exists in auth.users
-- Insert the public profile row so loadProfile() finds it
insert into users (id, email, name, role) values
  ('83cce30f-58be-40ec-99e1-8a37787b6c26', 'itsmesmarathe@gmail.com', 'Sanjay Marathe', 'founder')
on conflict (id) do update set role = 'founder', name = 'Sanjay Marathe';

insert into founder_profiles (id, company_name, company_description, industry_tags) values
  ('83cce30f-58be-40ec-99e1-8a37787b6c26', 'FounderSuite', 'AI-powered customer discovery platform', ARRAY['SaaS', 'AI'])
on conflict (id) do nothing;

-- Also seed matches for Sanjay's account (same testers, linked to demo form)
-- so the dashboard shows tester cards immediately on login
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
on conflict (id) do nothing;

insert into matches (id, tester_id, form_id, score, status) values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000102', 0.94, 'pending'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000102', 0.87, 'pending'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000102', 0.91, 'pending'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000102', 0.76, 'pending'),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000102', 0.89, 'pending')
on conflict (id) do nothing;
