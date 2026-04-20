# CCS Management System - Deployment Guide

## Overview
This guide will help you deploy the CCS Management System to production using:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase

## Prerequisites
- GitHub repository with your code
- Accounts on Vercel, Railway, and Supabase
- Node.js 20+ (for local testing)

## Step 1: Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Choose organization and create new project
   - Set database password and region

2. **Get Database Credentials**
   - Go to Settings > Database
   - Copy connection string
   - Note: Host, Port, User, Password

3. **Run Database Migrations**
   ```sql
   -- Run your schema.sql file in Supabase SQL Editor
   -- Or use the migration files from your database folder
   ```

## Step 2: Backend Deployment (Railway)

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository
   - Choose `backend` folder as root directory

2. **Configure Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=your-supabase-host.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your-supabase-password
   DB_NAME=postgres
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   ```

3. **Deploy**
   - Railway will automatically deploy
   - Wait for build to complete
   - Copy your Railway URL (e.g., `your-app.railway.app`)

## Step 3: Frontend Deployment (Vercel)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` folder as root directory

2. **Configure Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your Vercel URL

## Step 4: Final Configuration

1. **Update Backend CORS**
   - In Railway, update `FRONTEND_URL` to your actual Vercel domain
   - Redeploy backend

2. **Update Frontend API URL**
   - In Vercel, update `REACT_APP_API_URL` to your Railway URL
   - Redeploy frontend

## Step 5: Testing

1. **Health Check**
   - Backend: `https://your-backend.railway.app/api/health`
   - Frontend: `https://your-domain.vercel.app`

2. **Login Test**
   - Try logging in as different user types
   - Verify all features work

## Environment Variables Summary

### Backend (Railway)
```
NODE_ENV=production
PORT=5000
DB_HOST=your-supabase-host.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure `FRONTEND_URL` matches your Vercel domain exactly
2. **Database Connection**: Verify Supabase credentials are correct
3. **Build Failures**: Check package.json and dependencies
4. **404 Errors**: Ensure API URLs are correct in environment variables

### Logs
- **Railway**: View logs in Railway dashboard
- **Vercel**: View logs in Vercel dashboard
- **Supabase**: View logs in Supabase dashboard

## Cost Estimate (Monthly)
- **Vercel**: Free tier, then $20/month for Pro
- **Railway**: $5-20/month depending on usage
- **Supabase**: Free tier, then $25/month for Pro

## Next Steps
1. Set up custom domains
2. Configure SSL certificates (handled automatically)
3. Set up monitoring and alerts
4. Configure backup strategies
5. Set up CI/CD pipelines
