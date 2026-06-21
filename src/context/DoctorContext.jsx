import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config';
import { getConsultDisplayId } from '../utils/doctorService';

const DoctorContext = createContext(null);

export { getConsultDisplayId };

export const DoctorProvider = ({ children }) => {
  const [consultations, setConsultations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }, []);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      setLoadingConsultations(false);
      setLoadingProfile(false);
      return undefined;
    }

    const unsubProfile = onSnapshot(doc(db, 'doctors', uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoadingProfile(false);
    });

    const unsubConsults = onSnapshot(
      query(
        collection(db, 'consultations'),
        where('doctorId', '==', uid),
        orderBy('createdAt', 'desc'),
      ),
      (snap) => {
        setConsultations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingConsultations(false);
      },
      () => {
        onSnapshot(
          query(collection(db, 'consultations'), where('doctorId', '==', uid)),
          (snap) => {
            setConsultations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoadingConsultations(false);
          },
        );
      },
    );

    return () => {
      unsubProfile();
      unsubConsults();
    };
  }, []);

  const pendingCount = useMemo(
    () => consultations.filter((c) => c.status === 'pending').length,
    [consultations],
  );

  const stats = useMemo(() => ({
    total: consultations.length,
    pending: pendingCount,
    replied: consultations.filter((c) => c.status === 'replied').length,
    rating: profile?.rating ?? 5,
    reviews: profile?.reviews ?? 0,
  }), [consultations, pendingCount, profile]);

  const value = useMemo(() => ({
    consultations,
    profile,
    loadingConsultations,
    loadingProfile,
    pendingCount,
    stats,
    showToast,
    toast,
    profileComplete: Boolean(profile?.published && profile?.name),
  }), [consultations, profile, loadingConsultations, loadingProfile, pendingCount, stats, showToast, toast]);

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export const useDoctor = () => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctor must be used within DoctorProvider');
  return ctx;
};
