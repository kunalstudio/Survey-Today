import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { responseAPI, surveyAPI } from '../api';
import { useDocumentTitle } from '../hooks';

const SurveyResponsesPage = () => {
  const { id } = useParams();
  const [survey,    setSurvey]    = useState(null);
  const [responses, setResponses] = useState([]);
  useDocumentTitle(survey ? `Responses — ${survey.title}` : 'Responses');
  const [loading,   setLoading]   = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [msg,       setMsg]       = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 20;

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const load = useCallback(async (p = 1, isInitial = false) => {
    if (isInitial) setLoading(true); else setPageLoading(true);
    try {
      const [surveyRes, responseRes] = await Promise.all([
        surveyAPI.getOne(id),
        responseAPI.getAll(id, { page: p, limit: LIMIT }),
      ]);
      setSurvey(surveyRes.data.survey);
      setResponses(responseRes.data.responses || []);
      setTotal(responseRes.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load responses');
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [id]);

  useEffect(() => { load(1, true); }, [load]);

  useEffect(() => {
    if (page > 1) load(page, false);
  }, [page]); // eslint-disable-line

  const handleDelete = async (responseId) => {
    if (!window.confirm('Delete this response entry?')) return;
    try {
      await responseAPI.delete(id, responseId);
      setResponses(prev => prev.filter(r => r._id !== responseId));
      setTotal(prev => prev - 1);
      if (expanded === responseId) setExpanded(null);
      flash('Response deleted');
    } catch (err) { flash(err.response?.data?.message || 'Failed to delete'); }
  };

  const getAnswer = (response, questionId) => {
    const ans = response.answers?.find(a => a.questionId?.toString() === questionId?.toString());
    if (!ans) return '—';
    if (Array.isArray(ans.value)) return ans.value.join(', ');
    return String(ans.value ?? '—');
  };

  if (loading) return <div className="loading-screen">Loading responses…</div>;
  if (error)   return <div className="error-page"><h2>Error</h2><p>{error}</p></div>;

  const questions = survey?.questions?.slice().sort((a,b) => a.order - b.order) || [];
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Survey Responses</h1>
          <p className="text-muted">
            {survey?.title} · <span className={`badge badge-${survey?.status}`}>{survey?.status}</span>
            {' · '}{total} total response{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to={`/surveys/${id}/analytics`} className="btn btn-outline btn-sm">📊 Analytics</Link>
          <Link to={`/surveys/${id}/edit`} className="btn btn-outline btn-sm">✏ Builder</Link>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {responses.length === 0 && !pageLoading && (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No responses recorded yet.</p>
          {survey?.status === 'active' && (
            <button
              className="btn btn-render-white btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/surveys/${id}/respond`);
                flash('📋 Share link copied!');
              }}
            >
              📋 Copy Share Link
            </button>
          )}
        </div>
      )}

      {pageLoading && (
        <div className="loading-rows">
          <div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" />
        </div>
      )}

      {responses.length > 0 && !pageLoading && (
        <>
          <div className="response-list">
            {responses.map((r, idx) => (
              <div key={r._id} className="response-card">
                <div className="response-card-header" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                  <div className="response-card-meta">
                    <span className="response-num">#{(page - 1) * LIMIT + idx + 1}</span>
                    <div className="response-user">
                      <div className="response-avatar">{r.respondent?.name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <div className="response-name">{r.respondent?.name || 'Anonymous User'}</div>
                        <div className="response-email">{r.respondent?.email || 'No account attached'}</div>
                      </div>
                    </div>
                    <span className={`badge badge-${r.status === 'completed' ? 'active' : 'draft'}`}>
                      {r.status}
                    </span>
                    <span className="response-date">{new Date(r.createdAt).toLocaleString()}</span>
                    {r.answers?.length > 0 && (
                      <span className="text-muted">{r.answers.length} answer{r.answers.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-sm btn-ghost">
                      {expanded === r._id ? '▲ Collapse' : '▼ Inspect'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={e => { e.stopPropagation(); handleDelete(r._id); }}
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {expanded === r._id && (
                  <div className="response-answers">
                    {questions.length > 0 ? (
                      questions.map((q, qi) => (
                        <div key={q._id} className="response-answer-row">
                          <div className="response-question">Q{qi + 1}: {q.text}</div>
                          <div className="response-answer">{getAnswer(r, q._id)}</div>
                        </div>
                      ))
                    ) : (
                      r.answers?.map((a, ai) => (
                        <div key={ai} className="response-answer-row">
                          <div className="response-question">Answer {ai + 1}</div>
                          <div className="response-answer">{Array.isArray(a.value) ? a.value.join(', ') : String(a.value ?? '—')}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || pageLoading}
              >
                ← Prev
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || pageLoading}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyResponsesPage;
