import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Coins } from 'lucide-react';
import { useAuthStore } from './stores/authStore';

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
    <div className="min-h-screen flex flex-col">
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary italic">AETHERIUM</Link>

          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="hover:text-primary transition-colors text-sm">Dashboard</Link>
              <Link to="/explore" className="hover:text-primary transition-colors text-sm">Explore</Link>

              {/* Coin Balance */}
              {user.wallet && (
                <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
                  <Coins size={16} />
                  <span className="font-medium">{user.wallet.current_balance}</span>
                </div>
              )}

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url.startsWith('http') ? user.avatar_url : `/storage/${user.avatar_url}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-slate-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                </Link>

                <Link to="/profile/settings" className="text-slate-400 hover:text-white transition-colors" title="Settings">
                  <Settings size={18} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm hover:text-primary transition-colors">Sign In</Link>
              <Link
                to="/register"
                className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors"
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

      <footer className="bg-slate-900 border-t border-slate-800 p-8">
        <div className="container mx-auto text-center text-slate-500 text-sm">
          &copy; 2026 Aethereum - Gamified AI Learning.
        </div>
      </footer>
    </div>
  );
}

export default App;
