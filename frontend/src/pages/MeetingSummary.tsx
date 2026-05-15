import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { fetchMeetings, fetchSummary, fetchTranscript, generateSummary } from '../lib/api';
import type { Meeting, Segment, SummaryReport } from '../lib/api';

export default function MeetingSummary() {
  const { roomName } = useParams();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(roomName ?? '');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings().then(({ meetings: loaded }) => {
      setMeetings(loaded);
      if (!selectedRoom && loaded[0]) setSelectedRoom(loaded[0].room_name);
    });
  }, [selectedRoom]);

  useEffect(() => {
    if (!selectedRoom) return;
    fetchSummary(selectedRoom).then(({ report: found, title }) => {
      setReport(found);
      setGeneratedTitle(title ?? null);
    });
    fetchTranscript(selectedRoom).then(({ segments: found }) => setSegments(found));
  }, [selectedRoom]);

  const selectedMeeting = useMemo(() => meetings.find(meeting => meeting.room_name === selectedRoom), [meetings, selectedRoom]);
  const scoreItems = report ? [
    ['Bias', report.scores?.bias_score],
    ['Question Quality', report.scores?.question_quality],
    ['Insight Density', report.scores?.insight_density],
    ['Validation', report.scores?.validation_strength],
  ].filter(([, value]) => typeof value === 'number') : [];

  async function handleGenerate() {
    if (!selectedRoom) return;
    setBusy(true);
    setStatus(null);
    try {
      const { report: nextReport, title } = await generateSummary(selectedRoom);
      setReport(nextReport);
      setGeneratedTitle(title ?? null);
      setMeetings(current => current.map(meeting => meeting.room_name === selectedRoom ? { ...meeting, title: title ?? meeting.title } : meeting));
      setStatus('Analysis saved.');
    } catch {
      setStatus('Could not generate a summary for this meeting.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100vh', background: '#faf9fd', padding: 18 }}>
      <div className="flex items-center justify-between" style={{ minHeight: 62, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: '18px 18px 0 0', padding: '10px 18px', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#210b2c' }}>Interview Analysis</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>{generatedTitle || selectedMeeting?.title || 'SELECT A MEETING'}</div>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedRoom} onChange={event => setSelectedRoom(event.target.value)} style={{ border: '1px solid rgba(201,184,216,0.9)', borderRadius: 10, padding: '9px 10px', color: '#0a0a0f', background: '#ffffff' }}>
            <option value="">Choose meeting</option>
            {meetings.map(meeting => <option key={meeting.room_name} value={meeting.room_name}>{meeting.title || meeting.room_name}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={!selectedRoom || busy || segments.length === 0} className="fs-btn-primary">{busy ? 'Analyzing...' : 'Analyze interview'}</button>
        </div>
      </div>
      {status && <div style={{ background: '#ffffff', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)', padding: '9px 18px', color: 'rgba(88,77,102,0.82)', fontSize: 12, flexShrink: 0 }}>{status}</div>}

      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 0.62fr)', background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
        <main className="overflow-y-auto" style={{ padding: 24, borderRight: '1px solid rgba(201,184,216,0.72)' }}>
          {!report ? (
            <div className="flex h-full items-center justify-center text-center" style={{ color: 'rgba(88,77,102,0.72)' }}>
              {segments.length ? 'Select this meeting and click Analyze interview.' : 'No transcript is available for this meeting yet.'}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {scoreItems.length > 0 && (
                <section className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                  {scoreItems.map(([label, value]) => (
                    <div key={label as string} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 12, background: '#faf9fd' }}>
                      <div className="fs-label" style={{ marginBottom: 6 }}>{label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#210b2c', fontSize: 24, fontWeight: 800 }}>{value as number}</div>
                    </div>
                  ))}
                </section>
              )}

              <section style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#ffffff', padding: 18 }}>
                <p className="fs-label" style={{ marginBottom: 10 }}>Findings</p>
                {report.findings?.length ? (
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                    {report.findings.map((item, index) => <div key={`${item}-${index}`} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 14, color: '#0a0a0f', background: '#faf9fd', lineHeight: 1.45, fontSize: 14 }}>{item}</div>)}
                  </div>
                ) : <p style={{ color: 'rgba(88,77,102,0.72)' }}>No findings were returned.</p>}
              </section>

              <section style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#ffffff', padding: 18 }}>
                <p className="fs-label" style={{ marginBottom: 10 }}>Validations</p>
                <div className="flex flex-col gap-2">
                  {report.validations?.length ? report.validations.map((item, index) => <div key={`${item.hypothesis}-${index}`} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 14, background: '#faf9fd' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
                      <strong style={{ color: '#210b2c' }}>{item.hypothesis}</strong>
                      <span className="fs-badge fs-badge-purple">{item.status}</span>
                    </div>
                    <p style={{ color: 'rgba(88,77,102,0.78)', lineHeight: 1.45 }}>{item.evidence}</p>
                  </div>) : <p style={{ color: 'rgba(88,77,102,0.72)' }}>No validations were returned.</p>}
                </div>
              </section>

              <section className="grid" style={{ gridTemplateColumns: report.bias_flags?.length ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 14 }}>
                <div style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#ffffff', padding: 18 }}>
                  <p className="fs-label" style={{ marginBottom: 10 }}>Next Steps</p>
                  <div className="flex flex-col gap-2">
                    {report.next_steps?.length ? report.next_steps.map((item, index) => <div key={`${item}-${index}`} style={{ color: '#0a0a0f', lineHeight: 1.45, fontSize: 14 }}><strong>{index + 1}.</strong> {item}</div>) : <p style={{ color: 'rgba(88,77,102,0.72)' }}>No next steps were returned.</p>}
                  </div>
                </div>

                {!!report.bias_flags?.length && (
                  <div style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#ffffff', padding: 18 }}>
                    <p className="fs-label" style={{ marginBottom: 10 }}>Bias Flags</p>
                    <div className="flex flex-col gap-2">
                      {report.bias_flags.map((flag, index) => (
                        <div key={`${flag.question}-${index}`} style={{ border: '1px solid rgba(242,165,142,0.42)', borderRadius: 12, padding: 12, background: 'rgba(247,217,196,0.24)' }}>
                          <div style={{ color: '#210b2c', fontWeight: 800, marginBottom: 4 }}>{flag.issue}</div>
                          <div style={{ color: '#0a0a0f', fontSize: 13, lineHeight: 1.4 }}>{flag.question}</div>
                          <div style={{ color: '#6b2d8b', fontSize: 13, lineHeight: 1.4, marginTop: 6 }}>{flag.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {report.raw && (
                <section style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#faf9fd', padding: 18 }}>
                  <p className="fs-label" style={{ marginBottom: 10 }}>Raw Output</p>
                  <pre style={{ whiteSpace: 'pre-wrap', color: 'rgba(88,77,102,0.82)', fontSize: 12, lineHeight: 1.45 }}>{report.raw}</pre>
                </section>
              )}
            </div>
          )}
        </main>

        <aside className="overflow-y-auto" style={{ padding: 20, background: '#fbf9fd' }}>
          <p className="fs-label" style={{ marginBottom: 10 }}>Transcript</p>
          {segments.length === 0 ? <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13 }}>No transcript segments yet.</p> : segments.map((segment, index) => (
            <div key={`${segment.timestamp_ms}-${index}`} style={{ borderBottom: '1px solid rgba(201,184,216,0.55)', padding: '10px 0' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 5 }}>{segment.speaker}</div>
              <div style={{ color: '#0a0a0f', fontSize: 13, lineHeight: 1.5 }}>{segment.text}</div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
