import { useState } from 'react';
import type { SummaryReport } from '../../lib/api';

type StepStatus = 'pending' | 'active' | 'complete' | 'error';

interface Step {
  id: string;
  icon: string;
  title: string;
  subtitle: (report: SummaryReport | null) => string;
  detail: (report: SummaryReport | null) => React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 'transcript',
    icon: '◎',
    title: 'Conversation capture',
    subtitle: r => r ? `${r.findings?.length ?? 0} evidence points found` : 'Waiting for interview content',
    detail: r => (
      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
        {r
          ? `The interview has enough signal for ${r.findings?.length ?? 0} evidence-backed observations.`
          : 'Start or select an interview to review the conversation.'}
      </p>
    ),
  },
  {
    id: 'bias',
    icon: '⊘',
    title: 'Question quality review',
    subtitle: r => r ? `${r.bias_flags?.length ?? 0} flags` : 'Scanning for leading questions',
    detail: r => r?.bias_flags?.length ? (
      <div className="flex flex-col gap-2">
        {r.bias_flags.map((f, i) => (
          <div key={i} style={{ background: 'rgba(255,209,102,0.06)', border: '1px solid rgba(255,209,102,0.15)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--gold)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.issue}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>"{f.question}"</div>
            <div style={{ color: 'var(--purple)', fontSize: 12, marginTop: 6 }}>→ {f.suggestion}</div>
          </div>
        ))}
      </div>
    ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No bias flags detected.</p>,
  },
  {
    id: 'themes',
    icon: '⊞',
    title: 'Themes and evidence',
    subtitle: r => r ? `${r.findings?.length ?? 0} findings · ${r.validations?.length ?? 0} validations` : 'Identifying key themes',
    detail: r => r?.findings?.length ? (
      <ul className="flex flex-col gap-2">
        {r.findings.map((f, i) => (
          <li key={i} className="flex gap-2.5 items-start" style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--gold)', marginTop: 2, flexShrink: 0, fontSize: 10 }}>▸</span>
            {f}
          </li>
        ))}
      </ul>
    ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Analysis in progress...</p>,
  },
  {
    id: 'summary',
    icon: '✦',
    title: 'Recommended actions',
    subtitle: r => r ? 'Ready for review' : 'Preparing next steps',
    detail: r => r?.next_steps?.length ? (
      <ul className="flex flex-col gap-2">
        {r.next_steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 items-start" style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--purple)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
            {s}
          </li>
        ))}
      </ul>
    ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Generating report...</p>,
  },
];

function stepStatus(index: number, report: SummaryReport | null, isGenerating: boolean): StepStatus {
  if (!report && !isGenerating) return 'pending';
  if (isGenerating) return index < 3 ? 'complete' : 'active';
  return 'complete';
}

function StepIcon({ status, icon }: { status: StepStatus; icon: string }) {
  if (status === 'complete') return (
    <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.25)' }}>
      <span style={{ color: 'var(--gold)', fontSize: 12 }}>✓</span>
    </div>
  );
  if (status === 'active') return (
    <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.3)' }}>
      <span className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--gold)', animationDelay: `${i * 0.18}s` }} />
        ))}
      </span>
    </div>
  );
  if (status === 'error') return (
    <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'rgba(255,94,109,0.1)', border: '1px solid rgba(255,94,109,0.3)' }}>
      <span style={{ color: 'var(--red)', fontSize: 14 }}>✗</span>
    </div>
  );
  return (
    <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: 'rgba(107,45,139,0.04)', border: '1px solid var(--border-subtle)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{icon}</span>
    </div>
  );
}

interface Props {
  report: SummaryReport | null;
  isGenerating: boolean;
}

export default function PipelinePanel({ report, isGenerating }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <main
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ padding: '24px 28px', gap: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="fs-label-gold" style={{ marginBottom: 4 }}>Interview Review</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {report ? 'Insights are ready for the team' : isGenerating ? 'Reviewing the interview…' : 'Awaiting interview data'}
          </p>
        </div>
        {(report || isGenerating) && (
          <span className={`fs-badge ${report ? 'fs-badge-gold' : 'fs-badge-purple'}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: report ? 'var(--gold)' : 'var(--purple)' }} />
            {report ? 'Complete' : 'Running'}
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2">
        {STEPS.map((step, i) => {
          const status = stepStatus(i, report, isGenerating);
          const isExpanded = expanded === step.id;
          const isActive = status === 'active';
          const isComplete = status === 'complete';

          return (
            <div
              key={step.id}
              onClick={() => isComplete || isActive ? setExpanded(isExpanded ? null : step.id) : undefined}
              className="rounded-2xl transition-all"
              style={{
                background: isActive
                  ? 'rgba(255,209,102,0.04)'
                  : isComplete
                  ? 'rgba(107,45,139,0.035)'
                  : 'transparent',
                border: `1px solid ${
                  isActive
                    ? 'rgba(255,209,102,0.2)'
                    : isComplete
                    ? 'rgba(201,184,216,0.7)'
                    : 'rgba(201,184,216,0.42)'
                }`,
                padding: '14px 18px',
                cursor: isComplete || isActive ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center gap-3">
                <StepIcon status={status} icon={step.icon} />
                <div className="flex-1 min-w-0">
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    color: isActive ? 'var(--gold)' : isComplete ? 'var(--text-1)' : 'var(--text-muted)',
                    marginBottom: 2,
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                    {step.subtitle(report)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(isComplete || isActive) && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                      ▾
                    </span>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div
                  className="fade-in"
                  style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}
                >
                  {step.detail(report)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete banner */}
      {report && (
        <div
          className="rounded-xl flex items-center gap-3 fade-in"
          style={{ marginTop: 16, padding: '12px 18px', background: 'rgba(255,209,102,0.05)', border: '1px solid rgba(255,209,102,0.15)' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: 16 }}>✦</span>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: 'var(--gold)' }}>
              Report ready
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      {!report && !isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>⬡</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
            Join an interview, then open<br /><span style={{ color: 'var(--text-dim)' }}>Analysis</span> from the sidebar
          </p>
        </div>
      )}
    </main>
  );
}
