import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSurveys } from '../hooks';

const DashboardPage = () => {
  const { user } = useAuth();
  const { surveys, loading } = useSurveys();

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'active').length,
    draft: surveys.filter(s => s.status === 'draft').length,
    totalResponses: surveys.reduce((sum, s) => sum + (s.stats?.totalResponses || 0), 0),
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}</p>
        </div>
        <Link to="/surveys/new" className="btn btn-primary">+ New Survey</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Surveys</div></div>
        <div className="stat-card"><div className="stat-value">{stats.active}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value">{stats.draft}</div><div className="stat-label">Drafts</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalResponses}</div><div className="stat-label">Total Responses</div></div>
      </div>

      {/* Recent Surveys */}
      <div className="section">
        <h2>Recent Surveys</h2>
        {loading ? (
          <p>Loading...</p>
        ) : surveys.length === 0 ? (
          <div className="empty-state">
            <p>No surveys yet.</p>
            <Link to="/surveys/new" className="btn btn-primary">Create your first survey</Link>
          </div>
        ) : (
          <div className="survey-list">
            {surveys.slice(0, 5).map((survey) => (
              <div key={survey._id} className="survey-row">
                <div className="survey-row-info">
                  <Link to={`/surveys/${survey._id}/edit`}>{survey.title}</Link>
                  <span className={`badge badge-${survey.status}`}>{survey.status}</span>
                </div>
                <div className="survey-row-meta">
                  <span>{survey.stats?.totalResponses || 0} responses</span>
                  <Link to={`/surveys/${survey._id}/analytics`} className="btn btn-sm">Analytics</Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {surveys.length > 5 && (
          <Link to="/surveys" className="btn btn-outline">View all surveys →</Link>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
