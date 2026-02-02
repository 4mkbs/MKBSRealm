# 🚀 Vercel Environment Variables Setup

## Backend Environment Variables

Go to your **backend project** on Vercel → **Settings** → **Environment Variables** and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mkbs-realm?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_string_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-url.vercel.app
VERCEL=1
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Frontend Environment Variables

Go to your **frontend project** on Vercel → **Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://mkbs-realm-server.vercel.app/api
VITE_SOCKET_URL=https://mkbs-realm-server.vercel.app
```

**Replace** `mkbs-realm-server.vercel.app` with your actual backend Vercel URL!

## After Adding Environment Variables

1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

## ⚠️ Important Notes

### Socket.io on Vercel Free Tier

- Real-time messaging **will NOT work** on Vercel Free tier
- WebSocket is not supported without Vercel Pro ($20/month)

### Solutions:

1. **Upgrade to Vercel Pro** - Enables WebSocket support
2. **Deploy Socket.io separately** - Use Railway.app or Render.com (FREE)
3. **Accept limitations** - REST API works, real-time features don't

### Recommended Free Setup:

```
Frontend: Vercel Free ✅
REST API: Vercel Free ✅
Socket.io: Railway.app Free ✅
Database: MongoDB Atlas Free ✅
```

## Local Development

Create `.env` files locally:

**backend/.env**:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**frontend/.env**:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Troubleshooting

### Posts not working?

- Check `VITE_API_URL` is set correctly
- Check browser console for errors
- Verify backend is deployed and running

### 404 on refresh?

- ✅ Fixed with `vercel.json` rewrites
- Redeploy frontend after commit

### Real-time features not working?

- Socket.io requires WebSocket support
- Use Vercel Pro or deploy Socket.io separately to Railway

### CORS errors?

- Update `CLIENT_URL` in backend env vars
- Make sure it matches your frontend URL exactly
- Redeploy backend after changing

## Testing Your Deployment

```bash
# Test backend
curl https://your-backend.vercel.app/health

# Test auth
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123"}'
```

Visit your frontend URL and test:

- ✅ Registration
- ✅ Login
- ✅ Creating posts
- ✅ Viewing profile
- ⚠️ Real-time chat (needs Vercel Pro or Railway)
- ⚠️ Video calls (needs Vercel Pro or Railway)
