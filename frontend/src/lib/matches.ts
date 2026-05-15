import { supabase } from './supabase';

export type MatchStatus = 'pending' | 'accepted' | 'rejected';

export interface TesterMatch {
  id: string;
  matchScore: number;
  status: MatchStatus;
  createdAt: string;
  formTitle: string;
  formId: string;
  testerId: string;
  name: string;
  pronouns: string | null;
  headline: string | null;
  domain: string | null;
  livedExperience: string | null;
  skills: string[];
  qualityScore: number;
  projectsTested: number;
  totalHours: number;
  availability: string | null;
  timezone: string | null;
  testingTypes: string[];
  isTopVoice: boolean;
  pravatarImgId: number | null;
  methodology?: string | null;
  formDescription?: string;
  formTargetProfile?: string;
}

export async function fetchMatches(founderId: string): Promise<TesterMatch[]> {
  // Step 1: get forms for this founder
  const { data: forms, error: formErr } = await supabase
    .from('validation_forms')
    .select('id, title, description, target_profile')
    .eq('founder_id', founderId);

  if (formErr) throw new Error(formErr.message);
  if (!forms?.length) return [];

  const formIds = forms.map(f => f.id as string);
  const formMap = Object.fromEntries(forms.map(f => [f.id as string, f]));

  // Step 2: get matches for those forms
  const { data: matchRows, error: matchErr } = await supabase
    .from('matches')
    .select('id, score, status, created_at, form_id, tester_id')
    .in('form_id', formIds)
    .order('score', { ascending: false });

  if (matchErr) throw new Error(matchErr.message);
  if (!matchRows?.length) return [];

  const testerIds = [...new Set(matchRows.map(m => m.tester_id as string))];

  // Step 3: get tester users + profiles
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, name')
    .in('id', testerIds);
  if (userErr) throw new Error(userErr.message);

  const { data: profiles, error: profErr } = await supabase
    .from('tester_profiles')
    .select('id, domain, lived_experience, skills, availability, timezone, testing_types, quality_score, projects_tested, total_testing_hours, is_top_voice, pravatar_img_id, pronouns, professional_headline, methodology')
    .in('id', testerIds);
  if (profErr) throw new Error(profErr.message);

  const userMap = Object.fromEntries((users ?? []).map(u => [u.id as string, u]));
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id as string, p]));

  return matchRows.map(m => {
    const u = userMap[m.tester_id as string] ?? {};
    const p = profileMap[m.tester_id as string] ?? {};
    const form = formMap[m.form_id as string] ?? {};
    return {
      id: String(m.id),
      matchScore: Math.round(Number(m.score) * 100),
      status: (m.status as MatchStatus) ?? 'pending',
      createdAt: String(m.created_at),
      formId: String(m.form_id),
      formTitle: String((form as Record<string,unknown>).title ?? 'Validation study'),
      formDescription: (form as Record<string,unknown>).description ? String((form as Record<string,unknown>).description) : undefined,
      formTargetProfile: (form as Record<string,unknown>).target_profile ? String((form as Record<string,unknown>).target_profile) : undefined,
      testerId: String(m.tester_id),
      name: String((u as Record<string,unknown>).name ?? 'Tester'),
      pronouns: (p as Record<string,unknown>).pronouns ? String((p as Record<string,unknown>).pronouns) : null,
      headline: (p as Record<string,unknown>).professional_headline ? String((p as Record<string,unknown>).professional_headline) : null,
      domain: (p as Record<string,unknown>).domain ? String((p as Record<string,unknown>).domain) : null,
      livedExperience: (p as Record<string,unknown>).lived_experience ? String((p as Record<string,unknown>).lived_experience) : null,
      skills: ((p as Record<string,unknown>).skills as string[]) ?? [],
      qualityScore: Number((p as Record<string,unknown>).quality_score ?? 0),
      projectsTested: Number((p as Record<string,unknown>).projects_tested ?? 0),
      totalHours: Number((p as Record<string,unknown>).total_testing_hours ?? 0),
      availability: (p as Record<string,unknown>).availability ? String((p as Record<string,unknown>).availability) : null,
      timezone: (p as Record<string,unknown>).timezone ? String((p as Record<string,unknown>).timezone) : null,
      testingTypes: ((p as Record<string,unknown>).testing_types as string[]) ?? [],
      isTopVoice: Boolean((p as Record<string,unknown>).is_top_voice),
      pravatarImgId: (p as Record<string,unknown>).pravatar_img_id ? Number((p as Record<string,unknown>).pravatar_img_id) : null,
      methodology: (p as Record<string,unknown>).methodology ? String((p as Record<string,unknown>).methodology) : null,
    };
  });
}

