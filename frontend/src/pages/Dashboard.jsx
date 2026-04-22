import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Activity, Smile, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const SENTIMENT_COLORS = {
  Positive: '#10B981',
  Negative: '#EF4444',
  Neutral: '#94A3B8',
  Mixed: '#F59E0B',
};
const CATEGORY_COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [categories, setCategories] = useState(null);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sumRes, trendRes, catRes] = await Promise.all([
          axios.get(`${API}/insights/summary`),
          axios.get(`${API}/insights/trends?period=${period}`),
          axios.get(`${API}/insights/categories`),
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  // Sentiment trend chart data
  const trendData = trends?.labels?.map((label, i) => ({
    label,
    score: trends.averageScores[i],
  })) || [];

  // Category chart data
  const categoryData = categories?.categories?.map((c, i) => ({
    name: c.name,
    posts: c.postCount,
    sentiment: c.averageSentiment,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  })) || [];

  // Sentiment breakdown pie
  const sentimentPieData = summary?.sentimentBreakdown
    ? Object.entries(summary.sentimentBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  // Emotion frequency
  const emotionData = categories?.emotionFrequency?.slice(0, 8).map((e) => ({
    name: e._id,
    count: e.count,
  })) || [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Loading Campus Pulse...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black outfit text-neutral-900 dark:text-white tracking-tight">
              Campus Dashboard
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Real-time anonymous sentiment from MANIT Bhopal students
            </p>
          </div>
        </div>
        {/* Period toggle */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 gap-1">
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                period === p
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Posts"
          value={summary?.totalApprovedPosts ?? 0}
          icon={<Activity size={18} />}
          color="brand"
        />
        <StatCard
          label="Avg Sentiment"
          value={summary?.averageSentimentScore !== undefined
            ? (parseFloat(summary.averageSentimentScore) >= 0
              ? `+${summary.averageSentimentScore}`
              : `${summary.averageSentimentScore}`)
            : '—'}
          icon={<TrendingUp size={18} />}
          color={parseFloat(summary?.averageSentimentScore) >= 0 ? 'green' : 'red'}
        />
        <StatCard
          label="Top Category"
          value={summary?.topCategories?.[0] || '—'}
          icon={<BarChart3 size={18} />}
          color="violet"
          small
        />
        <StatCard
          label="Positive Rate"
          value={summary?.sentimentBreakdown?.Positive && summary?.totalApprovedPosts
            ? `${Math.round((summary.sentimentBreakdown.Positive / summary.totalApprovedPosts) * 100)}%`
            : '—'}
          icon={<Smile size={18} />}
          color="green"
        />
      </div>

      {/* Sentiment Trend Line Chart */}
      <div className="card-standard p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">
            Sentiment Trend ({period})
          </h3>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-3 h-0.5 bg-brand-500 rounded" />
            Avg Score (-1 to +1)
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                formatter={(val) => [val.toFixed(2), 'Avg Sentiment']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4F46E5"
                strokeWidth={2.5}
                dot={{ fill: '#4F46E5', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category + Sentiment Pie row */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Category Bar */}
        <div className="lg:col-span-7 card-standard p-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-6">
            Posts by Category
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                  formatter={(val, name) => [val, name === 'posts' ? 'Posts' : 'Avg Sentiment']}
                />
                <Bar dataKey="posts" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Pie */}
        <div className="lg:col-span-5 card-standard p-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-6">
            Sentiment Distribution
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentPieData.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Emotion Frequency */}
      {emotionData.length > 0 && (
        <div className="card-standard p-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-6">
            Dominant Emotions in Feedback
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Avg Sentiment Table */}
      {categoryData.length > 0 && (
        <div className="card-standard overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">
              Category Sentiment Breakdown
            </h3>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center px-6 py-4 gap-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.fill }} />
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex-1">{cat.name}</span>
                <span className="text-xs text-neutral-500">{cat.posts} posts</span>
                <div className="w-24 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.abs(cat.sentiment) * 50 + 50}%`,
                      backgroundColor: cat.sentiment >= 0 ? '#10B981' : '#EF4444',
                    }}
                  />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${cat.sentiment >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {cat.sentiment >= 0 ? '+' : ''}{cat.sentiment}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color, small }) => {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
    green: 'bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400',
    red: 'bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
  };
  return (
    <div className="card-standard p-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[color] || colorMap.brand}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
      <p className={`font-black outfit text-neutral-900 dark:text-white mt-1 ${small ? 'text-lg truncate' : 'text-3xl'}`}>
        {value}
      </p>
    </div>
  );
};

export default Dashboard;
