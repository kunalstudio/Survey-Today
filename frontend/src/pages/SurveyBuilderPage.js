import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSurvey } from '../hooks';

const SurveyBuilderPage = () => {
  const { id } = useParams();
  const { survey, loading, error } = useSurvey(id);

  if (loading) return <p>Loading survey...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!survey) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Builder: {survey.title}</h1>
      </div>
      <p>This is where you would add and edit questions for your survey.</p>
      <p>(Builder functionality coming soon)</p>
    </div>
  );
};

export default SurveyBuilderPage;
