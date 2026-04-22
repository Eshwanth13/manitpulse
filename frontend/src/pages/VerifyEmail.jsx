import React, { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle2, Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API}/auth/send-magic-link`, { email });
      if (res.data.success) {
        setSent(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Failed to send magic link. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 md:py-20">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-standard p-10 text-center space-y-8 shadow-medium"
          >
            <div className="w-20 h-20 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-success-100 dark:border-success-800/20">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white outfit">Check Inbox</h2>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Magic link sent to <strong className="text-neutral-700 dark:text-neutral-200">{email}</strong>.
                Click it within <strong>15 minutes</strong> to verify and post anonymously.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-left">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                💡 After clicking the link, your email will be <strong>permanently deleted</strong> from our servers. You'll be 100% anonymous.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700/50">
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">Didn't receive it? Check your spam folder.</p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-secondary w-full"
              >
                Try Another Email
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verify-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-standard p-10 space-y-10"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white outfit tracking-tight">One-time Access</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[260px] mx-auto">
                Enter your official <strong>@stu.manit.ac.in</strong> email to get a magic link.
                No password. No account. Completely anonymous after verification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] ml-1">
                  MANIT Student Email
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    placeholder="24112011172@stu.manit.ac.in"
                    className="input-field pl-12 h-14"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors" size={20} />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 text-xs font-bold rounded-xl border border-danger-200/50">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base shadow-brand"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Send Magic Link</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center">
              <Link to="/" className="text-xs font-bold text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors">
                <ArrowLeft size={14} />
                Back to Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyEmail;
