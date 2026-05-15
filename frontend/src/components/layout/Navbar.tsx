import { useState, type ComponentType, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BrandMark from './BrandMark';

const NAV = [
  { to: '/', label: 'Dashboard', Icon: DashboardRoundedIcon },
  { to: '/meeting', label: 'Interview', Icon: VideocamRoundedIcon },
  { to: '/simulator', label: 'Simulator', Icon: ForumRoundedIcon },
  { to: '/icp-agent', label: 'ICP Agent', Icon: SmartToyRoundedIcon },
  { to: '/knowledge-base', label: 'Knowledge Base', Icon: AccountTreeRoundedIcon },
  { to: '/analysis', label: 'Analysis', Icon: AnalyticsRoundedIcon },
  { to: '/marketplace', label: 'Matches', Icon: GroupsRoundedIcon },
] satisfies Array<{ to: string; label: string; Icon: ComponentType<{ fontSize?: 'small' | 'medium'; style?: CSSProperties }> }>;

export default function Navbar() {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const width = expanded ? 224 : 82;

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
        <Link to="/" className="flex items-center no-underline" aria-label="Home" style={{ minWidth: 38 }}>
          <BrandMark />
        </Link>

        <button
          type="button"
          onClick={() => setExpanded(current => !current)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            border: '1px solid rgba(201,184,216,0.86)',
            borderRadius: 10,
            background: '#faf9fd',
            color: '#210b2c',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {expanded ? <ChevronLeftRoundedIcon fontSize="small" /> : <ChevronRightRoundedIcon fontSize="small" />}
        </button>
      </div>

      <nav className="flex flex-col gap-2" style={{ width: '100%' }}>
        {NAV.map(({ to, label, Icon }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              title={label}
              aria-label={label}
              style={{
                width: '100%',
                height: 46,
                display: 'flex',
                alignItems: 'center',
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
    </aside>
  );
}
