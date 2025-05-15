#!/bin/bash

# Script to set up environment variables for Google Cloud Run
set -e

# Configuration variables
PROJECT_ID="prompt-guide"
SERVICE_NAME="novelist-guide-api"
REGION="us-central1"  # Change to your preferred region

echo "🔍 Setting up environment variables for Google Cloud Run..."

# Ensure gcloud is authenticated and configured
echo "🔐 Checking Google Cloud authentication..."
gcloud auth print-identity-token > /dev/null || (echo "❌ Not authenticated to Google Cloud. Run 'gcloud auth login' first." && exit 1)

# Set the current project
echo "🌐 Setting Google Cloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Prompt for environment variables
echo "Please enter the following environment variables for your Cloud Run service:"

read -p "DATABASE_URL: " DATABASE_URL
read -p "NEXTAUTH_URL (service URL): " NEXTAUTH_URL
read -p "NEXTAUTH_SECRET: " NEXTAUTH_SECRET
read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
read -p "FIREBASE_PROJECT_ID: " FIREBASE_PROJECT_ID
read -p "FIREBASE_CLIENT_EMAIL: " FIREBASE_CLIENT_EMAIL
read -p "FIREBASE_PRIVATE_KEY (paste the entire key): " FIREBASE_PRIVATE_KEY

# Update the Cloud Run service with environment variables
echo "🔄 Updating Cloud Run service with environment variables..."
gcloud run services update $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --set-env-vars="DATABASE_URL=$DATABASE_URL" \
  --set-env-vars="NEXTAUTH_URL=$NEXTAUTH_URL" \
  --set-env-vars="NEXTAUTH_SECRET=$NEXTAUTH_SECRET" \
  --set-env-vars="GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" \
  --set-env-vars="GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" \
  --set-env-vars="FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" \
  --set-env-vars="FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL" \
  --set-env-vars="FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY" \
  --set-env-vars="NODE_ENV=production"

echo "✅ Environment variables set successfully for Cloud Run service!" 