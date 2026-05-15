/**
 * Run: node seed.mjs
 * Seeds the Supabase DB with 1 founder, 5 testers, 2 forms, and 6 matches.
 * Requires @supabase/supabase-js installed: npm install @supabase/supabase-js
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bcgepilqwidlumkhkpea.supabase.co';
// Use service role key to bypass RLS for seeding
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_KEY env var before running.');
  console.error('  SUPABASE_SERVICE_KEY=eyJ... node seed.mjs');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function upsert(table, rows) {
  const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table} (${rows.length} rows)`);
}

async function seed() {
  // Users
  await upsert('users', [
    { id: '00000000-0000-0000-0000-000000000001', email: 'brady@example.com', name: 'Brady', role: 'founder' },
    { id: '00000000-0000-0000-0000-000000000011', email: 'maya@example.com',  name: 'Maya R.',  role: 'tester' },
    { id: '00000000-0000-0000-0000-000000000012', email: 'devon@example.com', name: 'Devon K.', role: 'tester' },
    { id: '00000000-0000-0000-0000-000000000013', email: 'aisha@example.com', name: 'Aisha T.', role: 'tester' },
    { id: '00000000-0000-0000-0000-000000000014', email: 'kenji@example.com', name: 'Kenji S.', role: 'tester' },
    { id: '00000000-0000-0000-0000-000000000015', email: 'sofia@example.com', name: 'Sofia L.', role: 'tester' },
  ]);

  // Founder profile
  await upsert('founder_profiles', [{
    id: '00000000-0000-0000-0000-000000000001',
    company_name: 'FoundersSuite',
    company_description: 'A two-sided marketplace connecting founders with domain-matched testers.',
    industry_tags: ['SaaS', 'B2B', 'Market Research'],
    team_size: 4,
    looking_for: 'Experienced operators who can give direct, actionable feedback.',
    time_commitment: '30 min interview or 5 min survey',
    feedback_style: 'Blunt, specific, and outcome-oriented',
  }]);

  // Tester profiles
  await upsert('tester_profiles', [
    { id: '00000000-0000-0000-0000-000000000011', domain: 'MedTech', lived_experience: 'Former clinical ops lead; led device trials and IRB workflows.', skills: ['Clinical Ops','Regulatory','User Research'], hourly_rate: 85, availability: 'Weeknights (after 6pm PT)', timezone: 'PT', testing_types: ['interview','survey'], platform_preferences: ['web'], industry_interests: ['MedTech','Health'], quality_score: 4.9, projects_tested: 11, total_testing_hours: 168, bio: 'I help teams validate workflows under real clinical constraints.', previous_company: 'AudioNova', is_top_voice: true, tags: ['Clinical Ops','Regulatory','User Research'], pravatar_img_id: 27, pronouns: 'She/Her', professional_headline: 'Clinical ops · HIPAA-aware · EHR-adjacent workflows', methodology: 'Scenario-based walkthroughs with think-aloud, then tighten into repro steps.' },
    { id: '00000000-0000-0000-0000-000000000012', domain: 'SaaS', lived_experience: 'Built RevOps systems for 3 B2B SaaS startups.', skills: ['Sales Ops','GTM','Pricing'], hourly_rate: 75, availability: 'Weekends', timezone: 'ET', testing_types: ['interview','beta test'], platform_preferences: ['web'], industry_interests: ['SaaS','FinTech'], quality_score: 4.7, projects_tested: 28, total_testing_hours: 214, bio: 'I focus on clarity, packaging, and sales motion fit.', previous_company: 'BrightApps', is_top_voice: false, tags: ['Sales Ops','GTM','Pricing'], pravatar_img_id: 12, pronouns: 'They/Them', professional_headline: 'RevOps · CPQ & CRM hygiene · PLG + sales-led', methodology: 'I stress-test positioning against how reps explain the product on calls.' },
    { id: '00000000-0000-0000-0000-000000000013', domain: 'EdTech', lived_experience: 'Former teacher; implemented district-wide LMS.', skills: ['Curriculum','Procurement','UX Feedback'], hourly_rate: 60, availability: 'Weeknights', timezone: 'CT', testing_types: ['interview','survey'], platform_preferences: ['web','mobile'], industry_interests: ['EdTech'], quality_score: 4.8, projects_tested: 15, total_testing_hours: 96, bio: 'I love stress-testing flows against real classroom realities.', is_top_voice: true, tags: ['Curriculum','Procurement','UX Feedback'], pravatar_img_id: 32, pronouns: 'She/Her', professional_headline: 'District LMS rollouts · procurement realities', methodology: 'Sessions mirror school-day interruptions.' },
    { id: '00000000-0000-0000-0000-000000000014', domain: 'FinTech', lived_experience: 'Payments PM; shipped fraud + risk tooling.', skills: ['Payments','Risk','Compliance'], hourly_rate: 110, availability: 'Weekdays', timezone: 'PT', testing_types: ['interview'], platform_preferences: ['web'], industry_interests: ['FinTech','SaaS'], quality_score: 4.6, projects_tested: 22, total_testing_hours: 188, bio: 'I call out hidden compliance + risk gotchas early.', is_top_voice: false, tags: ['Payments','Risk','Compliance'], pravatar_img_id: 45, pronouns: 'He/Him', professional_headline: 'Payments · fraud signals · ledger edge cases', methodology: 'API-level checks combined with user journeys.' },
    { id: '00000000-0000-0000-0000-000000000015', domain: 'VehicleTech', lived_experience: 'Worked in fleet maintenance; hardware deployments at scale.', skills: ['Field Ops','Hardware','Installation'], hourly_rate: 70, availability: 'Weekends', timezone: 'MT', testing_types: ['beta test','survey'], platform_preferences: ['hardware','mobile'], industry_interests: ['VehicleTech'], quality_score: 4.6, projects_tested: 9, total_testing_hours: 74, bio: 'I find edge cases in the real world.', is_top_voice: false, tags: ['Field Ops','Hardware','Installation'], pravatar_img_id: 16, pronouns: 'She/Her', professional_headline: 'Fleet deployments · field reliability', methodology: 'Hardware + app pairing tests with weak network and glove-on interactions.' },
  ]);

  // Validation forms
  await upsert('validation_forms', [
    { id: '00000000-0000-0000-0000-000000000021', founder_id: '00000000-0000-0000-0000-000000000001', title: 'Clinical Ops Workflow Validation', description: 'Testing our onboarding flow with clinical operations leads.', questions: [{id:'q1',question:'How do you currently handle IRB submissions?',type:'text',required:true},{id:'q2',question:'What is your biggest pain in device trial workflows?',type:'text',required:true}], target_profile: 'Clinical operations professionals in MedTech', status: 'open', stage: 'Beta' },
    { id: '00000000-0000-0000-0000-000000000022', founder_id: '00000000-0000-0000-0000-000000000001', title: 'RevOps SaaS Beta', description: 'Structured feedback sessions for our sales ops dashboard.', questions: [{id:'q1',question:'Walk me through your current RevOps stack.',type:'text',required:true},{id:'q2',question:'What does a broken sales motion look like for you?',type:'text',required:true}], target_profile: 'B2B SaaS operators and RevOps leads', status: 'open', stage: 'Pre-seed' },
  ]);

  // Matches
  await upsert('matches', [
    { id: '00000000-0000-0000-0000-000000000031', tester_id: '00000000-0000-0000-0000-000000000011', form_id: '00000000-0000-0000-0000-000000000021', score: 0.94, status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000032', tester_id: '00000000-0000-0000-0000-000000000012', form_id: '00000000-0000-0000-0000-000000000022', score: 0.87, status: 'accepted' },
    { id: '00000000-0000-0000-0000-000000000033', tester_id: '00000000-0000-0000-0000-000000000013', form_id: '00000000-0000-0000-0000-000000000022', score: 0.76, status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000034', tester_id: '00000000-0000-0000-0000-000000000014', form_id: '00000000-0000-0000-0000-000000000021', score: 0.91, status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000035', tester_id: '00000000-0000-0000-0000-000000000015', form_id: '00000000-0000-0000-0000-000000000021', score: 0.82, status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000036', tester_id: '00000000-0000-0000-0000-000000000011', form_id: '00000000-0000-0000-0000-000000000022', score: 0.68, status: 'accepted' },
  ]);

  console.log('\n✅ Seed complete.');
}

seed().catch(e => { console.error(e); process.exit(1); });
