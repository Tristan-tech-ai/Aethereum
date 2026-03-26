import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
        navigate('/login', { replace: true, state: { message: 'Please check your email to verify your account.' } });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  const inputClass = (hasError) => `w-full h-11 bg-dark-secondary text-text-primary text-sm rounded-[8px] px-4
    outline-none transition-all duration-fast placeholder:text-text-muted
    ${hasError
      ? 'border-2 border-danger focus:border-danger'
      : 'border border-border hover:border-border-hover focus:border-primary focus:ring-1 focus:ring-primary'
    }`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/nexera_logo.svg" alt="Nexera" className="h-10 w-10" />
            <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              NEXERA
            </span>
          </Link>
          <h1 className="text-h2 font-heading text-text-primary mb-1">Create your account</h1>
          <p className="text-body-sm text-text-muted">Start building your knowledge empire</p>
        </div>

        {/* Card */}
        <div className="bg-dark-card border border-border rounded-lg-drd p-6 space-y-5">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2.5
              bg-white text-[#1f1f1f] font-medium text-sm rounded-[8px]
              hover:bg-gray-100 active:bg-gray-200
              transition-colors duration-fast
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-dark-card text-text-muted text-caption">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Andi Pratama"
                value={formData.name}
                onChange={handleChange('name')}
                required
                className={inputClass(fieldErrors.name)}
              />
              {fieldErrors.name && <p className="mt-1 text-caption text-danger">{fieldErrors.name}</p>}
              <p className="mt-1 text-caption text-text-muted">Username will be auto-generated from your name</p>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                required
                className={inputClass(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="mt-1 text-caption text-danger">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  minLength={6}
                  className={`${inputClass(fieldErrors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-caption text-danger">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={handleChange('password_confirmation')}
                required
                className={inputClass(passwordMismatch)}
              />
              {passwordMismatch && <p className="mt-1 text-caption text-danger">Passwords do not match</p>}
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-[8px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full h-11 bg-primary text-white font-medium text-sm rounded-[8px]
                hover:bg-primary-dark hover:shadow-glow-primary active:bg-[#5B21B6]
                transition-all duration-fast cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create Account
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-body-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
