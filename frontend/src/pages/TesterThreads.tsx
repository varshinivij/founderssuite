import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { fetchTesterMatches } from '../lib/matches';
import type { TesterMatch } from '../lib/matches';

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TesterThreads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<TesterMatch[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = matches.find(m => m.id === selectedId) ?? null;

  useEffect(() => {
    if (!user) return;
    fetchTesterMatches(user.id)
      .then(rows => {
        const visible = rows.filter(m => m.status === 'accepted' || m.status === 'pending');
        setMatches(visible);
        if (visible.length > 0 && !selectedId) setSelectedId(visible[0].id);
      });
  }, [user]);

  // Load messages for selected match
  useEffect(() => {
    if (!selectedId) return;
    setMessages([]);

    supabase
      .from('messages')
      .select('id, sender_id, body, created_at')
      .eq('match_id', selectedId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data.map(r => ({
          id: String(r.id),
          senderId: String(r.sender_id),
          body: String(r.body),
          createdAt: String(r.created_at),
        })));
      });

    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${selectedId}`,
      }, payload => {
        const r = payload.new as Record<string, unknown>;
        setMessages(prev => [...prev, {
          id: String(r.id),
          senderId: String(r.sender_id),
          body: String(r.body),
          createdAt: String(r.created_at),
        }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!draft.trim() || !selectedId || !user) return;
    setSending(true);
    await supabase.from('messages').insert({
      match_id: selectedId,
      sender_id: user.id,
      body: draft.trim(),
    });
    setDraft('');
    setSending(false);
  }

  const statusColor: Record<string, string> = {
    accepted: '#2f8f67',
    pending: '#6b2d8b',
    rejected: 'rgba(88,77,102,0.4)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#faf9fd' }}>

      {/* Thread list */}
      <div style={{
        width: 260,
        flexShrink: 0,
        borderRight: '1px solid rgba(201,184,216,0.72)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '18px 16px 12px',
          borderBottom: '1px solid rgba(201,184,216,0.45)',
        }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#210b2c' }}>Threads</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(88,77,102,0.5)', marginTop: 3 }}>
            YOUR STUDY INVITATIONS
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {matches.length === 0 && (
            <div style={{ padding: 24, fontSize: 12, color: 'rgba(88,77,102,0.5)', textAlign: 'center' }}>
              No invitations yet
            </div>
          )}
          {matches.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                background: selectedId === m.id ? 'rgba(107,45,139,0.06)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(201,184,216,0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (selectedId !== m.id) e.currentTarget.style.background = 'rgba(201,184,216,0.1)'; }}
              onMouseLeave={e => { if (selectedId !== m.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#210b2c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.formTitle}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: statusColor[m.status] ?? 'rgba(88,77,102,0.5)',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                }}>
                  {m.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(88,77,102,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.matchScore}% match
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(88,77,102,0.4)', fontSize: 13 }}>
            Select a thread
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(201,184,216,0.45)',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#210b2c' }}>{selected.formTitle}</div>
                {selected.formDescription && (
                  <div style={{ fontSize: 11, color: 'rgba(88,77,102,0.6)', marginTop: 2 }}>
                    {selected.formDescription.slice(0, 80)}{selected.formDescription.length > 80 ? '…' : ''}
                  </div>
                )}
              </div>
              {selected.status === 'accepted' && (
                <button
                  onClick={() => navigate(`/meeting/${selected.id}`)}
                  style={{
                    height: 34,
                    padding: '0 16px',
                    borderRadius: 10,
                    background: '#3d1454',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ▶ Join Call
                </button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: 'rgba(88,77,102,0.4)',
                }}>
                  No messages yet — start the conversation
                </div>
              )}
              {messages.map(msg => {
                const mine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '9px 13px',
                      borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: mine ? '#3d1454' : '#ffffff',
                      border: mine ? 'none' : '1px solid rgba(201,184,216,0.72)',
                      color: mine ? '#ffffff' : '#210b2c',
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}>
                      <div>{msg.body}</div>
                      <div style={{
                        fontSize: 9,
                        marginTop: 4,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: mine ? 'rgba(255,255,255,0.5)' : 'rgba(88,77,102,0.4)',
                        textAlign: 'right',
                      }}>
                        {timeAgo(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(201,184,216,0.45)',
              background: '#ffffff',
              display: 'flex',
              gap: 10,
              flexShrink: 0,
            }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message…"
                style={{
                  flex: 1,
                  height: 38,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(201,184,216,0.72)',
                  background: '#faf9fd',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13,
                  color: '#210b2c',
                  outline: 'none',
                }}
              />
              <button
                onClick={send}
                disabled={!draft.trim() || sending}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 10,
                  background: draft.trim() ? '#3d1454' : 'rgba(201,184,216,0.3)',
                  border: 'none',
                  color: draft.trim() ? '#ffffff' : 'rgba(88,77,102,0.4)',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: draft.trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
