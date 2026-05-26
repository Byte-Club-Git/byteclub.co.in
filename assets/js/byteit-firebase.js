import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

const firebaseConfig = window.BYTEIT_FIREBASE_CONFIG || {};

export function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

export const app = hasFirebaseConfig() ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const functions = app ? getFunctions(app) : null;

export {
  collection,
  doc,
  getDoc,
  getDocs,
  httpsCallable,
  onAuthStateChanged,
  orderBy,
  query,
  signInWithEmailAndPassword,
  signOut,
  where
};

export function requireFirebase() {
  if (!app || !auth || !db || !functions) {
    throw new Error("Firebase is not configured. Update assets/js/byteit-firebase-config.js first.");
  }
  return { app, auth, db, functions };
}
