#!/bin/bash

# Script to build the Next.js app for GitHub Pages
set -e

echo "🔍 Preparing for GitHub Pages deployment..."

# Create .env.production.local with static export settings
echo "EXPORT_MODE=static" > .env.production.local 
echo "NEXT_PUBLIC_API_URL=https://your-cloud-run-url.run.app" >> .env.production.local
echo "NEXT_PUBLIC_FRONTEND_ONLY=true" >> .env.production.local

echo "📦 Installing dependencies..."
npm install

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf out

echo "🛠️ Building static site for GitHub Pages..."
npm run build

echo "📄 Creating GitHub Pages specific files..."
# Create .nojekyll file to prevent GitHub Pages from ignoring files that start with underscore
touch out/.nojekyll

# Create CNAME file if you have a custom domain
# echo "yourdomain.com" > out/CNAME

echo "✅ GitHub Pages build completed successfully!"
echo "Deploy the contents of the 'out' directory to GitHub Pages" 