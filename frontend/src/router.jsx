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
import ReportPage from "./pages/ReportPage";
import CommunityHubPage from "./pages/community/CommunityHubPage";
import StudyRaidsPage from "./pages/community/StudyRaidsPage";
import FocusDuelsPage from "./pages/community/FocusDuelsPage";
import QuizArenaPage from "./pages/community/QuizArenaPage";
import StudyRoomsPage from "./pages/community/StudyRoomsPage";
import LearningRelayPage from "./pages/community/LearningRelayPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import ChallengePage from "./pages/ChallengePage";
import ContentLibraryPage from "./pages/ContentLibraryPage";
import ExplorePage from "./pages/ExplorePage";
import GenerateCoursePage from "./pages/GenerateCoursePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import EventsPage from "./pages/EventsPage";
import SupportPage from "./pages/SupportPage";
import TasksPage from "./pages/TasksPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
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
                    <Route path="report" element={<ReportPage />} />
                    <Route path="settings" element={<ProfileSettingsPage />} />
                    <Route path="social" element={<Navigate to="/community" replace />} />{" "}
                    {/* TODO: re-add ProtectedRoute after testing */}
                    {/* ── Community Routes ── */}
                    <Route path="community" element={<CommunityHubPage />} />
                    <Route path="community/raids" element={<StudyRaidsPage />} />
                    <Route path="community/duels" element={<FocusDuelsPage />} />
                    <Route path="community/arena" element={<QuizArenaPage />} />
                    <Route path="community/rooms" element={<StudyRoomsPage />} />
                    <Route path="community/relay" element={<LearningRelayPage />} />
                    <Route path="library" element={<ContentLibraryPage />} />
                    <Route path="generate" element={<GenerateCoursePage />} />
                    <Route path="course/:id" element={<CourseDetailPage />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path="challenge" element={<ChallengePage />} />{" "}
                    {/* TODO: re-add ProtectedRoute */}
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="tasks" element={<TasksPage />} />
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
