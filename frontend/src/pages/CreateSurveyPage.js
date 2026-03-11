import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyAPI } from '../api';

const CreateSurveyPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await surveyAPI.create(form);
      // go to builder after creation
      navigate(`/surveys/${data.survey._id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Create Survey</h1>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn-primary">{loading ? 'Creating...' : 'Create'}</button>
      </form>
    </div>
  );
};

export default CreateSurveyPage;
