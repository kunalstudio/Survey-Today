import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce, useInfiniteSurveys, useDocumentTitle } from '../hooks';

const SORT_OPTIONS = [
  { value: 'newest',    label: '🕒 Newest' },
  { value: 'popular',   label: '🔥 Most Popular' },
  { value: 'relevance', label: '✨ Most Relevant' },
];

const ExplorePage = () => {
  useDocumentTitle('Explore Surveys');
  const { isAuthenticated } = useAuth();
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
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Link to="/" style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📋</span> Survey Today
          </Link>
        </div>
        <div className="landing-nav-links">
          <Link to="/" className="landing-nav-link">Home</Link>
          <Link to="/explore" className="landing-nav-link" style={{ color: '#ffffff', fontWeight: 600 }}>Explore</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-render-white btn-sm">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-render-white btn-sm">
                Start for free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Search Hero Header ───────────────────────────────── */}
      <div style={{
        padding: '60px 24px 50px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(56, 189, 248, 0.12)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 16
        }}>
          <span>🔍</span> PUBLIC DIRECTORY
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, marginBottom: 10, color: '#ffffff', letterSpacing: '-1px' }}>
          Explore Public Surveys
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 28, maxWidth: 520, margin: '0 auto 28px', fontSize: 15 }}>
          Discover surveys created by the community, share your thoughts, and see real-time questions.
        </p>

        <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Search input */}
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <input
              id="explore-search"
              className="search-input"
              style={{
                width: '100%',
                padding: '12px 42px 12px 16px',
                borderRadius: 8,
                fontSize: 14,
                background: 'rgba(18, 20, 27, 0.95)',
                border: '1px solid var(--border-medium)'
              }}
              placeholder="🔍 Search surveys by topic, title or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search surveys"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16,
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
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-surface-elevated)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
            aria-label="Sort surveys"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        {!loading && (
          <p style={{ marginTop: 18, color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>
            {total > 0
              ? `${total} survey${total !== 1 ? 's' : ''} available${debouncedSearch ? ` for "${debouncedSearch}"` : ''}`
              : debouncedSearch ? `No surveys found matching "${debouncedSearch}"` : 'No active public surveys found.'}
          </p>
        )}
      </div>

      {/* ── Results Grid ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px 80px' }}>
        {loading && (
          <div className="loading-rows">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && surveys.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
            <p>{debouncedSearch ? `No surveys found matching "${debouncedSearch}"` : 'No public surveys available right now.'}</p>
            {debouncedSearch && (
              <button className="btn btn-render-white btn-sm" onClick={() => setSearch('')} style={{ marginTop: 8 }}>
                Clear Search Filter
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
                    <span>📊 {survey.stats?.totalResponses || 0} answers</span>
                    <span>❓ {survey.questions?.length || 0} questions</span>
                  </div>
                  <Link to={`/surveys/${survey._id}/respond`} className="btn btn-render-white btn-sm">
                    Take Survey →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              id="explore-load-more"
              className="btn btn-outline"
              onClick={loadMore}
              disabled={loadingMore}
              style={{ minWidth: 180 }}
            >
              {loadingMore ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} /> Loading more…
                </span>
              ) : 'Load More Surveys'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
