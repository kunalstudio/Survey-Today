import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks';

const ProfilePage = () => {
  useDocumentTitle('Profile Settings');
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: user?.name || '' });
  const [prefs,   setPrefs]   = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    publicProfile: user?.preferences?.publicProfile ?? false
  });
  const [myResponses, setMyResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  useEffect(() => {
    userAPI.getMyResponses()
      .then(({ data }) => setMyResponses(data.responses || []))
      .catch(() => {})
      .finally(() => setLoadingResponses(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile({ name: form.name, preferences: prefs });
      updateUser(data.user);
      flash('✅ Profile updated successfully');
    } catch (err) {
      flash(err.response?.data?.message || 'Update failed', true);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? All your surveys and collected responses will be permanently removed.')) return;
    try {
      await userAPI.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) { flash(err.response?.data?.message || 'Deletion failed', true); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Profile Settings</h1>
          <p className="text-muted">Manage your personal information and application preferences.</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Avatar section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <span className={`badge badge-${user?.role === 'admin' ? 'active' : 'draft'}`}>
            {user?.role || 'User'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="settings-section">
              <h3>Personal Info</h3>
              <div className="form-group">
                <label htmlFor="name">Display Name</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
                <small className="text-muted">Email address is permanently bound to this account.</small>
              </div>
            </div>

            <div className="settings-section">
              <h3>Preferences</h3>
              {[
                { key:'emailNotifications', label:'Email Notifications', desc:'Receive notifications about your survey responses' },
                { key:'publicProfile',      label:'Public Profile Visibility', desc:'Allow others to see your name as survey creator' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="toggle-row">
                  <div>
                    <div className="toggle-label">{label}</div>
                    <div className="toggle-desc">{desc}</div>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={e => setPrefs(p => ({...p, [key]: e.target.checked}))}
                    />
                    <span className="toggle-knob" />
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-render-white" disabled={loading}>
              {loading ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Survey Response History Tab */}
        <div>
          <div className="settings-section">
            <h3>Surveys Answered by You</h3>
            {loadingResponses ? (
              <div className="loading-rows">
                <div className="skeleton-row" style={{ height: 48 }} />
                <div className="skeleton-row" style={{ height: 48 }} />
              </div>
            ) : myResponses.length === 0 ? (
              <p className="text-muted" style={{ padding: '12px 0' }}>
                You haven't completed any public surveys yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {myResponses.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 13 }}>
                        {r.survey?.title || 'Survey'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        Submitted {new Date(r.createdAt).toLocaleDateString()} · {r.answers?.length || 0} answers
                      </div>
                    </div>
                    {r.survey?._id && (
                      <Link to={`/surveys/${r.survey._id}`} className="btn btn-sm btn-ghost">
                        View →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="settings-section" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
            <h3 style={{ color: '#fb7185' }}>Danger Zone</h3>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Permanently delete your user profile, created surveys, and all collected responses.
            </p>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              🗑 Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
