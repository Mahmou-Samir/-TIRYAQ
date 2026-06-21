import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Search, Star, ShieldCheck, Clock, MessageCircle,
  X, Loader2, Send, Filter, Video, Phone,
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSettings } from '../../context/SettingsContext';
import { usePatient } from '../../context/PatientContext';
import { SPECIALTIES, SPECIALTY_FILTERS } from '../../components/patient/doctorConstants';
import { subscribePublishedDoctors, mergeDoctorsList, createConsultation } from '../../utils/doctorService';

export default function PatientDoctors() {
  const { t, lang } = useSettings();
  const { showToast } = usePatient();
  const D = t?.patient?.doctors ?? {};
  const isRTL = lang === 'ar';
  const currency = t?.patient?.profile?.currency || (isRTL ? 'ج.م' : 'EGP');

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('الكل');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [consultType, setConsultType] = useState('chat');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribePublishedDoctors(
      (docs) => {
        setDoctors(mergeDoctorsList(docs));
        setLoadingDoctors(false);
      },
      () => setLoadingDoctors(false),
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const filterFn = SPECIALTY_FILTERS[specialty] || (() => true);
    return doctors.filter((d) => {
      const name = isRTL ? d.name : (d.nameEn || d.name);
      const spec = isRTL ? d.specialty : (d.specialtyEn || d.specialty);
      const q = search.toLowerCase();
      const matchSearch = !q || name.toLowerCase().includes(q) || spec.toLowerCase().includes(q);
      return filterFn(d) && matchSearch;
    });
  }, [search, specialty, isRTL, doctors]);

  const handleSubmitConsult = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 10) {
      showToast(D.symptomsMin || 'اكتب وصفاً أوضح لحالتك (10 أحرف على الأقل)', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const authUser = getAuth().currentUser;
      let patientName = authUser?.displayName || 'مريض';
      if (authUser) {
        const snap = await getDoc(doc(db, 'users', authUser.uid));
        if (snap.exists()) patientName = snap.data().name || patientName;
      }
      await createConsultation({
        patientId: authUser?.uid || 'guest',
        patientName,
        doctorId: selectedDoctor.id,
        doctorName: isRTL ? selectedDoctor.name : (selectedDoctor.nameEn || selectedDoctor.name),
        symptoms: symptoms.trim(),
        consultType,
        fee: selectedDoctor.consultPrice,
      });
      setSelectedDoctor(null);
      setSymptoms('');
      showToast(D.consultSent || 'تم إرسال استشارتك — سيرد الطبيب قريباً ✓', 'success');
    } catch (err) {
      console.error(err);
      showToast(D.consultError || 'تعذر إرسال الاستشارة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getName = (d) => (isRTL ? d.name : (d.nameEn || d.name));
  const getSpec = (d) => (isRTL ? d.specialty : (d.specialtyEn || d.specialty));
  const getBio = (d) => (isRTL ? d.bio : (d.bioEn || d.bio));
  const getSlot = (d) => (isRTL ? d.nextSlot : (d.nextSlotEn || d.nextSlot));
  const getConditions = (d) => (isRTL ? (d.conditions || []) : (d.conditionsEn || d.conditions || []));
  const getAvatar = (d) => d.avatar || d.photoURL;

  return (
    <div className="space-y-6 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] lg:rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-700 to-cyan-800 p-6 lg:p-10 text-white shadow-xl"
      >
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 lg:flex lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Stethoscope size={14} /> {D.badge || 'استشارة طبية'}
            </p>
            <h1 className="text-2xl lg:text-4xl font-black leading-tight mb-2">{D.title || 'اسأل طبيباً معتمداً'}</h1>
            <p className="text-emerald-100/90 text-sm lg:text-base font-medium max-w-lg">
              {D.subtitle || 'أطباء متخصصون لإرشادك عن أعراضك وعلاجك — ليس بديلاً عن الكشف الحضوري في الحالات الطارئة.'}
            </p>
            <p className="text-emerald-200/80 text-xs mt-2 font-bold">{D.sortNote || 'مرتبون حسب الشهرة والتقييم — الأطباء الأكثر طلباً في المقدمة'}</p>
          </div>
          <div className="hidden lg:grid grid-cols-3 gap-3 mt-4 lg:mt-0 shrink-0">
            {[
              { val: doctors.length, label: D.doctorsCount || 'أطباء' },
              { val: '24/7', label: D.support || 'دعم' },
              { val: '< 2h', label: D.response || 'رد' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-black">{s.val}</p>
                <p className="text-[11px] text-emerald-100 font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={D.searchPh || 'ابحث عن طبيب أو تخصص...'}
            className="w-full ps-11 pe-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 font-bold text-sm outline-none focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpecialty(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all ${
                specialty === s
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
              }`}
            >
              {D.specialties?.[s] || s}
            </button>
          ))}
        </div>
      </div>

      {loadingDoctors ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-teal-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-100 dark:border-white/5 p-5 lg:p-6 shadow-sm hover:shadow-xl hover:border-teal-200 dark:hover:border-teal-900/30 transition-all flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                {getAvatar(doc) ? (
                  <img src={getAvatar(doc)} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg">
                    {getName(doc).charAt(isRTL ? 2 : 3) || 'د'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">{getName(doc)}</h3>
                    {doc.verified && <ShieldCheck size={16} className="text-teal-500 shrink-0" />}
                    {!doc.isSeed && (
                      <span className="text-[9px] font-black bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 px-2 py-0.5 rounded-full">
                        {D.newDoctor || 'جديد'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-teal-600 font-bold mt-0.5">{getSpec(doc)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-slate-700 dark:text-white">{doc.rating ?? 5}</span>
                    <span className="text-[10px] text-slate-400">({doc.reviews ?? 0} {D.reviews || 'تقييم'})</span>
                    <span className="text-[10px] text-slate-400">· {doc.experience ?? 0} {D.years || 'سنة'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{getBio(doc)}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {getConditions(doc).slice(0, 3).map((c) => (
                  <span key={c} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg">{c}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">{D.consultFee || 'رسوم الاستشارة'}</p>
                  <p className="font-black text-teal-600">{doc.consultPrice} {currency}</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 justify-end"><Clock size={10} /> {getSlot(doc)}</p>
                  <span className={`text-[10px] font-black ${doc.available !== false ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {doc.available !== false ? (D.available || 'متاح') : (D.busy || 'محجوز')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoctor(doc)}
                disabled={doc.available === false}
                className="w-full mt-4 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <MessageCircle size={18} /> {D.askDoctor || 'اسأل الطبيب'}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!loadingDoctors && filtered.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Filter size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-black text-slate-500">{D.noDoctors || 'لا يوجد أطباء مطابقون'}</p>
        </div>
      )}

      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="relative w-full lg:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black text-teal-600 mb-1">{D.consultWith || 'استشارة مع'}</p>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{getName(selectedDoctor)}</h2>
                    <p className="text-sm text-slate-400 font-medium">{getSpec(selectedDoctor)}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedDoctor(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex gap-2">
                  {[
                    { id: 'chat', icon: MessageCircle, label: D.chat || 'محادثة' },
                    { id: 'video', icon: Video, label: D.video || 'فيديو' },
                    { id: 'phone', icon: Phone, label: D.phone || 'مكالمة' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setConsultType(type.id)}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-black transition-all ${
                        consultType === type.id ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <type.icon size={18} /> {type.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    {D.symptomsLabel || 'صف أعراضك أو استفسارك'}
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={5}
                    placeholder={D.symptomsPh || 'مثال: عندي صداع من 3 أيام مع حرارة 38 و...'}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-medium outline-none border-2 border-transparent focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  {D.emergencyNote || '⚠️ في حالات الطوارئ (ألم صدر، ضيق تنفس شديد) اتصل 123 فوراً — الاستشارة عن بُعد لا تغني عن الإسعاف.'}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={handleSubmitConsult}
                  disabled={submitting}
                  className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> {D.sendConsult || 'إرسال الاستشارة'}</>}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-3 font-bold">
                  {D.feeNote || 'الرسوم'}: {selectedDoctor.consultPrice} {currency}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
