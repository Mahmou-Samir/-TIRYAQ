import React, { useState, useEffect } from 'react';
import { 
  Shield, Bell, Smartphone, Lock, Moon, Globe, 
  Save, Loader2, CheckCircle2, Sun, Settings as SettingsIcon 
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { db, auth } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// --- Premium Toggle Component ---
const PremiumToggle = ({ isActive, onToggle, activeColor = "bg-blue-600" }) => (
  <motion.div 
    className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? activeColor : 'bg-slate-200 dark:bg-slate-700'}`}
    onClick={onToggle}
    style={{ justifyContent: isActive ? 'flex-end' : 'flex-start' }}
    whileTap={{ scale: 0.9 }}
  >
    <motion.div 
      layout 
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="w-6 h-6 bg-white rounded-full shadow-md"
    />
  </motion.div>
);

// --- Main Component ---
const Settings = () => {
  const { t, theme, toggleTheme, lang, toggleLang } = useSettings();
  
  // States
  const [preferences, setPreferences] = useState({
    twoFactor: true,
    autoPassChange: false,
    criticalAlerts: true,
    emailReports: true
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 1. Fetch Settings
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().settings) {
            setPreferences(docSnap.data().settings);
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 2. Save Settings
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { settings: preferences }, { merge: true });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(t.error || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-slate-400 tracking-widest uppercase animate-pulse">جاري تحميل الإعدادات...</p>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12 pt-6 px-4 md:px-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🔮 Ultra Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 w-[90%] max-w-xs bg-green-600/90 backdrop-blur-xl border border-green-500/50 text-white"
          >
            <CheckCircle2 size={20} className="text-green-200" />
            <span className="text-xs font-black">{lang === 'ar' ? 'تم حفظ التفضيلات بنجاح!' : 'Preferences Saved Successfully!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tighter">
            <SettingsIcon className="text-blue-600" size={36} />
            {t.settingsTitle || 'إعدادات النظام'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            {t.settingsSubtitle || 'تحكم في أمان حسابك، الإشعارات، وتفضيلات واجهة المستخدم.'}
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
          {isSaving ? (t.saving || 'جاري الحفظ...') : (t.saveChanges || 'حفظ التعديلات')}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 🟢 1. Security Settings */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600"><Shield size={20} /></div>
            {t.securityTitle || 'الأمان والخصوصية'}
          </h3>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-slate-800 dark:text-white text-sm">{t.twoFactor || 'المصادقة الثنائية (2FA)'}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[250px] leading-relaxed">{t.twoFactorDesc || 'تأمين الحساب برمز إضافي يتم إرساله لهاتفك عند تسجيل الدخول.'}</p>
              </div>
              <PremiumToggle isActive={preferences.twoFactor} onToggle={() => handleToggle('twoFactor')} activeColor="bg-blue-600" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-slate-800 dark:text-white text-sm">{t.autoPass || 'التغيير التلقائي لكلمة المرور'}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[250px] leading-relaxed">{t.autoPassDesc || 'طلب تغيير كلمة المرور إجبارياً كل 90 يوم لضمان الأمان.'}</p>
              </div>
              <PremiumToggle isActive={preferences.autoPassChange} onToggle={() => handleToggle('autoPassChange')} activeColor="bg-blue-600" />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Lock size={16} /> {t.changePass || 'تغيير كلمة المرور الآن'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🟢 2. Notification Settings */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>

          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-500"><Bell size={20} /></div>
            {t.notificationsTitle || 'إدارة التنبيهات'}
          </h3>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-slate-800 dark:text-white text-sm">{t.criticalAlerts || 'إشعارات النواقص الحرجة'}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[250px] leading-relaxed">{t.criticalAlertsDesc || 'استلام تنبيه فوري عندما يقل رصيد أي صنف عن مستوى الخطر.'}</p>
              </div>
              <PremiumToggle isActive={preferences.criticalAlerts} onToggle={() => handleToggle('criticalAlerts')} activeColor="bg-orange-500" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-slate-800 dark:text-white text-sm">{t.emailReports || 'تقارير البريد الإلكتروني'}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[250px] leading-relaxed">{t.emailReportsDesc || 'إرسال ملخص أسبوعي لحركة المخزون إلى بريدك الإلكتروني.'}</p>
              </div>
              <PremiumToggle isActive={preferences.emailReports} onToggle={() => handleToggle('emailReports')} activeColor="bg-orange-500" />
            </div>
          </div>
        </motion.div>

        {/* 🟢 3. Appearance & Locale Settings */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600"><Smartphone size={20} /></div>
            {t.appearanceTitle || 'مظهر التطبيق واللغة'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Card */}
            <motion.button 
              whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={toggleTheme} 
              className="p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col items-start gap-4 group text-right"
            >
              <div className="flex justify-between items-center w-full">
                <div className="p-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 rounded-2xl text-purple-600 group-hover:rotate-12 transition-transform">
                  {theme === 'dark' ? <Moon size={28}/> : <Sun size={28}/>}
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </div>
              </div>
              <div>
                <span className="font-black block text-slate-800 dark:text-white text-lg mb-1">{t.themeToggle || 'تبديل المظهر'}</span>
                <span className="text-xs text-slate-500 font-medium">{t.themeDesc || 'انقر للتبديل بين الوضع المظلم والفاتح.'}</span>
              </div>
            </motion.button>

            {/* Language Card */}
            <motion.button 
              whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={toggleLang} 
              className="p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col items-start gap-4 group text-right"
            >
              <div className="flex justify-between items-center w-full">
                <div className="p-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 rounded-2xl text-green-600 group-hover:rotate-12 transition-transform">
                  <Globe size={28}/>
                </div>
                <div className="px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {lang === 'ar' ? 'العربية' : 'English'}
                </div>
              </div>
              <div>
                <span className="font-black block text-slate-800 dark:text-white text-lg mb-1">{t.langToggle || 'لغة النظام'}</span>
                <span className="text-xs text-slate-500 font-medium">{t.langDesc || 'انقر للتبديل بين اللغتين (Arabic / English).'}</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Settings;