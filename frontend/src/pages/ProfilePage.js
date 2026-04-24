import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();   // Fixed: updateUser not setUser
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: user?.name || '' });
  const [prefs,   setPrefs]   = useState({ emailNotifications: user?.preferences?.emailNotifications ?? true, publicProfile: user?.preferences?.publicProfile ?? false });
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

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
    if (!window.confirm('Delete your account? All your surveys and responses will be permanently removed.')) return;
    try {
      await userAPI.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) { flash(err.response?.data?.message || 'Deletion failed', true); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Avatar section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <span className={`badge badge-${user?.role === 'admin' ? 'active' : 'draft'}`}>{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{maxWidth:480}}>
        <div className="settings-section">
          <h3>Account Info</h3>
          <div className="form-group">
            <label htmlFor="name">Display Name</label>
            <input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={user?.email || ''} disabled style={{opacity:0.6, cursor:'not-allowed'}} />
            <small className="text-muted">Email cannot be changed</small>
          </div>
        </div>

        <div className="settings-section">
          <h3>Preferences</h3>
          {[
            { key:'emailNotifications', label:'Email Notifications', desc:'Receive emails about your survey activity' },
            { key:'publicProfile',      label:'Public Profile',       desc:'Allow others to see your name on public surveys' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="toggle-row">
              <div><div className="toggle-label">{label}</div><div className="toggle-desc">{desc}</div></div>
              <div className="toggle-switch">
                <input type="checkbox" checked={prefs[key]} onChange={e => setPrefs(p => ({...p, [key]: e.target.checked}))} />
                <span className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <hr style={{margin:'40px 0', borderColor:'#e5e7eb'}} />

      <div className="settings-section" style={{maxWidth:480}}>
        <h3 style={{color:'#dc2626'}}>Danger Zone</h3>
        <p className="text-muted" style={{marginBottom:16}}>Permanently delete your account, all surveys, and all responses. This cannot be undone.</p>
        <button className="btn btn-danger" onClick={handleDelete}>🗑 Delete My Account</button>
      </div>
    </div>
  );
};

export default ProfilePage;
