import {
  collection, doc, setDoc, addDoc, updateDoc,
  onSnapshot, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { MOCK_DOCTORS } from '../components/patient/doctorConstants';

/** شعبية = تقييم × log(تقييمات+1) + عدد التقييمات — الأطباء الأشهر أولاً */
export const computePopularityScore = (rating = 0, reviews = 0) => {
  const r = Number(rating) || 0;
  const n = Number(reviews) || 0;
  return r * Math.log10(n + 1) * 10 + n;
};

export const sortDoctorsByPopularity = (doctors) =>
  [...doctors].sort((a, b) => {
    const popA = a.popularityScore ?? computePopularityScore(a.rating, a.reviews);
    const popB = b.popularityScore ?? computePopularityScore(b.rating, b.reviews);
    if (popB !== popA) return popB - popA;
    if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
    if ((b.reviews || 0) !== (a.reviews || 0)) return (b.reviews || 0) - (a.reviews || 0);
    const tA = a.createdAt?.seconds ?? a.createdAt ?? 0;
    const tB = b.createdAt?.seconds ?? b.createdAt ?? 0;
    return tB - tA;
  });

export const mergeDoctorsList = (firestoreDocs) => {
  const byId = new Map(MOCK_DOCTORS.map((d) => {
    const popularityScore = computePopularityScore(d.rating, d.reviews);
    return [d.id, { ...d, isSeed: true, popularityScore }];
  }));
  firestoreDocs.forEach((d) => {
    if (d.published !== false) {
      byId.set(d.id, {
        ...d,
        isSeed: false,
        popularityScore: d.popularityScore ?? computePopularityScore(d.rating, d.reviews),
      });
    }
  });
  return sortDoctorsByPopularity([...byId.values()]);
};

export const subscribePublishedDoctors = (onData, onError) => {
  const q = query(
    collection(db, 'doctors'),
    where('published', '==', true),
    orderBy('popularityScore', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => {
      onSnapshot(collection(db, 'doctors'), (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((d) => d.published !== false);
        onData(docs);
      }, onError);
    },
  );
};

export const saveDoctorProfile = async (uid, data) => {
  const rating = Number(data.rating) || 5;
  const reviews = Number(data.reviews) || 0;
  const popularityScore = computePopularityScore(rating, reviews);
  const payload = {
    ...data,
    userId: uid,
    rating,
    reviews,
    popularityScore,
    published: true,
    updatedAt: serverTimestamp(),
  };
  if (!data.createdAt) payload.createdAt = serverTimestamp();
  await setDoc(doc(db, 'doctors', uid), payload, { merge: true });
  await setDoc(doc(db, 'users', uid), {
    profileComplete: true,
    doctorName: data.name,
  }, { merge: true });
  return payload;
};

export const createConsultation = async ({
  patientId, patientName, doctorId, doctorName,
  symptoms, consultType, fee,
}) => {
  const ref = await addDoc(collection(db, 'consultations'), {
    patientId,
    patientName: patientName || 'مريض',
    doctorId,
    doctorName: doctorName || '',
    symptoms,
    consultType: consultType || 'chat',
    fee: Number(fee) || 0,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateConsultationStatus = async (id, status, reply = '') => {
  const patch = { status, updatedAt: serverTimestamp() };
  if (reply) patch.reply = reply;
  await updateDoc(doc(db, 'consultations', id), patch);
};

export const getConsultDisplayId = (c) => c?.consultId || `#${String(c?.id || '').slice(0, 6)}`;
