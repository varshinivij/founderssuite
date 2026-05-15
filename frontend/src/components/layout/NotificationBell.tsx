import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleNotifClick(n: { id: string; matchId: string | null; read: boolean }) {
    if (!n.read) await markRead(n.id);
    setOpen(false);
    if (n.matchId) {
      if (user?.role === 'tester') navigate(`/tester/matches/${n.matchId}`);
      else navigate(`/founder/matches/${n.matchId}`);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        aria-label="Notifications"
        style={{
          width: '100%',
          height: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 12,
          padding: collapsed ? 0 : '0 13px',
          background: open ? 'rgba(107,45,139,0.06)' : 'transparent',
          border: '1px solid transparent',
          borderRadius: 12,
          cursor: 'pointer',
          position: 'relative',
          color: '#0a0a0f',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          transition: 'all 0.15s',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <NotificationsRoundedIcon fontSize="small" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -5,
              minWidth: 15,
              height: 15,
              borderRadius: 999,
              background: '#b95465',
              border: '1.5px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
              padding: '0 3px',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {!collapsed && <span>Notifications</span>}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          left: collapsed ? 58 : '100%',
          top: 0,
          marginLeft: collapsed ? 0 : 8,
          width: 320,
          background: '#ffffff',
          border: '1px solid rgba(201,184,216,0.8)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(33,11,44,0.12)',
          zIndex: 200,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(201,184,216,0.45)',
          }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#210b2c' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => user && markAllRead(user.id)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6b2d8b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '28px 16px',
                textAlign: 'center',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'rgba(88,77,102,0.5)',
              }}>
                No notifications yet
              </div>
            ) : notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleNotifClick(n)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  background: n.read ? 'transparent' : 'rgba(107,45,139,0.04)',
                  border: 'none',
                  borderBottom: '1px solid rgba(201,184,216,0.3)',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,45,139,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(107,45,139,0.04)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: n.read ? 600 : 800, fontSize: 13, color: '#210b2c' }}>
                    {!n.read && (
                      <span style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#6b2d8b',
                        marginRight: 6,
                        verticalAlign: 'middle',
                      }} />
                    )}
                    {n.title}
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    color: 'rgba(88,77,102,0.5)',
                    flexShrink: 0,
                  }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                {n.body && (
                  <span style={{ fontSize: 12, color: 'rgba(88,77,102,0.72)', lineHeight: 1.4 }}>
                    {n.body}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
