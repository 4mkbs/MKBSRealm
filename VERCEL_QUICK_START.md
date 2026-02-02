# Quick Vercel Setup Checklist

## ✅ Files Already Updated

- ✅ `backend/server.js` - Now supports Vercel deployment
- ✅ `vercel.json` - Root configuration for Vercel builds
- ✅ `frontend/vercel.json` - Frontend Vercel configuration
- ✅ `VERCEL_DEPLOYMENT.md` - Complete Vercel guide

## 📋 Steps to Deploy

### 1. Commit Changes

```bash
cd /home/sakib/projects/regular/mkbs-realm
git add -A
git commit -m "feat: prepare for Vercel deployment

- Update server.js to support Vercel serverless functions
- Add vercel.json configuration for both frontend and backend
- Create VERCEL_DEPLOYMENT.md with setup instructions"
git push origin main
```

### 2. Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Select your GitHub repository
3. **Project Name**: `mkbs-realm-backend`
4. **Framework Preset**: `Other` (or Node.js)
5. **Root Directory**: `backend`
6. Click **Deploy**
7. Wait for deployment to complete
8. Go to **Settings → Environment Variables**
9. Add these variables:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://user:password@cluster.mongodb.net/mkbs-realm
JWT_SECRET = [generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://your-frontend-url.vercel.app
VERCEL = 1
```

10. Click **Deployments** → redeploy to apply env vars
11. Copy your backend URL (e.g., `https://mkbs-realm-backend.vercel.app`)

### 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Select same GitHub repository
3. **Project Name**: `mkbs-realm-frontend`
4. **Framework Preset**: `Vite`
5. **Root Directory**: `frontend`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. Click **Deploy**
9. Wait for deployment
10. Go to **Settings → Environment Variables**
11. Add these variables:

```
VITE_API_URL = https://mkbs-realm-backend.vercel.app/api
VITE_SOCKET_URL = https://mkbs-realm-backend.vercel.app
```

12. Click **Deployments** → redeploy to apply env vars

### 4. Test Your Deployment

```bash
# Test backend API
curl https://mkbs-realm-backend.vercel.app/

# Test auth (using a test user)
curl -X POST https://mkbs-realm-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123"}'
```

### 5. Update Frontend Backend URL

After backend deployment, update frontend environment variable:

1. Frontend **Settings → Environment Variables**
2. Update `VITE_API_URL` with your backend URL
3. Redeploy frontend

## ⚠️ Important: Socket.io Limitation

**Vercel Free Tier does NOT support WebSocket** (required for real-time chat and video calls).

### Options:

**Option 1: Use Vercel Pro** ($20/month)

- Enables WebSocket support for Socket.io
- Best if you have budget

**Option 2: Deploy Socket.io Separately** (FREE)

- Deploy backend to **Railway.app** or **Render.com** instead
- Use Vercel only for frontend and REST API
- Update Socket.io server URL in frontend `.env`

**Option 3: Remove Real-Time Features** (FREE)

- Deploy as REST-only API
- Accept limitations on chat/video

## 🚀 Recommended Setup for Free Tier

1. **Frontend**: Deploy to Vercel ✅
2. **REST API**: Deploy to Vercel ✅
3. **Socket.io Server**: Deploy to Railway.app ✅

This gives you full functionality for free!

### Deploy to Railway (FREE)

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Select GitHub repository
4. Choose `backend` directory
5. Railway auto-detects Node.js and builds
6. Add environment variables (same as Vercel)
7. Get your Railway URL
8. Update frontend `VITE_SOCKET_URL` env var

## 📊 Comparison

| Platform    | Free Tier          | WebSocket | Best For            |
| ----------- | ------------------ | --------- | ------------------- |
| **Vercel**  | 10s timeout        | ❌ No     | Frontend + REST API |
| **Railway** | 100 hours/month    | ✅ Yes    | Socket.io + Backend |
| **Render**  | Free tier          | ✅ Yes    | Socket.io + Backend |
| **Fly.io**  | 3 shared CPUs free | ✅ Yes    | Socket.io + Backend |

## 🎯 What to Deploy Where

### Free Setup (Recommended)

```
Frontend (React) → Vercel
REST API (Express) → Vercel
Socket.io (WebRTC) → Railway/Render
MongoDB → MongoDB Atlas (free)
```

### Pro Setup ($20/month)

```
Frontend (React) → Vercel
Backend (Express + Socket.io) → Vercel Pro
MongoDB → MongoDB Atlas (free)
```

## ❓ FAQ

**Q: Will my chat work?**

- A: Yes, if you deploy Socket.io to Railway/Render or use Vercel Pro

**Q: Can I use Vercel free tier for everything?**

- A: Yes, but without real-time features. API and frontend will work fine.

**Q: How much will Railway.app cost?**

- A: Free tier includes 100 CPU hours/month, usually enough for ~$5/month after.

**Q: Do I need to change my code?**

- A: Minimal changes already done! Just set environment variables.

## 📝 Next Steps

1. ✅ Commit the changes
2. ✅ Create Vercel account (vercel.com)
3. ✅ Deploy backend to Vercel
4. ✅ Deploy frontend to Vercel
5. ✅ Test API endpoints
6. ⚠️ Decide on Socket.io: Vercel Pro or Railway

For full details, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
