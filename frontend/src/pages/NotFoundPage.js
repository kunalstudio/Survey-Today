import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks';

const NotFoundPage = () => {
  useDocumentTitle('404 — Page Not Found');
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), var(--bg-canvas)',
      padding: 24,
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 480,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 20,
        padding: '48px 36px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
      }}>
        <div style={{ fontSize: 60, marginBottom: 12, lineHeight: 1 }}>🔍</div>
        <h1 style={{
          fontSize: 64,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: 10,
          letterSpacing: '-1.5px'
        }}>
          404
        </h1>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          The page or resource you are looking for does not exist or has been moved to a new route.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
          <Link to="/" className="btn btn-render-white">🏠 Home</Link>
          <Link to="/explore" className="btn btn-outline">🔍 Explore</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
