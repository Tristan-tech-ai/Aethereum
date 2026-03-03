import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback, loading, error } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        navigate('/login', { replace: true });
        return;
      }

      const result = await handleGoogleCallback({ code, state });
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        // Redirect to login with error after a short delay
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <p className="text-slate-500 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <svg className="animate-spin w-16 h-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authenticating with Google</h2>
            <p className="text-slate-400">Please wait...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
