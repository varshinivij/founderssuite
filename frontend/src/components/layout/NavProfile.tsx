import { useAuth } from '../../lib/auth';

export default function NavProfile({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = user.role === 'founder' ? 'Founder' : 'Tester';

  return (
    <div
      title={`${user.name} · ${roleLabel}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '10px 0' : '10px 12px',
        borderTop: '1px solid rgba(201,184,216,0.45)',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      {/* Avatar circle */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3d1454, #6b2d8b)',
        border: '2px solid rgba(201,184,216,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 13,
        color: '#ffffff',
        flexShrink: 0,
        letterSpacing: '0.03em',
      }}>
        {initials}
      </div>

      {/* Name + role — only when expanded */}
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: '#210b2c',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user.name.split(' ')[0]}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: 'rgba(88,77,102,0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {roleLabel}
          </div>
        </div>
      )}

      {/* Logout — only when expanded */}
      {!collapsed && (
        <button
          onClick={() => logout()}
          title="Sign out"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(88,77,102,0.45)',
            fontSize: 16,
            padding: 0,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ↩
        </button>
      )}
    </div>
  );
}