export async function fetchMatch(matchId: string): Promise<TesterMatch | null> {
  const { data: m, error } = await supabase
    .from('matches')
    .select('id, score, status, created_at, form_id, tester_id')
    .eq('id', matchId)
    .single();
  if (error || !m) return null;

  const [{ data: formRows }, { data: userRows }, { data: profileRows }] = await Promise.all([
    supabase.from('validation_forms').select('id, title, description, target_profile').eq('id', m.form_id).maybeSingle(),
    supabase.from('users').select('id, name').eq('id', m.tester_id).maybeSingle(),
    supabase.from('tester_profiles').select('id, domain, lived_experience, skills, availability, timezone, testing_types, quality_score, projects_tested, total_testing_hours, is_top_voice, pravatar_img_id, pronouns, professional_headline, methodology').eq('id', m.tester_id).maybeSingle(),
  ]);

  const f = (formRows as Record<string,unknown>) ?? {};
  const u = (userRows as Record<string,unknown>) ?? {};
  const p = (profileRows as Record<string,unknown>) ?? {};

  return {
    id: String(m.id),
    matchScore: Math.round(Number(m.score) * 100),
    status: (m.status as MatchStatus) ?? 'pending',
    createdAt: String(m.created_at),
    formId: String(m.form_id),
    formTitle: String(f.title ?? 'Validation study'),
    formDescription: f.description ? String(f.description) : undefined,
    formTargetProfile: f.target_profile ? String(f.target_profile) : undefined,
    testerId: String(m.tester_id),
    name: String(u.name ?? 'Tester'),
    pronouns: p.pronouns ? String(p.pronouns) : null,
    headline: p.professional_headline ? String(p.professional_headline) : null,
    domain: p.domain ? String(p.domain) : null,
    livedExperience: p.lived_experience ? String(p.lived_experience) : null,
    skills: (p.skills as string[]) ?? [],
    qualityScore: Number(p.quality_score ?? 0),
    projectsTested: Number(p.projects_tested ?? 0),
    totalHours: Number(p.total_testing_hours ?? 0),
    availability: p.availability ? String(p.availability) : null,
    timezone: p.timezone ? String(p.timezone) : null,
    testingTypes: (p.testing_types as string[]) ?? [],
    isTopVoice: Boolean(p.is_top_voice),
    pravatarImgId: p.pravatar_img_id ? Number(p.pravatar_img_id) : null,
    methodology: p.methodology ? String(p.methodology) : null,
  };
}

export async function setMatchStatus(matchId: string, status: MatchStatus): Promise<void> {
  const { error } = await supabase.from('matches').update({ status }).eq('id', matchId);
  if (error) throw new Error(error.message);

  if (status === 'accepted') {
    // Look up the tester_id and form title to build the notification
    const { data: match } = await supabase
      .from('matches')
      .select('tester_id, form_id')
      .eq('id', matchId)
      .maybeSingle();
    if (!match) return;

    const { data: form } = await supabase
      .from('validation_forms')
      .select('title')
      .eq('id', match.form_id)
      .maybeSingle();

    const formTitle = (form as Record<string, unknown> | null)?.title
      ? String((form as Record<string, unknown>).title)
      : 'a validation study';

    await supabase.from('notifications').insert({
      user_id: match.tester_id,
      type: 'match_invite',
      title: 'You\'ve been invited!',
      body: `A founder wants you to participate in "${formTitle}". Check your matches to accept or decline.`,
      match_id: matchId,
    });
  }
}

export const updateMatchStatus = setMatchStatus;

export async function fetchTesterMatches(testerId: string): Promise<TesterMatch[]> {
  const { data: matchRows, error: matchErr } = await supabase
    .from('matches')
    .select('id, score, status, created_at, form_id, tester_id')
    .eq('tester_id', testerId)
    .order('score', { ascending: false });

  if (matchErr) throw new Error(matchErr.message);
  if (!matchRows?.length) return [];

  const formIds = [...new Set(matchRows.map(m => m.form_id as string))];
  const [{ data: forms }, { data: userRows }, { data: profileRows }] = await Promise.all([
    supabase.from('validation_forms').select('id, title, description, target_profile').in('id', formIds),
    supabase.from('users').select('id, name').eq('id', testerId).maybeSingle(),
    supabase.from('tester_profiles').select('id, domain, lived_experience, skills, availability, timezone, testing_types, quality_score, projects_tested, total_testing_hours, is_top_voice, pravatar_img_id, pronouns, professional_headline, methodology').eq('id', testerId).maybeSingle(),
  ]);

  const formMap = Object.fromEntries((forms ?? []).map(f => [f.id as string, f]));
  const u = (userRows as Record<string,unknown>) ?? {};
  const p = (profileRows as Record<string,unknown>) ?? {};

  return matchRows.map(m => {
    const form = (formMap[m.form_id as string] as Record<string,unknown>) ?? {};
    return {
      id: String(m.id),
      matchScore: Math.round(Number(m.score) * 100),
      status: (m.status as MatchStatus) ?? 'pending',
      createdAt: String(m.created_at),
      formId: String(m.form_id),
      formTitle: String(form.title ?? 'Validation study'),
      formDescription: form.description ? String(form.description) : undefined,
      formTargetProfile: form.target_profile ? String(form.target_profile) : undefined,
      testerId: String(m.tester_id),
      name: String(u.name ?? 'Tester'),
      pronouns: p.pronouns ? String(p.pronouns) : null,
      headline: p.professional_headline ? String(p.professional_headline) : null,
      domain: p.domain ? String(p.domain) : null,
      livedExperience: p.lived_experience ? String(p.lived_experience) : null,
      skills: (p.skills as string[]) ?? [],
      qualityScore: Number(p.quality_score ?? 0),
      projectsTested: Number(p.projects_tested ?? 0),
      totalHours: Number(p.total_testing_hours ?? 0),
      availability: p.availability ? String(p.availability) : null,
      timezone: p.timezone ? String(p.timezone) : null,
      testingTypes: (p.testing_types as string[]) ?? [],
      isTopVoice: Boolean(p.is_top_voice),
      pravatarImgId: p.pravatar_img_id ? Number(p.pravatar_img_id) : null,
      methodology: p.methodology ? String(p.methodology) : null,
    };
  });
}
