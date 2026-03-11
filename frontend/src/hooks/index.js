import { useState, useEffect, useCallback } from 'react';
import { surveyAPI, responseAPI, analyticsAPI } from '../api';

// ─── useSurveys: fetch paginated surveys ──────────────────────
export const useSurveys = (params = {}) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await surveyAPI.getAll(params);
      setSurveys(data.surveys);
      setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchSurveys(); }, [fetchSurveys]);

  return { surveys, loading, error, pagination, refetch: fetchSurveys };
};

// ─── useSurvey: fetch a single survey ────────────────────────
export const useSurvey = (id) => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    surveyAPI.getOne(id)
      .then(({ data }) => setSurvey(data.survey))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load survey'))
      .finally(() => setLoading(false));
  }, [id]);

  return { survey, setSurvey, loading, error };
};

// ─── useAnalytics: survey analytics ──────────────────────────
export const useAnalytics = (surveyId) => {
  const [summary, setSummary] = useState(null);
  const [questionData, setQuestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!surveyId) return;
    Promise.all([analyticsAPI.summary(surveyId), analyticsAPI.questions(surveyId)])
      .then(([sumRes, qRes]) => {
        setSummary(sumRes.data.summary);
        setQuestionData(qRes.data.analytics);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [surveyId]);

  const downloadCSV = async () => {
    const { data } = await analyticsAPI.exportCSV(surveyId);
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey-${surveyId}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return { summary, questionData, loading, error, downloadCSV };
};

// ─── useSurveyResponse: manage taking a survey ───────────────
export const useSurveyResponse = (surveyId) => {
  const [responseId, setResponseId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await responseAPI.start(surveyId);
      setResponseId(data.responseId);
      setSessionToken(data.sessionToken);
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!responseId || !sessionToken) return;
    setLoading(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({ questionId, value }));
      const { data } = await responseAPI.submit(surveyId, responseId, answersArray, sessionToken);
      setSubmitted(true);
      return data;
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [surveyId, responseId, sessionToken, answers]);

  return {
    responseId, sessionToken, answers, currentIndex, setCurrentIndex,
    submitted, loading, error, start, setAnswer, submit,
  };
};
