# Vercel Deployment Guide

This guide covers deploying MKBS Realm to Vercel for both frontend and backend.

## Table of Contents

- [Overview](#overview)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment](#post-deployment)
- [Important Limitations](#important-limitations)

## Overview

**Vercel** is ideal for:

- ✅ Frontend (React/Vite) - Excellent support
- ✅ Backend (Node.js API Routes) - Good support with limitations
- ⚠️ Socket.io - Limited support (requires Pro plan for WebSocket)

### Free Tier Limitations

- **Function timeout**: 10 seconds (Pro: 15 minutes)
- **Memory**: 512 MB (Pro: 3 GB)
- **WebSocket**: Not available on Free tier
- **Concurrency**: Limited connections

## Backend Setup

### 1. Create Vercel Configuration Files

Create `vercel.json` in the root directory:

```json
{
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/socket.io/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

### 2. Modify Backend Server for Vercel

Update `backend/server.js`:

```javascript
const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { applySecurity } = require("./middleware/security");

const app = express();

// Only create HTTP server if not on Vercel
const isVercel = process.env.VERCEL === "1";
const server = isVercel ? null : http.createServer(app);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Socket.io (optional on Vercel)
let io = null;
if (!isVercel) {
  io = initializeSocket(server);
  app.set("io", io);
}

// Apply security middleware
applySecurity(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.CLIENT_URL || "https://yourdomain.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "MKBS Realm API",
    version: "1.0.0",
    platform: isVercel ? "Vercel Serverless" : "Node.js Server",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// For Vercel deployment
if (isVercel) {
  module.exports = app;
} else {
  // For local development
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Socket.io is ready for connections");
  });
}
```

### 3. Update Backend Package.json

```json
{
  "name": "mkbs-realm-backend",
  "version": "1.0.0",
  "description": "MKBS Realm Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "socket.io": "^4.8.3",
    "simple-peer": "^9.11.1",
    "express-rate-limit": "^6.7.0",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

### 4. Handle Socket.io for Vercel

**Important**: Socket.io with long-lived connections is not supported on Vercel Free tier.

**Options:**

1. **Use Vercel Pro** ($20/month) - Enables WebSocket support
2. **Use external service** - Deploy Socket.io separately to:
   - Railway.app
   - Render.com
   - Fly.io
3. **Remove Socket.io** - Use polling or alternative real-time solution

#### Option A: Use External Socket.io Server (Recommended for Free Tier)

Create separate backend on **Railway.app**:

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Deploy only the Socket.io logic
4. Update frontend `.env`:

```env
VITE_API_URL=https://your-vercel-backend.vercel.app/api
VITE_SOCKET_URL=https://your-railway-socket-server.railway.app
```

#### Option B: Use Vercel Pro (Enable WebSocket)

Vercel Pro ($20/month) includes WebSocket support. Contact Vercel support to enable it.

## Frontend Setup

### 1. Create Vercel Configuration

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vite_api_url",
    "VITE_SOCKET_URL": "@vite_socket_url"
  }
}
```

### 2. Update Vite Configuration

Ensure `frontend/vite.config.js` has:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
    "process.env": {},
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

### 3. Create Frontend .env.local

```env
VITE_API_URL=https://your-vercel-backend.vercel.app/api
VITE_SOCKET_URL=https://your-socket-server.vercel.app
```

## Environment Configuration

### Backend Environment Variables (Vercel Dashboard)

Go to **Settings → Environment Variables** and add:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/mkbs-realm?retryWrites=true&w=majority
JWT_SECRET = your_very_secure_random_string_at_least_32_characters_long
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://your-frontend-domain.vercel.app
VERCEL = 1
```

### Frontend Environment Variables (Vercel Dashboard)

```
VITE_API_URL = https://your-vercel-backend.vercel.app/api
VITE_SOCKET_URL = https://your-socket-server.vercel.app
```

## Deployment Steps

### Step 1: Push to GitHub

