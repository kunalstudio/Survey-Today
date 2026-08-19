import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSurveys, useDebounce, useDocumentTitle } from '../hooks';
import { surveyAPI } from '../api';

const STATUS_FILTERS = ['all', 'draft', 'active', 'closed', 'archived'];

const SurveysListPage = () => {
  useDocumentTitle('My Surveys');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Debounce search — fires API only 400ms after user stops typing
  const debouncedSearch = useDebounce(search, 400);

  const params = {};
  if (statusFilter !== 'all') params.status = statusFilter;
  if (debouncedSearch) params.search = debouncedSearch;

  const { surveys, loading, error, refetch } = useSurveys(params);

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handlePublish = async (id) => {
    try { await surveyAPI.publish(id); refetch(); flash('✅ Survey published!'); }
    catch (err) { flash(err.response?.data?.message || 'Failed to publish'); }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this survey? It will stop accepting responses.')) return;
    try { await surveyAPI.close(id); refetch(); flash('Survey closed'); }
    catch (err) { flash(err.response?.data?.message || 'Failed to close'); }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await surveyAPI.duplicate(id);
      refetch();
      flash('Survey duplicated!');
      navigate(`/surveys/${data.survey._id}/edit`);
    } catch (err) { flash(err.response?.data?.message || 'Failed to duplicate'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This will also delete all its responses. This cannot be undone.`)) return;
    try { await surveyAPI.delete(id); refetch(); flash('Survey deleted'); }
    catch (err) { flash(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Surveys</h1>
          <p className="text-muted">{surveys.length} survey{surveys.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/surveys/new" className="btn btn-primary">+ New Survey</Link>
      </div>

      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}
      {error     && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="surveys-toolbar">
        <div className="filter-tabs">
          {STATUS_FILTERS.map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          placeholder="🔍 Search surveys…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="loading-rows"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>}

      {!loading && surveys.length === 0 && (
        <div className="empty-state">
          <p>{search ? `No surveys matching "${search}"` : 'No surveys yet.'}</p>
          {!search && <Link to="/surveys/new" className="btn btn-primary">Create your first survey</Link>}
        </div>
      )}

      {!loading && surveys.length > 0 && (
        <div className="survey-list">
          {surveys.map((survey) => (
            <div key={survey._id} className="survey-card">
              <div className="survey-card-top">
                <div className="survey-card-info">
                  <div className="survey-card-title">
                    <Link to={`/surveys/${survey._id}/edit`}>{survey.title}</Link>
                    <span className={`badge badge-${survey.status}`}>{survey.status}</span>
                  </div>
                  {survey.description && (
                    <p className="survey-card-desc">{survey.description.slice(0, 100)}{survey.description.length > 100 ? '…' : ''}</p>
                  )}
                  <div className="survey-card-meta">
                    <span>📊 {survey.stats?.totalResponses || 0} responses</span>
                    <span>❓ {survey.questions?.length || 0} questions</span>
                    <span>🕒 {new Date(survey.createdAt).toLocaleDateString()}</span>
                    {survey.settings?.isPublic && <span className="badge" style={{background:'#dbeafe',color:'#1d4ed8'}}>Public</span>}
                  </div>
                </div>
              </div>

              <div className="survey-card-actions">
                <Link to={`/surveys/${survey._id}/edit`} className="btn btn-sm btn-outline">✏ Builder</Link>
                <Link to={`/surveys/${survey._id}/analytics`} className="btn btn-sm btn-outline">📊 Analytics</Link>
                <Link to={`/surveys/${survey._id}/responses`} className="btn btn-sm btn-outline">📋 Responses</Link>
                <button className="btn btn-sm btn-outline" onClick={() => handleDuplicate(survey._id)}>⧉ Duplicate</button>

                {survey.status === 'draft' && (
                  <button className="btn btn-sm btn-primary"
                    onClick={() => handlePublish(survey._id)}
                    disabled={!survey.questions?.length}
                    title={!survey.questions?.length ? 'Add questions first' : ''}>
                    🚀 Publish
                  </button>
                )}
                {survey.status === 'active' && (
                  <>
                    <button className="btn btn-sm btn-outline"
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/surveys/${survey._id}/respond`); flash('📋 Link copied!'); }}>
                      📋 Copy Link
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleClose(survey._id)}>Close</button>
                  </>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(survey._id, survey.title)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveysListPage;
