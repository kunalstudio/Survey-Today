import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSurveys } from '../hooks';

const ExplorePage = () => {
  const [search, setSearch] = useState('');
  const params = { status: 'active' };
  if (search) params.search = search;
  const { surveys, loading, error } = useSurveys(params);

  return (
    <div className="landing-page" style={{background:'#f8faff', minHeight:'100vh'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)', padding:'40px 32px', color:'white', textAlign:'center'}}>
        <h1 style={{fontSize:32, fontWeight:800, marginBottom:8}}>Explore Surveys</h1>
        <p style={{opacity:0.85, marginBottom:20}}>Discover and respond to public surveys</p>
        <div style={{maxWidth:480, margin:'0 auto'}}>
          <input
            className="search-input"
            style={{background:'white', color:'#1a1a2e', borderRadius:8}}
            placeholder="🔍 Search surveys…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{maxWidth:960, margin:'0 auto', padding:'32px 24px'}}>
        {loading && (
          <div className="loading-rows">
            <div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" />
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && surveys.length === 0 && (
          <div className="empty-state">
            <p>{search ? `No surveys matching "${search}"` : 'No public surveys available right now.'}</p>
          </div>
        )}
        {!loading && surveys.length > 0 && (
          <div className="explore-grid">
            {surveys.map((survey) => (
              <div key={survey._id} className="explore-card">
                <div className="explore-card-body">
                  <div className="explore-card-title">{survey.title}</div>
                  {survey.description && (
                    <p className="explore-card-desc">{survey.description.slice(0, 120)}{survey.description.length > 120 ? '…' : ''}</p>
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
      </div>
    </div>
  );
};

export default ExplorePage;
