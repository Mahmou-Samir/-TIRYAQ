import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log("🔒 Checking protection for:", location.pathname); // 1. أين نحن؟

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("✅ User detected:", currentUser.email); // 2. هل يوجد مستخدم؟
        setUser(currentUser);
      } else {
        console.log("❌ No user found. Redirecting to login..."); // 3. لا يوجد مستخدم
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, location]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm text-slate-500">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!user) {
    // توجيه لصفحة الدخول مع حفظ المكان الذي كان يريد الذهاب إليه
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;