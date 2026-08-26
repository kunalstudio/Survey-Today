import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSurvey, useDocumentTitle } from '../hooks';

const SurveyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { survey, loading, error } = useSurvey(id);
  useDocumentTitle(survey ? survey.title : 'Survey Overview');

  if (loading) return <div className="loading-screen">Loading survey…</div>;
  if (error) return (
    <div className="error-page">
      <div style={{ fontSize: 44, marginBottom: 14 }}>😕</div>
      <h2>Survey not available</h2>
      <p>{error}</p>
      <Link to="/explore" className="btn btn-render-white" style={{ marginTop: 20 }}>
        Browse other surveys
      </Link>
    </div>
  );
  if (!survey) return null;

  const isOwner = user && survey.creator && (user._id === survey.creator._id || user._id === survey.creator);
  const isAvailable = survey.status === 'active';
  const isClosed    = survey.status === 'closed';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 20,
        padding: '40px',
        maxWidth: 620,
        width: '100%',
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(16px)'
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className={`badge badge-${survey.status}`}>{survey.status}</span>
            {isOwner && (
              <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                ★ You created this survey
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', marginBottom: 10, lineHeight: 1.25, letterSpacing: '-0.5px' }}>
            {survey.title}
          </h1>
          {survey.description && (
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{survey.description}</p>
          )}
        </div>

        {/* Metadata Strip */}
        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28,
          padding: '14px 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 13,
          color: '#94a3b8'
        }}>
          {survey.creator?.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: 'white', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {survey.creator.name[0]?.toUpperCase()}
              </div>
              <span style={{ color: '#f8fafc' }}>by {survey.creator.name}</span>
            </div>
          )}
          <span>❓ {survey.questions?.length || 0} questions</span>
          <span>📊 {survey.stats?.totalResponses || 0} responses</span>
          {survey.settings?.allowAnonymous && <span>👤 Anonymous allowed</span>}
        </div>

        {/* Owner Quick Controls */}
        {isOwner && (
          <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 24,
            padding: '12px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 8,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to={`/surveys/${survey._id}/edit`} className="btn btn-sm btn-outline">
              ✏ Edit in Builder
            </Link>
            <Link to={`/surveys/${survey._id}/analytics`} className="btn btn-sm btn-outline">
              📊 View Analytics
            </Link>
            <Link to={`/surveys/${survey._id}/responses`} className="btn btn-sm btn-outline">
              📋 Inspect Responses
            </Link>
          </div>
        )}

        {/* CTA */}
        {isAvailable ? (
          <div style={{ textAlign: 'center' }}>
            <Link
              to={`/surveys/${survey._id}/respond`}
              className="btn btn-render-white"
              style={{ padding: '14px 44px', fontSize: 15, width: '100%' }}
            >
              🚀 Start Survey →
            </Link>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>Estimated completion time: 2–4 minutes</p>
          </div>
        ) : isClosed ? (
          <div className="alert alert-warning" style={{ textAlign: 'center', justifyContent: 'center' }}>
            🔒 This survey is closed and is no longer accepting new responses.
          </div>
        ) : (
          <div className="alert alert-warning" style={{ textAlign: 'center', justifyContent: 'center' }}>
            ⏸ This survey is currently in draft mode.
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/explore" style={{ fontSize: 13, color: '#94a3b8' }}>
            ← Back to Explore Directory
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetailPage;
