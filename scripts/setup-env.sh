#!/bin/bash

# Script to set up environment variables for local development
set -e

# Check if .env file exists
if [ -f .env ]; then
  echo "⚠️ .env file already exists. Do you want to overwrite it? (y/n)"
  read -r answer
  if [[ "$answer" != "y" ]]; then
    echo "❌ Aborted. Your .env file was not modified."
    exit 0
  fi
fi

# Create .env file
cat > .env << EOL
# Database
DATABASE_URL="mongodb://localhost:27017/novelist-guide"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-local-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Drive API
GOOGLE_DRIVE_CLIENT_ID="your-drive-client-id"
GOOGLE_DRIVE_CLIENT_SECRET="your-drive-client-secret"

# Firebase
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_PRIVATE_KEY="your-private-key"

# Development mode
NODE_ENV="development"
EOL

echo "✅ .env file created successfully!"
echo "⚠️ Please edit the .env file and fill in your actual credentials."
echo "📝 For local development, run: npm run dev" 