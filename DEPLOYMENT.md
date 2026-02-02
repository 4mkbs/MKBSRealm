# Deployment Guide

This guide covers deploying MKBS Realm to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

## Prerequisites

- Node.js v18+ installed
- MongoDB instance (MongoDB Atlas recommended)
- Domain name (optional)
- SSL certificate (required for WebRTC)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mkbs-realm?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_string_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.com
```

**Important Security Notes:**

- Generate a strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Use MongoDB Atlas for production database
- Enable IP whitelist in MongoDB Atlas
- Keep .env file secure and never commit it

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Deployment Options

### Option 1: Deploy to Heroku

#### Backend (Heroku)

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**

   ```bash
   heroku login
   ```

3. **Create Heroku App**

   ```bash
   cd backend
   heroku create mkbs-realm-api
   ```

4. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set CLIENT_URL="https://your-frontend-url.com"
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

#### Frontend (Vercel)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy**

   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variable**
   - Go to Vercel dashboard
   - Add `VITE_API_URL` with your backend URL

### Option 2: Deploy to VPS (Ubuntu)

#### Backend Setup

1. **Install Dependencies**

   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

2. **Setup Application**

   ```bash
   cd /var/www
   git clone <your-repo>
   cd mkbs-realm/backend
   npm install --production
   ```

3. **Create .env file**

   ```bash
   nano .env
   # Add production environment variables
   ```

4. **Setup PM2**

   ```bash
   npm install -g pm2
   pm2 start server.js --name mkbs-api
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx Reverse Proxy**

   ```bash
   sudo nano /etc/nginx/sites-available/mkbs-api
   ```

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/mkbs-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

#### Frontend Setup

1. **Build Frontend**

   ```bash
   cd /var/www/mkbs-realm/frontend
   npm install
   npm run build
   ```

2. **Setup Nginx for Frontend**

   ```bash
   sudo nano /etc/nginx/sites-available/mkbs-frontend
   ```

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/mkbs-realm/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/mkbs-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Setup SSL**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 3: Deploy with Docker

#### Create Dockerfiles

**Backend Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile**

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLIENT_URL=${CLIENT_URL}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Deploy**

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Test Deployment

- [ ] User registration works
- [ ] User login works
- [ ] Posts creation works
- [ ] Messaging works
- [ ] Audio/video calls work (requires HTTPS)
- [ ] Friend requests work
- [ ] Socket.io connects successfully

### 2. Monitor Logs

```bash
# PM2
pm2 logs mkbs-api

# Docker
docker-compose logs -f

# Heroku
heroku logs --tail -a mkbs-realm-api
```

### 3. Database Backup

Setup automated MongoDB backups:

```bash
# Daily backup script
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)
```

## Monitoring

### Setup Monitoring Tools

1. **PM2 Monitoring**

   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   ```

2. **Error Tracking**

   - Consider integrating Sentry for error tracking
   - Add application monitoring (New Relic, DataDog)

3. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Monitor API endpoint health

### Performance Optimization

1. **Enable Gzip Compression** (Nginx)

   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Setup CDN** for static assets

3. **Database Indexing**

   - Ensure all frequently queried fields are indexed
   - Monitor slow queries

4. **Enable Caching**
   - Redis for session storage
   - Cache frequent API responses

## Security Checklist

- [ ] HTTPS enabled (required for WebRTC)
- [ ] Strong JWT secret set
- [ ] MongoDB IP whitelist configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Backup strategy in place

## Troubleshooting

### Common Issues

1. **Socket.io not connecting**

   - Ensure WebSocket support in reverse proxy
   - Check CORS configuration
   - Verify CLIENT_URL matches frontend domain

2. **WebRTC calls not working**

   - HTTPS is required for WebRTC
   - Check browser permissions
   - Verify STUN/TURN server configuration

3. **Database connection fails**
   - Check MongoDB URI format
   - Verify IP whitelist in MongoDB Atlas
   - Check network connectivity

## Rollback Strategy

```bash
# PM2
pm2 restart mkbs-api

# Docker
docker-compose down
git checkout previous-commit
docker-compose up -d

# Heroku
heroku releases -a mkbs-realm-api
heroku rollback v42 -a mkbs-realm-api
```

## Support

For deployment issues:

- Check logs first
- Review this guide
- Open an issue on GitHub
- Contact support team

---

**Remember**: Always test in a staging environment before deploying to production!
