import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';

const EmailVerificationPage = () => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuthStore();

  const email = location.state?.email || '';

  // If already has session, go to dashboard
  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setResent(true);
      setCooldown(60);
      setTimeout(() => setResent(false), 4000);
    } catch {
      // silent fail
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[460px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/nexera_logo.svg" alt="Nexera" className="h-10 w-10" />
            <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              NEXERA
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-dark-card border border-border rounded-lg-drd p-8 text-center">
          {/* Animated mail icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 animate-ping opacity-20" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
              <Mail size={36} className="text-primary" />
            </div>
            <Sparkles size={16} className="absolute -top-1 -right-1 text-accent animate-pulse" />
          </div>

          <h1 className="text-h2 font-heading text-text-primary mb-2">
            Check your inbox
          </h1>
          <p className="text-body-sm text-text-muted mb-1 max-w-[340px] mx-auto">
            We've sent a verification link to
          </p>
          {email && (
            <p className="text-sm font-medium text-primary mb-6">{email}</p>
          )}
          {!email && (
            <p className="text-sm text-text-muted mb-6">your email address</p>
          )}

          {/* Steps */}
          <div className="bg-dark-secondary/50 rounded-lg p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">1</div>
              <p className="text-sm text-text-secondary">Open the email from <strong className="text-text-primary">Nexera</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">2</div>
              <p className="text-sm text-text-secondary">Click the <strong className="text-text-primary">verification link</strong> in the email</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">3</div>
              <p className="text-sm text-text-secondary">Come back and <strong className="text-text-primary">sign in</strong> to start learning</p>
            </div>
          </div>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {resending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : resent ? (
              <CheckCircle size={16} className="text-success" />
            ) : (
              <RefreshCw size={16} />
            )}
            {resent
              ? 'Email sent!'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Didn't get the email? Resend"}
          </button>

          <p className="text-caption text-text-muted mt-4">
            Also check your <span className="text-text-secondary">spam folder</span> just in case
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
