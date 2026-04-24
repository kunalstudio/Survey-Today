import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { responseAPI, surveyAPI } from '../api';

const SurveyResponsesPage = () => {
  const { id } = useParams();
  const [survey,    setSurvey]    = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [msg,       setMsg]       = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 20;

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const load = async (p = 1) => {
    setLoading(true);
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
    }
  };

  useEffect(() => { load(page); }, [id, page]);  // eslint-disable-line

  const handleDelete = async (responseId) => {
    if (!window.confirm('Delete this response?')) return;
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

  const questions = survey?.questions?.sort((a,b) => a.order - b.order) || [];
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Responses</h1>
          <p className="text-muted">
            {survey?.title} · <span className={`badge badge-${survey?.status}`}>{survey?.status}</span>
            {' · '}{total} response{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <Link to={`/surveys/${id}/analytics`} className="btn btn-outline">📊 Analytics</Link>
          <Link to={`/surveys/${id}/edit`} className="btn btn-outline">✏ Builder</Link>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {responses.length === 0 && (
        <div className="empty-state">
          <p>No responses yet.</p>
          {survey?.status === 'active' && survey?.settings?.isPublic && (
            <button className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/surveys/${id}/respond`); flash('📋 Link copied!'); }}>
              📋 Copy Share Link
            </button>
          )}
        </div>
      )}

      {responses.length > 0 && (
        <>
          <div className="response-list">
            {responses.map((r, idx) => (
              <div key={r._id} className="response-card">
                <div className="response-card-header" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                  <div className="response-card-meta">
                    <span className="response-num">#{(page-1)*LIMIT + idx + 1}</span>
                    <div className="response-user">
                      <div className="response-avatar">{r.respondent?.name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <div className="response-name">{r.respondent?.name || 'Anonymous'}</div>
                        <div className="response-email">{r.respondent?.email || 'No account'}</div>
                      </div>
                    </div>
                    <span className={`badge badge-${r.status === 'completed' ? 'active' : 'draft'}`}>{r.status}</span>
                    <span className="response-date">{new Date(r.createdAt).toLocaleString()}</span>
                    {r.answers?.length > 0 && <span className="text-muted">{r.answers.length} answer{r.answers.length!==1?'s':''}</span>}
                  </div>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <button className="btn btn-sm btn-ghost">{expanded === r._id ? '▲ Hide' : '▼ View'}</button>
                    <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); handleDelete(r._id); }}>🗑</button>
                  </div>
                </div>

                {expanded === r._id && (
                  <div className="response-answers">
                    {questions.length > 0 ? (
                      questions.map((q, qi) => (
                        <div key={q._id} className="response-answer-row">
                          <div className="response-question">Q{qi+1}: {q.text}</div>
                          <div className="response-answer">{getAnswer(r, q._id)}</div>
                        </div>
                      ))
                    ) : (
                      r.answers?.map((a, ai) => (
                        <div key={ai} className="response-answer-row">
                          <div className="response-question">Answer {ai+1}</div>
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
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Prev</button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyResponsesPage;
