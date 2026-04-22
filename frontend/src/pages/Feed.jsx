import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, TrendingUp, Sparkles, MessageSquare, Info, RefreshCw } from 'lucide-react';
import PostCard from '../components/PostCard';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL_MS) || 15000;

const CATEGORIES = ['All', 'Placements', 'Academics', 'Faculty', 'Hostel', 'Mess Food', 'Mental Health'];

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [moodData, setMoodData] = useState({ score: 0, count: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPosts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20 });
      if (category !== 'All') params.set('category', category);

      const res = await axios.get(`${API}/posts?${params}`);
      setPosts(res.data.posts || []);
      setLastUpdated(new Date());

      if (res.data.posts?.length > 0) {
        // Use average sentimentScore (-1 to +1), convert to 0–100% for display
        // 0% = very negative, 50% = neutral, 100% = very positive
        const avgScore = res.data.posts.reduce((s, p) => s + (p.sentimentScore || 0), 0) / res.data.posts.length;
        const displayPercent = Math.round((avgScore + 1) / 2 * 100);
        setMoodData({
          score: displayPercent,      // 0–100 for bar width
          rawScore: avgScore.toFixed(2), // -1.00 to +1.00 for display
          count: res.data.posts.length,
        });
      } else {
        setMoodData({ score: 50, rawScore: '0.00', count: 0 }); // neutral baseline
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [category]);

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 15-second polling
  useEffect(() => {
    const interval = setInterval(() => fetchPosts(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const moodColor =
    moodData.score >= 63 ? 'text-success-600 dark:text-success-400' :
    moodData.score >= 38 ? 'text-amber-600 dark:text-amber-400' :
    'text-danger-600 dark:text-danger-400';
  const moodLabel =
    moodData.score >= 63 ? 'Optimistic' :
    moodData.score >= 38 ? 'Mixed' : 'Distressed';
  const moodDisplay = moodData.count === 0 ? '--' : `${moodData.rawScore > 0 ? '+' : ''}${moodData.rawScore}`;

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-24 h-fit">
        {/* Mood Meter */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 rounded-2xl shadow-soft dark:shadow-none">
          <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 mb-4">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Campus Mood</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className={`text-4xl font-black outfit ${moodColor}`}>
                {moodDisplay}
              </span>
              {moodData.count > 0 && (
                <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md mb-1 ${
                  moodData.score >= 60
                    ? 'text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-900/20'
                    : moodData.score >= 40
                    ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20'
                    : 'text-danger-600 bg-danger-50 dark:text-danger-400 dark:bg-danger-900/20'
                }`}>
                  {moodLabel}
                </span>
              )}
              {moodData.count > 0 && <span className="text-[10px] text-neutral-400 mb-1">avg score</span>}
            </div>
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${moodData.score}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  moodData.score >= 63 ? 'bg-gradient-to-r from-success-400 to-brand-500' :
                  moodData.score >= 38 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-danger-400 to-rose-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
              Based on {moodData.count} recent anonymous contributions.
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <RefreshCw size={12} className="animate-spin-slow" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Auto-refreshing</span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Every {POLL_INTERVAL / 1000}s
            {lastUpdated && (
              <> · Last: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</>
            )}
          </p>
        </div>

        {/* AI Safe Space Note */}
        <div className="bg-gradient-to-br from-info-50 to-brand-50 dark:from-info-900/20 dark:to-brand-900/20 border border-info-200/50 dark:border-info-800/30 p-6 rounded-2xl relative overflow-hidden">
          <Info className="absolute -right-2 -bottom-2 text-info-500/10" size={80} />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2 text-info-700 dark:text-info-400">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Safe Space AI</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every post is reviewed by <strong>Ling AI</strong> before publishing to ensure constructive, genuine feedback.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md'
                  : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 animate-pulse space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                    <div className="h-2 w-10 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full w-full" />
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full w-3/4" />
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl">
                <MessageSquare className="mx-auto text-neutral-200 dark:text-neutral-700 mb-4" size={48} />
                <h3 className="text-lg font-bold outfit text-neutral-900 dark:text-white">The feed is silent.</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Be the first to speak anonymously for {category === 'All' ? 'this campus' : category}.
                </p>
              </div>
            ) : (
              posts.map((post, idx) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Feed;
