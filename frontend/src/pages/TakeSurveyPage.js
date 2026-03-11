import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useSurveyResponse } from '../hooks';

const TakeSurveyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { survey, loading: surveyLoading, error: surveyError } = useSurvey(id);
  const {
    responseId, answers, currentIndex, setCurrentIndex,
    submitted, loading, error, start, setAnswer, submit,
  } = useSurveyResponse(id);

  const [started, setStarted] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    if (survey && !responseId) {
      start().then(() => setStarted(true));
    }
  }, [survey]);

  if (surveyLoading) return <div className="loading-screen">Loading survey...</div>;
  if (surveyError) return <div className="error-page"><h2>Survey not available</h2><p>{surveyError}</p></div>;
  if (!survey) return null;

  if (submitted) {
    return (
      <div className="survey-complete">
        <div className="complete-icon">✓</div>
        <h2>Thank you!</h2>
        <p>{confirmMessage || survey.settings?.confirmationMessage}</p>
        <button className="btn btn-outline" onClick={() => navigate('/explore')}>
          Explore more surveys
        </button>
      </div>
    );
  }

  const questions = survey.questions?.sort((a, b) => a.order - b.order) || [];
  const currentQuestion = questions[currentIndex];
  const progress = Math.round(((currentIndex) / questions.length) * 100);
  const isLast = currentIndex === questions.length - 1;

  const handleNext = () => {
    if (currentQuestion.required && !answers[currentQuestion._id]) {
      alert('This question is required.');
      return;
    }
    if (isLast) {
      submit().then((data) => {
        if (data) setConfirmMessage(data.message);
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
        return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="form-input" placeholder="Your answer..." />;

      case 'long_text':
        return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="form-textarea" placeholder="Your answer..." rows={5} />;

      case 'multiple_choice':
      case 'dropdown':
        return (
          <div className="options-list">
            {question.options.map((opt) => (
              <label key={opt._id} className={`option ${value === opt.text ? 'selected' : ''}`}>
                <input type="radio" name={question._id} value={opt.text}
                  checked={value === opt.text} onChange={() => onChange(opt.text)} />
                {opt.text}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="options-list">
            {question.options.map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt.text);
              return (
                <label key={opt._id} className={`option ${checked ? 'selected' : ''}`}>
                  <input type="checkbox" value={opt.text} checked={checked}
                    onChange={(e) => {
                      const arr = Array.isArray(value) ? [...value] : [];
                      onChange(e.target.checked ? [...arr, opt.text] : arr.filter((v) => v !== opt.text));
                    }} />
                  {opt.text}
                </label>
              );
            })}
          </div>
        );

      case 'scale':
      case 'rating':
        return (
          <div className="scale-container">
            <div className="scale-labels"><span>{question.scaleMinLabel || question.scaleMin}</span><span>{question.scaleMaxLabel || question.scaleMax}</span></div>
            <div className="scale-buttons">
              {Array.from({ length: question.scaleMax - question.scaleMin + 1 }, (_, i) => question.scaleMin + i).map((n) => (
                <button key={n} className={`scale-btn ${Number(value) === n ? 'active' : ''}`} onClick={() => onChange(n)}>{n}</button>
              ))}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="yes-no-buttons">
            <button className={`yn-btn ${value === 'Yes' ? 'active' : ''}`} onClick={() => onChange('Yes')}>Yes</button>
            <button className={`yn-btn ${value === 'No' ? 'active' : ''}`} onClick={() => onChange('No')}>No</button>
          </div>
        );

      default:
        return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="form-input" />;
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

      {error && <div className="alert alert-error">{error}</div>}

      <div className="survey-nav">
        {currentIndex > 0 && (
          <button className="btn btn-outline" onClick={() => setCurrentIndex(currentIndex - 1)}>
            ← Back
          </button>
        )}
        <button className="btn btn-primary" onClick={handleNext} disabled={loading}>
          {loading ? 'Submitting...' : isLast ? 'Submit Survey' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default TakeSurveyPage;
