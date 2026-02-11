// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 👇 انسخ الـ Config بتاعك من موقع Firebase وحطه هنا مكان ده
const firebaseConfig = {
  apiKey: "AIzaSyAikm6VNgN-If5uqwTsJ3jlJtHTeHiAjp8",
  authDomain: "tiryaq-5b9c6.firebaseapp.com",
  projectId: "tiryaq-5b9c6",
  storageBucket: "tiryaq-5b9c6.firebasestorage.app",
  messagingSenderId: "938703176892",
  appId: "1:938703176892:web:f2c227bf3aa73a5269bcb9"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);      // 👈 مهم
export const db = getFirestore(app);   // 👈 مهم
export const storage = getStorage(app);// 👈 مهم