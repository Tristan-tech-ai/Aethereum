import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Zap, Brain, Target } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [oauthErrorMessage, setOauthErrorMessage] = useState('');
  const { login, loginWithGoogle, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const oauthError = new URLSearchParams(location.search).get('oauth_error');
    if (oauthError) {
      setOauthErrorMessage(oauthError);
      try { localStorage.setItem('oauth_error', oauthError); } catch {}
      return;
    }
    try {
      const saved = localStorage.getItem('oauth_error');
      if (saved) { setOauthErrorMessage(saved); }
    } catch {}
  }, [location.search]);

  const clearAllErrors = () => {
    clearError();
    setOauthErrorMessage('');
    try { localStorage.removeItem('oauth_error'); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    clearAllErrors();
    const result = await loginWithGoogle();
    if (!result?.success && result?.error) {
      setOauthErrorMessage(result.error);
    }
  };

  const displayError = oauthErrorMessage || error;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-dark-base via-dark-primary to-dark-secondary">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src="/nexera_logo.svg" alt="Nexera" className="h-10 w-10" />
            <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              NEXERA
            </span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Selamat datang kembali
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Lanjutkan perjalanan belajarmu. Setiap sesi membawamu lebih dekat ke tujuan.
            </p>
          </div>

          {/* Stats highlights */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Brain size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">AI-Powered Learning</p>
                <p className="text-xs text-text-muted">Jalur belajar yang menyesuaikan denganmu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Streak & XP System</p>
                <p className="text-xs text-text-muted">Motivasi belajar setiap hari</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                <Target size={18} className="text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Track Progress</p>
                <p className="text-xs text-text-muted">Pantau perkembangan belajarmu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary/40 pl-4">
            <p className="text-sm text-text-secondary italic leading-relaxed">
              "Platform belajar terbaik yang pernah saya coba. Fitur AI-nya benar-benar membantu."
            </p>
            <footer className="mt-2 text-xs text-text-muted">
              — Mahasiswa Informatika, ITB
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-dark-base">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/nexera_logo.svg" alt="Nexera" className="h-10 w-10" />
              <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                NEXERA
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-1.5">Masuk ke akunmu</h1>
            <p className="text-sm text-text-muted">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">
                Daftar gratis
              </Link>
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2.5
              bg-white text-[#1f1f1f] font-medium text-sm rounded-[10px]
              hover:bg-gray-50 active:bg-gray-100
              shadow-sm hover:shadow transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <GoogleIcon />
            Masuk dengan Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-dark-base text-text-muted text-xs uppercase tracking-wider">atau</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => { clearAllErrors(); setFormData({ ...formData, email: e.target.value }); }}
                required
                autoComplete="email"
                className="w-full h-12 bg-dark-secondary text-text-primary text-sm rounded-[10px] px-4
                  border border-border hover:border-border-hover focus:border-primary focus:ring-2 focus:ring-primary/20
                  outline-none transition-all duration-200 placeholder:text-text-muted"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-secondary">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-light transition-colors font-medium">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => { clearAllErrors(); setFormData({ ...formData, password: e.target.value }); }}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 bg-dark-secondary text-text-primary text-sm rounded-[10px] px-4 pr-10
                    border border-border hover:border-border-hover focus:border-primary focus:ring-2 focus:ring-primary/20
                    outline-none transition-all duration-200 placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-[10px] flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{displayError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-semibold text-sm rounded-[10px]
                hover:bg-primary-dark hover:shadow-glow-primary active:scale-[0.98]
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Masuk
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Mobile footer */}
          <p className="text-center text-xs text-text-muted mt-6 lg:hidden">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
