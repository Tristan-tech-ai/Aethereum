import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (supaError) throw supaError;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 text-success mb-5">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-h2 font-heading text-text-primary mb-2">Check your email</h1>
          <p className="text-body-sm text-text-muted mb-6">
            We sent a password reset link to{' '}
            <span className="text-text-primary font-medium">{email}</span>
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-h2 font-heading text-text-primary mb-1">Reset password</h1>
          <p className="text-body-sm text-text-muted">Enter your email and we'll send you a reset link</p>
        </div>

        {/* Card */}
        <div className="bg-dark-card border border-border rounded-lg-drd p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setError(null); setEmail(e.target.value); }}
                required
                className="w-full h-11 bg-dark-secondary text-text-primary text-sm rounded-[8px] px-4
                  border border-border hover:border-border-hover focus:border-primary focus:ring-1 focus:ring-primary
                  outline-none transition-all duration-fast placeholder:text-text-muted"
              />
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-[8px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
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
              Send Reset Link
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-body-sm text-text-muted mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:text-primary-light font-medium transition-colors">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
