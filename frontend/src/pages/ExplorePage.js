import React from 'react';
import { Link } from 'react-router-dom';
import { useSurveys } from '../hooks';

const ExplorePage = () => {
  // status filter only applies when not authenticated (backend logic)
  const { surveys, loading, error } = useSurveys({ status: 'active' });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Explore Surveys</h1>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && surveys.length === 0 && (
        <div className="empty-state">
          <p>No public surveys found.</p>
        </div>
      )}
      {!loading && surveys.length > 0 && (
        <div className="survey-list">
          {surveys.map((survey) => (
            <div key={survey._id} className="survey-row">
              <div className="survey-row-info">
                <Link to={`/surveys/${survey._id}`}>{survey.title}</Link>
                <span className={`badge badge-${survey.status}`}>{survey.status}</span>
              </div>
              <div className="survey-row-meta">
                <span>by {survey.creator?.name || 'anonymous'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
