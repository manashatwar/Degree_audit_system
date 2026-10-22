# Backend Deployment to Vercel

## Prerequisites

1. MongoDB Atlas account with cluster created
2. Vercel account (already logged in)
3. Connection string from MongoDB Atlas

## Environment Variables Required

You'll need to set these in Vercel:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/degree_audit_system
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NODE_ENV=production
PORT=5000
CORS_ORIGIN=*
```

## Deployment Steps

### Step 1: Deploy Backend

```bash
cd backend
vercel --prod
```

### Step 2: Set Environment Variables

After deployment, set environment variables:

```bash
# Set MongoDB URI
vercel env add MONGODB_URI production

# Set JWT Secret
vercel env add JWT_SECRET production

# Set CORS Origin (after frontend is deployed)
vercel env add CORS_ORIGIN production
```

Or set them in Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add each variable

### Step 3: Redeploy After Adding Variables

```bash
vercel --prod
```

## Testing

After deployment, test the health endpoint:

```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "LNMIIT Degree Audit System API is running",
  "timestamp": "2024-10-22T..."
}
```

## Important Notes

- Vercel serverless functions have a 10-second timeout on free tier
- MongoDB connection will be established on each request
- Seed data runs automatically on server start
- CORS is configured to allow all origins by default (update for production)

## Post-Deployment

1. Copy the backend URL (e.g., `https://your-app.vercel.app`)
2. Use this URL for frontend `VITE_API_URL` environment variable
3. Update `CORS_ORIGIN` to match your frontend URL
