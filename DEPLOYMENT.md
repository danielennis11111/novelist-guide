# Deployment Checklist

This document outlines the steps to deploy the Novelist Guide application using a split architecture:
- Backend API on Google Cloud Run
- Frontend on GitHub Pages

## Prerequisites

- Google Cloud account with billing enabled
- Google Cloud CLI installed (`gcloud`)
- GitHub account
- Node.js 18+ installed

## Step 1: Set Up Google Cloud Project

1. Create a new Google Cloud project or use an existing one
2. Enable required APIs:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. Configure authentication:
   ```bash
   gcloud auth login
   ```

## Step 2: Deploy Backend to Google Cloud Run

1. Edit the `scripts/deploy-cloud-run.sh` file to set your Google Cloud project ID:
   ```bash
   # Change this line
   PROJECT_ID="prompt-guide"
   ```

2. Run the deployment script:
   ```bash
   ./scripts/deploy-cloud-run.sh
   ```

3. Set up environment variables for Cloud Run:
   ```bash
   ./scripts/setup-cloud-run-env.sh
   ```
   
4. Note the service URL from the output (e.g., `https://novelist-guide-api-abcdef123-uc.a.run.app`)

## Step 3: Deploy Frontend to GitHub Pages

1. Edit the `scripts/build-github-pages.sh` file to set your backend API URL:
   ```bash

   
   # To something like:
   echo "NEXT_PUBLIC_API_URL=https://novelist-guide-api-abcdef123-uc.a.run.app" >> .env
   ```

2. Run the GitHub Pages build script:
   ```bash
   ./scripts/build-github-pages.sh
   ```

3. Create a GitHub repository for your project (if not already created)

4. Push the contents of the `out` directory to the `gh-pages` branch:
   ```bash
   cd out
   git init
   git add .
   git commit -m "Deploy to GitHub Pages"
   git remote add origin https://github.com/yourusername/novelist-guide.git
   git push -f origin main:gh-pages
   ```

5. Configure GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Set Source to "Deploy from a branch"
   - Select the "gh-pages" branch
   - Click Save

## Step 4: Set Up GitHub Actions for Automated Deployment

1. Add the following secrets to your GitHub repository:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: Your workload identity provider
   - `GCP_SERVICE_ACCOUNT`: Your Google Cloud service account email

2. Set up workload identity federation for GitHub Actions:
   ```bash
   # Create a workload identity pool
   gcloud iam workload-identity-pools create "github-actions-pool" \
     --project="${PROJECT_ID}" \
     --location="global" \
     --display-name="GitHub Actions Pool"
   
   # Create a workload identity provider
   gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
     --project="${PROJECT_ID}" \
     --location="global" \
     --workload-identity-pool="github-actions-pool" \
     --display-name="GitHub Actions Provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   
   # Create a service account
   gcloud iam service-accounts create "github-actions-service-account" \
     --project="${PROJECT_ID}" \
     --display-name="GitHub Actions Service Account"
   
   # Grant necessary roles to the service account
   gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
     --member="serviceAccount:github-actions-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
     --member="serviceAccount:github-actions-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
     --member="serviceAccount:github-actions-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   
   # Allow GitHub Actions to impersonate the service account
   gcloud iam service-accounts add-iam-policy-binding "github-actions-service-account@${PROJECT_ID}.iam.gserviceaccount.com" \
     --project="${PROJECT_ID}" \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/yourusername/novelist-guide"
   ```

3. Get the workload identity provider resource name:
   ```bash
   gcloud iam workload-identity-pools providers describe "github-actions-provider" \
     --project="${PROJECT_ID}" \
     --location="global" \
     --workload-identity-pool="github-actions-pool" \
     --format="value(name)"
   ```

4. Set the GitHub repository secrets with the values obtained above

## Step 5: Test the Deployment

1. Visit your GitHub Pages URL (e.g., `https://yourusername.github.io/novelist-guide`)
2. Click the "Test Connection" button on the homepage to verify the connection to the backend API
3. Sign in and test the application functionality

## Troubleshooting

### Backend Issues

- Check Cloud Run logs:
  ```bash
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=novelist-guide-api" --limit=10
  ```

- Verify environment variables:
  ```bash
  gcloud run services describe novelist-guide-api --format="yaml(spec.template.spec.containers[0].env)"
  ```

### Frontend Issues

- Check that the API URL is correctly set in `.env.production.local`
- Verify that CORS is properly configured in the middleware
- Check browser console for any errors

### GitHub Actions Issues

- Check the GitHub Actions workflow runs in the repository's Actions tab
- Verify that all required secrets are set correctly 