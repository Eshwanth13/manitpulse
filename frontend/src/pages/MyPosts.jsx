import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MessageSquare, Sparkles, Trash2, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const SENTIMENT_COLORS = {
  Positive: 'text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-900/20',
  Negative: 'text-danger-600 bg-danger-50 dark:text-danger-400 dark:bg-danger-900/20',
  Neutral: 'text-neutral-500 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800',
  Mixed: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
};

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [aiTips, setAiTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(`${API}/posts/my`, {
          headers: { 'x-anonymous-token': token },
        });
        setPosts(res.data.posts || []);
        setAiTips(res.data.aiTips || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyPosts();
  }, [token]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Remove this post from the public feed? (It will be kept for admin audit.)')) return;
    setDeletingId(postId);
    try {
      await axios.delete(`${API}/posts/${postId}`, {
        headers: { 'x-anonymous-token': token },
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, status: 'deleted' } : p))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-10">
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl flex items-center justify-center shadow-lg">
          <History size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-black outfit text-neutral-900 dark:text-white tracking-tight">Your Voice</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">Your anonymous contributions.</p>
        </div>
      </div>

      {/* AI Tips Card */}
      {!loading && aiTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 border border-brand-200/50 dark:border-brand-700/30 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-black text-brand-700 dark:text-brand-300 uppercase tracking-widest">
              Personalized AI Tips
            </h3>
          </div>
          <ul className="space-y-3">
            {aiTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading your posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 card-standard border-dashed border-2 space-y-4">
              <MessageSquare className="mx-auto text-neutral-200 dark:text-neutral-700" size={48} />
              <div>
                <h3 className="text-lg font-bold outfit text-neutral-500 dark:text-neutral-500">
                  No posts in this session
                </h3>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
                  Posts are tied to your anonymous session token. If you verified a new magic link,
                  your previous posts belong to the old session and can't be retrieved
                  (by design — to protect your anonymity).
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-xs font-semibold border border-amber-200 dark:border-amber-800/30">
                💡 Keep this browser tab open to retain access to your posts
              </div>
            </div>
          ) : (
            posts.map((post, idx) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white dark:bg-neutral-800 border rounded-2xl p-6 space-y-3 ${
                  post.status === 'deleted'
                    ? 'border-neutral-200 dark:border-neutral-700 opacity-50'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {/* Post header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    {post.sentimentLabel && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${SENTIMENT_COLORS[post.sentimentLabel] || ''}`}>
                        {post.sentimentLabel}
                      </span>
                    )}
                    {post.status === 'deleted' && (
                      <span className="text-[10px] font-black text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-full">
                        Removed
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {new Date(post.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {post.content}
                </p>

                {/* Emotions & Topics */}
                {(post.emotions?.length > 0 || post.topics?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.emotions?.map((e) => (
                      <span key={e} className="text-[10px] px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full font-semibold">
                        {e}
                      </span>
                    ))}
                    {post.topics?.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {post.status !== 'deleted' && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/50 flex justify-end">
                    <button
                      onClick={() => handleDelete(post._id)}
                      disabled={deletingId === post._id}
                      className="flex items-center gap-2 text-xs font-bold text-danger-500 hover:text-danger-600 transition-colors disabled:opacity-40"
                    >
                      {deletingId === post._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Remove from Feed
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyPosts;
