# 🚀 ManitPulse Deployment Guide

This guide will walk you through deploying **ManitPulse** to production. We will use **Render** for the Backend and **Vercel/Netlify** for the Frontend.

---

## 📋 Prerequisites & Requirements

Before you start, make sure you have the following ready:

### 1. Accounts Needed
*   **GitHub**: To host your code.
*   **MongoDB Atlas**: For the cloud database.
*   **Render**: For hosting the Node.js Backend.
*   **Vercel / Netlify**: For hosting the React Frontend.
*   **OpenRouter**: For the AI (Ling-2.6-Flash).
*   **Gmail / Outlook**: An account for sending Magic Link emails (SMTP).

### 2. Required Credentials (API Keys)
*   `MONGODB_URI`: From MongoDB Atlas.
*   `OPENROUTER_API_KEY`: From OpenRouter.
*   `GEMINI_API_KEY`: (Optional) Fallback from Google AI Studio.
*   `EMAIL_USER` & `EMAIL_PASS`: For sending verification emails.
*   `ADMIN_SECRET_KEY`: A strong random string for Admin login.
*   `JWT_SECRET`: A strong random string for security.

---

## 🛠️ Step 1: Prepare Your Code

1.  **Push to GitHub**: Initialize a Git repository in your project root and push your code to a private GitHub repository.
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    git remote add origin <your-repo-url>
    git push -u origin main
    ```

---

## 📦 Step 2: Database Setup (MongoDB Atlas)

1.  Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Render's IP might change.
3.  Create a Database User with a password.
4.  Get your **Connection String** (Standard Connection String). It will look like:
    `mongodb+srv://<user>:<password>@cluster.mongodb.net/ManitPulse?retryWrites=true&w=majority`

---

## 🖥️ Step 3: Backend Deployment (Render)

1.  Log in to [Render](https://render.com).
2.  Click **New +** > **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `manitpulse-api`
    *   **Root Directory**: `backend`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables**: Add all variables from your `backend/.env` file.
    *   `PORT`: `5000` (Render provides this, but setting it doesn't hurt)
    *   `MONGODB_URI`: (Your Atlas string)
    *   `FRONTEND_URL`: (You will update this later after Frontend deployment)
    *   `EMAIL_SERVICE`: `gmail` (or your provider)
    *   `EMAIL_USER`: (Your email)
    *   `EMAIL_PASS`: (Your App Password - NOT your normal password)
    *   `OPENROUTER_API_KEY`: (Your key)
    *   `ADMIN_SECRET_KEY`: (Something secret)
    *   `JWT_SECRET`: (Something secret)

---

## 🌐 Step 4: Frontend Deployment (Vercel/Netlify)

1.  Log in to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2.  Connect your GitHub repository.
3.  Configure the build:
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api`
    *   `VITE_COLLEGE_NAME`: `MANIT Bhopal`
5.  **SPA Fix (For Vercel)**: Create a `vercel.json` in the `frontend` folder with:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

---

## 🔗 Step 5: Final Linkage

1.  Go back to your **Render Backend** settings.
2.  Update the `FRONTEND_URL` environment variable to your new Vercel/Netlify URL (e.g., `https://manitpulse.vercel.app`).
3.  Restart the Backend service.

---

## ⚠️ Important Security Note: Gmail
If you are using Gmail for sending emails, you **MUST** create an **App Password**.
1. Go to your Google Account > Security.
2. Enable 2-Step Verification.
3. Search for "App Passwords".
4. Create one for "Mail" and use that 16-character code as your `EMAIL_PASS`.

---

## ✅ Post-Deployment Checklist
- [ ] Test the Magic Link email delivery.
- [ ] Check if the AI Moderation is working on a test post.
- [ ] Verify the Admin Dashboard shows correctly with the secret key.
- [ ] Ensure the theme toggle works and saves your preference.
