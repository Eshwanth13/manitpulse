import React, { useState } from 'react';
import axios from 'axios';
import { Clock, ShieldAlert, Flag, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const SENTIMENT_CONFIG = {
  Positive: { bgColor: 'bg-success-500', label: '😊 Positive', textColor: 'text-success-700 dark:text-success-400' },
  Negative: { bgColor: 'bg-danger-500', label: '😟 Negative', textColor: 'text-danger-700 dark:text-danger-400' },
  Neutral: { bgColor: 'bg-neutral-400', label: '😐 Neutral', textColor: 'text-neutral-500 dark:text-neutral-400' },
  Mixed: { bgColor: 'bg-amber-500', label: '🤔 Mixed', textColor: 'text-amber-700 dark:text-amber-400' },
};

const CATEGORY_COLORS = {
  Placements: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  Academics: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Hostel: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Mess Food': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Faculty: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Mental Health': 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const PostCard = ({ post }) => {
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  const sentiment = SENTIMENT_CONFIG[post.sentimentLabel] || SENTIMENT_CONFIG.Neutral;

  const handleReport = async () => {
    if (reported) return;
    setReporting(true);
    try {
      await axios.post(`${API}/posts/${post._id}/report`);
      setReported(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 hover:shadow-medium dark:hover:shadow-none transition-all duration-200">
      {/* Top Metadata */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[post.category] || 'bg-neutral-100 text-neutral-600'}`}>
            {post.category}
          </span>
          {post.inputType === 'voice' && (
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
              🎤 Voice
            </span>
          )}
          {post.language === 'hi' && (
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
              हिं
            </span>
          )}
        </div>
        <div className="flex items-center text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          <Clock size={10} className="mr-1" />
          {formatDate(post.createdAt)}
        </div>
      </div>

      {/* Content */}
      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[15px] mb-4 font-medium">
        {post.content}
      </p>

      {/* Emotions & Topics */}
      {(post.emotions?.length > 0 || post.topics?.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
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

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-50 dark:border-neutral-700/50">
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-white ${sentiment.bgColor} shadow-sm`}>
          {sentiment.label}
        </span>
        <button
          onClick={handleReport}
          disabled={reported || reporting}
          className={`flex items-center space-x-1.5 transition-colors text-xs font-semibold ${
            reported
              ? 'text-amber-500 cursor-default'
              : 'text-neutral-400 hover:text-danger-500 dark:hover:text-danger-400'
          }`}
          aria-label="Report this post as fake"
          title={reported ? 'Reported' : 'Report as fake/spam'}
        >
          {reporting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Flag size={14} />
          )}
          <span className="hidden sm:inline">{reported ? 'Reported' : 'Report'}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
