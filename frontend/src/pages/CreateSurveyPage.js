import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyAPI } from '../api';
import { useDocumentTitle } from '../hooks';

const CreateSurveyPage = () => {
  useDocumentTitle('New Survey');
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ title: '', description: '', isPublic: false, allowAnonymous: true });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a survey title.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await surveyAPI.create({
        title:       form.title.trim(),
        description: form.description.trim(),
        settings: {
          isPublic:       form.isPublic,
          allowAnonymous: form.allowAnonymous,
        },
      });
      navigate(`/surveys/${data.survey._id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Create Survey</h1>
          <p className="text-muted">You will be taken to the interactive builder to add and arrange questions.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 580 }}>
        <div className="settings-section">
          <h3>Survey Overview</h3>
          <div className="form-group">
            <label htmlFor="title">Survey Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. Q3 Product Feedback Survey"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Briefly describe the context or purpose of this survey…"
              rows={3}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Access & Visibility</h3>
          <p className="text-muted" style={{ marginBottom: 14 }}>You can customize full security and completion parameters in builder settings anytime.</p>
          {[
            { key:'isPublic',       label:'Public Survey',    desc:'Make this survey discoverable in the public Explore directory' },
            { key:'allowAnonymous', label:'Allow Anonymous',  desc:'Respondents do not need to register or log in to answer' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="toggle-row">
              <div>
                <div className="toggle-label">{label}</div>
                <div className="toggle-desc">{desc}</div>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={e => setForm(p => ({...p, [key]: e.target.checked}))}
                />
                <span className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-render-white" disabled={loading || !form.title.trim()}>
            {loading ? 'Creating…' : 'Create & Open Builder →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurveyPage;
