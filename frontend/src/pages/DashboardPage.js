import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSurveys, useDocumentTitle } from '../hooks';
import { surveyAPI } from '../api';

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { surveys, loading, refetch } = useSurveys();
  // Fix #12: use flash state instead of alert()
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');

  const flash = (msg, isError = false) => {
    if (isError) { setActionErr(msg); setTimeout(() => setActionErr(''), 3000); }
    else         { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); }
  };

  const stats = {
    total:          surveys.length,
    active:         surveys.filter(s => s.status === 'active').length,
    draft:          surveys.filter(s => s.status === 'draft').length,
    totalResponses: surveys.reduce((sum, s) => sum + (s.stats?.totalResponses || 0), 0),
  };

  const handlePublish = async (id) => {
    try { await surveyAPI.publish(id); refetch(); flash('✅ Survey published!'); }
    catch (err) { flash(err.response?.data?.message || 'Failed to publish', true); }
  };

  // Fix #13: add Close action to Dashboard (parity with SurveysListPage)
  const handleClose = async (id) => {
    if (!window.confirm('Close this survey? It will stop accepting responses.')) return;
    try { await surveyAPI.close(id); refetch(); flash('Survey closed'); }
    catch (err) { flash(err.response?.data?.message || 'Failed to close', true); }
  };

  const recentSurveys = surveys.slice(0, 6);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name} 👋</p>
        </div>
        <Link to="/surveys/new" className="btn btn-primary">+ New Survey</Link>
      </div>

      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}
      {actionErr && <div className="alert alert-error">{actionErr}</div>}

      {/* Stat cards */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Surveys</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{color:'#059669'}}>{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-value" style={{color:'#d97706'}}>{stats.draft}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">📊</div>
          <div className="stat-value" style={{color:'#7c3aed'}}>{stats.totalResponses}</div>
          <div className="stat-label">Total Responses</div>
        </div>
      </div>

      {/* Recent surveys */}
      <div className="section">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <h2>Recent Surveys</h2>
          <Link to="/surveys" className="btn btn-ghost btn-sm">View all →</Link>
        </div>

        {loading ? (
          <div className="loading-rows">
            <div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" />
          </div>
        ) : recentSurveys.length === 0 ? (
          <div className="empty-state">
            <p>No surveys yet.</p>
            <Link to="/surveys/new" className="btn btn-primary">Create your first survey</Link>
          </div>
        ) : (
          <div className="survey-list">
            {recentSurveys.map((survey) => (
              <div key={survey._id} className="survey-card">
                <div className="survey-card-top">
                  <div className="survey-card-info">
                    <div className="survey-card-title">
                      <Link to={`/surveys/${survey._id}/edit`}>{survey.title}</Link>
                      <span className={`badge badge-${survey.status}`}>{survey.status}</span>
                    </div>
                    <div className="survey-card-meta">
                      <span>📊 {survey.stats?.totalResponses || 0} responses</span>
                      <span>❓ {survey.questions?.length || 0} questions</span>
                      <span>🕒 {new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="survey-card-actions">
                  <Link to={`/surveys/${survey._id}/edit`} className="btn btn-sm btn-outline">✏ Edit</Link>
                  <Link to={`/surveys/${survey._id}/analytics`} className="btn btn-sm btn-outline">📊 Analytics</Link>
                  {survey.status === 'draft' && survey.questions?.length > 0 && (
                    <button className="btn btn-sm btn-primary" onClick={() => handlePublish(survey._id)}>🚀 Publish</button>
                  )}
                  {survey.status === 'active' && (
                    <>
                      <button className="btn btn-sm btn-outline"
                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/surveys/${survey._id}/respond`); flash('📋 Link copied!'); }}>
                        📋 Copy Link
                      </button>
                      {/* Fix #13: Close button added for parity */}
                      <button className="btn btn-sm btn-danger" onClick={() => handleClose(survey._id)}>Close</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/surveys/new" className="quick-action-card">
            <div className="quick-action-icon">➕</div>
            <div className="quick-action-label">New Survey</div>
          </Link>
          <Link to="/surveys" className="quick-action-card">
            <div className="quick-action-icon">📋</div>
            <div className="quick-action-label">My Surveys</div>
          </Link>
          <Link to="/explore" className="quick-action-card">
            <div className="quick-action-icon">🔍</div>
            <div className="quick-action-label">Explore</div>
          </Link>
          <Link to="/profile" className="quick-action-card">
            <div className="quick-action-icon">👤</div>
            <div className="quick-action-label">Profile</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
