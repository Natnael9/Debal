# Debal

## Overview

**Debal** is a platform that helps people find compatible roommates to rent a home together. It aims to make the roommate-finding process more secure, trustworthy, and efficient.

## Problem Statement

The major problems identified are:
- Home rental prices are continuously rising in Ethiopia.
- Existing methods of finding roommates through social media platforms are often unreliable and lack trust.
- People struggle to find roommates with compatible preferences and lifestyles online.

## Key Features

- User authentication (Email/Password & Google OAuth)
- Profile creation and preference setup
- Fayda ID authentication for enhanced security and trust
- Automatic matching of compatible profiles
- Real-time chat & socket notifications for matched roommates
- Admin moderation dashboard & safety reporting

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/debal`) or MongoDB Atlas cloud URI
- **Redis**: Local Redis instance (`redis://127.0.0.1:6379`) or Upstash Redis URL

### 1. Server Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` to configure your environment variables (MongoDB URI, Redis URL, JWT secrets, OAuth, Cloudinary, etc.).

Start the backend development server:
```bash
npm start
```
The server will run on `http://localhost:4000` (or `http://localhost:4001` based on your `PORT`).

### 2. Seed Admin Account

To initialize the default admin user:
```bash
cd server
node modules/admin/seed-admin.js
```

### 3. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
cp .env.example .env
```

Start the Vite development server:
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

---

## Deployment Guide

### Backend Deployment (Render / Railway / VPS / Heroku)

1. **Environment Variables**:
   Set the following variables in your hosting environment:
   - `PORT`: Defined by host (e.g. `4000`)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Cloud MongoDB Atlas URI (`mongodb+srv://...`)
   - `REDIS_URL`: Managed Redis connection string (`rediss://...`)
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
   - `IDENTITY_ENCRYPTION_KEY` & `ID_HASH_PEPPER`
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://debal.vercel.app`)

2. **Start Command**:
   ```bash
   npm start
   ```

3. **Health Check Endpoint**:
   Use `GET /health` for automated health checks and uptime monitoring.

### Frontend Deployment (Vercel / Netlify / Render Static)

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: Your live backend API URL (e.g., `https://debal-api.onrender.com`)
   - `VITE_SOCKET_BASE_URL`: Live backend WebSocket URL (e.g., `https://debal-api.onrender.com`)

---

## Team Information

**Classroom:** 5

| Name | CTC ID |
|------|---------|
| Natnael Ashenafi | CTC-897-26 |
| Natnael Sebhat | CTC-1708-26 |
| Nardos Haile | CTC-7685-26 |
| Robel Alemayehu | CTC-1067-26 |
| Natnael Abrha | CTC-2834-26 |
| Midaso Edasa | CTC-4752-26 |
