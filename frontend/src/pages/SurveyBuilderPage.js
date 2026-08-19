import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSurvey, useDocumentTitle } from '../hooks';
import { surveyAPI } from '../api';

const QUESTION_TYPES = [
  { type: 'short_text',      label: 'Short Text',      icon: '✏️', desc: 'Single line answer' },
  { type: 'long_text',       label: 'Long Text',       icon: '📝', desc: 'Paragraph answer' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: '◉',  desc: 'Pick one option' },
  { type: 'checkbox',        label: 'Checkboxes',      icon: '☑',  desc: 'Pick multiple' },
  { type: 'dropdown',        label: 'Dropdown',        icon: '▼',  desc: 'Select from list' },
  { type: 'scale',           label: 'Linear Scale',    icon: '↔',  desc: 'Numeric scale' },
  { type: 'rating',          label: 'Rating',          icon: '⭐', desc: 'Star rating' },
  { type: 'yes_no',          label: 'Yes / No',        icon: '✓✗', desc: 'Simple yes or no' },
  { type: 'date',            label: 'Date',            icon: '📅', desc: 'Date picker' },
];

const hasOptions = (type) => ['multiple_choice', 'checkbox', 'dropdown'].includes(type);
const hasScale  = (type) => ['scale', 'rating'].includes(type);

