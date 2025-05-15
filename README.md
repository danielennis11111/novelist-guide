# Novelist Guide

A comprehensive web application designed to help writers manage their novels, track progress, and stay organized throughout their writing journey.

## Features

### Novel Management
- Rich text editor with formatting options
- Auto-save functionality
- Version history tracking
- Google Drive integration for backup and sync
- File upload support (.txt, .md, .doc, .docx)

### World Bible
- Character management with detailed profiles
- World building elements (locations, items, concepts)
- Relationship mapping between elements
- Progress tracking for world development

### Writing Calendar
- Schedule writing sessions
- Set recurring reminders
- Google Calendar integration
- View upcoming writing sessions
- Track writing streaks

### Gamification
- Daily and weekly writing quests
- Progress tracking
- Achievement system
- Writing statistics
- Points and rewards

## Architecture Overview

### Frontend Architecture
- **Pages**: Next.js pages for routing and server-side rendering
  - `/novels/[id]`: Novel editor page
  - `/novels/[id]/world-bible`: World bible management
  - `/novels/[id]/calendar`: Writing calendar
  - `/api/*`: API routes for backend functionality

- **Components**:
  - `NovelEditor`: Rich text editor with auto-save
  - `WorldBibleElements`: World building element management
  - `WorldBiblePanel`: Progress tracking and quests
  - `Calendar`: Writing schedule management
  - `ReminderForm`: Calendar event creation/editing

- **State Management**:
  - React hooks for local state
  - Firebase Realtime Updates
  - Server-side state through Firebase Admin SDK

### Backend Architecture
- **Database Schema** (Firestore):
  ```typescript
  interface Novel {
    id: string;
    title: string;
    description: string;
    genre: string[];
    targetAudience: string;
    status: string;
    gdriveRootFolderId: string;
    userId: string;
    characters: Character[];
    worldElements: WorldElement[];
    chapters: Chapter[];
    versions: NovelVersion[];
    backups: NovelBackup[];
    writingStats: WritingStats;
    writingQuests: WritingQuest[];
    writingReminders: WritingReminder[];
    worldBibleQuests: WorldBibleQuest[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  ```

- **API Routes** (Served via Google Cloud Run):
  - `/api/novels`: Novel CRUD operations
  - `/api/novels/[id]/versions`: Version management
  - `/api/novels/[id]/world-bible`: World bible operations
  - `/api/novels/[id]/reminders`: Calendar integration
  - `/api/novels/[id]/quests`: Gamification features

### External Integrations
- **Google Drive API**:
  - Auto-save functionality
  - Version history
  - File backup
  - Document sync

- **Google Calendar API**:
  - Writing session scheduling
  - Reminder management
  - Recurring events
  - Progress tracking

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Framework**: Chakra UI
- **Rich Text Editor**: TipTap
- **Database**: Firebase Firestore
- **Authentication**: NextAuth.js with Firebase Auth
- **Storage**: Firebase Storage
- **Calendar Integration**: Google Calendar API
- **Cloud Storage**: Google Drive API

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- Firebase project with Blaze plan
- Google Cloud Platform account
- Google OAuth credentials

### Environment Variables

There is an `.env` file in the root directory with the following variables:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_PRIVATE_KEY="your-private-key"

# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/danielennis11111/novelist-guide
cd novelist-guide
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
```bash
npm install -g firebase-tools
firebase login
firebase init
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

The application is deployed with a decoupled frontend and backend:
- **Backend Services**: A dedicated backend application (e.g., built with Express.js) will be created to handle all API logic. This service will interact with Firebase services (Firestore, Authentication, Storage) and will be containerized and deployed on Google Cloud Run.
- **Frontend Application**: The Next.js application is statically exported and can be deployed to GitHub Pages or any static hosting provider.

### Backend Deployment (Google Cloud Run)

The backend will be a new, standalone application (e.g., an Express.js server) responsible for all API routes and business logic. The API logic currently in `src/pages/api` should be migrated to this new backend service.

1.  **Create your Backend Application**:
    *   Set up a new Node.js project (e.g., in a `backend/` subdirectory).
    *   Install necessary dependencies (e.g., `express`, `firebase-admin`, `cors`).
    *   Implement your API endpoints. Ensure it's configured to connect to your Firebase project (using environment variables for service account keys, etc.).

2.  **Create a `Dockerfile` for the Backend**:
    Place this Dockerfile (e.g., `backend/Dockerfile` or `backend.Dockerfile`) in the directory of your new backend application.
    ```dockerfile
    # Example Dockerfile for a Node.js/Express.js backend
    FROM node:18-slim
    WORKDIR /usr/src/app

    # Copy package.json and package-lock.json (or yarn.lock)
    COPY package*.json ./

    # Install production dependencies
    RUN npm ci --only=production

    # Copy the rest of the application code
    COPY . .

    # Expose the port the app runs on
    EXPOSE 8080 

    # Command to run the application
    # Replace server.js with your application's entry point
    CMD [ "node", "server.js" ] 
    ```
    *Note: The existing `Dockerfile` in the project root is for building the full Next.js application and is **not** used for this decoupled backend service.*

3.  **Build and Push Docker Image**: Navigate to your backend application's directory and build its Docker image. Push it to Google Container Registry (GCR) or Artifact Registry.
    ```bash
    # Example: if your backend is in a 'backend' subdirectory
    cd backend/
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/novelist-guide-backend
    cd .. 
    ```
4.  **Deploy to Cloud Run**: Deploy the container image to Cloud Run.
    ```bash
    gcloud run deploy novelist-guide-backend \
      --image gcr.io/YOUR_PROJECT_ID/novelist-guide-backend \
      --platform managed \
      --region YOUR_REGION \
      --allow-unauthenticated \
      --port 8080 # Ensure this matches the port exposed in your Dockerfile and used by your app
      # Add environment variables for Firebase config, API keys, NEXT_PUBLIC_API_URL for the backend itself if needed, etc.
      # Example: --set-env-vars FIREBASE_PROJECT_ID="your-project-id",GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json" (if key is baked into image, or use Secret Manager)
    ```
    Ensure your Cloud Run service has the appropriate IAM permissions to access Firebase services and that `GOOGLE_APPLICATION_CREDENTIALS` are correctly configured (preferably via Secret Manager integration with Cloud Run). The `--allow-unauthenticated` flag is for simplicity; configure proper authentication for production.

### Frontend Deployment (GitHub Pages)

The Next.js frontend is deployed as a static site to GitHub Pages. This requires exporting your application.

**Prerequisites for Static Export:**
- Ensure your Next.js application is compatible with static export (`next export`). This means:
    - API routes (`pages/api`) within Next.js will not function on GitHub Pages; all API calls must be directed to your Google Cloud Run backend.
    - Dynamic routes need to be defined using `getStaticPaths` if they are to be pre-rendered.
    - Features like `getServerSideProps` cannot be used. Use `getStaticProps` for data fetching at build time or fetch data client-side.

**Deployment Steps:**

1.  **Configure `next.config.js` for GitHub Pages (if needed)**:
    If your GitHub Pages site is served from a subdirectory (e.g., `https://username.github.io/repository-name/`), you'll need to set the `basePath` and `assetPrefix`.
    ```javascript
    // next.config.js
    const isGithubActions = process.env.GITHUB_ACTIONS || false;

    let assetPrefix = '';
    let basePath = '';

    if (isGithubActions) {
      // trim off `<owner>/`
      const repo = process.env.GITHUB_REPOSITORY.replace(/.*\//, '');
      assetPrefix = `/${repo}/`;
      basePath = `/${repo}`;
    }

    module.exports = {
      assetPrefix: assetPrefix,
      basePath: basePath,
      // Optional: Ensure images are correctly handled for static export
      images: {
        loader: 'imgix', // or 'akamai', 'cloudinary' if you use an image CDN
        path: assetPrefix, // this might need to be your CDN path
        unoptimized: true, // if you don't use an image CDN and want to serve local images
      },
    };
    ```

