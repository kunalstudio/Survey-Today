import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSurvey } from '../hooks';

const SurveyDetailPage = () => {
  const { id } = useParams();
  const { survey, loading, error } = useSurvey(id);

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!survey) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{survey.title}</h1>
      </div>
      <p>{survey.description}</p>
      {survey.status === 'active' && survey.settings?.isPublic && (
        <Link to={`/surveys/${survey._id}/respond`} className="btn btn-primary">
          Take Survey
        </Link>
      )}
      {survey.creator && (
        <p className="text-muted" style={{ marginTop: 16 }}>
          Created by {survey.creator.name}
        </p>
      )}
    </div>
  );
};

export default SurveyDetailPage;
