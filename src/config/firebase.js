const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    console.log('Initializing Firebase Admin SDK...');
    console.log('Environment variables check:', {
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY
    });

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('Using FIREBASE_SERVICE_ACCOUNT_KEY...');
      let serviceAccount;
      
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('Service account parsed successfully:', {
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKeyLength: serviceAccount.private_key ? serviceAccount.private_key.length : 0
        });
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.log('Using individual Firebase environment variables...');
      
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      console.log('Private key processing:', {
        originalLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
        processedLength: privateKey?.length || 0,
        hasNewlines: privateKey?.includes('\n') || false
      });

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
    }
    
    console.log('Firebase Admin SDK initialized successfully');
    
    // Test the admin object
    if (admin && admin.auth) {
      console.log('Firebase admin.auth is available');
    } else {
      console.error('Firebase admin.auth is NOT available after initialization');
    }
    
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

module.exports = { admin, initializeFirebase };

