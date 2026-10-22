# 🚀 LNMIIT Degree Audit System - Deployment Guide

## Overview
This guide covers deploying the full-stack application with:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway/Render/Heroku (Node.js + Express + MongoDB)

---

## 📋 Prerequisites

1. **Vercel Account**: [Sign up at vercel.com](https://vercel.com)
2. **MongoDB Atlas**: [Create free cluster at mongodb.com](https://www.mongodb.com/cloud/atlas)
3. **Backend Hosting**: Choose one:
   - [Railway.app](https://railway.app) (Recommended)
   - [Render.com](https://render.com)
   - [Heroku](https://heroku.com)

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend

#### Option A: Railway (Recommended)

1. **Create Railway Account**: Visit [railway.app](https://railway.app)

2. **Create New Project**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to backend
   cd backend
   
   # Deploy
   railway init
   railway up
   ```

3. **Add Environment Variables** in Railway Dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-strong-secret-key>
   CORS_ORIGIN=<your-vercel-frontend-url>
   ```

4. **Get Backend URL**: Copy the generated Railway URL (e.g., `https://your-app.railway.app`)

#### Option B: Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add environment variables (same as above)
5. Copy the Render URL

---

### Step 2: Setup MongoDB Atlas

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free tier cluster (M0)
   - Choose region closest to your backend

2. **Create Database User**:
   - Database Access → Add New User
   - Set username and strong password
   - Grant "Read and write to any database" role

3. **Whitelist IP**:
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow from anywhere) for production

4. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `degree_audit_system`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/degree_audit_system?retryWrites=true&w=majority
```

---

### Step 3: Deploy Frontend to Vercel

#### Option A: Vercel CLI (Current Method)

1. **Install Vercel CLI** (already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # From project root
   vercel
   ```

4. **Set Environment Variables** when prompted:
   ```
   VITE_API_URL=<your-backend-url>
   ```
   Example: `VITE_API_URL=https://your-app.railway.app`

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Option B: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: Your backend URL (without `/api`)
6. Click "Deploy"

---

## 🔧 Post-Deployment Configuration

### Update Backend CORS

In your backend `.env` or hosting platform environment variables:
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Seed Database

After backend is deployed, seed the database:
```bash
# Using Railway CLI
railway run node -e "require('./src/data/seedData.js')"

# Or via HTTP request to your backend
curl -X POST https://your-backend-url/api/seed
```

---

## 🧪 Testing Deployment

### Test Accounts

After seeding, test with these accounts:

**Student**:
- Email: `24ucs001@lnmiit.ac.in`
- Password: `password123`

**Faculty Advisor**:
- Email: `dr.sharma@lnmiit.ac.in`
- Password: `password123`

**Registrar**:
- Email: `registrar.office@lnmiit.ac.in`
- Password: `password123`

### Verification Checklist

- [ ] Frontend loads without errors
- [ ] Login works for all three roles
- [ ] Student can view dashboard and audit
- [ ] Advisor can see at-risk students
- [ ] Registrar can import transcripts
- [ ] Registrar can manage advisor assignments
- [ ] Graduation eligibility displays correctly

---

## 🔐 Security Best Practices

1. **Change Default Passwords** after first login
2. **Use Strong JWT Secret**: Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. **Enable HTTPS** (automatic on Vercel/Railway)
4. **Restrict MongoDB Access**: Use specific IPs instead of 0.0.0.0/0
5. **Set up Rate Limiting** on backend API
6. **Enable Environment Variable Encryption**

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard → Project → Analytics
- Monitor page views, performance, errors

### Backend Monitoring
- **Railway**: Built-in metrics dashboard
- **Render**: Metrics tab in dashboard
- Consider adding [Sentry](https://sentry.io) for error tracking

---

## 🔄 Continuous Deployment

### Auto-deploy on Git Push

**Vercel**: Automatically enabled when connected to GitHub
- Push to `main` branch → auto-deploys to production
- Push to other branches → creates preview deployments

**Railway**: Enable in project settings
- Connect GitHub repository
- Auto-deploy on push to main

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
**Solution**: Check VITE_API_URL environment variable in Vercel

### CORS Errors
**Solution**: Update CORS_ORIGIN in backend to match Vercel URL

### 404 on Page Refresh
**Solution**: Add to `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### MongoDB Connection Fails
**Solution**: 
- Check connection string is correct
- Verify IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions

### Build Fails
**Solution**: 
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## 📱 URLs After Deployment

**Frontend**: `https://degree-audit-system.vercel.app`  
**Backend**: `https://your-app.railway.app`  
**MongoDB**: `mongodb+srv://...`

---

## 🎉 Deployment Complete!

Your LNMIIT Degree Audit System is now live and accessible globally!

### Next Steps:
1. Share the frontend URL with users
2. Update README.md with live demo link
3. Set up custom domain (optional)
4. Enable analytics and monitoring
5. Configure automated backups for MongoDB

---

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review Vercel/Railway documentation
- Contact your hosting provider support

**Happy Deploying! 🚀**
