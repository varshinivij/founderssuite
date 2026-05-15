import type { BiasEvent, LiveIntelligenceState, QuoteEvent, Segment } from './api';

type BiasType = BiasEvent['bias_type'];

const BIAS_PATTERNS: Array<{
  type: BiasType;
  severity: BiasEvent['severity'];
  patterns: RegExp[];
  reason: string;
}> = [
  {
    type: 'leading',
    severity: 'high',
    patterns: [/\b(don't you think|wouldn't you agree|isn't it true|obviously|clearly)\b/i, /\b(how much better|how useful|how valuable)\b/i],
    reason: 'The question implies the preferred answer.',
  },
  {
    type: 'assumption',
    severity: 'medium',
    patterns: [/\bwhen you (use|switch|buy|adopt|start using)\b/i, /\bonce you (use|switch|buy|adopt)\b/i],
    reason: 'The question assumes adoption or agreement before it has been earned.',
  },
  {
    type: 'double_barreled',
    severity: 'medium',
    patterns: [/\?.+\?/i, /\b(and|or)\b.+\b(and|or)\b.+\?/i],
    reason: 'The question asks about multiple ideas at once.',
  },
  {
    type: 'anchoring',
    severity: 'high',
    patterns: [/\$\s?\d+|\b\d+\s?(dollars|bucks|per month|\/mo|%)\b/i, /\b(cheap|expensive|reasonable price|only costs)\b/i],
    reason: 'The question introduces a number or price frame that can anchor the answer.',
  },
  {
    type: 'confirmation',
    severity: 'high',
    patterns: [/\b(does that confirm|so you would|so this solves|you'd buy|you would pay)\b/i, /\b(right\?|correct\?|is that fair\?)/i],
    reason: 'The question is testing the founder’s belief more than discovering the user’s reality.',
  },
  {
    type: 'social_desirability',
    severity: 'medium',
    patterns: [/\b(good|responsible|smart|successful) (team|person|user|founder)\b/i, /\b(most people|everyone|best teams) (would|do|care)\b/i],
    reason: 'The framing can pressure the respondent toward a socially acceptable answer.',
  },
  {
    type: 'sycophantic',
    severity: 'low',
    patterns: [/\b(that's great|exactly|perfect|love that).+\?/i],
    reason: 'The follow-up validates the answer before probing it.',
  },
  {
    type: 'false_dichotomy',
    severity: 'medium',
    patterns: [/\b(would you rather|which is better|is it more).+\bor\b/i, /\b(either .+ or|only two options)\b/i],
    reason: 'The question narrows the answer to a forced choice.',
  },
];

const STOPWORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'because',
  'before',
  'being',
  'could',
  'their',
  'there',
  'these',
  'thing',
  'think',
  'those',
  'through',
  'using',
  'would',
  'what',
  'when',
  'where',
  'which',
  'while',
  'your',
  'youre',
  'they',
  'them',
  'that',
  'this',
  'with',
  'have',
  'from',
  'just',
  'like',
  'really',
  'into',
  'were',
  'been',
]);

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function isQuestion(text: string) {
  const lowered = text.trim().toLowerCase();
  return (
    text.includes('?') ||
    /^(what|why|how|when|where|who|which|do|does|did|can|could|would|will|is|are)\b/.test(lowered)
  );
}

function wordCount(text: string) {
  return text.match(/\w+/g)?.length ?? 0;
}

export function detectLocalBias(segments: Segment[]): BiasEvent[] {
  return segments
    .filter(segment => isQuestion(segment.text))
    .flatMap(segment => {
      const match = BIAS_PATTERNS.find(config => config.patterns.some(pattern => pattern.test(segment.text)));
      if (!match) return [];
      return [
        {
          severity: match.severity,
          bias_type: match.type,
          flagged_text: segment.text,
          context_reason: match.reason,
          alternative_phrasings: [
            'Can you walk me through the last time this happened?',
            'What did you do in that situation?',
            'What made that approach work or not work?',
          ],
          confidence: match.severity === 'high' ? 0.84 : 0.72,
          source: 'local' as const,
        },
      ];
    });
}

export function mergeBiasEvents(...groups: BiasEvent[][]) {
  const severityRank = { high: 0, medium: 1, low: 2 };
  const seen = new Set<string>();
  return groups
    .flat()
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.confidence - a.confidence)
    .filter(event => {
      const key = `${event.bias_type}:${event.flagged_text.toLowerCase().slice(0, 80)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

export function computeTalkTime(segments: Segment[]) {
  const totals = segments.reduce(
    (acc, segment) => {
      const speaker = segment.speaker.toLowerCase() === 'user' ? 'user' : segment.speaker.toLowerCase() === 'agent' ? 'agent' : 'founder';
      if (speaker !== 'agent') acc[speaker] += wordCount(segment.text);
      return acc;
    },
    { founder: 0, user: 0 },
  );
  const total = Math.max(1, totals.founder + totals.user);
  const founder_ratio = Number((totals.founder / total).toFixed(2));
  const user_ratio = Number((totals.user / total).toFixed(2));
  return {
    founder_ratio,
    user_ratio,
    alert: founder_ratio > 0.6 && total > 40 ? 'Founder is dominating recent talk time.' : null,
  };
}

export function computeQualityScore(segments: Segment[], biasEvents: BiasEvent[]) {
  const questions = segments.filter(segment => isQuestion(segment.text)).map(segment => segment.text);
  if (!questions.length) return 50;
  const openEnded = questions.filter(q => /^(what|how|why|walk me through|tell me about)\b/i.test(q.trim())).length;
  const followUp = questions.filter(q => /\b(last time|example|specifically|what happened|why)\b/i.test(q)).length;
  return Math.round(clamp(45 + (openEnded / questions.length) * 30 + (followUp / questions.length) * 20 - biasEvents.length * 6));
}

export function computeBiasPressure(events: BiasEvent[]) {
  const base = events.reduce((sum, event) => sum + (event.severity === 'high' ? 25 : event.severity === 'medium' ? 15 : 8), 0);
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.bias_type] = (acc[event.bias_type] ?? 0) + 1;
    return acc;
  }, {});
  const repeated = Object.values(counts).some(count => count >= 3) ? 15 : 0;
  return clamp(base + repeated);
}

export function detectTopicDrift(segments: Segment[]) {
  const words = segments
    .slice(-8)
    .flatMap(segment => segment.text.toLowerCase().match(/[a-z]{4,}/g) ?? [])
    .filter(word => !STOPWORDS.has(word));
  if (!words.length) return { drifting: false, current_topic: null, redirect_question: null };
  const counts = words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
  const current_topic = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const early = new Set(
    segments
      .slice(0, 5)
      .flatMap(segment => segment.text.toLowerCase().match(/[a-z]{4,}/g) ?? [])
      .filter(word => !STOPWORDS.has(word)),
  );
  const recent = new Set(words.slice(-30));
  const overlap = [...recent].filter(word => early.has(word)).length;
  const drifting = segments.length >= 8 && overlap <= 1 && recent.size >= 8;
  return {
    drifting,
    current_topic,
    redirect_question: drifting && current_topic ? `Can we connect this back to the original workflow around ${current_topic}?` : null,
  };
}

export function extractLocalQuotes(segments: Segment[]): QuoteEvent[] {
  const matchers: Array<[QuoteEvent['signal_type'], RegExp]> = [
    ['pain', /\b(pain|frustrat|hard|annoying|waste|struggle|blocked|problem)\b/i],
    ['workaround', /\b(workaround|spreadsheet|manual|hack|we just|currently use)\b/i],
    ['willingness_to_pay', /\b(pay|budget|cost|price|worth|purchase)\b/i],
    ['objection', /\b(concern|worried|but|however|not sure|risk)\b/i],
    ['validation', /\b(definitely|absolutely|need|valuable|would use)\b/i],
  ];
  return segments
    .slice(-12)
    .flatMap(segment => {
      if (wordCount(segment.text) < 5) return [];
      const matcher = matchers.find(([, pattern]) => pattern.test(segment.text));
      if (!matcher) return [];
      return [{ text: segment.text.slice(0, 240), speaker: segment.speaker, signal_type: matcher[0], confidence: 0.64 }];
    })
    .slice(0, 4);
}

export function createLocalIntelligence(segments: Segment[]): LiveIntelligenceState {
  const bias_events = detectLocalBias(segments);
  const recentText = segments.slice(-5).map(segment => segment.text.toLowerCase()).join(' ');
  const phase = recentText.match(/\b(price|cost|budget|pay|pricing)\b/)
    ? 'pricing'
    : recentText.match(/\b(solution|feature|prototype|product)\b/)
      ? 'solution_validation'
      : recentText.match(/\b(problem|pain|hard|frustrating|workflow|workaround)\b/)
        ? 'problem_exploration'
        : recentText.match(/\b(wrap|next steps|anything else|thank)\b/)
          ? 'closing'
          : 'rapport';
  return {
    intent: {
      phase,
      confidence: segments.length ? 0.42 : 0.2,
      intent_signal: segments.length ? 'Local transcript signals are updating live.' : 'Waiting for transcript signals.',
      recommended_questions: ['Can you walk me through the last time that happened?', 'What made that moment difficult?'],
      momentum: phase === 'closing' ? 'closing' : segments.length > 3 ? 'deepening' : 'opening',
    },
    bias_events,
    bias_pressure_score: computeBiasPressure(bias_events),
    quality_score: computeQualityScore(segments, bias_events),
    talk_time: computeTalkTime(segments),
    topic_drift: detectTopicDrift(segments),
    quotes: extractLocalQuotes(segments),
    analyzed_segment_count: segments.length,
    generated_at: new Date().toISOString(),
    degraded: [],
  };
}
