import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🛠', title: 'Easy Builder', desc: 'Drag-free question builder with 9 question types: multiple choice, ratings, scales, text, and more.' },
  { icon: '🔗', title: 'Instant Sharing', desc: 'Publish with one click and share a link. No account required for respondents.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time charts, completion rates, and CSV export. Understand your data instantly.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Control who can respond. Public or private surveys with one-response-per-user enforcement.' },
  { icon: '⚡', title: 'Blazing Fast', desc: 'Built on the MERN stack. Surveys load instantly, responses save in real time.' },
  { icon: '🎯', title: 'Smart Logic', desc: 'Set expiry dates, confirmation messages, and custom redirect URLs after submission.' },
];

const STEPS = [
  { num: '01', title: 'Create a Survey', desc: 'Give your survey a title and description in seconds.' },
  { num: '02', title: 'Add Questions', desc: 'Use the builder to add any question type you need.' },
  { num: '03', title: 'Publish & Share', desc: 'Hit publish and share the link with anyone.' },
  { num: '04', title: 'Analyze Results', desc: 'View charts and export responses as CSV.' },
];

const LandingPage = () => (
  <div className="landing-page">
    {/* Nav */}
    <nav className="landing-nav">
      <div className="landing-logo">📋 SurveyOS</div>
      <div className="landing-nav-links">
        <Link to="/explore" className="landing-nav-link">Explore</Link>
        <Link to="/login"    className="btn btn-ghost btn-sm">Log In</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">✨ Free · No credit card required</div>
        <h1 className="hero-title">
          Build surveys that<br />
          <span className="hero-highlight">people actually complete</span>
        </h1>
        <p className="hero-subtitle">
          Create beautiful surveys in minutes. Share instantly. Get real-time insights with charts and CSV exports.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary hero-btn">Start Building Free →</Link>
          <Link to="/explore"  className="btn btn-outline hero-btn">Browse Surveys</Link>
        </div>
        <div className="hero-social-proof">
          <span>✓ No signup needed to respond</span>
          <span>✓ 9 question types</span>
          <span>✓ Real-time analytics</span>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-card-mockup">
          <div className="mock-header"><div className="mock-dot red" /><div className="mock-dot yellow" /><div className="mock-dot green" /></div>
          <div className="mock-title">Customer Satisfaction Survey</div>
          <div className="mock-progress"><div className="mock-progress-fill" /></div>
          <div className="mock-question">How would you rate your experience?</div>
          <div className="mock-options">
            {['⭐⭐⭐⭐⭐ Excellent','⭐⭐⭐⭐ Good','⭐⭐⭐ Average'].map((opt,i) => (
              <div key={i} className={`mock-option ${i===0?'mock-option-selected':''}`}>{opt}</div>
            ))}
          </div>
          <div className="mock-btn">Next →</div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="landing-section">
      <div className="landing-container">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything you need to collect feedback</h2>
        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="landing-section landing-section-dark">
      <div className="landing-container">
        <div className="section-label">How it works</div>
        <h2 className="section-title" style={{color:'white'}}>Up and running in 4 steps</h2>
        <div className="steps-grid">
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="step-card">
              <div className="step-num">{num}</div>
              <h3 className="step-title">{title}</h3>
              <p className="step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="landing-cta">
      <div className="landing-container" style={{textAlign:'center'}}>
        <h2 className="cta-title">Ready to get started?</h2>
        <p className="cta-sub">Create your first survey in under 2 minutes. It's free.</p>
        <Link to="/register" className="btn btn-primary hero-btn">Create Your Survey →</Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="landing-footer">
      <div className="landing-container">
        <span className="landing-logo">📋 SurveyOS</span>
        <span className="text-muted">© {new Date().getFullYear()} SurveyOS · Built with ❤ on MERN</span>
      </div>
    </footer>
  </div>
);

export default LandingPage;
