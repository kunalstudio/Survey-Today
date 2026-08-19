import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce, useInfiniteSurveys, useDocumentTitle } from '../hooks';

const SORT_OPTIONS = [
  { value: 'newest',    label: '🕒 Newest' },
  { value: 'popular',   label: '🔥 Most Popular' },
  { value: 'relevance', label: '✨ Most Relevant' },
];

const ExplorePage = () => {
  useDocumentTitle('Explore Surveys');
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('newest');

  // Fire API only after user stops typing for 400ms
  const debouncedSearch = useDebounce(search, 400);

  const params = { status: 'active', sortBy };
  if (debouncedSearch) params.search = debouncedSearch;

  const {
    surveys, loading, loadingMore, error, hasNextPage, total, loadMore,
  } = useInfiniteSurveys(params);

  return (
    <div className="landing-page" style={{ background: '#f8faff', minHeight: '100vh' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
        padding: '40px 32px',
        color: 'white',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Explore Surveys</h1>
        <p style={{ opacity: 0.85, marginBottom: 20 }}>Discover and respond to public surveys</p>

        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Search input */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              id="explore-search"
              className="search-input"
              style={{ background: 'white', color: '#1a1a2e', borderRadius: 8, paddingRight: 40 }}
              placeholder="🔍 Search surveys…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search surveys"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16,
                }}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>

          {/* Sort dropdown */}
          <select
            id="explore-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              flex: '0 0 auto',
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Sort surveys"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ color: '#1a1a2e' }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Live result count */}
        {!loading && (
          <p style={{ marginTop: 12, opacity: 0.75, fontSize: 14 }}>
            {total > 0
              ? `${total} survey${total !== 1 ? 's' : ''} found${debouncedSearch ? ` for "${debouncedSearch}"` : ''}`
              : debouncedSearch ? `No surveys found for "${debouncedSearch}"` : 'No public surveys available'}
          </p>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Initial loading skeleton */}
        {loading && (
          <div className="loading-rows">
            <div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" />
            <div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" />
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && surveys.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>{debouncedSearch ? `No surveys matching "${debouncedSearch}"` : 'No public surveys available right now.'}</p>
            {debouncedSearch && (
              <button className="btn btn-outline btn-sm" onClick={() => setSearch('')} style={{ marginTop: 12 }}>
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && surveys.length > 0 && (
          <div className="explore-grid">
            {surveys.map((survey) => (
              <div key={survey._id} className="explore-card">
                <div className="explore-card-body">
                  <div className="explore-card-title">{survey.title}</div>
                  {survey.description && (
                    <p className="explore-card-desc">
                      {survey.description.slice(0, 120)}{survey.description.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div className="explore-card-footer">
                  <div className="explore-card-meta">
                    <span>👤 {survey.creator?.name || 'Anonymous'}</span>
                    <span>📊 {survey.stats?.totalResponses || 0} responses</span>
                    <span>❓ {survey.questions?.length || 0} questions</span>
                  </div>
                  <Link to={`/surveys/${survey._id}/respond`} className="btn btn-primary btn-sm">
                    Take Survey →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              id="explore-load-more"
              className="btn btn-outline"
              onClick={loadMore}
              disabled={loadingMore}
              style={{ minWidth: 160 }}
            >
              {loadingMore ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16 }} /> Loading…
                </span>
              ) : 'Load More Surveys'}
            </button>
          </div>
        )}

        {/* Inline loading indicator when appending pages */}
        {loadingMore && (
          <div className="loading-rows" style={{ marginTop: 24 }}>
            <div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
