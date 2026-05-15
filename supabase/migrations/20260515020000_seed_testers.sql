-- ============================================================
-- Seed: demo founder + 5 testers + 1 form + 8 matches
-- Demo founder UUID matches VITE_DEMO_FOUNDER_ID in .env
-- ============================================================

-- Demo founder user (no Supabase Auth account required — open RLS)
insert into users (id, email, name, role) values
  ('00000000-0000-0000-0000-000000000001', 'demo-founder@foundersuite.ai', 'Demo Founder', 'founder')
on conflict (id) do nothing;

insert into founder_profiles (id, company_name, company_description, industry_tags) values
  ('00000000-0000-0000-0000-000000000001', 'FounderSuite', 'AI-powered customer discovery platform', ARRAY['SaaS', 'AI'])
on conflict (id) do nothing;

-- 5 tester users
insert into users (id, email, name, role) values
  ('00000000-0000-0000-0000-000000000011', 'priya.venkat@tester.ai',   'Priya Venkataraman',  'tester'),
  ('00000000-0000-0000-0000-000000000012', 'james.okafor@tester.ai',   'James Okafor',        'tester'),
  ('00000000-0000-0000-0000-000000000013', 'sara.lindqvist@tester.ai', 'Sara Lindqvist',      'tester'),
  ('00000000-0000-0000-0000-000000000014', 'dev.patel@tester.ai',      'Dev Patel',           'tester'),
  ('00000000-0000-0000-0000-000000000015', 'mei.tanaka@tester.ai',     'Mei Tanaka',          'tester')
on conflict (id) do nothing;

-- Tester profiles
insert into tester_profiles (
  id, domain, lived_experience, skills, availability, timezone,
  testing_types, quality_score, projects_tested, total_testing_hours,
  is_top_voice, pronouns, professional_headline, industry_interests,
  methodology, bio
) values
  (
    '00000000-0000-0000-0000-000000000011',
    'MedTech',
    'Spent 6 years as a clinical ops lead rolling out EHR integrations at three hospital systems. Seen exactly where HL7 handoffs break in practice.',
    ARRAY['EHR Integration', 'Clinical Workflows', 'Regulatory', 'HL7 FHIR'],
    'Weekdays 9am–5pm PST', 'America/Los_Angeles',
    ARRAY['usability', 'expert_interview', 'think_aloud'],
    9.2, 14, 38.5,
    true, 'she/her',
    'Clinical Ops → MedTech validator · 6 yrs EHR rollouts',
    ARRAY['MedTech', 'HealthTech', 'Regulatory'],
    'Think-aloud + structured debrief',
    'I review clinical software from the ops side, not the engineering side — which is where most teams miss problems.'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'FinTech',
    'Former fraud analyst at a top-5 bank. Built manual review pipelines before they were automated. Know every edge case in transaction velocity scoring.',
    ARRAY['Fraud Detection', 'Payment Rails', 'Risk Scoring', 'KYC/AML'],
    'Evenings EST, Sat mornings', 'America/New_York',
    ARRAY['expert_interview', 'survey'],
    8.7, 22, 61.0,
    false, 'he/him',
    'Fraud Analyst turned FinTech advisor · Payments & risk',
    ARRAY['FinTech', 'Banking', 'RegTech'],
    'Jobs-to-be-done interviews',
    'I test payment and risk products from the back-office perspective that most founders never reach.'
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'SaaS',
    'RevOps leader at 3 Series-B SaaS companies. Owned the full CRM stack, territory planning, and quota modeling. Can smell a leaky funnel in five minutes.',
    ARRAY['RevOps', 'CRM', 'Sales Forecasting', 'Territory Design', 'Salesforce'],
    'Flexible — async preferred', 'Europe/Stockholm',
    ARRAY['usability', 'expert_interview', 'competitive_analysis'],
    9.5, 28, 74.0,
    true, 'she/they',
    'RevOps lead · 3× Series B · CRM & quota systems',
    ARRAY['SaaS', 'B2B', 'Sales Tech'],
    'Competitive benchmarking + workflow audit',
    'I look at your product through the lens of a RevOps leader who has to get buy-in from 40 AEs and a skeptical CFO.'
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'EdTech',
    'District curriculum director for 5 years, now advising EdTech startups. Understand the procurement cycle, FERPA constraints, and why pilots stall.',
    ARRAY['K–12 Curriculum', 'LMS', 'FERPA', 'District Procurement', 'Teacher Training'],
    'Weekday mornings CST', 'America/Chicago',
    ARRAY['stakeholder_interview', 'survey', 'expert_interview'],
    8.1, 9, 22.0,
    false, 'he/him',
    'District curriculum director → EdTech advisor',
    ARRAY['EdTech', 'GovTech', 'K-12'],
    'Structured stakeholder mapping',
    'If you''re selling into districts, you need to understand the political layer — I''ve lived it from the inside.'
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'SaaS',
    'UX researcher who has run 200+ moderated user tests across B2B SaaS products. Specialises in onboarding friction and first-week retention signals.',
    ARRAY['UX Research', 'Usability Testing', 'Onboarding', 'Retention Analysis', 'Figma'],
    'Asia business hours + flexible', 'Asia/Tokyo',
    ARRAY['usability', 'think_aloud', 'diary_study'],
    9.0, 17, 49.5,
    true, 'she/her',
    'UX Researcher · 200+ moderated B2B tests · Onboarding specialist',
    ARRAY['SaaS', 'Consumer', 'B2B'],
    'Moderated think-aloud + retrospective interview',
    'I find the onboarding drop-offs that analytics can''t explain — the ones that live in user confusion and unmet expectations.'
  )
on conflict (id) do nothing;

-- Demo validation form
insert into validation_forms (id, founder_id, title, description, target_profile, status, stage) values
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Customer Discovery · AI Workflow Intelligence',
    'We are validating whether operators in regulated industries (MedTech, FinTech, SaaS) feel the pain of post-meeting insight extraction, and whether an AI pipeline that surfaces bias and themes in real time would change how they conduct discovery interviews.',
    'Operators and product leaders who run customer discovery or stakeholder interviews at least 4× per quarter, in industries with compliance or documentation requirements.',
    'open',
    'problem_discovery'
  )
on conflict (id) do nothing;

-- 5 matches (testers × form)
insert into matches (id, tester_id, form_id, score, status) values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', 0.94, 'pending'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000101', 0.87, 'pending'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000101', 0.91, 'pending'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000101', 0.76, 'pending'),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000101', 0.89, 'pending')
on conflict (id) do nothing;
