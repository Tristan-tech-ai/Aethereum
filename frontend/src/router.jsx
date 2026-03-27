import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AppErrorBoundary from "./components/app/AppErrorBoundary";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GoogleCallbackPage = lazy(() => import("./pages/GoogleCallbackPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DocumentDungeonPage = lazy(() => import("./pages/DocumentDungeonPage"));
const KnowledgeProfilePage = lazy(() => import("./pages/KnowledgeProfilePage"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const CommunityHubPage = lazy(() => import("./pages/community/CommunityHubPage"));
const StudyRaidsPage = lazy(() => import("./pages/community/StudyRaidsPage"));
const FocusDuelsPage = lazy(() => import("./pages/community/FocusDuelsPage"));
const QuizArenaPage = lazy(() => import("./pages/community/QuizArenaPage"));
const StudyRoomsPage = lazy(() => import("./pages/community/StudyRoomsPage"));
const LearningRelayPage = lazy(() => import("./pages/community/LearningRelayPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const ChallengePage = lazy(() => import("./pages/ChallengePage"));
const ContentLibraryPage = lazy(() => import("./pages/ContentLibraryPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const CoursesMarketplacePage = lazy(() => import("./pages/CoursesMarketplacePage"));
const GenerateCoursePage = lazy(() => import("./pages/GenerateCoursePage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const LeaguePage = lazy(() => import("./pages/LeaguePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
const NotFound = () => (
    <div className="p-8 text-center mt-20">
        <h1 className="text-h1 font-heading text-text-primary mb-2">404</h1>
        <p className="text-text-secondary">Page not found.</p>
    </div>
);

const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-dark-base">
        <Loader2 className="animate-spin text-primary" size={32} />
    </div>
);

const AppRouter = () => {
    return (
        <BrowserRouter>
            <AppErrorBoundary>
                <Suspense fallback={<PageLoader />}>
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
                    {/* ── Protected Routes ── */}
                    <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><KnowledgeProfilePage /></ProtectedRoute>} />
                    <Route path="report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
                    <Route path="social" element={<Navigate to="/community" replace />} />
                    {/* ── Community Routes ── */}
                    <Route path="community" element={<ProtectedRoute><CommunityHubPage /></ProtectedRoute>} />
                    <Route path="community/raids" element={<ProtectedRoute><StudyRaidsPage /></ProtectedRoute>} />
                    <Route path="community/duels" element={<ProtectedRoute><FocusDuelsPage /></ProtectedRoute>} />
                    <Route path="community/arena" element={<ProtectedRoute><QuizArenaPage /></ProtectedRoute>} />
                    <Route path="community/rooms" element={<ProtectedRoute><StudyRoomsPage /></ProtectedRoute>} />
                    <Route path="community/relay" element={<ProtectedRoute><LearningRelayPage /></ProtectedRoute>} />
                    <Route path="library" element={<ProtectedRoute><ContentLibraryPage /></ProtectedRoute>} />
                    <Route path="generate" element={<ProtectedRoute><GenerateCoursePage /></ProtectedRoute>} />
                    <Route path="course/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
                    <Route path="explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
                    <Route path="marketplace" element={<ProtectedRoute><CoursesMarketplacePage /></ProtectedRoute>} />
                    <Route path="challenge" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
                    <Route path="leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                    <Route path="league" element={<ProtectedRoute><LeaguePage /></ProtectedRoute>} />
                    <Route path="events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                    <Route path="support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                    <Route path="tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                    <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
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
                    <Route
                        path="verify-email"
                        element={
                            <GuestRoute>
                                <EmailVerificationPage />
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
                            <ProtectedRoute>
                                <DocumentDungeonPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                </Suspense>
            </AppErrorBoundary>
        </BrowserRouter>
    );
};

export default AppRouter;
