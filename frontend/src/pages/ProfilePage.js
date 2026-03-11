import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      setUser(data.user);
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await userAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <hr style={{ margin: '40px 0' }} />
      <button className="btn btn-danger" onClick={handleDelete}>Delete Account</button>
    </div>
  );
};

export default ProfilePage;
