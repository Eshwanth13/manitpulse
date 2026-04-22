# CampusVani: AI-Driven University Feedback Platform

**CampusVani** is a specialized feedback and sentiment analysis platform designed for **MANIT Bhopal**. It empowers students to voice their concerns, suggestions, and feedback regarding campus life (Hostels, Academics, Faculty, etc.) while providing the administration with actionable, data-driven insights.

---

## 🚀 Core Mission
To bridge the communication gap between students and university administration through **anonymous but verified** feedback, powered by state-of-the-art AI moderation and sentiment tracking.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS for a modern, responsive UI.
- **State Management**: React Hooks & Context API.
- **Visuals**: Lucide Icons, Framer Motion for smooth animations.

### Backend
- **Runtime**: Node.js with Express.
- **Database**: MongoDB (Atlas) for flexible data storage.
- **Authentication**: Magic Link system via Nodemailer (Gmail SMTP) — ensures only verified MANIT students can post while maintaining total anonymity.
- **Environment**: Managed via `dotenvx` for secure configuration.

### AI Integration (The "Brain")
- **Providers**: Primary integration via **OpenRouter** (Gemini 1.5 Flash) with a secondary fallback to **Google Gemini Direct API**.
- **Capabilities**:
  - **Auto-Moderation**: Blocks toxic, abusive, or irrelevant content instantly.
  - **Sentiment Analysis**: Tracks student moods (Joy, Frustration, Hope) and calculates sentiment scores (-1 to +1).
  - **Fake Content Detection**: Identifies gibberish, spam, or factually impossible posts using AI logic.
  - **Similarity Check**: Uses **Vector Embeddings** (Cosine Similarity) to detect and flag duplicate or highly similar posts.
  - **Admin Reporting**: Generates automated weekly sentiment summaries for administrators.

---

## 🌟 Key Features

### 1. Anonymous Verified Posting
Students verify their identity once via university email and receive an anonymous token. This allows them to post without fear of retribution while preventing outside spam.

### 2. AI-Powered Feed
Every post is processed through an AI pipeline before going live:
- **Approval**: Checks against university safety guidelines.
- **Categorization**: Automatically tags posts (e.g., #Hostel, #MessFood).
- **Sentiment**: Visualizes the "vibe" of the post using color-coded mood indicators.

### 3. Personalized AI Tips
The "My Posts" section provides students with AI-generated reflections and tips based on their recent feedback history, tailored to their specific "vibe."

### 4. Admin Analytics Dashboard
A high-level dashboard for university officials to:
- Monitor real-time sentiment trends across campus.
- Identify "Hot Topics" (e.g., sudden spike in #Hostel complaints).
- View AI-generated recommendations for campus improvements.

### 5. Smart Duplicate Prevention
By comparing the mathematical "fingerprint" (embeddings) of new posts against recent ones, the system prevents users from flooding the feed with identical complaints.

---

## 📁 Project Structure

```text
cmpvan/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Feed, Admin, Profile pages
│   │   └── utils/      # API services
├── backend/            # Express.js server
│   ├── src/
│   │   ├── controllers/# Business logic (Posts, AI, Admin)
│   │   ├── models/     # Mongoose Schemas (Post, AnonymousUser)
│   │   ├── routes/     # API endpoints
│   │   └── utils/      # AI integration (OpenRouter/Gemini)
│   └── .env            # Configuration & API Keys
```
  
---

## 🔒 Security & Privacy
- **Total Anonymity**: Student names/IDs are never stored alongside posts.
- **Token-Based Auth**: Uses secure headers for session management.
- **Rate Limiting**: Prevents API abuse and spamming.

---

**Developed for MANIT Bhopal Students.**  
*CampusVani — Amplifying Student Voices.*