2.  **Update Build Script**: Modify your `package.json` build script to include `next export`.
    ```json
    // package.json
    "scripts": {
      // ... other scripts
      "build": "next build && next export",
      "deploy-gh-pages": "npm run build && touch out/.nojekyll && gh-pages -d out -t true"
    },
    ```
    The `touch out/.nojekyll` command prevents GitHub Pages from ignoring files that start with an underscore (like Next.js's `_next` directory).

3.  **Install `gh-pages`**:
    ```bash
    npm install gh-pages --save-dev
    ```

4.  **Deploy**: Run the deploy script.
    ```bash
    npm run deploy-gh-pages
    ```
    This will build your Next.js app, export it to the `out` directory, and then push the contents of `out` to the `gh-pages` branch of your repository, which GitHub Pages will serve.

5.  **Configure GitHub Repository**:
    - Go to your repository settings on GitHub.
    - Navigate to the "Pages" section.
    - Select the `gh-pages` branch as the source for GitHub Pages.
    - Your site should become available at `https://<your-username>.github.io/<your-repo-name>/` (if using `basePath`).

### Original Firebase Deployment (Alternative for Frontend)

If you prefer to host the Next.js frontend (especially if it requires server-side capabilities not supported by static export) on Firebase, you can still use Firebase Hosting.

1.  **Configure Firebase for Hosting Next.js**:
    You might need to adjust your `firebase.json` to correctly serve a Next.js app, potentially using Firebase Functions for server-side rendering if not going fully static.
    ```json
    // firebase.json
    {
      "hosting": {
        "source": ".", // Or your Next.js build output directory if different
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "frameworksBackend": {
          "region": "us-central1" // Or your preferred region
        }
      }
      // ... other firebase configurations
    }
    ```
    Firebase has improved support for Next.js, often requiring minimal configuration if you initialize Firebase Hosting with experimental web frameworks support or use `firebase deploy --only hosting`.

2.  **Build the application**:
    ```bash
    npm run build
    ```
    (This command might differ if Next.js server-side features are used with Firebase Functions, often `next build` is sufficient).

3.  **Deploy to Firebase Hosting**:
    ```bash
    firebase deploy --only hosting
    ```

This approach keeps your entire application (frontend and backend interactions via Cloud Run) within the Google Cloud ecosystem, with Firebase Hosting serving the Next.js frontend. Choose between GitHub Pages (static) or Firebase Hosting based on your frontend's requirements.

### Development Workflow

```
novelist-guide/
├── src/
│   ├── components/        # React components
│   │   ├── NovelEditor.tsx
│   │   ├── WorldBibleElements.tsx
│   │   ├── Calendar.tsx
│   │   └── ...
│   ├── lib/              # Utility functions and services
│   │   ├── firebase-admin.ts
│   │   ├── firebase.ts
│   │   ├── calendar-service.ts
│   │   └── world-bible-service.ts
│   ├── pages/            # Next.js pages
│   │   ├── api/          # API routes
│   │   └── novels/       # Novel pages
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── package.json
```

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the existing patterns:
   - Use TypeScript for type safety
   - Follow the component structure
   - Add appropriate tests
   - Update documentation

3. Test your changes:
```bash
npm run test
npm run lint
```

4. Create a pull request with:
   - Description of changes
   - Screenshots if applicable
   - Test results
   - Any breaking changes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Firebase](https://firebase.google.com/)
- [TipTap](https://tiptap.dev/)
- [Google APIs](https://developers.google.com/) 