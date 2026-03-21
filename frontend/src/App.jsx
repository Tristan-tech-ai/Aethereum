import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Bell, Menu, X, BookOpen } from "lucide-react";
import { useAuthStore } from "./stores/authStore";
import Avatar from "./components/ui/Avatar";
import FriendRequestNotification from "./components/social/FriendRequestNotification";
import Sidebar from "./components/layout/Sidebar";
import StreakDisplay from "./components/profile/StreakDisplay";

// Pages that should NOT show the sidebar (guest/full-screen views)
const noSidebarPaths = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/auth/callback",
];

function App() {
    const { user, session, initialized, initialize, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [streakReminderDismissed, setStreakReminderDismissed] =
        useState(false);

    const showSidebar = !noSidebarPaths.includes(location.pathname);

    // Determine streak status for reminder banner
    const streakStatus =
        user?.streak?.status ||
        (user?.current_streak > 0 ? "active" : "broken");
    const streakCount = user?.streak?.count ?? user?.current_streak ?? 0;
    const showStreakWarning =
        user &&
        showSidebar &&
        streakStatus === "at-risk" &&
        !streakReminderDismissed;

    // Initialize Supabase auth on app load
    useEffect(() => {
        initialize();
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="h-screen flex bg-dark-base overflow-hidden">
            {/* ── Sidebar ── */}
            {showSidebar && (
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main Column ── */}
            <div
                className="flex-1 flex flex-col min-w-0 overflow-y-auto"
                style={{ overscrollBehaviorY: "none" }}
            >
                {/* ── Top Bar ── */}
                <header className="h-16 bg-dark-secondary border-b border-border-subtle sticky top-0 z-10 shrink-0">
                    <div className="h-full flex items-center justify-between px-4 lg:px-8">
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                            {/* Mobile hamburger */}
                            {showSidebar && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <Menu size={20} />
                                </button>
                            )}

                            {/* Logo — shown only when sidebar is NOT visible */}
                            {!showSidebar && (
                                <Link
                                    to="/"
                                    className="flex items-center gap-2"
                                >
                                    <img
                                        src="/nexera_logo.svg"
                                        alt="Nexera"
                                        className="h-10 w-10"
                                    />
                                    <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                                        NEXERA
                                    </span>
                                </Link>
                            )}
                        </div>

                        {/* Right side */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                {/* Coin Balance */}
                                {user.wallet && (
                                    <div className="flex items-center gap-1.5 text-accent text-sm">
                                        <span>🪙</span>
                                        <span className="font-semibold">
                                            {user.wallet.current_balance}
                                        </span>
                                    </div>
                                )}

                                {/* Streak */}
                                <StreakDisplay
                                    count={streakCount}
                                    status={streakStatus}
                                    compact
                                />

                                {/* Notifications */}
                                <button
                                    className="relative p-2 text-text-muted hover:text-text-primary transition-colors duration-fast"
                                    title="Notifications"
                                >
                                    <Bell size={18} />
                                </button>

                                {/* Friend Requests */}
                                <FriendRequestNotification />

                                {/* User Menu */}
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        <Avatar
                                            src={
                                                user.avatar_url
                                                    ? user.avatar_url.startsWith(
                                                          "http",
                                                      )
                                                        ? user.avatar_url
                                                        : `/storage/${user.avatar_url}`
                                                    : null
                                            }
                                            name={user.name}
                                            size="sm"
                                        />
                                        <span className="text-sm font-medium text-text-primary hidden sm:inline">
                                            {user.name}
                                        </span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-text-muted hover:text-danger transition-colors duration-fast"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-fast font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm bg-primary hover:bg-primary-dark hover:shadow-glow-primary text-white px-4 py-2 rounded-[8px] transition-all duration-fast font-medium"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── Streak At-Risk Reminder Banner (Checklist 5.5) ── */}
                {showStreakWarning && (
                    <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-body-sm">
                            <span className="text-warning">⚠️</span>
                            <span className="text-warning font-medium">
                                Your {streakCount}-day streak is at risk!
                            </span>
                            <span className="text-text-muted hidden sm:inline">
                                Complete a section today to keep it alive.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/library"
                                className="text-caption font-semibold text-warning hover:text-warning/80 flex items-center gap-1 transition-colors"
                            >
                                <BookOpen size={14} /> Study Now
                            </Link>
                            <button
                                onClick={() => setStreakReminderDismissed(true)}
                                className="p-1 text-text-muted hover:text-text-primary transition-colors"
                                aria-label="Dismiss"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Main Content ── */}
                <main className="flex-1">
                    <Outlet />
                </main>

                {/* ── Footer ── */}
                <footer className="bg-dark-secondary border-t border-border-subtle py-8 shrink-0">
                    <div className="text-center text-text-muted text-body-sm px-4">
                        &copy; 2026 Nexera — Knowledge Empire. All rights
                        reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;
