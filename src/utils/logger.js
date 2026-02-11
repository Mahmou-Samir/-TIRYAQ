// src/utils/logger.js
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// دالة تسجيل النشاط
export const logActivity = async (user, action, type = 'info') => {
  try {
    await addDoc(collection(db, "activities"), {
      user: user || 'مستخدم',
      action: action,
      type: type, // 'success', 'warning', 'info'
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};