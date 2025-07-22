// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBODx2iSheEk6mfbMUn0Zm_wiHo5Czremw",
  authDomain: "stackle-633f6.firebaseapp.com",
  projectId: "stackle-633f6",
  storageBucket: "stackle-633f6.firebasestorage.app",
  messagingSenderId: "637911762152",
  appId: "1:637911762152:web:3f4b43bd4c6cfb4a52355d",
  measurementId: "G-W84R8Y9CY6"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)