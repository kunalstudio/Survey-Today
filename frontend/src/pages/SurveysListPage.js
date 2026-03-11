import React from 'react';
import { Link } from 'react-router-dom';
import { useSurveys } from '../hooks';

const SurveysListPage = () => {
  const { surveys, loading, error } = useSurveys();

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Surveys</h1>
        <Link to="/surveys/new" className="btn btn-primary">+ New Survey</Link>
      </div>

      {loading && <p>Loading surveys...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && surveys.length === 0 && (
        <div className="empty-state">
          <p>No surveys yet.</p>
          <Link to="/surveys/new" className="btn btn-primary">Create your first survey</Link>
        </div>
      )}

      {!loading && surveys.length > 0 && (
        <div className="survey-list">
          {surveys.map((survey) => (
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
    </div>
  );
};

export default SurveysListPage;
