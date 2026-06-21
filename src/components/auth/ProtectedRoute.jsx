import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';

const ROLE_HOME = {
  admin: '/admin',
  pharmacy: '/pharmacy',
  doctor: '/doctor',
  patient: '/patient',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          setRole(snap.exists() ? snap.data().role : null);
        } catch {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm text-slate-500">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && role && !allowedRoles.includes(role)) {
    const home = ROLE_HOME[role] || '/';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
