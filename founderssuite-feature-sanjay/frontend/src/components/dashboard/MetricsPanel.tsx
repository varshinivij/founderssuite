import type { SummaryReport } from '../../lib/api';

interface Props { report: SummaryReport | null; }

function ScoreBar({ label, value, description }: { label: string; value: number; description?: string }) {
  const color = value >= 75 ? 'var(--gold)' : value >= 50 ? 'var(--purple)' : 'var(--red)';
  const glow = value >= 75
    ? '0 0 8px rgba(255,209,102,0.3)'
    : value >= 50
    ? '0 0 8px rgba(176,99,255,0.25)'
    : '0 0 8px rgba(255,94,109,0.25)';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span style={{ color: 'var(--text-dim)', fontSize: 13, fontWeight: 500 }}>{label}</span>
          {description && (
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 1 }}>{description}</p>
          )}
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color, fontWeight: 700 }}>
          {value}
        </span>
      </div>
      <div style={{ height: 5, background: 'rgba(201,184,216,0.34)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          className="score-fill h-full"
          style={{ width: `${value}%`, background: color, borderRadius: 99, boxShadow: value > 0 ? glow : 'none' }}
        />
      </div>
    </div>
  );
}

const EMPTY = { bias_score: 0, question_quality: 0, insight_density: 0, validation_strength: 0 };

export default function MetricsPanel({ report }: Props) {
  const scores = report?.scores ?? EMPTY;

  return (
    <aside
      className="flex flex-col overflow-y-auto"
      style={{
        width: 256,
        minWidth: 256,
        borderLeft: '1px solid var(--border-subtle)',
        background: 'var(--surface-0)',
      }}
    >
      {/* Scores */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p className="fs-label-gold" style={{ marginBottom: 18 }}>Metrics</p>
        <div className="flex flex-col gap-5">
          <ScoreBar label="Bias Score" value={scores.bias_score} />
          <ScoreBar label="Question Quality" value={scores.question_quality} />
          <ScoreBar label="Insight Density" value={scores.insight_density} />
          <ScoreBar label="Validation Strength" value={scores.validation_strength} />
        </div>
      </div>

      {/* Bias flags */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="fs-label">Bias Flags</p>
          {!!report?.bias_flags?.length && (
            <span className="fs-badge fs-badge-gold">{report.bias_flags.length}</span>
          )}
        </div>
        {!report?.bias_flags?.length ? (
          <div className="flex items-center gap-2 py-2" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>
            None detected
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {report.bias_flags.map((f, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,209,102,0.05)', border: '1px solid rgba(255,209,102,0.12)' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--gold)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {f.issue}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }} className="truncate">
                  "{f.question.slice(0, 48)}{f.question.length > 48 ? '…' : ''}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validations */}
      <div className="px-5 py-5">
        <p className="fs-label" style={{ marginBottom: 12 }}>Hypotheses</p>
        {!report?.validations?.length ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {report.validations.map((v, i) => {
              const isVal = v.status === 'validated';
              const isInval = v.status === 'invalidated';
              const color = isVal ? 'var(--green)' : isInval ? 'var(--red)' : 'var(--purple)';
              const icon = isVal ? '✓' : isInval ? '✗' : '?';
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-xl px-3 py-2.5" style={{ background: 'rgba(107,45,139,0.04)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.5 }}>{v.hypothesis}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
