import React from 'react';

/**
 * ManitPulse Logo Component
 * Icon: speech bubble outline (no filled background box) + EKG pulse line.
 * Wordmark: "Manit" (dark/white) + "Pulse" (brand indigo).
 * Automatically adapts to dark / light mode via Tailwind dark: classes on the SVG strokes.
 */
const Logo = ({ className = '' }) => {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {/* ── Icon: Speech bubble outline + pulse line ── */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bubbleGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>

        {/* Speech bubble — stroke outline only, no background fill */}
        <path
          d="M5 8C5 5.791 6.791 4 9 4H31C33.209 4 35 5.791 35 8V22C35 24.209 33.209 26 31 26H16L10 33V26H9C6.791 26 5 24.209 5 22V8Z"
          stroke="url(#bubbleGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* EKG / Heartbeat pulse line */}
        <polyline
          points="8,15 13,15 16,8 19,22 22,10 25,15 32,15"
          stroke="url(#pulseGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* ── Wordmark: Manit + Pulse ── */}
      <span className="text-[1.2rem] font-extrabold tracking-tight leading-none select-none mt-1">
        <span className="text-neutral-900 dark:text-white">Manit</span>
        <span className="text-brand-600 dark:text-brand-400">Pulse</span>
      </span>
    </div>
  );
};

export default Logo;
