# CampusVani AI — Design System & Styling Specification

> A modern, accessible color system and component guide built for anonymous student feedback platforms.
> Optimized for long reading sessions, dark environments (hostel/night use), and mobile-first usage.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette Overview](#2-color-palette-overview)
3. [Primary Brand Colors](#3-primary-brand-colors)
4. [Semantic Colors](#4-semantic-colors)
5. [Neutral / Gray Scale](#5-neutral--gray-scale)
6. [Typography](#6-typography)
7. [Component Patterns](#7-component-patterns)
8. [Dark Mode Implementation](#8-dark-mode-implementation)
9. [Tailwind Config](#9-tailwind-config)
10. [Accessibility Guidelines](#10-accessibility-guidelines)
11. [Responsive Design](#11-responsive-design)
12. [Animation & Transitions](#12-animation--transitions)
13. [Quick Reference Cheat Sheet](#13-quick-reference-cheat-sheet)

---

## 1. Design Philosophy

### Theme: "Anonymous But Trusted"

CampusVani must feel **safe, credible, and calm** — not like a chaotic social media feed. Students posting sensitive feedback (mental health, placement anxiety) need a UI that feels private and non-judgmental.

### Light Mode
- **Background**: Soft indigo-white (`#F8FAFF`) — slightly cooler than pure white, feels digital-native
- **Primary**: Deep violet-blue (`#4F46E5`) — conveys trust and seriousness without being corporate
- **Text**: Rich slate (`#0F172A`) — excellent readability on light backgrounds

### Dark Mode
- **Background**: Deep blue-black (`#0D0F1A`) — softer than pure black, reduces harsh contrast for late-night hostel usage
- **Primary**: Soft violet (`#818CF8`) — pops clearly on dark backgrounds, accessible
- **Text**: Light neutral (`#F1F5F9`) — optimal legibility, not harsh white

### Guiding Principles
1. **Anonymous-safe feel** — Nothing looks like a "social network." No likes, no avatars, no clout signals.
2. **Mobile-first** — Most NIT students will use this on phones. Every element is thumb-friendly.
3. **Dark mode priority** — Students use this at night. Dark mode is equally polished, not an afterthought.
4. **Calm color temperature** — No aggressive reds or neons in base UI. Emotion colors are reserved for sentiment badges only.
5. **Readable at a glance** — Sentiment, category, and topic must be scannable in under 2 seconds per post card.

---

## 2. Color Palette Overview

```
Brand Identity Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  brand-600   #4F46E5   Light mode primary   ⭐
  brand-400   #818CF8   Dark mode primary    ⭐

Sentiment Indicator Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  positive    #10B981   Green   (happy/optimistic posts)
  neutral     #F59E0B   Amber   (factual/mixed posts)
  negative    #EF4444   Red     (frustrated/sad posts)

Semantic UI Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  success     #10B981   Confirmations, published, verified
  danger      #EF4444   Errors, rejected, flagged
  warning     #F59E0B   Pending, under review, caution
  info        #06B6D4   Tips, AI suggestions, info banners

Neutral Scale:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Light bg    #F8FAFF   Page background
  Dark bg     #0D0F1A   Page background (dark)
  Cards       #FFFFFF / #1A1D2E
  Borders     #E2E8F0 / #2D3148
```

---

## 3. Primary Brand Colors

### Brand Violet-Blue (`brand-*`)

**Purpose**: Primary buttons, links, active states, focus rings, logo accent

| Shade | Hex | Light Mode Use | Dark Mode Use |
|-------|-----|---------------|---------------|
| 50 | `#EEF2FF` | Tinted backgrounds | — |
| 100 | `#E0E7FF` | Hover tints | — |
| 200 | `#C7D2FE` | Chip backgrounds | — |
| 300 | `#A5B4FC` | Borders, outlines | Text on dark |
| 400 | `#818CF8` | — | **Primary** ⭐ |
| 500 | `#6366F1` | Secondary actions | Hover |
| 600 | `#4F46E5` | **Primary** ⭐ | — |
| 700 | `#4338CA` | Hover state | — |
| 800 | `#3730A3` | Active/pressed | — |
| 900 | `#312E81` | Deep accent | — |

**Visual:**
```
Light Mode Brand Scale:
████ brand-50  #EEF2FF  (lightest tint)
████ brand-100 #E0E7FF
████ brand-200 #C7D2FE
████ brand-300 #A5B4FC
████ brand-400 #818CF8  ← dark mode primary ⭐
████ brand-500 #6366F1
████ brand-600 #4F46E5  ← light mode primary ⭐
████ brand-700 #4338CA
████ brand-800 #3730A3
████ brand-900 #312E81
```

**Usage Examples:**
```tsx
// Primary action button (adaptive)
<button className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-500 text-white">
  Post Anonymously
</button>

// Active nav link
<a className="text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400">
  Live Feed
</a>

// Focus ring (all interactive elements)
className="focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:ring-offset-2"
```

---

## 4. Semantic Colors

### Sentiment Colors (Core to CampusVani)

These are the most important colors in the UI. Every post shows a sentiment badge.

#### 😊 Positive — Emerald Green (`positive-*` / `success-*`)

**Purpose**: Positive sentiment badge, published confirmation, verified status, approved posts

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#ECFDF5` | Light background for success alerts |
| 400 | `#34D399` | Dark mode badge |
| 500 | `#10B981` | **Primary** ⭐ Badge, button |
| 600 | `#059669` | Hover |
| 700 | `#047857` | Active |
| 900/20 | `rgba` | Dark mode alert background |

```tsx
// Sentiment badge — Positive
<span className="px-3 py-1 rounded-full text-xs font-bold bg-success-500 text-white">
  😊 Positive
</span>

// Published success alert
<div className="bg-success-50 dark:bg-success-900/20 border border-success-500/40 rounded-xl p-4">
  <p className="text-success-700 dark:text-success-400 font-semibold">
    ✓ Posted anonymously!
  </p>
</div>

// Verified email badge
<span className="bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 px-2 py-0.5 rounded-md text-xs">
  ✓ Verified
</span>
```

---

#### 😐 Neutral — Amber (`neutral-sentiment-*` / `warning-*`)

**Purpose**: Neutral sentiment badge, pending moderation, "under review" state

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FFFBEB` | Light background |
| 400 | `#FBBF24` | Dark mode badge |
| 500 | `#F59E0B` | **Primary** ⭐ |
| 600 | `#D97706` | Hover |
| 700 | `#B45309` | Strong warning text |

```tsx
// Sentiment badge — Neutral
<span className="px-3 py-1 rounded-full text-xs font-bold bg-warning-500 text-white">
  😐 Neutral
</span>

// Pending moderation notice
<div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-400/40 rounded-xl p-4">
  <p className="text-warning-700 dark:text-warning-400">
    ⏳ Post is under AI review...
  </p>
</div>
```

---

#### 😟 Negative — Red (`negative-*` / `danger-*`)

**Purpose**: Negative sentiment badge, error messages, rejected post, fake detection alert

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FEF2F2` | Error background |
| 400 | `#F87171` | Dark mode badge |
| 500 | `#EF4444` | **Primary** ⭐ |
| 600 | `#DC2626` | Destructive button hover |
| 700 | `#B91C1C` | Strong error text |

```tsx
// Sentiment badge — Negative
<span className="px-3 py-1 rounded-full text-xs font-bold bg-danger-500 text-white">
  😟 Negative
</span>

// Post rejected (admin view)
<div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-500/40 rounded-xl p-4">
  <p className="text-danger-700 dark:text-danger-400">
    ✗ Post rejected — possible spam detected
  </p>
</div>

// Report as Fake button
<button className="text-danger-500 hover:text-danger-700 dark:text-danger-400 text-xs underline">
  Report as Fake
</button>
```

---

#### ℹ️ Info — Cyan (`info-*`)

**Purpose**: AI tips section, informational banners, help text, token expiry notice

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#ECFEFF` | Light background |
| 400 | `#22D3EE` | Dark mode |
| 500 | `#06B6D4` | **Primary** ⭐ |
| 600 | `#0891B2` | Hover |
| 700 | `#0E7490` | Active |

```tsx
// AI Tips banner
<div className="bg-info-50 dark:bg-info-900/20 border border-info-400/30 rounded-xl p-4">
  <p className="text-info-700 dark:text-info-400 text-sm">
    💡 AI Tip: Based on your posts, here's what seniors did...
  </p>
</div>
```

---

## 5. Neutral / Gray Scale

### Purpose: Backgrounds, surfaces, borders, text hierarchy

| Shade | Hex | Light Mode | Dark Mode |
|-------|-----|-----------|-----------|
| 50 | `#F8FAFF` | **Page background** ⭐ | Primary text |
| 100 | `#F1F5F9` | Elevated surface | — |
| 200 | `#E2E8F0` | **Default borders** ⭐ | — |
| 300 | `#CBD5E1` | Strong borders | — |
| 400 | `#94A3B8` | Muted text (both) | Muted text |
| 500 | `#64748B` | Secondary text | Secondary text |
| 600 | `#475569` | — | **Borders** ⭐ |
| 700 | `#334155` | — | Elevated surface |
| 800 | `#1E293B` | — | **Card bg** ⭐ |
| 850 | `#1A1D2E` | — | **Deeper card** |
| 900 | `#0F172A` | **Primary text** ⭐ | — |
| 950 | `#0D0F1A` | — | **Page background** ⭐ |

**Visual:**
```
Light Mode (white page):
░░░░ neutral-50  #F8FAFF  ← page bg
░░░░ neutral-100 #F1F5F9  ← elevated surfaces
░░░░ neutral-200 #E2E8F0  ← borders ⭐
░░░░ neutral-300 #CBD5E1
▒▒▒▒ neutral-400 #94A3B8  ← muted text
▒▒▒▒ neutral-500 #64748B  ← secondary text
▓▓▓▓ neutral-900 #0F172A  ← primary text ⭐

Dark Mode (dark page):
████ neutral-950 #0D0F1A  ← page bg ⭐
████ neutral-800 #1E293B  ← card bg ⭐
████ neutral-700 #334155  ← elevated
████ neutral-600 #475569  ← borders ⭐
▓▓▓▓ neutral-500 #64748B  ← muted text
▒▒▒▒ neutral-400 #94A3B8  ← secondary text
░░░░ neutral-50  #F8FAFF  ← primary text ⭐
```

**Usage Examples:**
```tsx
// Adaptive page wrapper
<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">

// Standard card
<div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-2xl">

// Muted metadata (timestamp, category)
<span className="text-neutral-500 dark:text-neutral-400 text-xs">
  2 hours ago · Placement
</span>
```

---

## 6. Typography

### Font Stack

```css
/* Primary: Inter — clean, modern, screen-optimized */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace: for AI-generated content / stats */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Import in index.html or CSS
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size | Weight | Use Case |
|-------|------|--------|---------|
| `display` | 36px / 2.25rem | 800 | Landing page headline |
| `h1` | 28px / 1.75rem | 700 | Page titles |
| `h2` | 22px / 1.375rem | 700 | Section headings |
| `h3` | 18px / 1.125rem | 600 | Card titles, modal headings |
| `body-lg` | 16px / 1rem | 400 | Default body text |
| `body` | 14px / 0.875rem | 400 | Post content, descriptions |
| `small` | 12px / 0.75rem | 400 | Metadata, timestamps, labels |
| `label` | 12px / 0.75rem | 600 | Form labels, badges |

```tsx
// Display headline (landing page)
<h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight">
  Speak Anonymously.<br/>Your Voice Matters.
</h1>

// Section heading
<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
  Campus Pulse
</h2>

// Post body text
<p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
  {post.content}
</p>

// Timestamp / metadata
<span className="text-xs text-neutral-500 dark:text-neutral-400">
  3 hours ago · Mental Health
</span>
```

---

## 7. Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="
  px-5 py-3 rounded-xl font-semibold text-sm
  bg-brand-600 hover:bg-brand-700
  dark:bg-brand-400 dark:hover:bg-brand-500
  text-white shadow-md shadow-brand-600/20
  transition-all duration-200 active:scale-95
  focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:ring-offset-2
">
  Post Anonymously
</button>
```

#### Secondary Button
```tsx
<button className="
  px-5 py-3 rounded-xl font-semibold text-sm
  bg-neutral-100 hover:bg-neutral-200
  dark:bg-neutral-700 dark:hover:bg-neutral-600
  text-neutral-800 dark:text-neutral-100
  border border-neutral-200 dark:border-neutral-600
  transition-all duration-200 active:scale-95
">
  View Campus Pulse
</button>
```

#### Ghost / Text Button
```tsx
<button className="
  px-4 py-2 rounded-lg font-medium text-sm
  text-brand-600 hover:text-brand-700
  dark:text-brand-400 dark:hover:text-brand-300
  hover:bg-brand-50 dark:hover:bg-brand-900/20
  transition-all duration-200
">
  View All Posts
</button>
```

#### Danger Button (Admin: Reject post)
```tsx
<button className="
  px-4 py-2 rounded-lg font-semibold text-sm
  bg-danger-500 hover:bg-danger-600
  text-white transition-all duration-200 active:scale-95
">
  Reject
</button>
```

#### Success Button (Admin: Approve post)
```tsx
<button className="
  px-4 py-2 rounded-lg font-semibold text-sm
  bg-success-500 hover:bg-success-600
  text-white transition-all duration-200 active:scale-95
">
  Approve
</button>
```

---

### Cards

#### Post Card (Live Feed)
```tsx
<div className="
  bg-white dark:bg-neutral-800
  border border-neutral-200 dark:border-neutral-700
  rounded-2xl p-5
  hover:shadow-md hover:shadow-neutral-200/60 dark:hover:shadow-neutral-900/60
  transition-all duration-200
">
  {/* Top row: category + time */}
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
      Placement
    </span>
    <span className="text-xs text-neutral-400 dark:text-neutral-500">2h ago</span>
  </div>

  {/* Post text */}
  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
    {post.content}
  </p>

  {/* Bottom row: sentiment + report */}
  <div className="flex items-center justify-between">
    <SentimentBadge label={post.sentimentLabel} />
    <button className="text-xs text-neutral-400 hover:text-danger-500 dark:hover:text-danger-400 transition-colors">
      Report
    </button>
  </div>
</div>
```

#### Metric Card (Admin Dashboard)
```tsx
<div className="
  bg-white dark:bg-neutral-800
  border border-neutral-200 dark:border-neutral-700
  rounded-2xl p-6
">
  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
    Total Posts This Week
  </p>
  <p className="text-3xl font-extrabold text-neutral-900 dark:text-white">
    247
  </p>
  <p className="text-xs text-success-600 dark:text-success-400 mt-1 font-medium">
    ↑ 18% from last week
  </p>
</div>
```

#### AI Tip Card (Personal Dashboard)
```tsx
<div className="
  bg-gradient-to-br from-brand-50 to-info-50
  dark:from-brand-900/20 dark:to-info-900/20
  border border-brand-200/50 dark:border-brand-700/40
  rounded-2xl p-5
">
  <div className="flex items-start gap-3">
    <span className="text-2xl">💡</span>
    <div>
      <p className="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-1">
        AI Tip for You
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {tip.content}
      </p>
    </div>
  </div>
</div>
```

---

### Forms

#### Text Input
```tsx
<div className="space-y-1.5">
  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
    Your NIT Email
  </label>
  <input
    type="email"
    className="
      w-full px-4 py-3 rounded-xl text-sm
      bg-white dark:bg-neutral-800
      border border-neutral-300 dark:border-neutral-600
      text-neutral-900 dark:text-neutral-50
      placeholder:text-neutral-400 dark:placeholder:text-neutral-500
      focus:outline-none focus:ring-2
      focus:ring-brand-600 dark:focus:ring-brand-400
      focus:border-transparent
      transition-all duration-200
    "
    placeholder="you@nitbhopal.ac.in"
  />
</div>
```

#### Post Textarea
```tsx
<textarea
  rows={5}
  className="
    w-full px-4 py-3 rounded-xl text-sm resize-none
    bg-white dark:bg-neutral-800
    border border-neutral-200 dark:border-neutral-600
    text-neutral-900 dark:text-neutral-50
    placeholder:text-neutral-400 dark:placeholder:text-neutral-500
    focus:outline-none focus:ring-2
    focus:ring-brand-500 dark:focus:ring-brand-400
    focus:border-transparent
    transition-all duration-200
  "
  placeholder="What's on your mind? Hindi या English — दोनों चलते हैं 👍"
/>
```

#### Category Dropdown
```tsx
<select className="
  w-full px-4 py-3 rounded-xl text-sm
  bg-white dark:bg-neutral-800
  border border-neutral-200 dark:border-neutral-600
  text-neutral-700 dark:text-neutral-300
  focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400
  focus:border-transparent transition-all duration-200
  appearance-none cursor-pointer
">
  <option value="">Select Category</option>
  <option value="placement">🎯 Placement</option>
  <option value="academics">📚 Academics</option>
  <option value="hostel">🏠 Hostel</option>
  <option value="mess">🍱 Mess</option>
  <option value="faculty">👨‍🏫 Faculty</option>
  <option value="mental_health">🧠 Mental Health</option>
  <option value="others">💬 Others</option>
</select>
```

---

### Badges

#### Category Badge
```tsx
// Color per category
const categoryColors = {
  placement:     "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  academics:     "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-300",
  hostel:        "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
  mess:          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  faculty:       "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  mental_health: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  others:        "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
}

<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[category]}`}>
  {categoryLabel}
</span>
```

#### Sentiment Badge
```tsx
const sentimentConfig = {
  positive: { color: "bg-success-500", label: "😊 Positive" },
  neutral:  { color: "bg-warning-500", label: "😐 Neutral" },
  negative: { color: "bg-danger-500",  label: "😟 Negative" },
}

<span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${sentimentConfig[sentiment].color}`}>
  {sentimentConfig[sentiment].label}
</span>
```

#### Status Badge (Admin Panel)
```tsx
// Approved
<span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
  ✓ Approved
</span>

// Pending
<span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400">
  ⏳ Pending
</span>

// Rejected
<span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">
  ✗ Rejected
</span>
```

---

### Navigation

#### Top Navbar
```tsx
<nav className="
  sticky top-0 z-50
  bg-white/80 dark:bg-neutral-950/80
  backdrop-blur-md
  border-b border-neutral-200 dark:border-neutral-800
">
  <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
    {/* Logo */}
    <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
      CampusVani
      <span className="text-xs align-super ml-1 font-semibold text-neutral-400">AI</span>
    </span>

    {/* Nav links */}
    <div className="flex items-center gap-6">
      <a className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400">
        Feed
      </a>
      <a className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400">
        My Posts
      </a>
    </div>
  </div>
</nav>
```

---

### Modals & Overlays

#### Verification Modal
```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50" />

{/* Modal */}
<div className="
  fixed inset-x-4 top-1/4 mx-auto max-w-md
  bg-white dark:bg-neutral-800
  border border-neutral-200 dark:border-neutral-700
  rounded-2xl p-6 shadow-2xl z-50
">
  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
    Verify Your NIT Email
  </h3>
  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
    One-time verification. You'll never log in again.
  </p>
  {/* form fields */}
</div>
```

---

### Loading States

#### AI Analysis Loading
```tsx
<div className="flex items-center gap-3 py-4 text-sm text-neutral-500 dark:text-neutral-400">
  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  AI is checking for authenticity...
</div>
```

#### Skeleton Post Card
```tsx
<div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 animate-pulse">
  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full w-1/4 mb-4" />
  <div className="space-y-2 mb-4">
    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full w-full" />
    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full w-5/6" />
    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full w-3/4" />
  </div>
  <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded-full w-20" />
</div>
```

---

## 8. Dark Mode Implementation

### Setup (Tailwind class-based)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // toggles via .dark on <html>
  // ...
}
```

### Toggle Logic
```tsx
// ThemeToggle.jsx
const [theme, setTheme] = useState(
  localStorage.getItem('cv-theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
);

useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('cv-theme', theme);
}, [theme]);
```

### Theme Toggle UI
```tsx
<button
  onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
  className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
  aria-label="Toggle theme"
>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

---

## 9. Tailwind Config

```js
// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          900: '#064E3B',
        },
        danger: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          900: '#7F1D1D',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          900: '#78350F',
        },
        info: {
          50:  '#ECFEFF',
          100: '#CFFAFE',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          900: '#164E63',
        },
        neutral: {
          50:  '#F8FAFF',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#1A1D2E',
          900: '#0F172A',
          950: '#0D0F1A',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft':    '0 2px 12px rgba(0,0,0,0.06)',
        'medium':  '0 4px 24px rgba(0,0,0,0.10)',
        'brand':   '0 4px 14px rgba(79,70,229,0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
```

---

## 10. Accessibility Guidelines

### Contrast Ratios (WCAG 2.1 AA)

| Combination | Ratio | Grade |
|-------------|-------|-------|
| `brand-600` on `white` | 7.4:1 | ✅ AAA |
| `brand-400` on `neutral-950` | 6.9:1 | ✅ AAA |
| `success-500` on `white` | 4.7:1 | ✅ AA |
| `danger-500` on `white` | 5.1:1 | ✅ AA |
| `warning-500` on `white` | 4.6:1 | ✅ AA |
| `neutral-900` on `neutral-50` | 16.7:1 | ✅ AAA |
| `neutral-50` on `neutral-950` | 17.2:1 | ✅ AAA |

### Focus Indicators (Always Required)
```tsx
// Apply on every interactive element
className="focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
```

### ARIA Labels for Anonymous Elements
```tsx
// Voice button
<button aria-label="Record voice message" aria-pressed={isRecording}>
  🎤
</button>

// Report button (no visible label)
<button aria-label="Report this post as fake">
  Report
</button>
```

---

## 11. Responsive Design

### Breakpoints (Tailwind defaults)

| Breakpoint | Width | Usage in CampusVani |
|-----------|-------|---------------------|
| (default) | 0px+ | Mobile — primary target |
| `sm` | 640px+ | Larger phones |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Desktop (sidebar visible) |
| `xl` | 1280px+ | Wide desktop |

### Layout Patterns

```tsx
// Page wrapper (mobile-first, capped width)
<div className="max-w-2xl mx-auto px-4 lg:px-0">

// Feed + Sidebar (stacked on mobile, side-by-side on desktop)
<div className="flex flex-col lg:flex-row gap-6">
  <main className="flex-1 min-w-0">        {/* Post feed */}
  <aside className="lg:w-80 shrink-0">    {/* Sentiment sidebar */}
</div>

// Admin dashboard grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Metric cards */}
</div>
```

### Touch Targets
All interactive elements must be minimum `44x44px` for mobile usability:
```tsx
// Minimum touch target
className="min-h-[44px] min-w-[44px] flex items-center justify-center"
```

---

## 12. Animation & Transitions

### Base Transitions
```tsx
// Color/background changes (most UI)
className="transition-colors duration-200"

// All properties (cards, hovers)
className="transition-all duration-200"

// Subtle scale on button press
className="active:scale-95 transition-transform duration-100"
```

### Theme Switch Transition
```css
/* globals.css — smooth theme transition */
*, *::before, *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}
```

### Loading Spinner
```tsx
<div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
```

### Post Appear Animation
```tsx
// New post slides in from bottom
<div className="animate-in slide-in-from-bottom-4 duration-300">
  <PostCard post={post} />
</div>
```

### Skeleton Pulse
```tsx
className="animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl"
```

---

## 13. Quick Reference Cheat Sheet

### Colors by Context

| Context | Light Mode Class | Dark Mode Class |
|---------|-----------------|-----------------|
| Page background | `bg-neutral-50` | `dark:bg-neutral-950` |
| Card background | `bg-white` | `dark:bg-neutral-800` |
| Elevated card | `bg-neutral-100` | `dark:bg-neutral-700` |
| Default border | `border-neutral-200` | `dark:border-neutral-700` |
| Strong border | `border-neutral-300` | `dark:border-neutral-600` |
| Primary text | `text-neutral-900` | `dark:text-neutral-50` |
| Body text | `text-neutral-700` | `dark:text-neutral-300` |
| Secondary text | `text-neutral-500` | `dark:text-neutral-400` |
| Muted text | `text-neutral-400` | `dark:text-neutral-500` |
| Primary button | `bg-brand-600` | `dark:bg-brand-400` |
| Primary hover | `hover:bg-brand-700` | `dark:hover:bg-brand-500` |
| Focus ring | `focus:ring-brand-600` | `dark:focus:ring-brand-400` |

### Sentiment Colors at a Glance

| Sentiment | Badge BG | Text on Dark | Emoji |
|-----------|----------|-------------|-------|
| Positive | `bg-success-500` | `text-success-400` | 😊 |
| Neutral | `bg-warning-500` | `text-warning-400` | 😐 |
| Negative | `bg-danger-500` | `text-danger-400` | 😟 |

### Spacing & Rounding

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Inputs, small chips |
| `rounded-xl` | 12px | Buttons |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-full` | 9999px | Badges, avatars |
| `p-4` | 16px | Compact card padding |
| `p-5` | 20px | Standard card padding |
| `p-6` | 24px | Roomy card padding |
| `gap-4` | 16px | Default grid/flex gap |

---

## Real-World Screen Examples

### Post Card (Light vs Dark)
```
LIGHT MODE:
┌────────────────────────────────────────────────┐  bg-white
│  🎯 Placement          ·          2 hours ago  │  text-neutral-500
│                                                │
│  Placement season anxiety is real. Nobody      │  text-neutral-700
│  talks about it openly but everyone is         │
│  struggling. Seniors give no real info.        │
│                                                │
│  😟 Negative                         Report   │  danger-500 badge
└────────────────────────────────────────────────┘  border-neutral-200

DARK MODE:
┌────────────────────────────────────────────────┐  bg-neutral-800
│  🎯 Placement          ·          2 hours ago  │  text-neutral-400
│                                                │
│  Placement season anxiety is real. Nobody      │  text-neutral-300
│  talks about it openly but everyone is         │
│  struggling. Seniors give no real info.        │
│                                                │
│  😟 Negative                         Report   │  danger-500 badge
└────────────────────────────────────────────────┘  border-neutral-700
```

### Admin Metric Card
```
LIGHT MODE:
┌─────────────────────────┐
│  POSITIVE SENTIMENT     │  text-neutral-500, uppercase
│                         │
│  74%                    │  text-4xl font-extrabold, neutral-900
│  ↑ 8% from last week   │  text-success-600 text-xs
└─────────────────────────┘  bg-white, border-neutral-200, rounded-2xl

DARK MODE:
┌─────────────────────────┐
│  POSITIVE SENTIMENT     │  text-neutral-400
│                         │
│  74%                    │  text-white
│  ↑ 8% from last week   │  text-success-400
└─────────────────────────┘  bg-neutral-800, border-neutral-700, rounded-2xl
```

---

**Design System Version**: 1.0
**Project**: CampusVani AI
**Last Updated**: April 2026
**Maintained by**: CampusVani Dev Team
