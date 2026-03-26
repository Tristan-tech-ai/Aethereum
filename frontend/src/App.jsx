import { useEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    Bell,
    Menu,
    X,
    BookOpen,
    ChevronDown,
    LogOut,
    User,
    Settings,
} from "lucide-react";
import { useAuthStore } from "./stores/authStore";
import Avatar from "./components/ui/Avatar";
import FriendRequestNotification from "./components/social/FriendRequestNotification";
import Sidebar from "./components/layout/Sidebar";
import StreakDisplay from "./components/profile/StreakDisplay";
import AssistantPanel from "./components/assistant/AssistantPanel";

const routeContext = {
    "/dashboard": {
        title: "Dashboard",
        subtitle: "Track your learning momentum",
    },
    "/library": {
        title: "My Library",
        subtitle: "Continue where you left off",
    },
    "/tasks": {
        title: "Active Learning",
        subtitle: "Complete your focus sessions",
    },
    "/community": {
        title: "Community Hub",
        subtitle: "Collaborate and compete with peers",
    },
    "/community/rooms": {
        title: "Study Rooms",
        subtitle: "Join live co-study sessions",
    },
    "/community/raids": {
        title: "Study Raids",
        subtitle: "Team up for intensive learning",
    },
    "/community/duels": {
        title: "Focus Duels",
        subtitle: "1v1 focus challenge mode",
    },
    "/community/arena": {
        title: "Quiz Arena",
        subtitle: "Compete in live quiz battles",
    },
    "/community/relay": {
        title: "Learning Relay",
        subtitle: "Split knowledge, learn faster",
    },
    "/leaderboard": {
        title: "Leaderboard",
        subtitle: "See the top learners",
    },
    "/profile": {
        title: "Profile",
        subtitle: "Review your personal progress",
    },
    "/report": {
        title: "Report",
        subtitle: "Analyze your learning metrics",
    },
    "/settings": {
        title: "Settings",
        subtitle: "Manage account preferences",
    },
};

// Pages that should NOT show the sidebar (guest/full-screen views)
const noSidebarPaths = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
    "/auth/callback",
];

// Pages where we hide the entire top bar (auth pages have their own logo)
const noHeaderPaths = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
    "/auth/callback",
];

function App() {
    const { user, session, initialized, initialize, logout } = useAuthStore();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [streakReminderDismissed, setStreakReminderDismissed] =
        useState(false);

    const showSidebar = !noSidebarPaths.includes(location.pathname);
    const showHeader = !noHeaderPaths.includes(location.pathname);
    const headerMeta =
        routeContext[location.pathname] || {
            title: "Nexera",
            subtitle: "Knowledge Empire",
        };

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
        setUserMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [userMenuOpen]);

    return (
        <>
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
                {showHeader && (
                <header className="h-16 bg-dark-secondary border-b border-border-subtle sticky top-0 z-10 shrink-0">
                    <div className="h-full flex items-center justify-between px-4 lg:px-8">
                        {/* Left side */}
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Mobile hamburger */}
                            {showSidebar && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <Menu size={20} />
                                </button>
                            )}

                            <div className="min-w-0 hidden sm:block">
                                <h1 className="text-[15px] font-semibold text-text-primary leading-tight truncate">
                                    {headerMeta.title}
                                </h1>
                                <p className="text-[11px] text-text-muted leading-tight truncate">
                                    {headerMeta.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Right side */}
                        {(session || user) ? (
                            <div className="flex items-center gap-4">
                                {/* Coin Balance */}
                                {user?.wallet && (
                                    <div className="flex items-center gap-1.5 text-accent text-sm">
                                        <span>🪙</span>
                                        <span className="font-semibold">
                                            {user.wallet.current_balance}
                                        </span>
                                    </div>
                                )}

                                {/* Streak */}
                                {user && (
                                <StreakDisplay
                                    count={streakCount}
                                    status={streakStatus}
                                    compact
                                />
                                )}

                                {/* Notifications — feed dot */}
                                {user && (
                                <>
                                <Link
                                    to="/social"
                                    className="relative p-2 text-text-muted hover:text-text-primary transition-colors duration-fast"
                                    title="Notifications"
                                >
                                    <Bell size={18} />
                                    {/* Unread feed dot */}
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-dark-secondary" />
                                </Link>

                                {/* Friend Requests */}
                                <FriendRequestNotification />
                                </>
                                )}

                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() =>
                                            setUserMenuOpen((prev) => !prev)
                                        }
                                        className="flex items-center gap-2 rounded-[10px] px-2 py-1.5 border border-transparent
                                          hover:border-border-subtle hover:bg-dark-card/50 transition-all"
                                    >
                                        <Avatar
                                            src={
                                                user?.avatar_url
                                                    ? user.avatar_url.startsWith(
                                                          "http",
                                                      )
                                                        ? user.avatar_url
                                                        : `/storage/${user.avatar_url}`
                                                    : null
                                            }
                                            name={user?.name || '...'}
                                            size="sm"
                                        />
                                        <span className="text-sm font-medium text-text-primary hidden sm:inline max-w-[120px] truncate">
                                            {user?.name || '...'}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`hidden sm:inline transition-transform duration-fast ${
                                                userMenuOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-[12px] border border-border-subtle bg-dark-elevated shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden z-30">
                                            <div className="px-3 py-2.5 border-b border-border-subtle">
                                                <div className="text-sm font-semibold text-text-primary truncate">
                                                    {user?.name || '...'}
                                                </div>
                                                <div className="text-[11px] text-text-muted truncate">
                                                    {user?.email || ''}
                                                </div>
                                            </div>

                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors"
                                            >
                                                <User size={15} /> Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors"
                                            >
                                                <Settings size={15} /> Settings
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors border-t border-border-subtle"
                                            >
                                                <LogOut size={15} /> Logout
                                            </button>
                                        </div>
                                    )}
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
                )}

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
                {showHeader && (
                <footer className="bg-dark-secondary border-t border-border-subtle py-8 shrink-0">
                    <div className="text-center text-text-muted text-body-sm px-4">
                        &copy; 2026 Nexera — Knowledge Empire. All rights
                        reserved.
                    </div>
                </footer>
                )}
            </div>
        </div>

        {/* ── Nexera Assistant Panel (global, right-side drawer) ── */}
        {showSidebar && <AssistantPanel />}
        </>
    );
}

export default App;
