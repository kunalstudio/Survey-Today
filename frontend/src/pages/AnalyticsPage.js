import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnalytics, useDocumentTitle } from '../hooks';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#ec4899', '#818cf8'];

const fmtTime = (sec) => {
  if (!sec) return '—';
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#13161c',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 6,
        padding: '8px 12px',
        color: '#ffffff',
        fontSize: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
      }}>
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#a5b4fc' }}>{payload[0].value} responses</p>
      </div>
    );
  }
  return null;
};

const QuestionChart = ({ q }) => {
  const isChoice = ['multiple_choice', 'checkbox', 'dropdown', 'yes_no'].includes(q.type);
  const isScale  = ['scale', 'rating'].includes(q.type);
  const allValues = q.values || q.textValues || [];

  if (isChoice && q.chartData?.length > 0) {
    const total = q.chartData.reduce((s, d) => s + d.count, 0);
    return (
      <div className="chart-grid">
        <div style={{ flex: 2, minWidth: 280 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={q.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {q.chartData.map((entry, index) => (
                  <Cell key={entry.label || index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {q.chartData.length <= 6 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={q.chartData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                >
                  {q.chartData.map((entry, index) => (
                    <Cell key={entry.label || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  if (isScale) {
    const scaleValues = (q.values && q.values.length > 0) ? q.values : [];
    const distribution = [...new Set(scaleValues)].sort((a, b) => Number(a) - Number(b)).map(v => ({
      value: String(v),
      count: scaleValues.filter(x => String(x) === String(v)).length
    }));

    return (
      <div className="scale-result">
        <div className="scale-avg-box">
          <div className="scale-avg-num">{q.average ?? '—'}</div>
          <div className="scale-avg-label">Average Score</div>
          <div className="scale-avg-sub">{q.totalAnswers} responses</div>
        </div>
        {distribution.length > 0 && (
          <div style={{ flex: 2, minWidth: 260 }}>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={distribution} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="value" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // Text or Date responses feed
  if (allValues.length > 0) {
    return (
      <div className="text-answers">
        {allValues.slice(0, 15).map((v, i) => (
          <div key={i} className="text-answer-pill">
            "{String(v)}"
          </div>
        ))}
        {allValues.length > 15 && (
          <div className="text-muted" style={{ marginTop: 6, fontSize: 12 }}>
            …and {allValues.length - 15} more responses (export CSV/JSON for full transcript)
          </div>
        )}
      </div>
    );
  }

  return <div className="text-muted">No answers recorded yet.</div>;
};

const AnalyticsPage = () => {
  const { id } = useParams();
  const { summary, questionData, loading, error, downloadCSV, downloadJSON } = useAnalytics(id);
  useDocumentTitle(summary ? `Analytics — ${summary.title || 'Survey'}` : 'Analytics');

  if (loading) return <div className="loading-screen">Loading live analytics…</div>;
  if (error)   return <div className="alert alert-error" style={{ margin: 32 }}>{error}</div>;
  if (!summary) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics & Insights</h1>
          <p className="text-muted">
            <span className={`badge badge-${summary.status}`}>{summary.status}</span>
            {summary.publishedAt && ` · Published ${new Date(summary.publishedAt).toLocaleDateString()}`}
            {' · '}{summary.questions} question{summary.questions !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={downloadCSV}>⬇ Export CSV</button>
          <button className="btn btn-outline btn-sm" onClick={downloadJSON}>⬇ Export JSON</button>
          <Link to={`/surveys/${id}/edit`} className="btn btn-outline btn-sm">✏ Builder</Link>
          <Link to={`/surveys/${id}/responses`} className="btn btn-outline btn-sm">📋 Responses</Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{summary.totalResponses}</div>
          <div className="stat-label">TOTAL RESPONSES</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-value" style={{ color: '#34d399' }}>{summary.completedResponses}</div>
          <div className="stat-label">COMPLETED</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#fbbf24' }}>{summary.inProgress}</div>
          <div className="stat-label">IN PROGRESS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#c084fc' }}>{summary.completionRate}%</div>
          <div className="stat-label">COMPLETION RATE</div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${summary.completionRate}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fmtTime(summary.averageCompletionTime)}</div>
          <div className="stat-label">AVG. TIME</div>
        </div>
      </div>

      {/* Per-Question Charts */}
      {questionData.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p>No responses yet to analyze. Share your survey to collect responses!</p>
        </div>
      )}

      {questionData.map((q, idx) => (
        <div key={q.questionId} className="analytics-card">
          <div className="analytics-card-header">
            <span className="qcard-num">Q{idx + 1}</span>
            <h3 className="analytics-q-text">{q.text}</h3>
            <span className="qtype-badge">{q.type.replace('_', ' ')}</span>
            <span className="text-muted" style={{ marginLeft: 'auto' }}>
              {q.totalAnswers} answer{q.totalAnswers !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="analytics-chart-body">
            <QuestionChart q={q} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsPage;
