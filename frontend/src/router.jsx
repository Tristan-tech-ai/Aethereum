import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder components
const Dashboard = () => <div className="p-8"><h1>Dashboard</h1><p>Welcome to Aethereum.</p></div>;
const Profile = () => <div className="p-8"><h1>Profile</h1></div>;
const Explore = () => <div className="p-8"><h1>Explore</h1></div>;
const NotFound = () => <div className="p-8"><h1>404 - Not Found</h1></div>;

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="explore" element={<Explore />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
