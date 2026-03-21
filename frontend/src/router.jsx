import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentDungeonPage from "./pages/DocumentDungeonPage";
import KnowledgeProfilePage from "./pages/KnowledgeProfilePage";
import SocialHubPage from "./pages/SocialHubPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import ChallengePage from "./pages/ChallengePage";
import ContentLibraryPage from "./pages/ContentLibraryPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";

// Placeholder
const Explore = () => (
    <div className="p-8">
        <h1 className="text-h2 font-heading text-text-primary">Explore</h1>
        <p className="text-text-secondary mt-2">
            Discover new learning materials and trending learners.
        </p>
    </div>
);
const NotFound = () => (
    <div className="p-8 text-center mt-20">
        <h1 className="text-h1 font-heading text-text-primary mb-2">404</h1>
        <p className="text-text-secondary">Page not found.</p>
    </div>
);

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    {/* Landing — Guest sees landing, authed redirects to dashboard */}
                    <Route
                        index
                        element={
                            <GuestRoute>
                                <LandingPage />
                            </GuestRoute>
                        }
                    />
                    {/* Protected Routes(Aslinya ada ProtectedRoute) */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<KnowledgeProfilePage />} />
                    <Route path="settings" element={<ProfileSettingsPage />} />
                    <Route path="social" element={<SocialHubPage />} />{" "}
                    {/* TODO: re-add ProtectedRoute after testing */}
                    <Route path="library" element={<ContentLibraryPage />} />
                    <Route path="explore" element={<Explore />} />
                    <Route path="challenge" element={<ChallengePage />} />{" "}
                    {/* TODO: re-add ProtectedRoute */}
                    {/* Public Profile (no auth required) */}
                    <Route path="u/:username" element={<PublicProfilePage />} />
                    {/* Guest Routes */}
                    <Route
                        path="login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="register"
                        element={
                            <GuestRoute>
                                <RegisterPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="forgot-password"
                        element={
                            <GuestRoute>
                                <ForgotPasswordPage />
                            </GuestRoute>
                        }
                    />
                    {/* OAuth callback */}
                    <Route
                        path="auth/callback"
                        element={<GoogleCallbackPage />}
                    />
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Document Dungeon — full-screen, outside App layout (aslinya ada protected route)*/}
                <Route
                    path="learn/:materialId"
                    element={
                        // <ProtectedRoute>
                            <DocumentDungeonPage />
                        // </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
