import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSurveys } from '../../hooks';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { surveys } = useSurveys();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSurveys = surveys.filter(s => s.status === 'active').length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard',   label: 'Dashboard',  icon: '▦'  },
    { to: '/surveys',     label: 'My Surveys', icon: '📋', count: surveys.length },
    { to: '/surveys/new', label: 'New Survey', icon: '✚' },
    { to: '/explore',     label: 'Explore',    icon: '🔍' },
    { to: '/profile',     label: 'Profile',    icon: '👤' },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Topbar */}
      <header className="mobile-topbar">
        <Link to="/dashboard" className="mobile-logo">
          <span style={{ fontSize: 20 }}>📋</span> Survey Today
        </Link>
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
            <span style={{ fontSize: 20 }}>📋</span> Survey Today
          </Link>
        </div>

        {/* Active surveys pill */}
        {activeSurveys > 0 && (
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              color: '#34d399',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
              {activeSurveys} survey{activeSurveys !== 1 ? 's' : ''} live
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon, count }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/surveys' || to === '/explore' || to === '/profile'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count > 0 && (
                <span style={{
                  fontSize: 11,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontWeight: 700
                }}>
                  {count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-full"
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            ↪ Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
