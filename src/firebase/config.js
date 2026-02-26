import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAikm6VNgN-If5uqwTsJ3jlJtHTeHiAjp8",
  authDomain: "tiryaq-5b9c6.firebaseapp.com",
  projectId: "tiryaq-5b9c6",
  storageBucket: "tiryaq-5b9c6.firebasestorage.app",
  messagingSenderId: "938703176892",
  appId: "1:938703176892:web:f2c227bf3aa73a5269bcb9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);     
export const db = getFirestore(app);  
export const storage = getStorage(app);