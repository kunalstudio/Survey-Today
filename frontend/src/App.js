import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ─── Pages that exist ─────────────────────────────────────────
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TakeSurveyPage from './pages/TakeSurveyPage';
import MainLayout from './components/layout/MainLayout';

// pages we just created
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SurveysListPage from './pages/SurveysListPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import SurveyDetailPage from './pages/SurveyDetailPage';
import SurveyResponsesPage from './pages/SurveyResponsesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// ─── Route Guards ─────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'monospace' }}>
      Loading...
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ─── Routes ───────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"               element={<LandingPage />} />
    <Route path="/explore"        element={<ExplorePage />} />

    {/* Unauthenticated only */}
    <Route path="/login"          element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register"       element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
    <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />

    {/* Survey take routes — public, must come before the private layout */}
    <Route path="/surveys/:id"         element={<SurveyDetailPage />} />
    <Route path="/surveys/:id/respond" element={<TakeSurveyPage />} />

    {/* Private — wrapped in sidebar layout.
        /surveys/new and /surveys/:id/edit are defined here FIRST so they are
        matched before the public /surveys/:id wildcard above. React Router v6
        picks the most-specific match, so these are safe. */}
    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
      <Route path="/dashboard"              element={<DashboardPage />} />
      <Route path="/surveys"                element={<SurveysListPage />} />
      <Route path="/surveys/new"            element={<CreateSurveyPage />} />
      <Route path="/surveys/:id/edit"       element={<SurveyBuilderPage />} />
      <Route path="/surveys/:id/analytics"  element={<AnalyticsPage />} />
      <Route path="/surveys/:id/responses"  element={<SurveyResponsesPage />} />
      <Route path="/profile"                element={<ProfilePage />} />
    </Route>

    {/* 404 */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;