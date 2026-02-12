import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Mail, Phone, MapPin, Building, Save, User, 
  Loader2, CheckCircle, Briefcase, AlertCircle 
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

// Firebase
import { db, storage, auth } from '../../firebase/config'; 
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const { t, lang } = useSettings(); // 👈 استدعاء إعدادات اللغة
  
  // States
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    company: '',
    location: '',
    bio: ''
  });
  
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const fileInputRef = useRef(null);

  // 1. جلب البيانات
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let data = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || null
        };

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            data = { ...data, ...firestoreData };
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        setUserData({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role || (lang === 'ar' ? 'مسؤول النظام' : 'System Admin'),
          company: data.company || '',
          location: data.location || '',
          bio: data.bio || ''
        });
        setAvatar(data.photoURL);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lang]);

  // 2. معاينة الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAvatar(tempUrl);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // 3. التحقق من الهاتف
  const validatePhone = (phone) => {
    const egyptianPhoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    return egyptianPhoneRegex.test(phone);
  };

  // 4. الحفظ
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    if (userData.phone && !validatePhone(userData.phone)) {
      alert(lang === 'ar' 
        ? "⚠️ رقم الهاتف غير صحيح. يجب أن يكون رقم مصري مكون من 11 رقم." 
        : "⚠️ Invalid phone number. Must be a valid Egyptian number.");
      return;
    }

    setIsSaving(true);

    try {
      let photoURL = user.photoURL;

      if (fileInputRef.current?.files[0]) {
        const file = fileInputRef.current.files[0];
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName: userData.name,
        photoURL: photoURL
      });

      await setDoc(doc(db, "users", user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        // role: userData.role, // لا نحدث الدور للحماية
        company: userData.company,
        location: userData.location,
        bio: userData.bio,
        photoURL: photoURL, 
        updatedAt: new Date()
      }, { merge: true });

      setAvatar(photoURL);
      
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error("Error saving profile:", error);
      alert(t.error);
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce-in z-50 border border-green-400">
          <CheckCircle size={20} />
          <span className="font-bold">{lang === 'ar' ? 'تم حفظ التغييرات بنجاح!' : 'Profile saved successfully!'}</span>
        </div>
      )}

      {/* Cover & Header */}
      <div className="relative h-56 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden shadow-lg group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className={`absolute bottom-6 ${lang === 'ar' ? 'right-8' : 'left-8'} text-white z-10`}>
          <h1 className="text-3xl font-bold mb-1">{t.profile}</h1>
          <p className="opacity-90 text-blue-100 flex items-center gap-2">
            <User size={16}/> {lang === 'ar' ? 'إدارة بيانات حساب المسؤول' : 'Manage Admin Account'}
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="relative -mt-20 px-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="relative group mx-auto lg:mx-0">
              <div className="w-36 h-36 rounded-full border-[6px] border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-4xl shadow-lg overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-gray-400">{userData.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              
              <button 
                onClick={() => fileInputRef.current.click()} 
                className={`absolute bottom-2 ${lang === 'ar' ? 'right-2' : 'left-2'} bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 border-4 border-white dark:border-slate-800 cursor-pointer`}
              >
                <Camera size={18} />
              </button>
            </div>

            {/* User Info Header */}
            <div className={`pt-4 flex-1 text-center ${lang === 'ar' ? 'lg:text-right' : 'lg:text-left'}`}>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{userData.name || (lang === 'ar' ? 'مستخدم جديد' : 'New User')}</h2>
              <div className={`flex flex-wrap gap-3 justify-center ${lang === 'ar' ? 'lg:justify-start' : 'lg:justify-start'} text-sm text-gray-500 dark:text-gray-400 mb-6`}>
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full"><Briefcase size={14}/> {userData.role}</span>
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full"><MapPin size={14}/> {userData.location || (lang === 'ar' ? 'غير محدد' : 'N/A')}</span>
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full"><Building size={14}/> {userData.company || (lang === 'ar' ? 'ترياق' : 'Tiryaq')}</span>
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95 w-full lg:w-auto justify-center">
              {isSaving ? <Loader2 size={20} className="animate-spin"/> : <Save size={20} />}
              {isSaving ? t.saving : t.saveChanges}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 border-t border-gray-100 dark:border-slate-700 pt-10">
            
            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <User className="text-blue-500"/> {t.personalInfo}
              </h3>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <input type="text" name="name" value={userData.name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3.5 text-gray-400`} size={18} />
                  <input type="email" value={userData.email} disabled className={`w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 ${lang === 'ar' ? 'pl-10' : 'pr-10'} text-gray-500 cursor-not-allowed text-left dir-ltr`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  <span className="text-xs font-normal text-gray-400 mx-2">
                    {lang === 'ar' ? '(يجب أن يبدأ بـ 010, 011...)' : '(Must start with +20 or 01...)'}
                  </span>
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={userData.phone} 
                  onChange={handleChange} 
                  placeholder="01xxxxxxxxx"
                  className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all text-left dir-ltr ${
                    userData.phone && !validatePhone(userData.phone) 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'
                  }`} 
                />
                {userData.phone && !validatePhone(userData.phone) && (
                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                     <AlertCircle size={12}/> {lang === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number'}
                   </p>
                )}
              </div>
            </div>

            {/* Work Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Briefcase className="text-purple-500"/> {t.workInfo}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                    {lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={userData.role} 
                      disabled 
                      className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" 
                    />
                    <LockIcon className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3.5 text-gray-400`} size={16}/>
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                     {lang === 'ar' ? 'الشركة / الجهة' : 'Company'}
                   </label>
                   <input type="text" name="company" value={userData.company} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === 'ar' ? 'العنوان / الموقع' : 'Location / Address'}
                </label>
                <input type="text" name="location" value={userData.location} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === 'ar' ? 'نبذة تعريفية (Bio)' : 'Bio'}
                </label>
                <textarea 
                  rows="3" 
                  name="bio" 
                  value={userData.bio} 
                  onChange={handleChange} 
                  placeholder={lang === 'ar' ? "اكتب نبذة مختصرة عن دورك الوظيفي..." : "Write a brief description of your role..."}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// أيقونة قفل صغيرة للمسمى الوظيفي
const LockIcon = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export default Profile;