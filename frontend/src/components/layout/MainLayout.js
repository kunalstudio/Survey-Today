import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSurveys } from '../../hooks';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { surveys } = useSurveys();
  const navigate = useNavigate();

  const activeSurveys = surveys.filter(s => s.status === 'active').length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard',  icon: '▦'  },
    { to: '/surveys',   label: 'My Surveys', icon: '📋', count: surveys.length },
    { to: '/surveys/new', label: 'New Survey', icon: '✚' },
    { to: '/explore',   label: 'Explore',    icon: '🔍' },
    { to: '/profile',   label: 'Profile',    icon: '👤' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/dashboard">📋 SurveyOS</Link>
        </div>

        {/* Active surveys pill */}
        {activeSurveys > 0 && (
          <div style={{ padding:'8px 20px 0' }}>
            <div style={{ background:'rgba(79,70,229,0.15)', borderRadius:6, padding:'6px 10px', fontSize:11, color:'#a5b4fc', fontWeight:500 }}>
              🟢 {activeSurveys} survey{activeSurveys !== 1 ? 's' : ''} live
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon, count }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/surveys/new' ? false : undefined}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count > 0 && (
                <span style={{ fontSize:11, background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'1px 7px', fontWeight:600 }}>
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
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>
            ↪ Logout
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
