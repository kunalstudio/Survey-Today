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
  const [page, setPage] = useState(1);

  // Debounce search
  const debouncedSearch = useDebounce(search, 400);

  const params = { page, limit: 10 };
  if (statusFilter !== 'all') params.status = statusFilter;
  if (debouncedSearch) params.search = debouncedSearch;

  const { surveys, loading, error, pagination, refetch } = useSurveys(params);

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePublish = async (id) => {
    try {
      await surveyAPI.publish(id);
      refetch();
      flash('✅ Survey published!');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this survey? It will stop accepting responses.')) return;
    try {
      await surveyAPI.close(id);
      refetch();
      flash('Survey closed');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to close');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this survey?')) return;
    try {
      await surveyAPI.archive(id);
      refetch();
      flash('Survey archived');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to archive');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await surveyAPI.duplicate(id);
      refetch();
      flash('Survey duplicated!');
      navigate(`/surveys/${data.survey._id}/edit`);
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to duplicate');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This will also delete all its responses. This cannot be undone.`)) return;
    try {
      await surveyAPI.delete(id);
      refetch();
      flash('Survey deleted');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to delete');
    }
  };

  const totalPages = pagination?.pages || 1;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Surveys</h1>
          <p className="text-muted">
            {pagination?.total !== undefined ? `${pagination.total} total surveys` : `${surveys.length} surveys`}
          </p>
        </div>
        <Link to="/surveys/new" className="btn btn-render-white">+ New Survey</Link>
      </div>

      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}
      {error     && <div className="alert alert-error">{error}</div>}

      {/* Filters & Search */}
      <div className="surveys-toolbar">
        <div className="filter-tabs">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => handleFilterChange(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          placeholder="🔍 Search surveys by title or description…"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {loading && (
        <div className="loading-rows">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      )}

      {!loading && surveys.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>{search ? `No surveys matching "${search}"` : 'No surveys found in this category.'}</p>
          {!search && (
            <Link to="/surveys/new" className="btn btn-render-white">
              Create your first survey
            </Link>
          )}
        </div>
      )}

      {!loading && surveys.length > 0 && (
        <>
          <div className="survey-list">
            {surveys.map((survey) => (
              <div key={survey._id} className="survey-card">
                <div className="survey-card-top">
                  <div className="survey-card-title">
                    <Link to={`/surveys/${survey._id}/edit`}>{survey.title}</Link>
                    <span className={`badge badge-${survey.status}`}>{survey.status}</span>
                  </div>
                  {survey.description && (
                    <p className="survey-card-desc">
                      {survey.description.slice(0, 120)}{survey.description.length > 120 ? '…' : ''}
                    </p>
                  )}
                  <div className="survey-card-meta">
                    <span>📊 {survey.stats?.totalResponses || 0} responses</span>
                    <span>❓ {survey.questions?.length || 0} questions</span>
                    <span>🕒 {new Date(survey.createdAt).toLocaleDateString()}</span>
                    {survey.settings?.isPublic && (
                      <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        Public
                      </span>
                    )}
                  </div>
                </div>

                <div className="survey-card-actions">
                  <Link to={`/surveys/${survey._id}/edit`} className="btn btn-sm btn-outline">✏ Builder</Link>
                  <Link to={`/surveys/${survey._id}/analytics`} className="btn btn-sm btn-outline">📊 Analytics</Link>
                  <Link to={`/surveys/${survey._id}/responses`} className="btn btn-sm btn-outline">📋 Responses</Link>
                  <button className="btn btn-sm btn-outline" onClick={() => handleDuplicate(survey._id)}>⧉ Duplicate</button>

                  {survey.status === 'draft' && (
                    <button
                      className="btn btn-sm btn-indigo"
                      onClick={() => handlePublish(survey._id)}
                      disabled={!survey.questions?.length}
                      title={!survey.questions?.length ? 'Add questions first' : ''}
                    >
                      🚀 Publish
                    </button>
                  )}

                  {survey.status === 'active' && (
                    <>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/surveys/${survey._id}/respond`);
                          flash('📋 Link copied to clipboard!');
                        }}
                      >
                        📋 Copy Link
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleClose(survey._id)}>Close</button>
                    </>
                  )}

                  {survey.status === 'closed' && (
                    <button className="btn btn-sm btn-outline" onClick={() => handleArchive(survey._id)}>
                      📦 Archive
                    </button>
                  )}

                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(survey._id, survey.title)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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

export default SurveysListPage;
