import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, Camera, Loader2, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { auth, db, storage } from '../../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PharmacyProfile = () => {
  const { lang, t } = useSettings();
  const currentUser = auth.currentUser;

  // States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    license: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // 1. جلب البيانات من Firestore عند التحميل
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: currentUser.displayName || data.name || '',
            email: currentUser.email || '',
            phone: data.phone || '',
            address: data.address || '',
            license: data.license || 'N/A',
            photoURL: currentUser.photoURL || data.photoURL || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  // 2. معالجة تغيير الصورة ورفعها لـ Firebase Storage
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // تحديث الصورة في الـ Auth
      await updateProfile(currentUser, { photoURL: downloadURL });
      
      // تحديث الصورة في الـ State
      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
      
      // حفظ الرابط في Firestore
      await setDoc(doc(db, "users", currentUser.uid), { photoURL: downloadURL }, { merge: true });
      
      setMessage({ type: 'success', text: lang === 'ar' ? 'تم تحديث الصورة بنجاح' : 'Photo updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: lang === 'ar' ? 'فشل رفع الصورة' : 'Image upload failed' });
    } finally {
      setUploadingImage(false);
    }
  };

  // 3. حفظ التعديلات النصية
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // تحديث الاسم في Firebase Auth
      await updateProfile(currentUser, { displayName: formData.name });

      // تحديث البيانات في Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setMessage({ 
        type: 'success', 
        text: lang === 'ar' ? 'تم حفظ التحديثات بنجاح!' : 'Profile updated successfully!' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving profile' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-emerald-600 gap-4">
        <Loader2 size={40} className="animate-spin" />
        <p className="font-bold animate-pulse">{lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading profile...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 Notification Message */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10'}`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 Header Card */}
      <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600">
             <User size={28} />
          </div>
          {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2 relative z-10">
          {lang === 'ar' ? 'إدارة بيانات صيدليتك وتفاصيل الاتصال.' : 'Manage your pharmacy details and contact info.'}
        </p>
      </div>

      {/* 🟢 Main Content Card */}
      <div className="bg-white dark:bg-[#0b1121] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl p-6 md:p-10 relative overflow-hidden">
        
        {/* Cover & Avatar Logic */}
        <div className="relative mb-20">
          <div className="h-32 md:h-48 w-full rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 overflow-hidden relative">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          </div>

          {/* Profile Picture Upload */}
          <div className={`absolute -bottom-12 ${lang === 'ar' ? 'right-10' : 'left-10'} group`}>
            <div className="relative w-32 h-32 rounded-[2rem] bg-white dark:bg-slate-800 p-1.5 shadow-2xl border border-slate-100 dark:border-slate-700">
               <div className="w-full h-full rounded-[1.6rem] bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center relative">
                  {uploadingImage ? (
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                  ) : formData.photoURL ? (
                    <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-emerald-600 uppercase">{formData.name.charAt(0)}</span>
                  )}
                  
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer backdrop-blur-[2px]">
                    <Camera size={24} />
                    <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">{lang === 'ar' ? 'تغيير' : 'Change'}</span>
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </label>
               </div>
               {/* Verified Badge */}
               <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white dark:border-slate-800 shadow-lg">
                  <ShieldCheck size={16} strokeWidth={3} />
               </div>
            </div>
          </div>
        </div>

        {/* 🟢 Profile Form */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Name Field */}
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User size={16} className="text-emerald-500" /> {lang === 'ar' ? 'اسم الصيدلية / المسؤول' : 'Pharmacy / Admin Name'}
            </label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold transition-all" 
              placeholder={lang === 'ar' ? 'أدخل الاسم...' : 'Enter name...'}
              required 
            />
          </div>

          {/* Email Field (Disabled) */}
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Mail size={16} className="text-emerald-500" /> {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative group">
               <input 
                 type="email" 
                 value={formData.email} 
                 disabled 
                 className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-800/50 rounded-2xl py-4 px-5 text-slate-400 font-bold cursor-not-allowed" 
               />
               <div className="absolute inset-y-0 right-4 flex items-center">
                  <div className="bg-slate-200 dark:bg-slate-700 text-[10px] font-black px-2 py-1 rounded-md text-slate-500">READ ONLY</div>
               </div>
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Phone size={16} className="text-emerald-500" /> {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold transition-all" 
              placeholder="01xxxxxxxxx"
            />
          </div>

          {/* License Field (Locked) */}
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> {lang === 'ar' ? 'رقم الترخيص' : 'License Number'}
            </label>
            <input 
              type="text" 
              value={formData.license} 
              disabled 
              className="w-full bg-emerald-50/30 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/20 rounded-2xl py-4 px-5 text-emerald-700 dark:text-emerald-400 font-black tracking-widest opacity-80 cursor-not-allowed" 
            />
          </div>

          {/* Address Field */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" /> {lang === 'ar' ? 'العنوان الجغرافي' : 'Store Address'}
            </label>
            <textarea 
              rows="3" 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold transition-all resize-none"
              placeholder={lang === 'ar' ? 'مثال: شارع جامعة الدول، المهندسين...' : 'e.g. 123 Cairo St...'}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end mt-4 border-t border-slate-100 dark:border-white/5 pt-8">
            <button 
              type="submit" 
              disabled={isSaving} 
              className="group relative bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-3 overflow-hidden disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{lang === 'ar' ? 'جاري الحفظ...' : 'Saving Changes...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} className="group-hover:scale-125 transition-transform" />
                  <span>{lang === 'ar' ? 'حفظ التحديثات' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default PharmacyProfile;