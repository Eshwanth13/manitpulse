import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, ArrowRight, BarChart3, User, Sun, Moon, Menu, X, Rss, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const { token, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const close = () => setMobileOpen(false);

  const navLinkClass = (path) =>
    `text-sm font-semibold transition-colors ${
      isActive(path)
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="group" onClick={close}>
            <Logo />
          </Link>

          {/* ── Desktop Nav ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/feed" className={navLinkClass('/feed')}>
              Live Feed
            </Link>
            <Link to="/dashboard" className={`${navLinkClass('/dashboard')} flex items-center gap-1.5`}>
              <BarChart3 size={15} />
              Dashboard
            </Link>

            {token && (
              <Link to="/my-posts" className={`${navLinkClass('/my-posts')} flex items-center gap-1.5`}>
                <User size={15} />
                My Posts
              </Link>
            )}

            {token ? (
              <>
                <Link to="/post" className="btn-primary py-2 px-4 flex items-center gap-1.5">
                  <span>Post</span>
                  <ArrowRight size={14} />
                </Link>
                <button onClick={logout} className="p-2 text-neutral-400 hover:text-danger-500 transition-colors" title="Sign out">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/verify" className="btn-primary py-2 px-4 shadow-brand">
                Get Started
              </Link>
            )}

            {isAdmin ? (
              <Link to="/admin" className="text-sm font-bold text-amber-600 dark:text-amber-400 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                Admin Panel
              </Link>
            ) : (
              <Link to="/admin/login" className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 rounded-lg">
                Staff Login
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

          {/* ── Mobile: theme + hamburger ───────────────────── */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Slide-Down Menu ───────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shadow-medium px-4 py-5 flex flex-col gap-2 animate-in">

          <MobileLink to="/feed" icon={<Rss size={17} />} label="Live Feed" active={isActive('/feed')} onClick={close} />
          <MobileLink to="/dashboard" icon={<BarChart3 size={17} />} label="Dashboard" active={isActive('/dashboard')} onClick={close} />

          {token && (
            <MobileLink to="/my-posts" icon={<User size={17} />} label="My Posts" active={isActive('/my-posts')} onClick={close} />
          )}

          <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

          {token ? (
            <>
              <Link
                to="/post"
                onClick={close}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <span>Post Anonymously</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => { logout(); close(); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
              >
                <LogOut size={17} />
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/verify" onClick={close} className="btn-primary w-full flex items-center justify-center gap-2 py-3 shadow-brand">
              Get Started Free
            </Link>
          )}

          {isAdmin ? (
            <MobileLink to="/admin" icon={<ShieldCheck size={17} />} label="Admin Panel" active={isActive('/admin')} onClick={close} amber />
          ) : (
            <MobileLink to="/admin/login" icon={<ShieldCheck size={17} />} label="Staff Login" active={false} onClick={close} />
          )}
        </div>
      )}

      {/* Backdrop overlay for mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 top-16 bg-black/20 dark:bg-black/40"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
};

/* ── Mobile nav link item ── */
const MobileLink = ({ to, icon, label, active, onClick, amber = false }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
      amber
        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
        : active
        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
    }`}
  >
    {icon}
    {label}
  </Link>
);

export default Navbar;
