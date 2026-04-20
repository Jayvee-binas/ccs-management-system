#!/bin/bash

# CCS Management System Deployment Script
echo "=== CCS Management System Deployment ==="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: CCS Management System"
else
    echo "Git repository already exists"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production

# Build outputs
build/
dist/
*/build/
*/dist/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Uploads
backend/uploads/
EOF
fi

# Add all files
echo "Adding files to Git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Configure for deployment: Vercel + Railway + Supabase"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Please add your GitHub repository as origin:"
    echo "git remote add origin https://github.com/yourusername/your-repo.git"
    echo "Then run: git push -u origin main"
else
    echo "Pushing to GitHub..."
    git push origin main
fi

echo ""
echo "=== Next Steps ==="
echo "1. Push code to GitHub if not done automatically"
echo "2. Set up Supabase database (see DEPLOYMENT_GUIDE.md)"
echo "3. Deploy backend to Railway"
echo "4. Deploy frontend to Vercel"
echo "5. Configure environment variables"
echo ""
echo "Check DEPLOYMENT_GUIDE.md for detailed instructions!"
