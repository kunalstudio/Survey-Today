import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ─── Pages that exist ─────────────────────────────────────────
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TakeSurveyPage from './pages/TakeSurveyPage';
import MainLayout from './components/layout/MainLayout';

// ─── Placeholder for pages not built yet ─────────────────────
const PH = ({ name }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'monospace', background: '#f5f0e8'
  }}>
    <div style={{
      background: 'white', border: '2px solid #0f0e0c',
      borderRadius: 8, padding: '40px 60px', textAlign: 'center'
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>{name}</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>This page is coming soon.</p>
      <a href="/dashboard" style={{
        padding: '10px 24px', background: '#0f0e0c', color: 'white',
        textDecoration: 'none', borderRadius: 4, fontSize: 13
      }}>← Dashboard</a>
    </div>
  </div>
);

const LandingPage         = () => <PH name="Landing Page" />;
const RegisterPage        = () => <PH name="Register" />;
const ForgotPasswordPage  = () => <PH name="Forgot Password" />;
const ResetPasswordPage   = () => <PH name="Reset Password" />;
const SurveysListPage     = () => <PH name="My Surveys" />;
const CreateSurveyPage    = () => <PH name="Create Survey" />;
const SurveyBuilderPage   = () => <PH name="Survey Builder" />;
const SurveyDetailPage    = () => <PH name="Survey Detail" />;
const SurveyResponsesPage = () => <PH name="Responses" />;
const AnalyticsPage       = () => <PH name="Analytics" />;
const ExplorePage         = () => <PH name="Explore" />;
const ProfilePage         = () => <PH name="Profile" />;
const NotFoundPage        = () => <PH name="404 — Not Found" />;

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
    <Route path="/surveys/:id"    element={<SurveyDetailPage />} />
    <Route path="/surveys/:id/respond" element={<TakeSurveyPage />} />

    {/* Unauthenticated only */}
    <Route path="/login"          element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register"       element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
    <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />

    {/* Private — wrapped in sidebar layout */}
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