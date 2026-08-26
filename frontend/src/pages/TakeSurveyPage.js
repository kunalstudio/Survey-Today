import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useSurveyResponse, useDocumentTitle } from '../hooks';

const TakeSurveyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { survey, loading: surveyLoading, error: surveyError } = useSurvey(id);
  const {
    responseId, answers, currentIndex, setCurrentIndex,
    submitted, loading, error, start, setAnswer, submit,
  } = useSurveyResponse(id);
  useDocumentTitle(survey ? survey.title : 'Take Survey');

  const [sessionStarting, setSessionStarting] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (survey && !responseId && !sessionStarting) {
      setSessionStarting(true);
      start().finally(() => setSessionStarting(false));
    }
  }, [survey, responseId, start, sessionStarting]);

  // Handle redirect timer if redirectUrl exists on submit
  useEffect(() => {
    if (submitted && redirectUrl) {
      setCountdown(4);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = redirectUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, redirectUrl]);

  if (surveyLoading) return <div className="loading-screen">Loading survey…</div>;
  if (surveyError) return <div className="error-page"><h2>Survey Not Available</h2><p>{surveyError}</p></div>;
  if (!survey) return null;

  if (sessionStarting || (!responseId && !surveyError)) {
    return <div className="loading-screen">Initializing secure survey session…</div>;
  }

  if (submitted) {
    return (
      <div className="survey-complete">
        <div className="complete-icon">✓</div>
        <h2>Thank you!</h2>
        <p>{confirmMessage || survey.settings?.confirmationMessage || 'Your response has been successfully recorded.'}</p>
        
        {redirectUrl && (
          <div style={{ marginBottom: 20, fontSize: 13, color: '#a5b4fc' }}>
            {countdown > 0 ? `Redirecting to partner site in ${countdown}s…` : 'Redirecting now…'}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {redirectUrl && (
            <a href={redirectUrl} className="btn btn-render-white">
              Continue to Destination →
            </a>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/explore')}>
            Explore More Surveys
          </button>
        </div>
      </div>
    );
  }

  const questions = survey.questions?.slice().sort((a, b) => a.order - b.order) || [];

  if (questions.length === 0) {
    return (
      <div className="survey-complete">
        <div className="complete-icon" style={{ fontSize: 44 }}>📋</div>
        <h2>No Questions in this Survey</h2>
        <p>The creator has not added any questions yet.</p>
        <button className="btn btn-outline" onClick={() => navigate('/explore')}>
          Browse Other Surveys
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isLast = currentIndex === questions.length - 1;

  const handleNext = () => {
    const answer = answers[currentQuestion._id];
    const isEmpty = answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0);
    if (currentQuestion.required && isEmpty) {
      alert('Please answer this required question to proceed.');
      return;
    }
    if (isLast) {
      submit().then((data) => {
        if (data) {
          setConfirmMessage(data.message || '');
          if (data.redirectUrl) setRedirectUrl(data.redirectUrl);
        }
      });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const renderQuestion = (question) => {
    const value = answers[question._id];
    const onChange = (val) => setAnswer(question._id, val);

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            placeholder="Type your response here…"
            autoFocus
          />
        );

      case 'long_text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-textarea"
            placeholder="Type detailed response here…"
            rows={5}
            autoFocus
          />
        );

      case 'multiple_choice':
        return (
          <div className="options-list">
            {question.options.map((opt) => (
              <label key={opt._id} className={`option ${value === opt.text ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={question._id}
                  value={opt.text}
                  checked={value === opt.text}
                  onChange={() => onChange(opt.text)}
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="form-input"
            >
              <option value="">-- Select an option --</option>
              {question.options.map((opt) => (
                <option key={opt._id} value={opt.text}>
                  {opt.text}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="options-list">
            {question.options.map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt.text);
              return (
                <label key={opt._id} className={`option ${checked ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    value={opt.text}
                    checked={checked}
                    onChange={(e) => {
                      const arr = Array.isArray(value) ? [...value] : [];
                      onChange(e.target.checked ? [...arr, opt.text] : arr.filter((v) => v !== opt.text));
                    }}
                  />
                  <span>{opt.text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'scale':
        const scaleCount = (question.scaleMax || 5) - (question.scaleMin || 1) + 1;
        return (
          <div className="scale-container">
            <div className="scale-labels">
              <span>{question.scaleMinLabel || question.scaleMin}</span>
              <span>{question.scaleMaxLabel || question.scaleMax}</span>
            </div>
            <div className="scale-buttons">
              {Array.from({ length: scaleCount }, (_, i) => (question.scaleMin || 1) + i).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`scale-btn ${Number(value) === n ? 'active' : ''}`}
                  onClick={() => onChange(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        );

      case 'rating':
        const starCount = (question.scaleMax || 5);
        return (
          <div style={{ textAlign: 'center' }}>
            <div className="rating-stars">
              {Array.from({ length: starCount }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${Number(value) >= star ? 'active' : ''}`}
                  onClick={() => onChange(star)}
                  aria-label={`${star} star rating`}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              {value ? `${value} of ${starCount} stars selected` : 'Select a rating'}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="yes-no-buttons">
            <button
              type="button"
              className={`yn-btn ${value === 'Yes' ? 'active' : ''}`}
              onClick={() => onChange('Yes')}
            >
              ✓ Yes
            </button>
            <button
              type="button"
              className={`yn-btn ${value === 'No' ? 'active' : ''}`}
              onClick={() => onChange('No')}
            >
              ✕ No
            </button>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            style={{ maxWidth: 280 }}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
          />
        );
    }
  };

  return (
    <div className="take-survey-page">
      <div className="survey-header">
        <h1>{survey.title}</h1>
        {survey.settings?.showProgressBar && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
        <p className="progress-text">Question {currentIndex + 1} of {questions.length}</p>
      </div>

      {currentQuestion && (
        <div className="question-card">
          <h2>{currentQuestion.text}</h2>
          {currentQuestion.description && <p className="question-desc">{currentQuestion.description}</p>}
          {currentQuestion.required && <span className="required-badge">Required</span>}
          <div className="question-input">{renderQuestion(currentQuestion)}</div>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ maxWidth: 680, width: '100%' }}>{error}</div>}

      <div className="survey-nav">
        {currentIndex > 0 && (
          <button className="btn btn-outline" onClick={() => setCurrentIndex(currentIndex - 1)}>
            ← Back
          </button>
        )}
        <button
          className="btn btn-render-white"
          onClick={handleNext}
          disabled={loading}
          style={{ marginLeft: currentIndex === 0 ? 'auto' : 0 }}
        >
          {loading ? 'Submitting…' : isLast ? 'Submit Survey ✓' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
};

export default TakeSurveyPage;
