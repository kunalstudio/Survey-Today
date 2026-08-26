import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';

const FEATURES = [
  { icon: '⚡', title: 'Lightning Fast Builder', desc: 'Create complex multi-step surveys in seconds with 9 question types, linear scales, ratings, and smart logic.' },
  { icon: '🔗', title: 'Instant Global Sharing', desc: 'Publish with one click and share a direct link or embed code. Zero signup required for respondents.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Live response streams, dynamic bar and pie charts, completion rates, and instant CSV / JSON export.' },
  { icon: '🔒', title: 'Enterprise-Grade Security', desc: 'Fine-grained access controls, private surveys, rate-limiting, and one-response-per-user enforcement.' },
  { icon: '🎯', title: 'Smart Redirection & Logic', desc: 'Set expiry limits, custom completion messages, and instant redirect URLs after respondent submission.' },
  { icon: '🌐', title: 'Fully Responsive & Mobile-First', desc: 'Every survey and dashboard screen is tailored to render with perfection on any screen size.' },
];

const STEPS = [
  { num: '01', title: 'Define Your Survey', desc: 'Give your survey a title, optional description, and select privacy rules.' },
  { num: '02', title: 'Compose Questions', desc: 'Choose from 9 question types including MCQ, linear scale, star ratings, and dates.' },
  { num: '03', title: 'Publish & Distribute', desc: 'Hit publish and copy your unique link to start collecting live responses instantly.' },
  { num: '04', title: 'Analyze & Export', desc: 'Inspect real-time analytics, response distributions, and export data in CSV or JSON format.' },
];

const LandingPage = () => {
  useDocumentTitle('Build Surveys That People Actually Complete');
  const { isAuthenticated } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [voted, setVoted] = useState(false);

  const demoOptions = ['⭐⭐⭐⭐⭐ Outstanding Experience', '⭐⭐⭐⭐ Very Satisfied', '⭐⭐⭐ Good', '⭐⭐ Needs Improvement'];

  return (
    <div className="landing-page">
      {/* ── Top Announcement Bar (Render style) ────────────────── */}
      <div className="top-announcement-bar">
        <span className="announcement-badge">NEW</span>
        <span>Survey Today 2.0 is live — Build surveys at the speed of thought.</span>
        <Link to="/register">Get started free →</Link>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span style={{ fontSize: 22 }}>📋</span> Survey Today
        </div>
        <div className="landing-nav-links">
          <Link to="/explore" className="landing-nav-link">Explore</Link>
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How it works</a>
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

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span style={{ color: '#34d399' }}>●</span> Free forever · No credit card required
          </div>
          <h1 className="hero-title">
            Your fastest path to <br />
            <span className="hero-highlight">actionable feedback</span>
          </h1>
          <p className="hero-subtitle">
            Intuitive survey infrastructure to collect feedback, measure customer satisfaction, and extract deep insights from your first user to your millionth.
          </p>
          <div className="hero-cta">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn btn-render-white hero-btn">
              {isAuthenticated ? "Go to Dashboard →" : "Start for free →"}
            </Link>
            <Link to="/explore" className="btn btn-outline hero-btn">
              Explore Live Surveys
            </Link>
          </div>
          <div className="hero-social-proof">
            <span>✓ Instant link sharing</span>
            <span>✓ 9 question formats</span>
            <span>✓ Live Recharts analytics</span>
          </div>
        </div>

        {/* ── Render-style Visual Mockup Card ──────────────────── */}
        <div className="hero-visual">
          <div className="render-mockup">
            <div className="mockup-topbar">
              <div className="mockup-dots">
                <div className="mockup-dot red" />
                <div className="mockup-dot yellow" />
                <div className="mockup-dot green" />
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>survey-today // live-node</span>
              <span className="badge badge-active" style={{ fontSize: 9 }}>LIVE</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-terminal-line">
                <span style={{ color: '#10b981' }}>$</span> npx create-survey --live
              </div>

              {/* Stats overview in mockup */}
              <div className="mockup-card-grid">
                <div className="mockup-mini-card">
                  <div className="mockup-mini-label">TOTAL RESPONSES</div>
                  <div className="mockup-mini-val" style={{ color: '#38bdf8' }}>1,482</div>
                </div>
                <div className="mockup-mini-card">
                  <div className="mockup-mini-label">COMPLETION RATE</div>
                  <div className="mockup-mini-val" style={{ color: '#34d399' }}>94.2%</div>
                </div>
              </div>

              {/* Interactive preview question */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Customer Satisfaction Poll</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Question 1 of 4</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: voted ? '100%' : '50%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'width 0.4s' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', marginBottom: 10 }}>
                  How would you rate your product experience today?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {demoOptions.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => { setSelectedDemo(i); setVoted(true); }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: selectedDemo === i ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                        background: selectedDemo === i ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                        color: selectedDemo === i ? '#ffffff' : '#94a3b8',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        fontWeight: selectedDemo === i ? 600 : 400
                      }}
                    >
                      <span>{opt}</span>
                      {selectedDemo === i && <span style={{ color: '#a5b4fc', fontSize: 11 }}>✓ Selected</span>}
                    </div>
                  ))}
                </div>
                {voted && (
                  <div style={{ marginTop: 12, fontSize: 11, color: '#34d399', textAlign: 'center', fontWeight: 600 }}>
                    ⚡ Real-time response registered!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="section-label">Capabilities</div>
          <h2 className="section-title">Everything you need to collect & analyze data</h2>
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

      {/* ── How It Works Section ───────────────────────────────── */}
      <section id="how-it-works" className="landing-section landing-section-dark">
        <div className="landing-container">
          <div className="section-label">Workflow</div>
          <h2 className="section-title">Up and running in 4 simple steps</h2>
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

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="landing-cta">
        <div className="landing-container">
          <h2 className="cta-title">Ready to scale your feedback loop?</h2>
          <p className="cta-sub">
            Join thousands of teams crafting engaging surveys and uncovering deep user insights.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn btn-render-white hero-btn">
            {isAuthenticated ? "Open Dashboard →" : "Create Your First Survey Free →"}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 16 }}>
          <div className="landing-logo">
            <span style={{ fontSize: 20 }}>📋</span> Survey Today
          </div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} Survey Today. Built with precision on the MERN stack.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
