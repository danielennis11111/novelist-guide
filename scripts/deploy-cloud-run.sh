#!/bin/bash

# Script to deploy the Next.js app backend to Google Cloud Run
set -e

# Configuration variables
PROJECT_ID="your-google-cloud-project-id"
SERVICE_NAME="novelist-guide-api"
REGION="us-central1"  # Change to your preferred region

echo "🔍 Preparing for Google Cloud Run deployment..."

# Ensure gcloud is authenticated and configured
echo "🔐 Checking Google Cloud authentication..."
gcloud auth print-identity-token > /dev/null || (echo "❌ Not authenticated to Google Cloud. Run 'gcloud auth login' first." && exit 1)

# Set the current project
echo "🌐 Setting Google Cloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Run the build script
echo "🏗️ Building the application for Cloud Run..."
./scripts/build-cloud-run.sh

# Build the Docker image
echo "🏗️ Building Docker image..."
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars="NODE_ENV=production"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo "✅ Backend deployed successfully to Google Cloud Run!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "Don't forget to update your GitHub Pages frontend with this backend URL:"
echo "Edit scripts/build-github-pages.sh and set NEXT_PUBLIC_API_URL=$SERVICE_URL" 