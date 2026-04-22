# CampusVani AI — Complete Project Specification
> **For:** Antigravity Development Team  
> **Version:** 2.0 (Final)  
> **Project:** Verified Anonymous Student Sentiment Analyzer for MANIT Bhopal (NIT Bhopal)  
> **Status:** Ready for Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Key Features](#4-key-features)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Core Workflows](#9-core-workflows)
10. [AI Layer — Gemini Integration](#10-ai-layer--gemini-integration)
11. [Admin Dashboard](#11-admin-dashboard)
12. [Frontend Screens](#12-frontend-screens)
13. [Security & Rate Limiting](#13-security--rate-limiting)
14. [Environment Variables](#14-environment-variables)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)
16. [Non-Functional Requirements](#16-non-functional-requirements)
17. [Impact & Success Metrics](#17-impact--success-metrics)

---

## 1. Project Overview

**CampusVani AI** is a privacy-first, AI-powered anonymous feedback platform built exclusively for students of MANIT Bhopal (NIT Bhopal). It enables students to post honest, verified-anonymous feedback across key campus categories — placements, academics, faculty, hostels, mess food, and mental health — without any fear of identification.

Every post is:
- Verified via a one-time magic-link using the student's official college email
- Analyzed and moderated by Gemini AI before going live
- Stored with zero Personally Identifiable Information (PII)

The platform provides real-time sentiment trends, an interactive campus pulse dashboard, and one-click weekly PDF reports for the placement cell and administration.

**Deployment (Beta):**
- Frontend: Vercel preview URL (no custom domain for MVP)
- Backend: Render preview URL
- Custom domain (`campusvani.ai`) can be added post-beta

---

## 2. Problem Statement

Students at MANIT Bhopal hesitate to share honest feedback due to fear of identification. Existing feedback methods (e.g., Google Forms) suffer from two critical problems:

- **Spam / Fake Responses:** High volume of unreliable entries makes data unusable for administrative decision-making.
- **No Real-Time Insights:** There is no live dashboard or automated reporting mechanism — insights are delayed, manual, and often ignored.

As a result:
- Student concerns remain unaddressed
- Placement cell lacks accurate data on campus sentiment
- Student stress and admin disconnect increase over time

---

## 3. Proposed Solution

CampusVani AI addresses both problems through three pillars:

| Pillar | Mechanism |
|---|---|
| **Privacy & Anonymity** | One-time magic-link via official email; email deleted post-verification; only anonymous token retained |
| **AI Moderation** | Gemini 2.5 Flash + embedding-based fake detection before any post goes live |
| **Real-Time Insights** | Live sentiment dashboard (polling every 15s) + one-click weekly PDF report for admin |

---

## 4. Key Features

### Student-Facing
- **Passwordless Verification:** One-time magic-link via official `@stu.manit.ac.in` email — email is deleted from DB immediately after successful verification
- **Text + Voice Input:** Post feedback by typing or recording voice — browser's Web Speech API handles speech-to-text on the client side; only plain text reaches the backend. Hindi (`hi-IN`) and English (`en-US`) both supported.
- **Category Selection:** Placements, Academics, Faculty, Hostel, Mess Food, Mental Health
- **Anonymous Submission:** No name, roll number, or email stored after verification
- **Public Live Feed:** Real-time feed of all approved posts with AI-generated sentiment badges; frontend polls `/api/posts` every 15 seconds
- **Personalized AI Tips:** AI-generated suggestions (2–3 tips) based on the student's own post history, fetched via anonymous token
- **Post Deletion:** Students can soft-delete their own posts using their anonymous token. Deleted posts are hidden from the public feed and "My Posts" view but retained in DB with `status: "deleted"` for admin audit trail. Editing is not allowed.
- **Report as Fake:** Any user can flag a suspicious post; `reportCount` on the post document increments

### Admin-Facing
- **Protected Admin Panel** at `/admin` — secured via `Authorization: Bearer <ADMIN_SECRET_KEY>` header, validated in Express middleware. Secret stored in `.env`.
- **Single Admin User** — placement cell only (no multi-user management in MVP)
- **Sentiment Dashboard:** Interactive charts (Recharts) showing campus-wide trends by category, time, and emotion
- **One-Click Weekly PDF Report:** Generated using `pdfkit` on the backend; Gemini 2.5 Flash writes the content; download served via API
- **Moderation Logs:** View flagged and rejected posts with AI rejection reasons
- **Soft-Deleted Post Audit:** Admins can view all posts including `status: "deleted"` entries

### Platform-Wide
- **Rate Limiting:** Max 3 posts per anonymous token per 24-hour rolling window; 1-hour cooldown between any two consecutive posts. Tracked in `anonymousUsers` document fields — no separate collection.
- **Fake Detection:** Hybrid — cosine similarity on stored embeddings + Gemini 2.5 Flash structured JSON moderation
- **Mobile-First PWA:** Installable on mobile, responsive on all screen sizes

---

## 5. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 (Vite) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Icons | Lucide Icons |
| Voice Input | Browser Web Speech API (`SpeechRecognition`) — client-side only, no backend audio |
| App Type | Mobile-first PWA |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express.js |
| Email | Nodemailer with Gmail SMTP (App Password) |
| PDF Generation | `pdfkit` |
| Auth | Admin: `Authorization: Bearer` header checked in middleware. Student: anonymous UUID token in `localStorage`. |

### Database
| Layer | Technology |
|---|---|
| Primary DB | MongoDB Atlas (free M0 tier) |
| Token Cleanup | TTL Index on `verificationTokens.createdAt` (expires after 15 min) |
| Rate Limit Storage | Fields inside `anonymousUsers` document |
| Embedding Storage | Arrays inside `posts` document (no separate vector DB) |

### AI Layer
| Purpose | Model |
|---|---|
| Moderation, Sentiment Analysis, Report Generation | Gemini 2.5 Flash |
| Fake Detection (Embeddings) | Gemini Embedding Model |
| SDK | `@google/generative-ai` |
| Output Format | `responseMimeType: "application/json"` + `responseSchema` for all structured calls |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 6. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   React Frontend (Vercel)                     │
│                                                               │
│  Landing │ Post Form │ Feed │ Dashboard │ My Posts │ Admin   │
│                                                               │
│  Voice → Web Speech API → plain text → POST /api/posts       │
│  Feed → polls GET /api/posts every 15 seconds                │
└─────────────────────────┬────────────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼────────────────────────────────────┐
│              Node.js + Express Backend (Render)               │
│                                                               │
│  Middleware: Admin Bearer key check │ Rate limit check        │
│                                                               │
│  /api/auth    /api/posts    /api/insights    /api/admin       │
└──────┬──────────────┬───────────────────────────────────────┘
       │              │
┌──────▼──────┐  ┌────▼────────────────────────────────────┐
│  MongoDB    │  │           Gemini AI Layer                │
│  Atlas      │  │                                          │
│             │  │  Embedding Model → vector array          │
│  Collections│  │  Gemini 2.5 Flash → structured JSON      │
│  - tokens   │  │  (moderation + sentiment + report text)  │
│  - users    │  └──────────────────────────────────────────┘
│  - posts    │
└─────────────┘
```

**Key architectural decisions:**
- Voice-to-text is 100% client-side (Web Speech API). Backend never handles audio.
- Post embeddings stored as float arrays in the `posts` document. Cosine similarity computed in a custom JS utility — no external library.
- Real-time feed uses simple polling (15s interval), not WebSockets.
- Admin access uses a single `ADMIN_SECRET_KEY` from `.env` — checked in Express middleware on all `/api/admin/*` routes.

---

## 7. Database Schema

### Collection: `verificationTokens`
> TTL index on `createdAt` — auto-expires and deletes document after 15 minutes.

```json
{
  "_id": "ObjectId",
  "email": "24112011172@stu.manit.ac.in",
  "token": "uuid-v4-string",
  "createdAt": "ISODate"
}
```

**Notes:**
- On successful verification, this document is deleted with `deleteOne()` immediately — email is never retained.
- Only `@stu.manit.ac.in` domain is accepted. Backend validates this before sending any email.

---

### Collection: `anonymousUsers`
> Created after successful email verification. No PII stored.

```json
{
  "_id": "ObjectId",
  "anonymousToken": "uuid-v4-string",
  "createdAt": "ISODate",
  "postCountToday": 2,
  "lastPostTimestamp": "ISODate",
  "lastResetDate": "YYYY-MM-DD"
}
```

**Rate Limiting Fields:**

| Field | Type | Purpose |
|---|---|---|
| `postCountToday` | Number | Count of posts submitted in the current calendar day |
| `lastPostTimestamp` | ISODate | Timestamp of the most recent post submission |
| `lastResetDate` | String (YYYY-MM-DD) | The date `postCountToday` was last reset to 0 |

**Rate Limit Logic (enforced atomically in backend):**
1. If `lastResetDate` ≠ today → reset `postCountToday` to 0, update `lastResetDate`
2. If `postCountToday` ≥ 3 → reject with "Daily post limit reached"
3. If `Date.now() - lastPostTimestamp` < 3600000 (1 hour in ms) → reject with "Please wait before posting again"
4. Otherwise → allow post, increment `postCountToday`, update `lastPostTimestamp`

---

### Collection: `posts`

```json
{
  "_id": "ObjectId",
  "anonymousToken": "uuid-v4-string",
  "category": "Placements | Academics | Faculty | Hostel | Mess Food | Mental Health",
  "content": "The placement process this year was quite disorganized...",
  "inputType": "text | voice",
  "language": "en | hi",
  "status": "approved | rejected | deleted",
  "sentimentScore": 0.72,
  "sentimentLabel": "Positive | Negative | Neutral | Mixed",
  "emotions": ["frustrated", "hopeful"],
  "topics": ["placement drive", "company PPO"],
  "aiReason": "Post appears genuine and relevant to campus life.",
  "fakeProbability": 0.04,
  "embedding": [0.123, -0.456, 0.789, "...float array"],
  "reportCount": 0,
  "createdAt": "ISODate"
}
```

**Status values:**

| Value | Meaning | Visible in public feed? | Visible to admin? |
|---|---|---|---|
| `approved` | Passed AI moderation | Yes | Yes |
| `rejected` | Blocked by AI moderation | No | Yes |
| `deleted` | Soft-deleted by student | No | Yes (audit trail) |

---

### MongoDB Indexes

```javascript
// Auto-expire verification tokens after 15 minutes
db.verificationTokens.createIndex({ createdAt: 1 }, { expireAfterSeconds: 900 });

// Public feed queries (approved posts, newest first)
db.posts.createIndex({ status: 1, createdAt: -1 });

// Category filter queries
db.posts.createIndex({ category: 1, status: 1, createdAt: -1 });

// Student's own posts
db.posts.createIndex({ anonymousToken: 1, status: 1 });

// Anonymous user lookup
db.anonymousUsers.createIndex({ anonymousToken: 1 }, { unique: true });
```

---

## 8. API Endpoints

All routes prefixed with `/api`. Frontend base URL stored in `VITE_API_BASE_URL`.

---

### Auth — `/api/auth`

#### `POST /api/auth/send-magic-link`
Validates the email domain, creates a verification token, sends magic link via Nodemailer.

**Request body:**
```json
{ "email": "24112011172@stu.manit.ac.in" }
```

**Validation:**
- Email must end with `@stu.manit.ac.in`
- Reject all other domains with a clear error message

**Response (success):**
```json
{ "success": true, "message": "Magic link sent to your email." }
```

**Response (invalid domain):**
```json
{ "success": false, "message": "Only official MANIT student emails are accepted." }
```

---

#### `GET /api/auth/verify?token=<uuid>`
Validates the token, deletes the `verificationTokens` document, creates a new `anonymousUsers` document, returns the anonymous token.

**Response (success):**
```json
{
  "success": true,
  "anonymousToken": "new-uuid-v4",
  "message": "Verified. Your identity is completely anonymous."
}
```

**Response (invalid/expired token):**
```json
{ "success": false, "message": "This link is invalid or has expired." }
```

---

### Posts — `/api/posts`

#### `POST /api/posts`
Submit a new post. Triggers rate limit check → Gemini embedding → cosine similarity check → Gemini moderation → save or reject.

**Headers:** `x-anonymous-token: <uuid>`

**Request body:**
```json
{
  "content": "The mess food quality has dropped significantly...",
  "category": "Mess Food",
  "inputType": "voice",
  "language": "hi"
}
```

**Response (approved):**
```json
{
  "success": true,
  "status": "approved",
  "sentimentLabel": "Negative",
  "sentimentScore": -0.65,
  "message": "Your post is live."
}
```

**Response (rejected by AI):**
```json
{
  "success": false,
  "status": "rejected",
  "message": "Your post could not be published.",
  "reason": "Post appears to contain spam or test content."
}
```

**Response (rate limited):**
```json
{
  "success": false,
  "message": "Daily post limit reached. You can post again tomorrow."
}
```

---

#### `GET /api/posts`
Fetch paginated approved posts for the public live feed.

**Query params:** `page` (default: 1), `limit` (default: 20), `category` (optional filter)

**Response:**
```json
{
  "posts": [
    {
      "_id": "ObjectId",
      "category": "Placements",
      "content": "...",
      "sentimentLabel": "Positive",
      "sentimentScore": 0.72,
      "emotions": ["hopeful"],
      "topics": ["PPO", "placement drive"],
      "createdAt": "ISODate"
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

> Note: `anonymousToken` and `embedding` are never returned in public responses.

---

#### `GET /api/posts/my`
Fetch all posts (approved + deleted) submitted by the current anonymous token, plus personalized AI tips.

**Headers:** `x-anonymous-token: <uuid>`

**Response:**
```json
{
  "posts": [ { "...post fields..." } ],
  "aiTips": [
    "Your posts suggest high stress around academics. Consider speaking to the student counselor.",
    "You've raised valid concerns about hostel conditions — the admin portal accepts formal complaints at..."
  ]
}
```

---

#### `DELETE /api/posts/:id`
Soft-delete a post. Sets `status` to `"deleted"`. Only works if the post belongs to the token in the header.

**Headers:** `x-anonymous-token: <uuid>`

**Response:**
```json
{ "success": true, "message": "Your post has been removed from the feed." }
```

---

#### `POST /api/posts/:id/report`
Increment `reportCount` on a post. Used for community fake-flagging.

**Response:**
```json
{ "success": true, "message": "Post reported. Thank you for helping keep the feed clean." }
```

---

### Insights — `/api/insights`

#### `GET /api/insights/summary`
Overall platform-wide sentiment stats (public).

**Response:**
```json
{
  "totalApprovedPosts": 342,
  "averageSentimentScore": 0.14,
  "sentimentBreakdown": {
    "Positive": 120,
    "Negative": 145,
    "Neutral": 55,
    "Mixed": 22
  },
  "topCategories": ["Placements", "Mess Food", "Academics"]
}
```

---

#### `GET /api/insights/trends`
Sentiment trend over time for charts.

**Query params:** `period` (`weekly` | `monthly`, default: `weekly`)

**Response:**
```json
{
  "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "averageScores": [0.2, -0.1, 0.4, 0.1, -0.3, 0.5, 0.3]
}
```

---

#### `GET /api/insights/categories`
Per-category breakdown for bar/pie charts.

**Response:**
```json
{
  "categories": [
    { "name": "Placements", "postCount": 85, "averageSentiment": 0.42 },
    { "name": "Mess Food", "postCount": 73, "averageSentiment": -0.61 },
    { "name": "Academics", "postCount": 68, "averageSentiment": 0.08 }
  ]
}
```

---

### Admin — `/api/admin` *(All routes require `Authorization: Bearer <ADMIN_SECRET_KEY>` header)*

#### `GET /api/admin/posts`
All posts including `rejected` and `deleted`, paginated. For admin moderation view.

**Query params:** `status` (optional: `approved | rejected | deleted`), `page`, `limit`

---

#### `POST /api/admin/reports/generate`
Triggers weekly report generation: aggregates MongoDB data → sends to Gemini 2.5 Flash → generates PDF using `pdfkit` → returns download URL.

**Response:**
```json
{
  "success": true,
  "reportId": "ObjectId",
  "downloadUrl": "/api/admin/reports/download/<reportId>"
}
```

---

#### `GET /api/admin/reports/download/:id`
Streams the generated PDF report as a file download.

**Response:** `Content-Type: application/pdf`

---

## 9. Core Workflows

### Workflow 1: Student Registration & Verification

```
Student visits app → clicks "Post Anonymously"
        │
        ▼
Enters official MANIT email (e.g., 24112011172@stu.manit.ac.in)
        │
        ▼
Backend validates: domain must be @stu.manit.ac.in (hard reject otherwise)
        │
        ▼
UUID token created → stored in verificationTokens (TTL: 15 min)
Magic link sent: https://<backend-url>/api/auth/verify?token=<uuid>
        │
        ▼
Student clicks magic link in email
        │
        ▼
Backend verifies token → calls deleteOne() on verificationTokens document
Email is now permanently gone from the database
        │
        ▼
New anonymousToken (UUID v4) created → saved in anonymousUsers
        │
        ▼
anonymousToken returned to frontend → stored in localStorage
Student is now verified and anonymous. No PII anywhere.
```

---

### Workflow 2: Submitting a Post (Text or Voice)

```
Student writes text  ──OR──  Records voice
                                  │
                         Web Speech API (browser)
                         converts audio → plain text
                                  │
                    Both paths converge: plain text string ready
        │
        ▼
Student selects category → clicks Submit
        │
        ▼
Frontend sends POST /api/posts
Headers: { x-anonymous-token: <uuid> }
Body: { content, category, inputType, language }
        │
        ▼
Backend: Rate limit check (postCountToday, lastPostTimestamp, lastResetDate)
  → Reject if limit exceeded
        │
        ▼
Backend: Call Gemini Embedding model → get float array for content
        │
        ▼
Fetch last 50 approved post embeddings from MongoDB
Run cosine similarity (custom JS utility, no library)
  → If similarity > 0.82 with any recent post: flag for stricter scrutiny
        │
        ▼
Call Gemini 2.5 Flash with structured JSON schema:
  responseMimeType: "application/json"
  Output: { approved, fakeProbability, sentiment, emotions, topics, reason }
        │
        ├── fakeProbability > 0.65 OR Gemini approved = false
        │       → status: "rejected", return polite message to student
        │         Post not stored in public feed
        │
        └── fakeProbability ≤ 0.65 AND Gemini approved = true
                → Save post to MongoDB (status: "approved", embedding stored)
                → Update anonymousUsers rate limit fields atomically
                → Return success + sentimentLabel to student
                → Post appears on live feed at next 15s poll
```

---

### Workflow 3: Admin Report Generation

```
Admin opens /admin → Authorization header checked by middleware
        │
        ▼
Admin clicks "Generate Weekly Report"
        │
        ▼
Backend aggregates from MongoDB:
  - Total posts this week
  - Average sentiment per category
  - Top 5 topics (by frequency)
  - Emotion distribution
  - Fake rejection rate
  - Week-over-week sentiment delta
        │
        ▼
Aggregated data passed to Gemini 2.5 Flash with report prompt
Gemini returns structured JSON: { summary, concerns[], recommendations[], stats }
        │
        ▼
pdfkit builds PDF with sections:
  1. Executive Summary
  2. Category Breakdown
  3. Top Student Concerns
  4. Trend Analysis
  5. Recommended Actions for Administration
  6. Moderation Statistics (fake rejection rate, report counts)
        │
        ▼
PDF saved → download URL returned to admin
```

---

## 10. AI Layer — Gemini Integration

### 10.1 Fake Detection — Hybrid Approach

**Step 1 — Cosine Similarity (custom JS utility):**

```javascript
// utils/cosineSimilarity.js
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}
```

- Compare new post embedding against last 50 approved post embeddings stored in MongoDB
- If any similarity score > **0.82** → flag as potential duplicate/spam and pass stricter scrutiny to Gemini

**Step 2 — Gemini 2.5 Flash Structured Moderation:**

```javascript
// Gemini call configuration
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: moderationPrompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        approved: { type: "boolean" },
        fakeProbability: { type: "number" },
        reason: { type: "string" },
        sentiment: {
          type: "object",
          properties: {
            score: { type: "number" },
            label: { type: "string" },
            emotions: { type: "array", items: { type: "string" } },
            topics: { type: "array", items: { type: "string" } }
          }
        }
      }
    }
  }
});
```

**Decision thresholds:**

| Condition | Action |
|---|---|
| `fakeProbability > 0.65` | Auto-reject post |
| `approved === false` (Gemini) | Auto-reject post |
| Cosine similarity > 0.82 | Flag for stricter scrutiny (lower Gemini approval threshold) |
| All checks pass | Approve and publish post |

**Target latency:** < 2 seconds end-to-end

---

### 10.2 Sentiment Analysis

Each approved post stores:

| Field | Type | Example |
|---|---|---|
| `sentimentScore` | Float (-1.0 to 1.0) | `-0.65` |
| `sentimentLabel` | String | `"Negative"` |
| `emotions` | String array | `["frustrated", "anxious"]` |
| `topics` | String array | `["placement drive", "shortlisting"]` |

---

### 10.3 Personalized AI Tips

- Triggered when student hits `GET /api/posts/my`
- Backend sends student's post history (content + sentiment) to Gemini 2.5 Flash
- Returns 2–3 short, actionable, empathetic tips in the response language
- Prompts are pre-designed and stored in the codebase (exact prompts included in source)

---

### 10.4 Weekly PDF Report Content

Generated by Gemini 2.5 Flash from aggregated MongoDB data. PDF sections:

| # | Section | Content |
|---|---|---|
| 1 | Executive Summary | 3–4 sentence overview of campus sentiment this week |
| 2 | Category Breakdown | Avg sentiment score + post count per category |
| 3 | Top Student Concerns | Most frequent topics and dominant emotions |
| 4 | Trend Analysis | Week-over-week sentiment change with interpretation |
| 5 | Recommended Actions | 3–5 AI-generated suggestions for administration |
| 6 | Moderation Statistics | Total posts, approval rate, fake rejection count, report flags |

PDF generated using `pdfkit` on the Express backend. Served via `GET /api/admin/reports/download/:id`.

---

## 11. Admin Dashboard

### Access & Security
- Route: `/admin`
- All `/api/admin/*` backend routes protected by Express middleware
- Middleware checks: `req.headers.authorization === "Bearer " + process.env.ADMIN_SECRET_KEY`
- If key is missing or wrong → `401 Unauthorized`
- Single admin user (placement cell) — no multi-user management in MVP
- Key stored only in `.env` on server — never exposed to frontend

### Dashboard Panels

| Panel | Chart Type | Data Source |
|---|---|---|
| Overview Stats | Stat cards | `/api/insights/summary` |
| Sentiment Trend | Recharts LineChart | `/api/insights/trends` |
| Category Distribution | Recharts BarChart + PieChart | `/api/insights/categories` |
| Emotion Frequency | Recharts BarChart | Aggregated from `posts.emotions` |
| Recent Posts Table | Data table | `/api/admin/posts` |
| Flagged Posts | Data table (filtered) | `/api/admin/posts?status=rejected` |
| Deleted Posts (Audit) | Data table | `/api/admin/posts?status=deleted` |
| Report Generator | Button + download link | `POST /api/admin/reports/generate` |

---

## 12. Frontend Screens

| Screen | Route | Key Components |
|---|---|---|
| Landing / Home | `/` | Hero section, CTA button, live feed preview (latest 5 posts), platform stats |
| Verify Email | `/verify` | Email input, submit button, success state ("Check your inbox") |
| Magic Link Callback | `/auth/callback` | Reads `?token=` from URL, calls `/api/auth/verify`, stores `anonymousToken` in `localStorage`, redirects to `/post` |
| Public Feed | `/feed` | Paginated list of approved posts, category filter tabs, sentiment badge per post, polls every 15s |
| Submit Post | `/post` | Text area + voice recorder toggle (Web Speech API), category selector, language toggle (EN/HI), submit button, rate limit error states |
| My Posts | `/my-posts` | Student's own posts list, AI tips card, soft-delete button per post |
| Campus Dashboard | `/dashboard` | Public sentiment charts (Recharts), emotion cloud, category breakdown, trend line |
| Admin Login | `/admin/login` | Secret key input field, "Enter Dashboard" button — sends key as Authorization header |
| Admin Dashboard | `/admin` | Full admin panel with all dashboard panels described in Section 11 |

**Voice Input UX (Submit Post screen):**
- Toggle button switches between "Type" and "Speak" mode
- In speak mode: language selector shows EN / HI
- `SpeechRecognition` object initialized with selected language (`en-US` or `hi-IN`)
- Transcribed text appears in the text area in real time
- Student can edit transcription before submitting
- Backend receives only the final plain text string — no audio is transmitted

---

## 13. Security & Rate Limiting

### Student Anonymity
- Email is stored only during verification (TTL: 15 min), then permanently deleted with `deleteOne()`
- `anonymousToken` is UUID v4 — not guessable, not linked to any PII
- Posts are linked only to `anonymousToken`, never to email or identity
- `anonymousToken` stored in browser `localStorage` only — never sent to or stored on server after initial creation

### Admin Security
- Secret key validated via `Authorization: Bearer` header (not query param — avoids browser history and server log exposure)
- Key stored in `.env`, never committed to version control
- All `/api/admin/*` routes wrapped in a single `adminAuth` middleware function

### Rate Limiting
- Tracked in `anonymousUsers` document — no separate Redis or collection needed
- 3 posts maximum per 24-hour rolling window (resets daily based on `lastResetDate`)
- 1-hour cooldown between consecutive posts (checked via `lastPostTimestamp`)
- All checks and increments done atomically using MongoDB `findOneAndUpdate`

### Input Validation
- Email domain check: strictly `@stu.manit.ac.in`
- Post content: minimum 20 characters, maximum 1000 characters
- Category: must be one of the 6 defined enum values
- Anonymous token: validated to exist in `anonymousUsers` before any post is processed

---

## 14. Environment Variables

### Backend (`.env`)

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campusvani

# Nodemailer — Gmail SMTP with App Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=campusvani.noreply@gmail.com
EMAIL_PASS=your-gmail-app-password

# Magic Link
MAGIC_LINK_BASE_URL=https://<backend-render-url>/api/auth/verify
TOKEN_EXPIRY_SECONDS=900

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Admin Auth
ADMIN_SECRET_KEY=your-strong-random-secret-key

# Rate Limiting Constants
RATE_LIMIT_MAX_POSTS_PER_DAY=3
RATE_LIMIT_COOLDOWN_MS=3600000

# Fake Detection Thresholds
FAKE_PROBABILITY_THRESHOLD=0.65
COSINE_SIMILARITY_THRESHOLD=0.82
EMBEDDING_COMPARISON_POOL=50
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=https://<backend-render-url>/api
VITE_POLL_INTERVAL_MS=15000
```

---

## 15. Deployment & Infrastructure

| Component | Platform | Tier | Notes |
|---|---|---|---|
| Frontend | Vercel | Free | Auto-deploy from `main` branch |
| Backend | Render | Free | Cold starts possible; acceptable for beta |
| Database | MongoDB Atlas | Free M0 | Sufficient for 200–500 beta posts |
| Email | Gmail SMTP | Free | App Password required; 500 emails/day limit — sufficient for beta |
| Domain | None (MVP) | — | Vercel/Render preview URLs used during beta |

### Gmail App Password Setup
1. Enable 2FA on Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail" + "Other (CampusVani)"
4. Use generated password as `EMAIL_PASS` in `.env`

### Render Cold Start Note
Render free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Acceptable for beta. Consider upgrading if latency becomes an issue post-launch.

---

## 16. Non-Functional Requirements

| Requirement | Target |
|---|---|
| AI moderation latency | < 2 seconds per post (Gemini + cosine similarity combined) |
| Feed polling interval | 15 seconds |
| Uptime | Best-effort (Vercel + Render free tier) |
| Mobile responsiveness | All screens functional at 375px and above |
| PWA | Installable, service worker for offline feed browsing |
| Hindi language support | Voice input (`hi-IN`) + text input |
| Data privacy | Zero PII stored after email verification |
| Post content limits | Min: 20 characters, Max: 1000 characters |
| PDF report generation time | < 30 seconds |
| Embedding array storage | Float32 array stored as MongoDB array field — no vector DB needed |

---

## 17. Impact & Success Metrics

| Metric | Target |
|---|---|
| Student posts in Month 1 beta | 200 – 500 posts |
| Fake post detection precision | ≥ 91% (validated on 300 test cases) |
| Average AI analysis latency | < 2 seconds |
| Manual moderation effort reduction | ~85% |
| Admin report generation time | < 30 seconds |
| Student anonymity breach incidents | 0 |
| Daily active anonymous tokens (Month 1) | 50 – 150 |

---

*This document is complete and covers all aspects required to build CampusVani AI from scratch. No open questions remain. All architectural decisions, schemas, API contracts, security mechanisms, and AI integration details are fully specified.*

*— Prepared for Antigravity development handoff, Version 2.0 Final*
