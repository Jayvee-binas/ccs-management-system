# Quick Deploy - CCS Management System

## One-Click Deployment Steps

### 1. Push to GitHub
```bash
# Run the deployment script
./deploy.sh

# Or manually:
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables (see below)
6. Deploy

### 3. Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app/api`
6. Deploy

### 4. Set up Database (Supabase)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Run your database schema
4. Get connection credentials

## Required Environment Variables

### Railway (Backend)
```
NODE_ENV=production
PORT=5000
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend-app.railway.app/api
```

## Test Deployment
- Backend Health: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-app.vercel.app`

## Done! Your CCS Management System is now live!
