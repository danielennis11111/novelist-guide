const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require('./firebase-backend-sa-key.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

// Initialize Firebase and export the admin instance
const firebase = initializeFirebase();
module.exports = firebase; 