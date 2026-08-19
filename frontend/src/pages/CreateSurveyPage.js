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
    setError('');
    setLoading(true);
    try {
      const { data } = await surveyAPI.create({
        title:       form.title,
        description: form.description,
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
          <p className="text-muted">You'll be taken to the builder to add questions after this step.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{maxWidth:520}}>
        <div className="settings-section">
          <h3>Survey Details</h3>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" type="text" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. Customer Satisfaction Survey" required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Tell respondents what this survey is about…" rows={3} />
          </div>
        </div>

        <div className="settings-section">
          <h3>Initial Settings</h3>
          <p className="text-muted" style={{marginBottom:12}}>You can change these later in the builder settings.</p>
          {[
            { key:'isPublic',       label:'Public Survey',    desc:'Anyone can find and take this survey' },
            { key:'allowAnonymous', label:'Allow Anonymous',  desc:"Respondents don't need to log in" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="toggle-row">
              <div><div className="toggle-label">{label}</div><div className="toggle-desc">{desc}</div></div>
              <div className="toggle-switch">
                <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.checked}))} />
                <span className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !form.title.trim()}>
          {loading ? 'Creating…' : 'Create & Open Builder →'}
        </button>
      </form>
    </div>
  );
};

export default CreateSurveyPage;
