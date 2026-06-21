import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, FileText, Stethoscope, Camera,
  Loader2, ShieldCheck, Star, Clock, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useDoctor } from '../../context/DoctorContext';
import { auth, db, storage } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { saveDoctorProfile } from '../../utils/doctorService';
import { DOCTOR_SPECIALTY_OPTIONS } from '../../components/patient/doctorConstants';

const GOVERNORATES = [
  'القاهرة', 'الإسكندرية', 'الجيزة', 'القليوبية', 'الدقهلية', 'الشرقية',
  'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'بني سويف', 'الفيوم', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
];

export default function DoctorProfile() {
  const { lang, t } = useSettings();
  const { profile, showToast } = useDoctor();
  const P = t?.doctor?.profile ?? {};
  const isRTL = lang === 'ar';
  const currentUser = auth.currentUser;

  const [form, setForm] = useState({
    name: '',
    nameEn: '',
    email: '',
    phone: '',
    licenseNumber: '',
    governorate: 'القاهرة',
    specialtyKey: 'باطنة',
    specialty: 'طب باطنة',
    specialtyEn: 'Internal Medicine',
    experience: 1,
    consultPrice: 150,
    bio: '',
    bioEn: '',
    conditions: '',
    conditionsEn: '',
    available: true,
    nextSlot: 'اليوم',
    nextSlotEn: 'Today',
    photoURL: '',
    verified: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        const p = profile || {};
        setForm({
          name: p.name || currentUser.displayName || userData.name || '',
          nameEn: p.nameEn || '',
          email: currentUser.email || '',
          phone: p.phone || userData.phone || '',
          licenseNumber: p.licenseNumber || userData.licenseNumber || '',
          governorate: p.governorate || userData.governorate || 'القاهرة',
          specialtyKey: DOCTOR_SPECIALTY_OPTIONS.find((o) => o.specialty === p.specialty)?.key || 'باطنة',
          specialty: p.specialty || 'طب باطنة',
          specialtyEn: p.specialtyEn || 'Internal Medicine',
          experience: p.experience ?? 1,
          consultPrice: p.consultPrice ?? 150,
          bio: p.bio || '',
          bioEn: p.bioEn || '',
          conditions: (p.conditions || []).join(', '),
          conditionsEn: (p.conditionsEn || []).join(', '),
          available: p.available !== false,
          nextSlot: p.nextSlot || 'اليوم',
          nextSlotEn: p.nextSlotEn || 'Today',
          photoURL: p.photoURL || currentUser.photoURL || userData.photoURL || '',
          verified: p.verified ?? false,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'specialtyKey') {
      const opt = DOCTOR_SPECIALTY_OPTIONS.find((o) => o.key === value);
      if (opt) {
        setForm((f) => ({ ...f, specialtyKey: value, specialty: opt.specialty, specialtyEn: opt.specialtyEn }));
        return;
      }
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `doctor-profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(currentUser, { photoURL: url });
      setForm((f) => ({ ...f, photoURL: url }));
      showToast(P.photoUpdated || 'تم تحديث الصورة', 'success');
    } catch {
      showToast(P.photoError || 'فشل رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.bio.trim()) {
      showToast(P.fillRequired || 'الاسم والنبذة مطلوبان', 'warning');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(currentUser, { displayName: form.name });
      const rating = profile?.reviews > 0 ? (profile?.rating ?? 5) : 5;
      const reviews = profile?.reviews ?? 0;
      await saveDoctorProfile(currentUser.uid, {
        name: form.name.trim(),
        nameEn: form.nameEn.trim() || form.name.trim(),
        phone: form.phone,
        email: form.email,
        licenseNumber: form.licenseNumber,
        governorate: form.governorate,
        specialty: form.specialty,
        specialtyEn: form.specialtyEn,
        experience: Number(form.experience) || 1,
        consultPrice: Number(form.consultPrice) || 150,
        bio: form.bio.trim(),
        bioEn: form.bioEn.trim() || form.bio.trim(),
        conditions: form.conditions.split(',').map((s) => s.trim()).filter(Boolean),
        conditionsEn: form.conditionsEn.split(',').map((s) => s.trim()).filter(Boolean),
        available: form.available,
        nextSlot: form.nextSlot,
        nextSlotEn: form.nextSlotEn,
        photoURL: form.photoURL,
        avatar: form.photoURL,
        verified: form.verified,
        rating,
        reviews,
        createdAt: profile?.createdAt,
      });
      showToast(P.saved || 'تم نشر ملفك — سيظهر للمرضى مرتباً حسب الشهرة ✓', 'success');
    } catch (err) {
      console.error(err);
      showToast(P.saveError || 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-white/5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-black overflow-hidden shadow-xl">
              {form.photoURL ? (
                <img src={form.photoURL} alt="" className="w-full h-full object-cover" />
              ) : form.name.charAt(isRTL ? 2 : 0) || 'د'}
            </div>
            <label className="absolute -bottom-2 -end-2 p-2 bg-teal-600 text-white rounded-xl cursor-pointer shadow-lg hover:bg-teal-700">
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div className="text-center sm:text-start flex-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{P.title || 'الملف الطبي العام'}</h2>
            <p className="text-sm text-slate-400 mt-1">{P.subtitle || 'هذا الملف يظهر للمرضى في «اسأل طبيب»'}</p>
            {profile?.published && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-black text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full">
                <ShieldCheck size={12} /> {P.published || 'منشور للمرضى'}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field icon={User} label={P.nameAr || 'الاسم (عربي)'} name="name" value={form.name} onChange={handleChange} required />
            <Field icon={User} label={P.nameEn || 'الاسم (English)'} name="nameEn" value={form.nameEn} onChange={handleChange} dir="ltr" />
            <Field icon={Mail} label={P.email || 'البريد'} name="email" value={form.email} onChange={handleChange} readOnly />
            <Field icon={Phone} label={P.phone || 'الهاتف'} name="phone" value={form.phone} onChange={handleChange} />
            <Field icon={FileText} label={P.license || 'رقم الترخيص'} name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{P.governorate || 'المحافظة'}</label>
              <select name="governorate" value={form.governorate} onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:border-teal-500">
                {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{P.specialty || 'التخصص'}</label>
              <select name="specialtyKey" value={form.specialtyKey} onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 px-4 font-bold text-sm outline-none focus:border-teal-500">
                {DOCTOR_SPECIALTY_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{isRTL ? o.specialty : o.specialtyEn}</option>
                ))}
              </select>
            </div>
            <Field icon={Stethoscope} label={P.experience || 'سنوات الخبرة'} name="experience" type="number" min={1} value={form.experience} onChange={handleChange} />
            <Field icon={Star} label={P.consultPrice || 'رسوم الاستشارة (ج.م)'} name="consultPrice" type="number" min={50} value={form.consultPrice} onChange={handleChange} />
            <Field icon={Clock} label={P.nextSlot || 'أقرب موعد (عربي)'} name="nextSlot" value={form.nextSlot} onChange={handleChange} />
            <Field icon={Clock} label={P.nextSlotEn || 'Next slot (EN)'} name="nextSlotEn" value={form.nextSlotEn} onChange={handleChange} dir="ltr" />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{P.bio || 'نبذة (عربي)'}</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl p-4 font-medium text-sm outline-none focus:border-teal-500 resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{P.bioEn || 'Bio (English)'}</label>
            <textarea name="bioEn" value={form.bioEn} onChange={handleChange} rows={3} dir="ltr"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl p-4 font-medium text-sm outline-none focus:border-teal-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={P.conditions || 'حالات يعالجها (فاصلة)'} name="conditions" value={form.conditions} onChange={handleChange} placeholder="سكر، ضغط،..." />
            <Field label={P.conditionsEn || 'Conditions (comma)'} name="conditionsEn" value={form.conditionsEn} onChange={handleChange} dir="ltr" placeholder="Diabetes, ..." />
          </div>

          <button type="button" onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5">
            {form.available ? <ToggleRight className="text-teal-600" size={28} /> : <ToggleLeft className="text-slate-400" size={28} />}
            <div className="text-start">
              <p className="font-black text-sm text-slate-900 dark:text-white">{P.available || 'متاح للاستشارات'}</p>
              <p className="text-xs text-slate-400">{form.available ? (P.availableOn || 'المرضى يمكنهم إرسال استشارة') : (P.availableOff || 'غير متاح مؤقتاً')}</p>
            </div>
          </button>

          <button type="submit" disabled={saving}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-60">
            {saving ? <Loader2 size={20} className="animate-spin" /> : (P.publish || 'حفظ ونشر الملف')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, name, value, onChange, type = 'text', required, readOnly, dir, placeholder, min }) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          dir={dir}
          min={min}
          placeholder={placeholder}
          className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 ${Icon ? 'ps-11' : 'px-4'} pe-4 font-bold text-sm outline-none focus:border-teal-500 ${readOnly ? 'opacity-60' : ''}`}
        />
      </div>
    </div>
  );
}
