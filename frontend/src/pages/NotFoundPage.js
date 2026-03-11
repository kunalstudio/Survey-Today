import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
    <h1 style={{ fontSize: 48 }}>404</h1>
    <p style={{ fontSize: 18, marginBottom: 24 }}>Page not found.</p>
    <Link to="/" className="btn btn-primary">Go home</Link>
  </div>
);

export default NotFoundPage;
