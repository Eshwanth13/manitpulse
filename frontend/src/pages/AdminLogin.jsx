import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Loader2, Eye, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Admin Login — no backend call.
 * Admin enters their ADMIN_SECRET_KEY directly.
 * It's stored in localStorage and sent as Authorization: Bearer <key> on all admin API requests.
 * The backend validates it in middleware.
 */
const AdminLogin = () => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Quick preflight — call /api/admin/stats with this key to verify it
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/stats`,
        { headers: { Authorization: `Bearer ${key.trim()}` } }
      );

      if (res.ok) {
        setAdmin(key.trim());
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid admin secret key. Access denied.');
      }
    } catch {
      setError('Cannot connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-10 rounded-3xl space-y-8 shadow-medium"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold outfit text-neutral-900 dark:text-white">Admin Access</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Enter the <code className="bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_SECRET_KEY</code> from your <code className="bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> to access the placement cell dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <KeyRound size={12} />
              Admin Secret Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                placeholder="Enter your admin secret key..."
                className="w-full h-12 px-4 pr-12 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 placeholder:text-neutral-400 placeholder:font-sans"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-danger-600 dark:text-danger-400 text-sm font-bold text-center bg-danger-50 dark:bg-danger-900/20 py-3 px-4 rounded-xl border border-danger-200/50">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl hover:bg-black dark:hover:bg-neutral-100 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Enter Dashboard</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-neutral-400 font-medium">
          For MANIT Bhopal Placement Cell use only.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