```bash
cd /home/sakib/projects/regular/mkbs-realm
git add -A
git commit -m "prep: configure for Vercel deployment"
git push origin main
```

### Step 2: Deploy Backend

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Select your GitHub repository
4. **Framework Preset**: None (Custom)
5. **Root Directory**: `backend`
6. **Build Command**: Leave empty (Vercel detects Node.js)
7. **Output Directory**: Leave empty
8. Click **Deploy**
9. After deployment, go to **Settings → Environment Variables**
10. Add all backend environment variables
11. Redeploy the project

### Step 3: Deploy Frontend

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Select same repository
4. **Framework Preset**: Vite
5. **Root Directory**: `frontend`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. Click **Deploy**
9. After deployment, go to **Settings → Environment Variables**
10. Add frontend environment variables
11. Update `VITE_API_URL` with your backend domain
12. Redeploy

### Step 4: Get Your Domains

After deployment:

- **Backend**: `https://mkbs-realm-backend.vercel.app` (or custom domain)
- **Frontend**: `https://mkbs-realm-frontend.vercel.app` (or custom domain)

Update environment variables with these URLs.

## Post-Deployment

### 1. Test Deployment

```bash
# Test backend
curl https://your-backend.vercel.app/

# Test authentication
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123"}'
```

### 2. Monitor Logs

In Vercel Dashboard:

1. Select project
2. Go to **Deployments**
3. Click recent deployment
4. View **Function Logs** or **Runtime Logs**

### 3. Custom Domains

1. Go to **Settings → Domains**
2. Add custom domain
3. Update DNS records at your domain provider
4. Vercel will auto-configure SSL

## Important Limitations

### Vercel Free Tier

| Feature          | Free    | Pro       |
| ---------------- | ------- | --------- |
| Function Timeout | 10s     | 15min     |
| Memory           | 512 MB  | 3 GB      |
| WebSocket        | ❌      | ✅        |
| Concurrency      | Limited | High      |
| Databases        | ✅      | ✅        |
| Cost             | Free    | $20/month |

### What Won't Work on Free Tier

❌ Real-time chat (Socket.io)
❌ Video calls (requires WebSocket)
❌ Long-polling
❌ Server-sent events

### Solutions

1. **Upgrade to Pro** ($20/month)
2. **Deploy Socket.io separately**:
   - Railway.app: Free tier available
   - Render.com: Free tier available
   - Fly.io: Free tier available
3. **Use third-party services**:
   - Firebase Realtime Database
   - Pusher
   - Ably

## Alternative: Use Railway for Backend

Railway offers better support for long-lived connections:

1. Go to [railway.app](https://railway.app)
2. Create project → Deploy from GitHub
3. Select backend folder
4. Add environment variables
5. Railway handles Socket.io better than Vercel

## Troubleshooting

### Issue: "Function timed out"

- **Cause**: Operations taking >10 seconds
- **Solution**: Optimize queries, upgrade to Pro, or move long operations elsewhere

### Issue: "Socket connection failed"

- **Cause**: WebSocket not enabled on Vercel Free tier
- **Solution**: Upgrade to Pro or deploy Socket.io separately

### Issue: "CORS errors"

- **Check**: Frontend `VITE_API_URL` matches backend domain
- **Check**: Backend CORS configuration includes frontend domain
- **Update**: Redeploy after changing environment variables

### Issue: "404 on API routes"

- **Check**: Backend `vercel.json` routes configuration
- **Check**: File is in correct directory
- **Solution**: Redeploy backend

## Next Steps

1. ✅ Commit changes with `git commit -m "prep: configure for Vercel deployment"`
2. ✅ Push to GitHub
3. ✅ Deploy backend to Vercel
4. ✅ Deploy frontend to Vercel
5. ✅ Set environment variables
6. ✅ Test API endpoints
7. ⚠️ Consider Socket.io solution (Pro, Railway, or external service)

## Support

For issues:

- Check [Vercel Documentation](https://vercel.com/docs)
- Review deployment logs in dashboard
- Check CORS configuration
- Verify environment variables are set
