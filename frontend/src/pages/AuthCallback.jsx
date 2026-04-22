import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * /auth/callback
 *
 * The magic link email points HERE (frontend page).
 * URL format: /auth/callback?token=<magic-link-uuid>
 *
 * This page calls GET /api/auth/verify?token=<uuid> via axios.
 *
 * FIX: useRef guard prevents React 18 StrictMode from firing the effect TWICE.
 * Without this, the second invocation would try to verify an already-consumed token
 * and show an error state even though the first call succeeded.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Guard against React 18 StrictMode double-invocation of useEffect
  const hasVerified = useRef(false);

  useEffect(() => {
    // StrictMode fires effects twice in dev — skip the second invocation
    if (hasVerified.current) return;
    hasVerified.current = true;

    const magicToken = searchParams.get('token');

    if (!magicToken) {
      setStatus('error');
      setErrorMsg('Invalid verification link. No token found. Please request a new magic link.');
      return;
    }

    // Call backend to verify the magic link token
    axios
      .get(`${API}/auth/verify`, { params: { token: magicToken } })
      .then((res) => {
        if (res.data.success && res.data.anonymousToken) {
          login(res.data.anonymousToken);
          setStatus(res.data.returning ? 'returning' : 'success');
          // Returning students → see their old posts; new students → go to post form
          const destination = res.data.returning ? '/my-posts' : '/post';
          setTimeout(() => navigate(destination, { replace: true }), 2200);
        } else {
          setStatus('error');
          setErrorMsg(res.data.message || 'Verification failed. Please try again.');
        }
      })
      .catch((err) => {
        setStatus('error');
        const msg = err.response?.data?.message;
        if (msg?.toLowerCase().includes('invalid') || msg?.toLowerCase().includes('expired')) {
          setErrorMsg(
            'This magic link has already been used or has expired (15-min limit). Please request a new one.'
          );
        } else {
          setErrorMsg(msg || 'Something went wrong on our end. Please try again.');
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-md mx-auto py-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-12 text-center space-y-6 w-full shadow-medium"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-600 mx-auto animate-spin" />
            <div className="space-y-1">
              <h2 className="text-xl font-black outfit text-neutral-900 dark:text-white">Verifying...</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Confirming your identity and permanently erasing your email from our servers.
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-full flex items-center justify-center mx-auto border border-success-100 dark:border-success-800/20">
              <ShieldCheck size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black outfit text-neutral-900 dark:text-white">
                You&apos;re Anonymous!
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                Your email has been{' '}
                <strong className="text-neutral-700 dark:text-neutral-300">permanently deleted</strong>{' '}
                from our servers. You are now completely anonymous. Redirecting to post form...
              </p>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-brand-500 to-success-500"
              />
            </div>
          </>
        )}

        {status === 'returning' && (
          <>
            <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto border border-brand-100 dark:border-brand-800/20">
              <ShieldCheck size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black outfit text-neutral-900 dark:text-white">
                Welcome Back!
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                Your email has been erased. Your anonymous session has been{' '}
                <strong className="text-neutral-700 dark:text-neutral-300">restored</strong>{' '}
                — all your previous posts are still here. Redirecting to your posts...
              </p>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-brand-500 to-violet-500"
              />
            </div>
          </>
        )}


        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-full flex items-center justify-center mx-auto border border-danger-100 dark:border-danger-800/20">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black outfit text-neutral-900 dark:text-white">
                Verification Failed
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => navigate('/verify', { replace: true })}
              className="btn-primary w-full py-3 text-sm"
            >
              Request New Magic Link
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
