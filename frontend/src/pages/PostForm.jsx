import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Send, Loader2, Sparkles, AlertCircle, Info, ChevronRight, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CATEGORIES = ['Placements', 'Academics', 'Faculty', 'Hostel', 'Mess Food', 'Mental Health'];

const CATEGORY_EMOJI = {
  Placements: '💼',
  Academics: '📚',
  Faculty: '👨‍🏫',
  Hostel: '🏠',
  'Mess Food': '🍽️',
  'Mental Health': '🧠',
};

const PostForm = () => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Placements');
  const [inputType, setInputType] = useState('text');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  // ── Voice Input Setup ──
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join('');
      setContent(transcript);
    };
    recognition.onend = () => setIsListening(false);
  }

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      // Update language before starting
      if (recognition) recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 20) {
      setError('Your post must be at least 20 characters long.');
      return;
    }
    if (content.trim().length > 1000) {
      setError('Post cannot exceed 1000 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API}/posts`,
        { content: content.trim(), category, inputType, language },
        { headers: { 'x-anonymous-token': token } }
      );

      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const reason = err.response?.data?.reason;
      setError(reason || msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = content.length;
  const charWarning = charCount > 900;
  const charOver = charCount > 1000;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {result ? (
          // ── Success State ──
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-3xl p-10 text-white text-center shadow-2xl relative overflow-hidden"
          >
            <Sparkles className="absolute -top-10 -right-10 text-white/10 w-48 h-48" />
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles size={40} className="text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black outfit">Voice Published!</h2>
                <p className="text-brand-100 font-medium">
                  Your feedback is live on the campus pulse.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm font-semibold mt-2">
                  <span>{result.sentimentLabel}</span>
                  <span>·</span>
                  <span>Score: {result.sentimentScore?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/feed')}
                  className="px-6 py-3 bg-white text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition-all flex items-center gap-2"
                >
                  <span>View Live Feed</span>
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/my-posts')}
                  className="px-6 py-3 bg-white/10 text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  My Posts & AI Tips
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // ── Post Form ──
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-8 md:p-10 shadow-soft dark:shadow-none"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white outfit tracking-tight">
                  Speak Your Truth.
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                  Your identity remains a secret, forever.
                </p>
              </div>
              <div className="bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-brand-100 dark:border-brand-500/20">
                <div className="w-1.5 h-1.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-pulse" />
                AI Safe
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        category === cat
                          ? 'bg-brand-600 dark:bg-brand-500 text-white border-transparent shadow-brand'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-brand-300'
                      }`}
                    >
                      {CATEGORY_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Mode Toggle + Language */}
              <div className="flex items-center gap-3">
                <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => { setInputType('text'); if (isListening) recognition?.stop(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      inputType === 'text'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    ✍️ Type
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('voice')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      inputType === 'voice'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    🎤 Speak
                  </button>
                </div>

                {inputType === 'voice' && (
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1">
                    <Globe size={12} className="text-neutral-400 ml-2" />
                    {['en', 'hi'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          language === lang
                            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {lang === 'en' ? 'EN' : 'हिं'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="space-y-3 relative">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Your Feedback</span>
                  <span className={`${charOver ? 'text-danger-500' : charWarning ? 'text-amber-500' : 'text-neutral-300'}`}>
                    {charCount}/1000
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={6}
                    className="w-full px-5 py-4 rounded-2xl text-base bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none pb-16"
                    placeholder={
                      inputType === 'voice'
                        ? 'Press 🎤 below to speak — transcription appears here in real time...'
                        : 'Share your experience honestly. Min 20 characters. Hindi or English both accepted.'
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    readOnly={isListening}
                  />
                  {inputType === 'voice' && (
                    <div className="absolute right-4 bottom-4">
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={!SpeechRecognition}
                        title={
                          !SpeechRecognition
                            ? 'Voice not supported in this browser'
                            : isListening
                            ? 'Stop Recording'
                            : 'Start Recording'
                        }
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          isListening
                            ? 'bg-danger-500 text-white animate-pulse'
                            : 'bg-brand-600 text-white hover:bg-brand-700'
                        }`}
                        aria-label="Voice input"
                      >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                    </div>
                  )}
                </div>
                {isListening && (
                  <p className="text-xs text-danger-500 font-bold animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-danger-500 rounded-full inline-block" />
                    Recording... Speak now. Press stop when done.
                  </p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200/50 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-danger-600 dark:text-danger-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-danger-700 dark:text-danger-400 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !content.trim() || charOver}
                className="btn-primary w-full py-5 text-lg shadow-brand relative"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI Moderation in Progress...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send size={20} />
                    <span>Post Anonymously</span>
                  </div>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-neutral-400 dark:text-neutral-600">
                <Info size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Ling AI reviews every post before publishing.
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostForm;
