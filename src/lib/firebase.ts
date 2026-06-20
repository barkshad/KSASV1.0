import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxQ7pKCdlJgtH1cxfM5QChgtULqRHmx_s",
  authDomain: "ksas-33f7b.firebaseapp.com",
  databaseURL: "https://ksas-33f7b-default-rtdb.firebaseio.com",
  projectId: "ksas-33f7b",
  storageBucket: "ksas-33f7b.firebasestorage.app",
  messagingSenderId: "485938520817",
  appId: "1:485938520817:web:5f998d22fa06e729ffff50"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Cloudinary config
export const CLOUDINARY_CLOUD_NAME = "dilrcexxe";
export const CLOUDINARY_UPLOAD_PRESET = "MingleKe";
export const CLOUDINARY_FOLDER = "ksas";
