import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAetD1_983dWo1lApaHnKl1R1JrKyxfHoE",
  authDomain: "ai-hedge-fund-b8e3b.firebaseapp.com",
  projectId: "ai-hedge-fund-b8e3b",
  storageBucket: "ai-hedge-fund-b8e3b.firebasestorage.app",
  messagingSenderId: "36181991213",
  appId: "1:36181991213:web:be9926bfc3cdba10febda4",
  measurementId: "G-1PJ0W41V8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances to be used across the app!
export { app, auth, db, analytics };