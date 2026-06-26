import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach token ───────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — auto refresh token ────────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(original);
      } catch {
        // Refresh failed — log out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post('/auth/reset-password', { token, password }),
};

// ─── Surveys ──────────────────────────────────────────────────
export const surveyAPI = {
  getAll: (params) => API.get('/surveys', { params }),
  getOne: (id) => API.get(`/surveys/${id}`),
  create: (data) => API.post('/surveys', data),
  update: (id, data) => API.put(`/surveys/${id}`, data),
  delete: (id) => API.delete(`/surveys/${id}`),
  publish: (id) => API.patch(`/surveys/${id}/publish`),
  close: (id) => API.patch(`/surveys/${id}/close`),
  archive: (id) => API.patch(`/surveys/${id}/archive`),
  duplicate: (id) => API.post(`/surveys/${id}/duplicate`),

  addQuestion: (surveyId, data) => API.post(`/surveys/${surveyId}/questions`, data),
  updateQuestion: (surveyId, questionId, data) => API.put(`/surveys/${surveyId}/questions/${questionId}`, data),
  deleteQuestion: (surveyId, questionId) => API.delete(`/surveys/${surveyId}/questions/${questionId}`),
  reorderQuestions: (surveyId, orderedIds) => API.patch(`/surveys/${surveyId}/questions/reorder`, { orderedIds }),
};

// ─── Responses ────────────────────────────────────────────────
export const responseAPI = {
  start: (surveyId) => API.post(`/surveys/${surveyId}/responses/start`),
  saveAnswers: (surveyId, responseId, answers, sessionToken) =>
    API.patch(`/surveys/${surveyId}/responses/${responseId}/answers`, { answers }, {
      headers: { 'x-session-token': sessionToken },
    }),
  submit: (surveyId, responseId, answers, sessionToken) =>
    API.post(`/surveys/${surveyId}/responses/${responseId}/submit`, { answers }, {
      headers: { 'x-session-token': sessionToken },
    }),
  abandon: (surveyId, responseId, sessionToken) =>
    API.patch(`/surveys/${surveyId}/responses/${responseId}/abandon`, {}, {
      headers: { 'x-session-token': sessionToken },
    }),
  getAll: (surveyId, params) => API.get(`/surveys/${surveyId}/responses`, { params }),
  delete: (surveyId, responseId) => API.delete(`/surveys/${surveyId}/responses/${responseId}`),
};

// ─── Analytics ────────────────────────────────────────────────
export const analyticsAPI = {
  summary: (surveyId) => API.get(`/surveys/${surveyId}/analytics/summary`),
  questions: (surveyId) => API.get(`/surveys/${surveyId}/analytics/questions`),
  exportCSV: (surveyId) => API.get(`/surveys/${surveyId}/analytics/export`, { responseType: 'blob' }),
  exportJSON: (surveyId) => API.get(`/surveys/${surveyId}/analytics/export-json`),
};

// ─── Users ────────────────────────────────────────────────────
export const userAPI = {
  getMySurveys: () => API.get('/users/me/surveys'),
  getMyResponses: () => API.get('/users/me/responses'),
  updateProfile: (data) => API.patch('/users/me', data),
  deleteAccount: () => API.delete('/users/me'),
};

export default API;

