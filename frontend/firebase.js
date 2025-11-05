// frontend/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config - replace with your actual config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_9Sm3vxCr1YnBgv_Bgc33nuK0wScMz_c",
  authDomain: "myschedulink.firebaseapp.com",
  projectId: "myschedulink",
  storageBucket: "myschedulink.firebasestorage.app",
  messagingSenderId: "503046113443",
  appId: "1:503046113443:web:743ad1c02bbf04b8be1716",
  measurementId: "G-ER37MBV87Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

