import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => (
  <div className="page" style={{ textAlign: 'center', padding: '80px 20px' }}>
    <h1 style={{ fontSize: 36, marginBottom: 16 }}>SurveyOS</h1>
    <p style={{ fontSize: 18, marginBottom: 32 }}>Build, share and analyze surveys with ease.</p>
    <div style={{ display: 'inline-flex', gap: '12px' }}>
      <Link to="/register" className="btn btn-primary">Get Started</Link>
      <Link to="/login" className="btn btn-outline">Log In</Link>
    </div>
  </div>
);

export default LandingPage;
