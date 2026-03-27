import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, Trophy, Users, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const features = [
  { icon: BookOpen, title: 'Pembelajaran Interaktif', desc: 'AI-powered courses yang adaptif' },
  { icon: Trophy, title: 'Gamifikasi & XP', desc: 'Level up sambil belajar' },
  { icon: Users, title: 'Komunitas Aktif', desc: 'Belajar bersama ribuan pelajar' },
  { icon: Shield, title: 'Gratis Selamanya', desc: 'Akses penuh tanpa biaya' },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, loginWithGoogle, loading, error, fieldErrors, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    clearError();
    setFormData({ ...formData, [field]: e.target.value });
  };

  const passwordMismatch = formData.password_confirmation && formData.password !== formData.password_confirmation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordMismatch) return;

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    if (result.success) {
      if (result.needsVerification) {
        navigate('/verify-email', { replace: true, state: { email: formData.email } });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const inputClass = (hasError) => `w-full h-11 bg-dark-secondary text-text-primary text-sm rounded-[10px] px-4
    outline-none transition-all duration-200 placeholder:text-text-muted
    ${hasError
      ? 'border-2 border-danger focus:border-danger'
      : 'border border-border hover:border-border-hover focus:border-primary focus:ring-2 focus:ring-primary/20'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Features (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-dark-base via-dark-primary to-dark-secondary">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
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
              Mulai perjalanan belajarmu
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Bergabung dengan platform pembelajaran berbasis AI yang dirancang untuk membuat belajar lebih efektif dan menyenangkan.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-dark-base flex items-center justify-center">
                  <span className="text-[10px] font-bold text-text-primary">
                    {['A', 'R', 'S', 'D'][i - 1]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Dipercaya oleh <span className="text-text-secondary font-medium">10,000+</span> pelajar di Indonesia
          </p>
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
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-1.5">Buat akun baru</h1>
            <p className="text-sm text-text-muted">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2.5
              bg-white text-[#1f1f1f] font-medium text-sm rounded-[10px]
              hover:bg-gray-50 active:bg-gray-100
              shadow-sm hover:shadow transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <GoogleIcon />
            Daftar dengan Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-dark-base text-text-muted text-xs uppercase tracking-wider">atau daftar dengan email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Contoh: Andi Pratama"
                value={formData.name}
                onChange={handleChange('name')}
                required
                autoComplete="name"
                className={inputClass(fieldErrors.name)}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-danger">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange('email')}
                required
                autoComplete="email"
                className={inputClass(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Buat password yang kuat"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass(fieldErrors.password)} pr-10`}
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
              {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
              <PasswordStrengthMeter password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang password"
                  value={formData.password_confirmation}
                  onChange={handleChange('password_confirmation')}
                  required
                  autoComplete="new-password"
                  className={`${inputClass(passwordMismatch)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordMismatch && <p className="mt-1 text-xs text-danger">Password tidak cocok</p>}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border bg-dark-secondary text-primary focus:ring-primary/30 cursor-pointer"
              />
              <span className="text-xs text-text-muted leading-relaxed">
                Saya setuju dengan{' '}
                <a href="#" className="text-primary hover:text-primary-light transition-colors">Ketentuan Layanan</a>
                {' '}dan{' '}
                <a href="#" className="text-primary hover:text-primary-light transition-colors">Kebijakan Privasi</a>
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-[10px] flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || passwordMismatch || !agreedToTerms}
              className="w-full h-12 bg-primary text-white font-semibold text-sm rounded-[10px]
                hover:bg-primary-dark hover:shadow-glow-primary active:scale-[0.98]
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  Buat Akun
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Mobile footer */}
          <p className="text-center text-xs text-text-muted mt-6 lg:hidden">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
