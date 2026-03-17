import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import api from '../services/api';

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
      await api.post('/v1/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg-drd bg-success/10 text-success mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-h2 font-heading text-text-primary mb-2">Check Your Email</h1>
          <p className="text-text-secondary mb-6">
            We've sent a password reset link to <span className="text-text-primary font-medium">{email}</span>
          </p>
          <Link to="/login">
            <Button variant="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg-drd bg-primary/10 text-primary mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-h1 font-heading text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary">Enter your email to receive a reset link</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => { setError(null); setEmail(e.target.value); }}
              required
            />

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-md-drd">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link to="/login" className="text-sm text-primary hover:text-primary-light transition-colors duration-fast inline-flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
