import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BrandMark from './BrandMark';
import NotificationBell from './NotificationBell';
import NavProfile from './NavProfile';

const NAV = [
  { to: '/tester/threads', label: 'Threads', Icon: ForumRoundedIcon },
  { to: '/meeting', label: 'Call', Icon: VideocamRoundedIcon },
];

export default function TesterNav() {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const width = expanded ? 224 : 82;
  const collapsed = !expanded;

  return (
    <aside
      className="flex flex-col"
      style={{
        width,
        minWidth: width,
        height: '100vh',
        background: '#ffffff',
        borderRight: '1px solid rgba(201,184,216,0.72)',
        padding: expanded ? '18px 14px' : '18px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'width 180ms ease, min-width 180ms ease, padding 180ms ease',
      }}
    >
      <div className="flex items-center" style={{ justifyContent: expanded ? 'space-between' : 'center', gap: 10, marginBottom: 22 }}>
        <Link to="/tester/threads" className="flex items-center no-underline" aria-label="Home" style={{ minWidth: 38 }}>
          <BrandMark />
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(c => !c)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex items-center justify-center"
          style={{
            width: 32, height: 32,
            border: '1px solid rgba(201,184,216,0.86)',
            borderRadius: 10, background: '#faf9fd',
            color: '#210b2c', cursor: 'pointer', flexShrink: 0,
          }}
        >
          {expanded ? <ChevronLeftRoundedIcon fontSize="small" /> : <ChevronRightRoundedIcon fontSize="small" />}
        </button>
      </div>

      <nav className="flex flex-col gap-2" style={{ width: '100%', flex: 1 }}>
        <NotificationBell collapsed={collapsed} />

        {NAV.map(({ to, label, Icon }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              title={label}
              aria-label={label}
              style={{
                width: '100%', height: 46,
                display: 'flex', alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                gap: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: active ? 800 : 700,
                fontSize: 13,
                color: active ? '#ffffff' : '#0a0a0f',
                textDecoration: 'none',
                transition: 'all 0.15s',
                borderRadius: 12,
                background: active ? '#3d1454' : 'transparent',
                border: active ? '1px solid #3d1454' : '1px solid transparent',
                padding: expanded ? '0 13px' : 0,
              }}
            >
              <Icon fontSize="small" style={{ flexShrink: 0 }} />
              {expanded && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <NavProfile collapsed={collapsed} />
    </aside>
  );
}
