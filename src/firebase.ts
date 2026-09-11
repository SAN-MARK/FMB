import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default config from Firebase provisioning with fallbacks to environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD-NY1KfPjp1Z7KnsRko62EhIOBJmHghy0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'light-flow-15jvd.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'light-flow-15jvd',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'light-flow-15jvd.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '331036023954',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:331036023954:web:c136eab16e694b06adda4b',
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication instance
export const auth = getAuth(app);

// Google Auth Provider configured with prompt selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Firestore database instance
const customDatabaseId = 
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
  'ai-studio-findback-c5aa700c-3e01-4ca2-b113-fc2397c8e41c';

// Use named database if specified, otherwise default database
export const db = customDatabaseId 
  ? getFirestore(app, customDatabaseId) 
  : getFirestore(app);

export default app;
