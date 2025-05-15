#!/bin/bash

# Script to prepare the Next.js app for deployment
set -e

echo "🔍 Checking Node.js version..."
node -v

echo "📦 Installing dependencies including sharp..."
npm install
npm install sharp

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🛠️ Building app..."
npm run build

echo "✅ Build completed successfully!"
echo "You can now deploy the app using your preferred platform."
echo "Remember to set all required environment variables on your platform." 