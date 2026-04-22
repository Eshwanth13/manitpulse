import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  LayoutDashboard, Download, FileText, Users, AlertCircle, TrendingUp,
  ShieldCheck, Trash2, LogOut, RefreshCw, Loader2, MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const SENTIMENT_COLORS = {
  Positive: '#10B981',
  Negative: '#EF4444',
  Neutral: '#94A3B8',
  Mixed: '#F59E0B',
};

const CATEGORY_COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);

  const { getAdminHeaders, logoutAdmin, adminKey } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchPosts('');
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, { headers: getAdminHeaders() });
      setStats(res.data.stats);
    } catch (err) {
      if (err.response?.status === 401) {
        logoutAdmin();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (status) => {
    setPostsLoading(true);
    setStatusFilter(status);
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (status) params.set('status', status);
      const res = await axios.get(`${API}/admin/posts?${params}`, { headers: getAdminHeaders() });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    setReportUrl(null);
    try {
      const res = await axios.post(`${API}/admin/reports/generate`, {}, { headers: getAdminHeaders() });
      if (res.data.success) {
        // Append the admin key as a query param so the browser download link is authorized
        setReportUrl(`${API.replace('/api', '')}${res.data.downloadUrl}?key=${adminKey}`);
      }
    } catch (err) {
      alert('Report generation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingReport(false);
    }
  };


  // Chart data
  const sentimentPieData = stats?.sentimentBreakdown
    ? Object.entries(stats.sentimentBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const categoryBarData = stats?.topCategories?.map((c) => ({
    name: c._id,
    count: c.count,
  })) || [];

  const topicBarData = stats?.trendingTopics?.slice(0, 8).map((t) => ({
    name: t._id,
    count: t.count,
  })) || [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Loading Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl flex items-center justify-center shadow-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black outfit text-neutral-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              MANIT Bhopal · Placement Cell Intelligence
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setLoading(true); fetchStats(); fetchPosts(statusFilter); }}
            className="btn-secondary py-2.5 px-4 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={generateReport}
            disabled={generatingReport}
            className="btn-primary py-2.5 px-4 flex items-center gap-2 shadow-brand"
          >
            {generatingReport ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>{generatingReport ? 'Generating...' : 'Generate Weekly PDF'}</span>
          </button>
          {reportUrl && (
            <a
              href={reportUrl}
              download
              className="py-2.5 px-4 flex items-center gap-2 bg-success-600 text-white font-bold rounded-xl hover:bg-success-700 transition-all text-sm"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </a>
          )}
          <button
            onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
            className="py-2.5 px-4 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 font-bold rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all text-sm"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Approved Posts" value={stats?.totalApproved ?? 0} icon={<MessageSquare size={18} />} green />
        <StatCard label="Rejected (AI)" value={stats?.totalRejected ?? 0} icon={<AlertCircle size={18} />} red />
        <StatCard label="Avg Sentiment" value={stats?.averageSentimentScore ?? 0} icon={<TrendingUp size={18} />} />
        <StatCard label="Flagged Posts" value={stats?.totalFlagged ?? 0} icon={<ShieldCheck size={18} />} warning={stats?.totalFlagged > 0} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Sentiment Pie */}
        <div className="lg:col-span-4 card-standard p-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-6">
            Sentiment Breakdown
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
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

        {/* Category Bar */}
        <div className="lg:col-span-4 card-standard p-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-6">
            Posts by Category
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={75} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryBarData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="lg:col-span-4 card-standard p-6">
          <h3 className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-6">
            Trending Topics
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="card-standard">
        {/* Filter Tabs */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-black text-neutral-900 dark:text-white mr-2">All Posts</h3>
          {[
            { label: 'All', value: '' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Deleted', value: 'deleted' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => fetchPosts(f.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f.value
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-neutral-400">
            {posts.length} posts
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {postsLoading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-neutral-300" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 text-sm">No posts found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  {['Category', 'Content', 'Sentiment', 'Fake Prob.', 'Status', 'Reports', 'Date'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded-lg">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[280px]">
                      <p className="text-neutral-700 dark:text-neutral-300 truncate text-xs leading-relaxed">
                        {post.content}
                      </p>
                      {post.aiReason && (
                        <p className="text-[10px] text-neutral-400 italic truncate mt-0.5">{post.aiReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                        SENTIMENT_COLORS[post.sentimentLabel]
                          ? `text-white`
                          : 'text-neutral-500'
                      }`}
                        style={{ backgroundColor: SENTIMENT_COLORS[post.sentimentLabel] || '#94A3B8' }}
                      >
                        {post.sentimentLabel || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500 whitespace-nowrap">
                      {post.fakeProbability !== undefined
                        ? `${(post.fakeProbability * 100).toFixed(0)}%`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                        post.status === 'approved'
                          ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                          : post.status === 'rejected'
                          ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500 whitespace-nowrap">
                      {post.reportCount > 0 ? (
                        <span className="text-amber-600 font-bold">{post.reportCount} flags</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, green, red, warning }) => (
  <div className={`card-standard p-5 ${warning ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
      green ? 'bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400' :
      red ? 'bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400' :
      warning ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
      'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
    }`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black outfit text-neutral-900 dark:text-white mt-1">{value}</p>
  </div>
);

export default AdminDashboard;
