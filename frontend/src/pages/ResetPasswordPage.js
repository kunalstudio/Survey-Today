import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useDocumentTitle } from '../hooks';

const ResetPasswordPage = () => {
  useDocumentTitle('Reset Password');
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Fix #14: client-side min-length check
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(token, password);
      setMessage(data.message || 'Password reset successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="auth-subtitle">Choose a new password</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              {/* Fix #14: strength hint */}
              <small className="text-muted" style={{ marginTop: 4, display: 'block' }}>
                {password.length === 0
                  ? 'At least 6 characters required.'
                  : password.length < 6
                  ? `${6 - password.length} more character${6 - password.length !== 1 ? 's' : ''} needed.`
                  : password.length < 10
                  ? '✅ Good password.'
                  : '✅ Strong password!'}
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                name="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {confirm.length > 0 && (
                <small className="text-muted" style={{ marginTop: 4, display: 'block' }}>
                  {confirm === password ? '✅ Passwords match.' : '⚠ Passwords do not match.'}
                </small>
              )}
            </div>
            <button type="submit" className="btn btn-render-white btn-full" disabled={loading}>
              {loading ? 'Saving new password…' : 'Reset Password →'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
