import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { responseAPI } from '../api';

const SurveyResponsesPage = () => {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    responseAPI.getAll(id)
      .then(({ data }) => setResponses(data.responses || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load responses'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Responses</h1>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && responses.length === 0 && (
        <div className="empty-state">
          <p>No responses yet.</p>
        </div>
      )}
      {!loading && responses.length > 0 && (
        <div className="section">
          {responses.map((r) => (
            <div key={r._id} className="survey-row" style={{ flexDirection: 'column' }}>
              <div className="survey-row-info">
                <span>{new Date(r.createdAt).toLocaleString()}</span>
                <span className="badge badge-" style={{ marginLeft: '10px' }}>{r.status}</span>
              </div>
              <pre style={{ marginTop: 8, fontSize: 12 }}>{JSON.stringify(r.answers, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyResponsesPage;
