# 🚀 Digital Product Selling Platform - Deployment Guide

This guide will help you deploy your premium SaaS platform and set up the necessary integrations.

## 1. Firebase Setup (Database & Auth)
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication** and turn on **Google Sign-In**.
4. Create a **Firestore Database** in production mode.
5. Create a **Storage** bucket for file uploads.
6. Go to Project Settings > General > Your Apps > Add Web App.
7. Copy the `firebaseConfig` object and update your `src/firebase.ts` or `firebase-applet-config.json`.
8. **Security Rules**: Copy the content of `firestore.rules` from this project and paste it into the "Rules" tab of your Firestore database in the Firebase console.

## 2. Cashfree Payment Integration
1. Sign up at [Cashfree Payments](https://www.cashfree.com/).
2. Go to the **Payment Gateway** dashboard.
3. In the **Developers** section, find your **API Keys** (App ID and Secret Key).
4. Use the `SANDBOX` environment for testing and `PRODUCTION` for real payments.

## 3. Environment Variables (.env)
Add these variables to your deployment platform (Netlify/Render/Railway):

```env
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENVIRONMENT=SANDBOX
APP_URL=https://your-deployed-app-url.com
GEMINI_API_KEY=your_gemini_api_key
```

## 4. Deployment Steps

### Frontend (Netlify/Vercel)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**: Add the keys mentioned above.

### Backend (Render/Railway)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Add the keys mentioned above.

## 5. Beginner-Friendly Explanation
- **React + Vite**: Handles the beautiful UI you see.
- **Express Server**: Securely talks to Cashfree so nobody can fake a payment.
- **Firebase**: Stores your products, users, and handles the Google Login.
- **Cashfree**: The bridge that allows you to accept money from customers.

**Powered by Bikash Bindhani 🚀**
