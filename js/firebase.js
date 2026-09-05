// =====================================================
// Firebase Configuration
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhQvRHBYX7dGW7QiSVN24cukmYHrN6d1c",
  authDomain: "data-ke-aksi-auth.firebaseapp.com",
  projectId: "data-ke-aksi-auth",
  storageBucket: "data-ke-aksi-auth.firebasestorage.app",
  messagingSenderId: "631382692174",
  appId: "1:631382692174:web:c10a099fb3021849eace1f",
  measurementId: "G-9NMBBB79EQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
