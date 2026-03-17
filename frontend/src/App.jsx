import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Coins, Bell } from 'lucide-react';
import { useAuthStore } from './stores/authStore';
import Avatar from './components/ui/Avatar';

function App() {
  const { user, session, initialized, initialize, logout } = useAuthStore();
  const navigate = useNavigate();

  // Initialize Supabase auth on app load
  useEffect(() => {
    initialize();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-base">
      {/* ── Navbar ── DRD §7.1 */}
      <nav className="h-16 bg-dark-secondary border-b border-border-subtle sticky top-0 z-10">
        <div className="container mx-auto h-full flex justify-between items-center px-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            AETHEREUM
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              {/* Nav Links */}
              <Link to="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors duration-fast text-sm font-medium">Dashboard</Link>
              <Link to="/library" className="text-text-secondary hover:text-text-primary transition-colors duration-fast text-sm font-medium hidden sm:inline">Library</Link>
              <Link to="/social" className="text-text-secondary hover:text-text-primary transition-colors duration-fast text-sm font-medium hidden md:inline">Social Hub</Link>
              <Link to="/explore" className="text-text-secondary hover:text-text-primary transition-colors duration-fast text-sm font-medium hidden md:inline">Explore</Link>

              {/* Coin Balance */}
              {user.wallet && (
                <div className="flex items-center gap-1.5 text-accent text-sm">
                  <span>🪙</span>
                  <span className="font-semibold">{user.wallet.current_balance}</span>
                </div>
              )}

              {/* Streak */}
              {user.streak && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="animate-flicker">🔥</span>
                  <span className="font-semibold text-text-primary">{user.streak.count}</span>
                </div>
              )}

              {/* Notifications */}
              <button className="relative p-2 text-text-muted hover:text-text-primary transition-colors duration-fast" title="Notifications">
                <Bell size={18} />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar
                    src={user.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `/storage/${user.avatar_url}`) : null}
                    name={user.name}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-text-primary hidden sm:inline">{user.name}</span>
                </Link>

                <Link to="/profile/settings" className="p-2 text-text-muted hover:text-text-primary transition-colors duration-fast" title="Settings">
                  <Settings size={18} />
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
              <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-fast font-medium">Sign In</Link>
              <Link
                to="/register"
                className="text-sm bg-primary hover:bg-primary-dark hover:shadow-glow-primary text-white px-4 py-2 rounded-[8px] transition-all duration-fast font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="grow container mx-auto">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-dark-secondary border-t border-border-subtle py-8">
        <div className="container mx-auto text-center text-text-muted text-body-sm px-4">
          &copy; 2026 Aethereum — Knowledge Empire. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
