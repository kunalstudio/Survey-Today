import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnalytics } from '../hooks';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#4f46e5','#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777'];

const fmtTime = (sec) => {
  if (!sec) return '—';
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec/60)}m ${sec%60}s`;
};

const QuestionChart = ({ q }) => {
  const isChoice = ['multiple_choice','checkbox','dropdown','yes_no'].includes(q.type);
  const isScale  = ['scale','rating'].includes(q.type);

  if (isChoice && q.chartData?.length > 0) {
    const total = q.chartData.reduce((s, d) => s + d.count, 0);
    return (
      <div className="chart-grid">
        <div style={{ flex: 2, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={q.chartData} margin={{ top:4, right:20, left:0, bottom:4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize:12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
              <Tooltip formatter={(val) => [`${val} (${Math.round(val/total*100)}%)`, 'Responses']} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {q.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {q.chartData.length <= 6 && (
          <div style={{ flex:1, minWidth:160 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={q.chartData} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={70} label={({ label, percent }) => `${label} ${(percent*100).toFixed(0)}%`}>
                  {q.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  if (isScale) {
    return (
      <div className="scale-result">
        <div className="scale-avg-box">
          <div className="scale-avg-num">{q.average ?? '—'}</div>
          <div className="scale-avg-label">Average Score</div>
          <div className="scale-avg-sub">{q.totalAnswers} responses</div>
        </div>
        {q.values?.length > 0 && (
          <div style={{ flex:2, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={
                [...new Set(q.values)].sort((a,b)=>a-b).map(v => ({
                  value: String(v),
                  count: q.values.filter(x => x==v).length
                }))
              } margin={{ top:4, right:20, left:0, bottom:4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="value" tick={{ fontSize:12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // Text / date answers
  if (q.values?.length > 0) {
    return (
      <div className="text-answers">
        {q.values.slice(0, 10).map((v, i) => (
          <div key={i} className="text-answer-pill">"{String(v)}"</div>
        ))}
        {q.values.length > 10 && <div className="text-muted">…and {q.values.length - 10} more</div>}
      </div>
    );
  }

  return <div className="text-muted">No answers yet</div>;
};

const AnalyticsPage = () => {
  const { id } = useParams();
  const { summary, questionData, loading, error, downloadCSV } = useAnalytics(id);

  if (loading) return <div className="loading-screen">Loading analytics…</div>;
  if (error)   return <div className="alert alert-error" style={{margin:32}}>{error}</div>;
  if (!summary) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="text-muted">
            <span className={`badge badge-${summary.status}`}>{summary.status}</span>
            {summary.publishedAt && ` · Published ${new Date(summary.publishedAt).toLocaleDateString()}`}
            {' · '}{summary.questions} question{summary.questions !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-outline" onClick={downloadCSV}>⬇ Export CSV</button>
          <Link to={`/surveys/${id}/edit`} className="btn btn-outline">✏ Builder</Link>
          <Link to={`/surveys/${id}/responses`} className="btn btn-outline">📋 Responses</Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{marginBottom:32}}>
        <div className="stat-card">
          <div className="stat-value">{summary.totalResponses}</div>
          <div className="stat-label">Total Responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color:'#059669'}}>{summary.completedResponses}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color:'#d97706'}}>{summary.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{width:`${summary.completionRate}%`}} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fmtTime(summary.averageCompletionTime)}</div>
          <div className="stat-label">Avg. Completion Time</div>
        </div>
      </div>

      {/* Per-question charts */}
      {questionData.length === 0 && (
        <div className="empty-state"><p>No responses yet to analyze.</p></div>
      )}
      {questionData.map((q, idx) => (
        <div key={q.questionId} className="analytics-card">
          <div className="analytics-card-header">
            <span className="qcard-num">Q{idx+1}</span>
            <h3 className="analytics-q-text">{q.text}</h3>
            <span className="qtype-badge">{q.type.replace('_',' ')}</span>
            <span className="text-muted" style={{marginLeft:'auto'}}>{q.totalAnswers} answer{q.totalAnswers!==1?'s':''}</span>
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
