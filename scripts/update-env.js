const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { initializeApp, cert } = require('firebase-admin/app');

async function updateEnv() {
  try {
    // Read the client secret file
    const clientSecretPath = path.join(process.cwd(), 'client_secret_289372425801-1sjvmp5qqs1h0gagnl05ur0v0rpcm7ii.apps.googleusercontent.com.json');
    const clientSecret = JSON.parse(fs.readFileSync(clientSecretPath, 'utf8'));

    // Read Firebase service account key
    const serviceAccountPath = path.join(process.cwd(), 'firebase-backend-sa-key.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // Read existing .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.log('No existing .env file found, creating new one.');
    }

    // Parse existing env variables
    const envVars = envContent.split('\n').reduce((acc, line) => {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        acc[key.trim()] = values.join('=').trim();
      }
      return acc;
    }, {});

    // Update with Google OAuth credentials
    envVars['GOOGLE_CLIENT_ID'] = clientSecret.web.client_id;
    envVars['GOOGLE_CLIENT_SECRET'] = clientSecret.web.client_secret;
    envVars['NEXTAUTH_URL'] = 'http://localhost:3000';
    envVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = clientSecret.web.project_id;
    envVars['FIREBASE_PROJECT_ID'] = clientSecret.web.project_id;
    envVars['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] = `${clientSecret.web.project_id}.firebaseapp.com`;
    envVars['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] = `${clientSecret.web.project_id}.appspot.com`;

    // Add Firebase service account credentials
    envVars['FIREBASE_CLIENT_EMAIL'] = serviceAccount.client_email;
    envVars['FIREBASE_PRIVATE_KEY'] = serviceAccount.private_key;

    // If NEXTAUTH_SECRET doesn't exist, generate a random one
    if (!envVars['NEXTAUTH_SECRET']) {
      envVars['NEXTAUTH_SECRET'] = crypto.randomBytes(32).toString('hex');
    }

    // Convert back to .env format
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write back to .env file
    fs.writeFileSync(envPath, newEnvContent);

    console.log('✅ Updated .env file with Google OAuth and Firebase credentials');
    console.log('⚠️ Note: You still need to add NEXT_PUBLIC_FIREBASE_API_KEY from your Firebase Console:');
    console.log('1. Go to Firebase Console');
    console.log('2. Select your project');
    console.log('3. Go to Project Settings');
    console.log('4. Under "Your apps", click the Web app (</>)');
    console.log('5. Copy the apiKey value from the config');
  } catch (error) {
    console.error('Error updating environment variables:', error);
  } finally {
    process.exit();
  }
}

updateEnv(); 