import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';

// Real Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyANn7DJq76nrxMRY25vO8sAcEiRIE8Rd8c",
  authDomain: "gen-lang-client-0420782130.firebaseapp.com",
  projectId: "gen-lang-client-0420782130",
  storageBucket: "gen-lang-client-0420782130.firebasestorage.app",
  messagingSenderId: "507824012838",
  appId: "1:507824012838:web:c2107667b88fe8032c70e7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, "ai-studio-a5c4dd4a-323c-4393-886f-818343a351d5");

// Re-export common Firestore functions to use elsewhere
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  runTransaction,
  serverTimestamp
};

export const CLOUDINARY_CONFIG = {
  cloudName: 'dilrcexxe',
  uploadPreset: 'MingleKe',
  folderPrefix: 'ksas/'
};
