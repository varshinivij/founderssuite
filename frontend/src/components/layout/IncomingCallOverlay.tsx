import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface CallNotif {
  id: string;
  matchId: string;
  title: string;
  body: string | null;
}

export default function IncomingCallOverlay() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [call, setCall] = useState<CallNotif | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 30s
  function dismiss(notifId: string) {
    supabase.from('notifications').update({ read: true }).eq('id', notifId).then(() => {});
    setCall(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function accept(c: CallNotif) {
    dismiss(c.id);
    navigate(`/meeting/${c.matchId}`);
  }

  useEffect(() => {
    if (!user) return;

    // Check for any unread call_started notifications on mount (in case they came in while offline)
    supabase
      .from('notifications')
      .select('id, match_id, title, body')
      .eq('user_id', user.id)
      .eq('type', 'call_started')
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const n = data[0];
          setCall({ id: String(n.id), matchId: String(n.match_id), title: String(n.title), body: n.body ? String(n.body) : null });
        }
      });

    // Real-time: listen for new call_started inserts
    const channel = supabase
      .channel(`incoming_call:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        const row = payload.new as Record<string, unknown>;
        if (row.type !== 'call_started') return;
        setCall({
          id: String(row.id),
          matchId: String(row.match_id),
          title: String(row.title),
          body: row.body ? String(row.body) : null,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!call) return;
    timerRef.current = setTimeout(() => dismiss(call.id), 30_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [call]);

  if (!call) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10, 4, 20, 0.72)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ring-bounce {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
      `}</style>

      <div style={{
        width: 320,
        borderRadius: 28,
        background: 'linear-gradient(160deg, #1e0533 0%, #3d1454 100%)',
        border: '1px solid rgba(201,184,216,0.2)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        padding: '36px 28px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        textAlign: 'center',
      }}>

        {/* Pulsing avatar */}
        <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 20 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(242,165,142,0.5)',
              animation: `pulse-ring 1.8s ease-out ${i * 0.5}s infinite`,
            }} />
          ))}
          <div style={{
            width: 88, height: 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(107,45,139,0.6), rgba(242,165,142,0.4))',
            border: '2px solid rgba(242,165,142,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            animation: 'ring-bounce 0.5s ease-in-out infinite',
          }}>
            📞
          </div>
        </div>

        {/* Labels */}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: 'rgba(242,165,142,0.7)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          Incoming Call
        </div>

        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: '#ffffff',
          marginBottom: 6,
          lineHeight: 1.2,
        }}>
          {call.title}
        </div>

        {call.body && (
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 32,
            lineHeight: 1.4,
          }}>
            {call.body}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
          <button
            onClick={() => dismiss(call.id)}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 16,
              background: 'rgba(185,84,101,0.18)',
              border: '1px solid rgba(185,84,101,0.4)',
              color: '#f28ea0',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(185,84,101,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(185,84,101,0.18)')}
          >
            ✕ Decline
          </button>
          <button
            onClick={() => accept(call)}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #2f8f67, #27a065)',
              border: 'none',
              color: '#ffffff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(47,143,103,0.4)',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✓ Accept
          </button>
        </div>

        {/* Auto-dismiss hint */}
        <div style={{
          marginTop: 16,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
        }}>
          Auto-dismisses in 30s
        </div>
      </div>
    </div>
  );
}
