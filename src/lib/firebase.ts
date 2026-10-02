import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as secondarySignOut, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel,
  Firestore 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCRd0ZYMrw-HbKoQPLvCjHEhUBcThqXUjM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "anti-theft-e5d7a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "anti-theft-e5d7a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "anti-theft-e5d7a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "754088433198",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:754088433198:web:ee85d23e264441561071bf"
};

// Initialize Primary Firebase Instance
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Suppress transient network offline warnings
try {
  setLogLevel('silent');
} catch {
  // Ignore if already set
}

// Initialize robust Firestore with forced long-polling for rock-solid iframe/proxy connectivity
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch {
    return getFirestore(app);
  }
})();

/**
 * Secondary Firebase App pattern:
 * Allows verifying target user credentials without affecting the current logged in session
 */
export async function authenticateSecondaryUser(email: string, pass: string): Promise<{ uid: string; email: string }> {
  const secondaryAppName = 'SecondaryAuthApp';
  let secondaryApp: FirebaseApp;
  
  const existingApp = getApps().find(a => a.name === secondaryAppName);
  if (existingApp) {
    secondaryApp = existingApp;
  } else {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }

  const secondaryAuth = getAuth(secondaryApp);
  const userCredential = await signInWithEmailAndPassword(secondaryAuth, email, pass);
  const uid = userCredential.user.uid;
  const userEmail = userCredential.user.email || email;

  // Clean up session in secondary app
  try {
    await secondarySignOut(secondaryAuth);
  } catch (e) {
    console.warn('Secondary auth signOut non-fatal:', e);
  }

  return { uid, email: userEmail };
}
