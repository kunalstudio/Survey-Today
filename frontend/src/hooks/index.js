import { useState, useEffect, useCallback, useRef } from 'react';
import { surveyAPI, responseAPI, analyticsAPI } from '../api';

// ─── useDebounce: delay a value update until typing stops ─────
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ─── useSurveys: fetch paginated surveys ──────────────────────
export const useSurveys = (params = {}) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await surveyAPI.getAll(params);
      setSurveys(data.surveys);
      setPagination({
        total: data.total,
        pages: data.pages,
        currentPage: data.currentPage,
        hasNextPage: data.hasNextPage,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchSurveys(); }, [fetchSurveys]);

  return { surveys, loading, error, pagination, refetch: fetchSurveys };
};

// ─── useInfiniteSurveys: paginated with load-more ─────────────
export const useInfiniteSurveys = (params = {}) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [total, setTotal] = useState(0);

  // When search/sort params change reset to page 1
  const paramsKey = JSON.stringify(params);
  const prevParamsKey = useRef(paramsKey);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      setError(null);
      const { data } = await surveyAPI.getAll({ ...params, page: pageNum, limit: 12 });
      setSurveys((prev) => reset ? data.surveys : [...prev, ...data.surveys]);
      setHasNextPage(data.hasNextPage);
      setTotal(data.total);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isReset = prevParamsKey.current !== paramsKey;
    prevParamsKey.current = paramsKey;
    fetchPage(1, true);
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) fetchPage(page + 1, false);
  }, [page, hasNextPage, loadingMore, fetchPage]);

  return { surveys, loading, loadingMore, error, hasNextPage, total, loadMore };
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

  const downloadJSON = async () => {
    const { data } = await analyticsAPI.exportJSON(surveyId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey-${surveyId}-responses.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return { summary, questionData, loading, error, downloadCSV, downloadJSON };
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

  const abandon = useCallback(async () => {
    if (!responseId || !sessionToken || submitted) return;
    try {
      await responseAPI.abandon(surveyId, responseId, sessionToken);
    } catch {
      // Best-effort — don't surface errors for abandon
    }
  }, [surveyId, responseId, sessionToken, submitted]);

  return {
    responseId, sessionToken, answers, currentIndex, setCurrentIndex,
    submitted, loading, error, start, setAnswer, submit, abandon,
  };
};
