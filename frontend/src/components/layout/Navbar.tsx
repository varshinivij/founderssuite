import { Link, useLocation } from 'react-router';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/meeting', label: 'Interview' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/graph', label: 'Graph' },
  { to: '/marketplace', label: 'Matches' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header
      className="flex items-center justify-between px-8 sticky top-0 z-50"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(201,184,216,0.72)',
        height: 72,
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center no-underline" aria-label="Home">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #f7d9c4 0%, #6b2d8b 100%)',
            color: '#210b2c',
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          ƒ
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {NAV.map(({ to, label }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: active ? 800 : 500,
                fontSize: 14,
                color: active ? '#ffffff' : '#0a0a0f',
                textDecoration: 'none',
                transition: 'all 0.15s',
                padding: '10px 16px',
                borderRadius: 10,
                background: active ? '#3d1454' : 'transparent',
                border: '1px solid transparent',
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div />
    </header>
  );
}
