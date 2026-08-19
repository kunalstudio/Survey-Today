import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSurvey, useDocumentTitle } from '../hooks';

const SurveyDetailPage = () => {
  const { id } = useParams();
  const { survey, loading, error } = useSurvey(id);
  useDocumentTitle(survey ? survey.title : 'Survey');

  if (loading) return <div className="loading-screen">Loading survey…</div>;
  if (error)   return (
    <div className="error-page">
      <div style={{fontSize:48, marginBottom:16}}>😕</div>
      <h2>Survey not available</h2>
      <p>{error}</p>
      <Link to="/explore" className="btn btn-outline" style={{marginTop:20}}>Browse other surveys</Link>
    </div>
  );
  if (!survey) return null;

  const isAvailable = survey.status === 'active';
  const isClosed    = survey.status === 'closed';

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f5f3ff,#ede9fe,#dbeafe)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <div style={{ background:'white', borderRadius:16, padding:'40px', maxWidth:600, width:'100%', boxShadow:'0 20px 60px rgba(79,70,229,0.12)' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <span className={`badge badge-${survey.status}`} style={{ marginBottom:12, display:'inline-block' }}>{survey.status}</span>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#1a1a2e', marginBottom:10, lineHeight:1.3 }}>{survey.title}</h1>
          {survey.description && (
            <p style={{ color:'#6b7280', fontSize:15, lineHeight:1.6 }}>{survey.description}</p>
          )}
        </div>

        {/* Meta info */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28, padding:'14px 0', borderTop:'1px solid #f3f4f6', borderBottom:'1px solid #f3f4f6' }}>
          {survey.creator && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#4f46e5', color:'white', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {survey.creator.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:13, color:'#374151' }}>by {survey.creator.name}</span>
            </div>
          )}
          <span style={{ fontSize:13, color:'#6b7280' }}>❓ {survey.questions?.length || 0} questions</span>
          <span style={{ fontSize:13, color:'#6b7280' }}>📊 {survey.stats?.totalResponses || 0} responses</span>
          {survey.settings?.allowAnonymous && <span style={{ fontSize:13, color:'#6b7280' }}>👤 Anonymous allowed</span>}
        </div>

        {/* CTA */}
        {isAvailable ? (
          <div style={{ textAlign:'center' }}>
            <Link to={`/surveys/${survey._id}/respond`} className="btn btn-primary" style={{ padding:'14px 40px', fontSize:16 }}>
              🚀 Start Survey →
            </Link>
            <p style={{ fontSize:12, color:'#9ca3af', marginTop:12 }}>Takes about 2–5 minutes</p>
          </div>
        ) : isClosed ? (
          <div className="alert alert-warning" style={{ textAlign:'center' }}>
            🔒 This survey is closed and no longer accepting responses.
          </div>
        ) : (
          <div className="alert alert-warning" style={{ textAlign:'center' }}>
            ⏸ This survey is not currently active.
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:20 }}>
          <Link to="/explore" style={{ fontSize:13, color:'#9ca3af' }}>← Browse other surveys</Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetailPage;