const SurveyBuilderPage = () => {
  const { id } = useParams();
  const { survey, setSurvey, loading, error } = useSurvey(id);
  useDocumentTitle(survey ? `Builder — ${survey.title}` : 'Survey Builder');

  const [activeTab,     setActiveTab]     = useState('questions');
  const [showModal,     setShowModal]     = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [editForm,      setEditForm]      = useState({});
  const [settingsForm,  setSettingsForm]  = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [flash,         setFlash]         = useState('');

  // Fix #7: track which survey id the settingsForm was initialized for,
  // so navigating to a different survey resets the form correctly.
  const settingsSurveyId = useRef(null);

  const showFlash = useCallback((msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 3000);
  }, []);

  // Init (or re-init) settings form when survey loads or survey id changes
  useEffect(() => {
    if (survey && settingsSurveyId.current !== survey._id) {
      settingsSurveyId.current = survey._id;
      setSettingsForm({
        title:       survey.title || '',
        description: survey.description || '',
        expiresAt:   survey.expiresAt ? new Date(survey.expiresAt).toISOString().split('T')[0] : '',
        settings:    { ...survey.settings },
      });
    }
  }, [survey]);

  // ── Question actions ──────────────────────────────────────────
  const handleAddQuestion = async (type) => {
    setShowModal(false);
    setSaving(true);
    try {
      const defaultQ = {
        type, text: 'Untitled Question', description: '', required: false,
        options: hasOptions(type) ? [{ text: 'Option 1' }, { text: 'Option 2' }] : [],
        scaleMin: 1, scaleMax: 10, scaleMinLabel: '', scaleMaxLabel: '',
      };
      const { data } = await surveyAPI.addQuestion(id, defaultQ);
      setSurvey(prev => ({ ...prev, questions: data.questions }));
      const newQ = data.questions[data.questions.length - 1];
      setEditingId(newQ._id);
      setEditForm({ ...newQ, options: newQ.options?.map(o => ({ ...o })) || [] });
    } catch (err) { showFlash(err.response?.data?.message || 'Failed to add question'); }
    finally { setSaving(false); }
  };

  const startEdit  = (q) => { setEditingId(q._id); setEditForm({ ...q, options: q.options?.map(o => ({ ...o })) || [] }); };
  const cancelEdit = ()  => { setEditingId(null); setEditForm({}); };

  const saveQuestion = async () => {
    setSaving(true);
    try {
      const { data } = await surveyAPI.updateQuestion(id, editingId, editForm);
      setSurvey(prev => ({ ...prev, questions: data.questions }));
      setEditingId(null);
      showFlash('✅ Question saved');
    } catch (err) { showFlash(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (qid) => {
    if (!window.confirm('Delete this question?')) return;
    setSaving(true);
    try {
      const { data } = await surveyAPI.deleteQuestion(id, qid);
      setSurvey(prev => ({ ...prev, questions: data.questions }));
      if (editingId === qid) cancelEdit();
      showFlash('Question deleted');
    } catch (err) { showFlash(err.response?.data?.message || 'Failed to delete'); }
    finally { setSaving(false); }
  };

  // ── Option helpers ────────────────────────────────────────────
  const addOption    = () => setEditForm(p => ({ ...p, options: [...(p.options||[]), { text: `Option ${(p.options?.length||0)+1}` }] }));
  const updateOption = (i, text) => setEditForm(p => ({ ...p, options: p.options.map((o,j) => j===i ? {...o,text} : o) }));
  const removeOption = (i) => setEditForm(p => ({ ...p, options: p.options.filter((_,j) => j!==i) }));

  // ── Survey-level actions ──────────────────────────────────────
  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data } = await surveyAPI.update(id, {
        title: settingsForm.title, description: settingsForm.description,
        settings: settingsForm.settings,
        expiresAt: settingsForm.expiresAt || null,
      });
      setSurvey(data.survey);
      showFlash('✅ Settings saved');
    } catch (err) { showFlash(err.response?.data?.message || 'Failed to save settings'); }
    finally { setSaving(false); }
  };

  const publishSurvey = async () => {
    setSaving(true);
    try {
      const { data } = await surveyAPI.publish(id);
      setSurvey(data.survey);
      showFlash('🎉 Survey is now live!');
    } catch (err) { showFlash(err.response?.data?.message || 'Failed to publish'); }
    finally { setSaving(false); }
  };

  const closeSurvey = async () => {
    if (!window.confirm('Close this survey? It will stop accepting responses.')) return;
    setSaving(true);
    try {
      const { data } = await surveyAPI.close(id);
      setSurvey(data.survey);
      showFlash('Survey closed');
    } catch (err) { showFlash(err.response?.data?.message || 'Failed to close'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-screen">Loading builder…</div>;
  if (error)   return <div className="error-page"><h2>Error</h2><p>{error}</p></div>;
  if (!survey) return null;

  const questions  = [...(survey.questions || [])].sort((a,b) => a.order - b.order);
  const shareUrl   = `${window.location.origin}/surveys/${survey._id}/respond`;
  const isDraft    = survey.status === 'draft';
  const isActive   = survey.status === 'active';

  return (
    <div className="builder-page">

      {/* ── Top Bar ── */}
      <div className="builder-topbar">
        <div className="builder-breadcrumb">
          <Link to="/surveys" className="breadcrumb-link">My Surveys</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{survey.title}</span>
          <span className={`badge badge-${survey.status}`} style={{ marginLeft: 10 }}>{survey.status}</span>
        </div>
        <div className="builder-topbar-actions">
          {flash && <span className="flash-msg">{flash}</span>}
          {isDraft && (
            <button className="btn btn-primary" onClick={publishSurvey}
              disabled={saving || questions.length === 0}
              title={questions.length === 0 ? 'Add at least one question first' : ''}>
              🚀 Publish
            </button>
          )}
          {isActive && (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard.writeText(shareUrl); showFlash('📋 Link copied!'); }}>
                📋 Copy Share Link
              </button>
              <button className="btn btn-danger btn-sm" onClick={closeSurvey} disabled={saving}>Close Survey</button>
            </>
          )}
          <Link to={`/surveys/${id}/analytics`}  className="btn btn-outline btn-sm">📊 Analytics</Link>
          <Link to={`/surveys/${id}/responses`}  className="btn btn-outline btn-sm">📋 Responses</Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="builder-tabs">
        <button className={`builder-tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
          Questions ({questions.length})
        </button>
        <button className={`builder-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          ⚙ Settings
        </button>
        {isActive && (
          <div className="share-hint">
            🔗 <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
          </div>
        )}
      </div>

      {/* ── Questions Tab ── */}
      {activeTab === 'questions' && (
        <div className="builder-questions">
          {questions.length === 0 && (
            <div className="empty-state">
              <p>No questions yet. Add your first question below.</p>
            </div>
          )}

          {questions.map((q, idx) => (
            <div key={q._id} className={`qcard ${editingId === q._id ? 'qcard-editing' : ''}`}>
              {/* Question header */}
              <div className="qcard-header">
                <div className="qcard-meta">
                  <span className="qcard-num">Q{idx + 1}</span>
                  <span className="qtype-badge">{QUESTION_TYPES.find(t => t.type === q.type)?.label || q.type}</span>
                  {q.required && <span className="req-badge">Required</span>}
                </div>
                <div className="qcard-actions">
                  {isDraft && (
                    <>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => editingId === q._id ? cancelEdit() : startEdit(q)}
                        aria-label={editingId === q._id ? 'Cancel editing question' : `Edit question ${idx + 1}`}
                      >
                        {editingId === q._id ? 'Cancel' : '✏ Edit'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteQuestion(q._id)}
                        disabled={saving}
                        aria-label={`Delete question ${idx + 1}`}
                      >✕</button>
                    </>
                  )}
                </div>
              </div>
              <div className="qcard-text">{q.text}</div>
              {q.description && <div className="qcard-desc">{q.description}</div>}
              {q.options?.length > 0 && (
                <div className="qcard-options">
                  {q.options.map((o,i) => <span key={o._id || i} className="qcard-option-pill">{o.text}</span>)}
                </div>
              )}
              {hasScale(q.type) && (
                <div className="qcard-desc">Scale: {q.scaleMin} → {q.scaleMax}{q.scaleMinLabel ? ` (${q.scaleMinLabel} to ${q.scaleMaxLabel})` : ''}</div>
              )}

              {/* ── Inline Edit Form ── */}
              {editingId === q._id && (
                <div className="qcard-edit-form">
                  <div className="form-group">
                    <label>Question Text *</label>
                    <input value={editForm.text || ''} onChange={e => setEditForm(p => ({...p, text: e.target.value}))} className="form-input" placeholder="Enter question text…" />
                  </div>
                  <div className="form-group">
                    <label>Description (optional)</label>
                    <input value={editForm.description || ''} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} className="form-input" placeholder="Add hint or context…" />
                  </div>
                  <label className="toggle-row">
                    <div><div className="toggle-label">Required</div><div className="toggle-desc">Respondents must answer this question</div></div>
                    <div className="toggle-switch">
                      <input type="checkbox" checked={editForm.required || false} onChange={e => setEditForm(p => ({...p, required: e.target.checked}))} />
                      <span className="toggle-knob" />
                    </div>
                  </label>

                  {hasOptions(editForm.type) && (
                    <div className="form-group">
                      <label>Options</label>
                      {(editForm.options || []).map((opt, i) => (
                        <div key={i} className="option-edit-row">
                          <input value={opt.text} onChange={e => updateOption(i, e.target.value)} className="form-input" placeholder={`Option ${i+1}`} />
                          <button className="btn btn-sm btn-ghost" onClick={() => removeOption(i)} aria-label={`Remove option ${i+1}`}>✕</button>
                        </div>
                      ))}
                      <button className="btn btn-sm btn-outline" onClick={addOption} style={{marginTop:8}}>+ Add Option</button>
                    </div>
                  )}

                  {hasScale(editForm.type) && (
                    <div className="scale-config">
                      <div className="scale-config-row">
                        <div className="form-group"><label>Min value</label><input type="number" value={editForm.scaleMin ?? 1} onChange={e => setEditForm(p=>({...p,scaleMin:Number(e.target.value)}))} className="form-input" style={{width:80}} /></div>
                        <div className="form-group"><label>Min label</label><input value={editForm.scaleMinLabel || ''} onChange={e => setEditForm(p=>({...p,scaleMinLabel:e.target.value}))} className="form-input" placeholder="e.g. Not at all" /></div>
                      </div>
                      <div className="scale-config-row">
                        <div className="form-group"><label>Max value</label><input type="number" value={editForm.scaleMax ?? 10} onChange={e => setEditForm(p=>({...p,scaleMax:Number(e.target.value)}))} className="form-input" style={{width:80}} /></div>
                        <div className="form-group"><label>Max label</label><input value={editForm.scaleMaxLabel || ''} onChange={e => setEditForm(p=>({...p,scaleMaxLabel:e.target.value}))} className="form-input" placeholder="e.g. Absolutely" /></div>
                      </div>
                    </div>
                  )}

                  <div style={{display:'flex', gap:8, marginTop:12}}>
                    <button className="btn btn-primary" onClick={saveQuestion} disabled={saving}>{saving ? 'Saving…' : '✅ Save Question'}</button>
                    <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isDraft && (
            <button className="add-question-btn" onClick={() => setShowModal(true)} disabled={saving}>
              + Add Question
            </button>
          )}
          {!isDraft && (
            <div className="alert alert-warning" style={{marginTop:16}}>
              This survey is <strong>{survey.status}</strong>. Questions can only be edited in draft mode.
            </div>
          )}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && settingsForm && (
        <div className="builder-settings">
          <div className="settings-section">
            <h3>Survey Details</h3>
            <div className="form-group">
              <label>Title</label>
              <input value={settingsForm.title} onChange={e => setSettingsForm(p=>({...p,title:e.target.value}))} className="form-input" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={settingsForm.description} onChange={e => setSettingsForm(p=>({...p,description:e.target.value}))} className="form-input" rows={3} />
            </div>
          </div>

          <div className="settings-section">
            <h3>Access & Visibility</h3>
            {[
              { key:'isPublic',           label:'Public Survey',          desc:'Anyone can find and take this survey' },
              { key:'allowAnonymous',      label:'Allow Anonymous',         desc:"Respondents don't need to log in" },
              { key:'oneResponsePerUser',  label:'One Response Per User',   desc:'Logged-in users can only respond once' },
              { key:'showProgressBar',     label:'Show Progress Bar',       desc:'Show progress while taking the survey' },
              { key:'shuffleQuestions',    label:'Shuffle Questions',       desc:'Randomize question order for each respondent' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="toggle-row">
                <div><div className="toggle-label">{label}</div><div className="toggle-desc">{desc}</div></div>
                <div className="toggle-switch">
                  <input type="checkbox" checked={settingsForm.settings[key] || false}
                    onChange={e => setSettingsForm(p=>({...p, settings:{...p.settings,[key]:e.target.checked}}))} />
                  <span className="toggle-knob" />
                </div>
              </label>
            ))}
          </div>

          <div className="settings-section">
            <h3>Completion</h3>
            <div className="form-group">
              <label>Confirmation Message</label>
              <textarea value={settingsForm.settings.confirmationMessage || ''} rows={2}
                onChange={e => setSettingsForm(p=>({...p,settings:{...p.settings,confirmationMessage:e.target.value}}))}
                className="form-input" />
            </div>
            <div className="form-group">
              <label>Redirect URL (optional)</label>
              <input value={settingsForm.settings.redirectUrl || ''}
                onChange={e => setSettingsForm(p=>({...p,settings:{...p.settings,redirectUrl:e.target.value}}))}
                className="form-input" placeholder="https://…" />
            </div>
            <div className="form-group">
              <label>Expires On (optional)</label>
              <input type="date" value={settingsForm.expiresAt || ''}
                onChange={e => setSettingsForm(p=>({...p,expiresAt:e.target.value}))}
                className="form-input" />
            </div>
          </div>

          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* ── Type Picker Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Choose Question Type</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>
            </div>
            <div className="type-grid">
              {QUESTION_TYPES.map(({ type, label, icon, desc }) => (
                <button key={type} className="type-btn" onClick={() => handleAddQuestion(type)}>
                  <span className="type-icon">{icon}</span>
                  <span className="type-label">{label}</span>
                  <span className="type-desc">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBuilderPage;
