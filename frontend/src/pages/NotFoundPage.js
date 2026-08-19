import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks';

const NotFoundPage = () => {
  useDocumentTitle('404 — Page Not Found');
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:80, marginBottom:8, lineHeight:1 }}>🔍</div>
        <h1 style={{ fontSize:72, fontWeight:900, color:'#4f46e5', lineHeight:1, marginBottom:8 }}>404</h1>
        <h2 style={{ fontSize:24, fontWeight:700, color:'#1a1a2e', marginBottom:12 }}>Page Not Found</h2>
        <p style={{ color:'#6b7280', fontSize:15, marginBottom:32 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
          <Link to="/"         className="btn btn-primary">🏠 Home</Link>
          <Link to="/explore"  className="btn btn-outline">🔍 Explore Surveys</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
