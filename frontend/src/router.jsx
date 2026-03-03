import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

// Placeholder components
const Dashboard = () => <div className="p-8"><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-slate-400 mt-2">Welcome to Aethereum.</p></div>;
const Profile = () => <div className="p-8"><h1 className="text-2xl font-bold text-white">Profile</h1></div>;
const Explore = () => <div className="p-8"><h1 className="text-2xl font-bold text-white">Explore</h1></div>;
const NotFound = () => <div className="p-8"><h1 className="text-2xl font-bold text-white">404 - Not Found</h1></div>;

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="profile/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
          <Route path="explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />

          {/* Guest Routes (redirect to dashboard if already logged in) */}
          <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

          {/* Google OAuth callback (no guard — handles both cases) */}
          <Route path="auth/google/callback" element={<GoogleCallbackPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
