import React from 'react';
import { useParams } from 'react-router-dom';
import { useAnalytics } from '../hooks';

const AnalyticsPage = () => {
  const { id } = useParams();
  const { summary, questionData, loading, error, downloadCSV } = useAnalytics(id);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!summary) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analytics</h1>
        <button className="btn btn-outline" onClick={downloadCSV}>Export CSV</button>
      </div>
      <div className="section">
        <h2>Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{summary.totalResponses}</div>
            <div className="stat-label">Responses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.started}</div>
            <div className="stat-label">Started</div>
          </div>
        </div>
      </div>
      <div className="section">
        <h2>By Question</h2>
        {questionData.map((q) => (
          <div key={q.questionId} style={{ marginBottom: 20 }}>
            <h3>{q.text}</h3>
            {/* simple JSON output for now */}
            <pre>{JSON.stringify(q.analytics, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;
