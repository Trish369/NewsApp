// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIiytXrZ-R7ey0MBmuhaCTjV6mGk8E_W0",
  authDomain: "news-56096.firebaseapp.com",
  projectId: "news-56096",
  storageBucket: "news-56096.firebasestorage.app",
  messagingSenderId: "3845910401",
  appId: "1:3845910401:web:67ff688a45555dce8ec280",
  measurementId: "G-XJBJK4305Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, analytics };