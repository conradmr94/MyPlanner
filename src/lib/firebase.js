// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

import {
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAX_sClHf-smW5SULniJ4XbJV4L4x9QcvA",
  authDomain: "myplanner-8eda5.firebaseapp.com",
  projectId: "myplanner-8eda5",
  storageBucket: "myplanner-8eda5.firebasestorage.app",
  messagingSenderId: "1074863350827",
  appId: "1:1074863350827:web:1a3ab1651697318c16366e",
  measurementId: "G-95L49NQPY4"
};
const app = initializeApp(firebaseConfig);

// Firestore (with offline persistence)
export const db = getFirestore(app);

export const TS = serverTimestamp;

// Auth helpers
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}
export function signOutUser() {
  return signOut(auth);
}
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function createUser(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

export async function signInUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  } catch {}
}
