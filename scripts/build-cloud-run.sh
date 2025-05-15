#!/bin/bash

# Script to build the Next.js app for Google Cloud Run
set -e

echo "🔍 Preparing for Google Cloud Run deployment..."

# Create .env.production for server deployment
cat > .env.production << EOL
# Set this to your production MongoDB URL
DATABASE_URL=mongodb+srv://your-mongodb-atlas-url/novelist-guide

# NextAuth
NEXTAUTH_URL=https://your-cloud-run-url.run.app
NEXTAUTH_SECRET=your-production-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Drive
GOOGLE_DRIVE_CLIENT_ID=your-drive-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-drive-client-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Production mode
NODE_ENV=production
EOL

echo "📦 Installing dependencies..."
npm ci

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🛠️ Building app for Cloud Run..."
npm run build

echo "✅ Build completed successfully!"
echo "You can now deploy the app using the deploy-cloud-run.sh script."
echo "Remember to update your environment variables in .env.production with real values." 