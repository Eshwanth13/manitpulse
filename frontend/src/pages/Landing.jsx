import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Sparkles, BarChart3, ArrowRight, CheckCircle2,
  Eye, Lock, Zap, Users, AlertTriangle, Mic, ChevronRight,
  MessageSquare, TrendingUp, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

const Landing = () => {
  return (
    <div className="flex flex-col space-y-28 pb-24">

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative pt-12 overflow-hidden text-center flex flex-col items-center">
        <motion.div {...fadeUp(0)} className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-8">
          <Shield size={14} className="text-brand-600 dark:text-brand-400" />
          <span>Anonymous · Verified · Powered by AI</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1] max-w-4xl">
          MANIT's Voice. <br />
          <span className="text-gradient font-black">Amplified. Anonymous.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="mt-8 text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          ManitPulse is the safe space for MANIT Bhopal students. Share feedback, report campus issues, and drive real change — without revealing your identity.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/verify" className="btn-primary flex items-center space-x-2 px-8 py-4 text-base bg-brand-600 shadow-brand">
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/feed" className="btn-secondary px-8 py-4 text-base">
            View Live Feed
          </Link>
          <Link to="/dashboard" className="btn-secondary px-8 py-4 text-base">
            Campus Dashboard
          </Link>
        </motion.div>

        {/* Backdrop Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none -z-10 opacity-40 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-400/30 rounded-full blur-[120px]"></div>
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        </div>
      </section>

      {/* ── Why ManitPulse Is Different ────────────────────── */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <motion.span {...fadeUp(0)} className="inline-block text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Why ManitPulse?
          </motion.span>
          <motion.h2 {...fadeUp(0.1)} className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Not Just Another Feedback Form
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            Traditional suggestion boxes and college portals fail students. ManitPulse is built differently — from the ground up.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <CompareCard
            icon={<AlertTriangle className="text-danger-500" size={22} />}
            label="Old Way"
            variant="bad"
            points={[
              'Suggestion boxes that no one reads',
              'Identity-linked complaints — fear of repercussions',
              'No data, no trends, no accountability',
              'Admin sees raw complaints, no context',
              'Zero follow-up or acknowledgment',
            ]}
          />
          <CompareCard
            icon={<Sparkles className="text-brand-500" size={22} />}
            label="ManitPulse"
            variant="good"
            points={[
              'Real-time public feed — issues visible to all',
              'Cryptographically anonymous — no identity stored',
              'AI sentiment dashboard for admins with trends',
              'Automated weekly insight reports for department heads',
              'Students see collective campus mood live',
            ]}
          />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <motion.span {...fadeUp(0)} className="inline-block text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Core Features
          </motion.span>
          <motion.h2 {...fadeUp(0.1)} className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Everything Students Need
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Lock className="text-brand-600 dark:text-brand-400" />}
            title="Zero Identity Storage"
            desc="We verify your MANIT email once via magic link. After that, your name is never linked to any post — ever."
          />
          <FeatureCard
            icon={<Sparkles className="text-amber-500" />}
            title="AI Moderation (Ling AI)"
            desc="Every post is screened by Ling 2.6 Flash for fake content, spam, and toxicity before it reaches the public feed."
          />
          <FeatureCard
            icon={<BarChart3 className="text-success-600 dark:text-success-400" />}
            title="Admin Insights Dashboard"
            desc="Collective sentiment data is turned into weekly AI-generated reports for college administration to act on."
          />
          <FeatureCard
            icon={<TrendingUp className="text-info-600 dark:text-info-400" />}
            title="Live Campus Mood Meter"
            desc="See the real-time emotional pulse of MANIT — is the campus optimistic, mixed, or distressed today?"
          />
          <FeatureCard
            icon={<Mic className="text-violet-500" />}
            title="Voice & Text Input"
            desc="Post using your voice in Hindi or English. No need to type — just speak your truth."
          />
          <FeatureCard
            icon={<Eye className="text-rose-500" />}
            title="Duplicate Detection"
            desc="AI compares embeddings to prevent spam and repetitive posts flooding the feed."
          />
        </div>
      </section>

      {/* ── How To Use ────────────────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <motion.span {...fadeUp(0)} className="inline-block text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
            How It Works
          </motion.span>
          <motion.h2 {...fadeUp(0.1)} className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Up & Running in 3 Steps
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-brand-200 dark:bg-brand-800/60" />

          <StepCard
            step="1"
            icon={<BookOpen size={28} className="text-brand-600 dark:text-brand-400" />}
            title="Verify Your Email"
            desc="Enter your official MANIT email. We send a one-time magic link. No password, no account, no personal data stored."
          />
          <StepCard
            step="2"
            icon={<MessageSquare size={28} className="text-brand-600 dark:text-brand-400" />}
            title="Post Your Feedback"
            desc="Choose a category (Hostel, Academics, Faculty…), type or speak your feedback, and hit Post Anonymously."
          />
          <StepCard
            step="3"
            icon={<Users size={28} className="text-brand-600 dark:text-brand-400" />}
            title="See Campus React"
            desc="Your verified post goes live on the public feed. The campus mood meter updates in real time."
          />
        </div>

        <div className="text-center mt-6">
          <Link to="/verify" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base shadow-brand">
            <span>Verify My Email Now</span>
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Trust Quote ───────────────────────────────────── */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 md:p-16 text-center space-y-8 relative overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-tight">
          "The most powerful voice is the one that speaks without fear."
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          <TrustStat icon={<CheckCircle2 size={16} />} text="100% Anonymity" />
          <TrustStat icon={<CheckCircle2 size={16} />} text="Ling AI Moderation" />
          <TrustStat icon={<CheckCircle2 size={16} />} text="Admin Reports" />
          <TrustStat icon={<Zap size={16} />} text="Real-time Feed" />
        </div>
        {/* Glow effect */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="pt-12 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-neutral-500">© 2026 ManitPulse AI • For {import.meta.env.VITE_COLLEGE_NAME || 'MANIT Bhopal'}</p>
        <div className="flex gap-6">
          <Link to="/admin/login" className="text-xs font-bold text-neutral-400 hover:text-brand-600 transition-colors">Admin Access</Link>
          <a href="#" className="text-xs font-bold text-neutral-400 hover:text-brand-600 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────── */

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 rounded-2xl hover:shadow-medium transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">{title}</h3>
    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const StepCard = ({ step, icon, title, desc }) => (
  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 text-center space-y-4 relative">
    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-200 dark:border-brand-700 rounded-2xl flex items-center justify-center mx-auto">
      {icon}
    </div>
    <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-brand-400 dark:text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-full border border-brand-100 dark:border-brand-800">
      Step {step}
    </span>
    <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">{title}</h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
  </div>
);

const CompareCard = ({ icon, label, variant, points }) => (
  <div className={`rounded-2xl p-8 border space-y-5 ${
    variant === 'good'
      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700/40'
      : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700'
  }`}>
    <div className="flex items-center gap-3">
      {icon}
      <span className={`font-black text-base ${variant === 'good' ? 'text-brand-700 dark:text-brand-300' : 'text-neutral-600 dark:text-neutral-400'}`}>
        {label}
      </span>
    </div>
    <ul className="space-y-3">
      {points.map((pt, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          {variant === 'good'
            ? <CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" />
            : <span className="w-4 h-4 rounded-full bg-danger-200 dark:bg-danger-800 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger-500 dark:bg-danger-400" />
              </span>
          }
          <span className={variant === 'good' ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-500'}>
            {pt}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const TrustStat = ({ icon, text }) => (
  <div className="flex items-center space-x-2 text-neutral-400 text-sm font-semibold uppercase tracking-widest">
    {icon}
    <span>{text}</span>
  </div>
);

export default Landing;
