import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Sparkles, KeyRound, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const OTP_LENGTH = 8;

const EmailVerificationPage = () => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mode, setMode] = useState('link'); // 'link' | 'otp'
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, sendVerificationOtp, verifyEmailOtp } = useAuthStore();

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
      const { supabase } = await import('../services/supabase');
      const { error } = await supabase.auth.resend({ type: 'signup', email });
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

  const handleSendOtp = async () => {
    if (!email || sendingOtp) return;
    setSendingOtp(true);
    setOtpError('');
    const result = await sendVerificationOtp({ email });
    setSendingOtp(false);
    if (result.success) {
      setOtpSent(true);
      setCooldown(60);
      setTimeout(() => setOtpSent(false), 4000);
    } else {
      setOtpError('Gagal mengirim kode. Coba lagi.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < OTP_LENGTH) {
      setOtpError(`Masukkan ${OTP_LENGTH} karakter kode verifikasi.`);
      return;
    }
    setVerifying(true);
    setOtpError('');
    const result = await verifyEmailOtp({ email, token });
    setVerifying(false);
    if (result.success) {
      navigate('/login', { replace: true, state: { verified: true } });
    } else {
      setOtpError('Kode salah atau sudah kadaluarsa. Coba kirim ulang.');
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
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
          {/* Animated icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 animate-ping opacity-20" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
              {mode === 'otp' ? <KeyRound size={36} className="text-primary" /> : <Mail size={36} className="text-primary" />}
            </div>
            <Sparkles size={16} className="absolute -top-1 -right-1 text-accent animate-pulse" />
          </div>

          <h1 className="text-h2 font-heading text-text-primary mb-2">
            {mode === 'otp' ? 'Masukkan kode verifikasi' : 'Cek emailmu'}
          </h1>
          <p className="text-body-sm text-text-muted mb-1 max-w-[340px] mx-auto">
            {mode === 'otp'
              ? `Kode ${OTP_LENGTH} karakter telah dikirim ke`
              : 'Kami telah mengirim link verifikasi ke'}
          </p>
          {email && <p className="text-sm font-medium text-primary mb-6">{email}</p>}
          {!email && <p className="text-sm text-text-muted mb-6">alamat emailmu</p>}

          {/* Mode Tabs */}
          <div className="flex bg-dark-secondary rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('link')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                mode === 'link'
                  ? 'bg-dark-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Mail size={14} className="inline mr-1.5 mb-0.5" />
              Link Email
            </button>
            <button
              onClick={() => setMode('otp')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                mode === 'otp'
                  ? 'bg-dark-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <KeyRound size={14} className="inline mr-1.5 mb-0.5" />
              Kode OTP
            </button>
          </div>

          {mode === 'link' && (
            <>
              {/* Steps */}
              <div className="bg-dark-secondary/50 rounded-lg p-4 mb-6 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">1</div>
                  <p className="text-sm text-text-secondary">Buka email dari <strong className="text-text-primary">Nexera</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">2</div>
                  <p className="text-sm text-text-secondary">Klik <strong className="text-text-primary">link verifikasi</strong> di dalam email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">3</div>
                  <p className="text-sm text-text-secondary">Kamu akan diarahkan ke halaman <strong className="text-text-primary">masuk</strong></p>
                </div>
              </div>

              <button
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {resending ? <RefreshCw size={16} className="animate-spin" /> : resent ? <CheckCircle size={16} className="text-success" /> : <RefreshCw size={16} />}
                {resent ? 'Email terkirim!' : cooldown > 0 ? `Kirim ulang dalam ${cooldown}d` : 'Tidak menerima email? Kirim ulang'}
              </button>
            </>
          )}

          {mode === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted text-center">
                Masukkan kode {OTP_LENGTH} karakter dari email konfirmasi yang dikirim saat registrasi.
              </p>

              {/* OTP input boxes */}
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 text-center text-xl font-bold bg-dark-secondary text-text-primary rounded-xl border transition-all outline-none
                      ${digit ? 'border-primary' : 'border-border'}
                      focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    style={{ height: '52px' }}
                  />
                ))}
              </div>

              {otpError && <p className="text-sm text-red-400 text-center">{otpError}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={verifying || otp.join('').length < OTP_LENGTH}
                className="w-full h-11 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {verifying ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {verifying ? 'Memverifikasi...' : 'Verifikasi'}
              </button>

              {otpSent && (
                <p className="text-sm text-success text-center flex items-center justify-center gap-1.5">
                  <CheckCircle size={15} /> Kode baru berhasil dikirim!
                </p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={sendingOtp || cooldown > 0 || !email}
                className="text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingOtp
                  ? <span className="inline-flex items-center gap-1"><RefreshCw size={12} className="inline animate-spin" /> Mengirim...</span>
                  : cooldown > 0
                  ? `Kirim ulang dalam ${cooldown}d`
                  : 'Belum terima kode? Kirim ulang'}
              </button>
            </div>
          )}

          <p className="text-caption text-text-muted mt-6">
            Cek juga folder <span className="text-text-secondary">spam</span> jika tidak muncul
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;

