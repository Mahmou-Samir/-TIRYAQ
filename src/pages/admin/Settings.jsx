import React, { useState, useEffect } from 'react';
import { Shield, Bell, Smartphone, Lock, Moon, Globe, Save, Loader2, CheckCircle, Sun } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

// Firebase
import { db, auth } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Settings = () => {
  const { t, theme, toggleTheme, lang, toggleLang } = useSettings();
  
  // States
  const [preferences, setPreferences] = useState({
    twoFactor: true,
    autoPassChange: false,
    criticalAlerts: true,
    emailReports: true
  });

  const [loading, setLoading] = useState(true); // تحميل البيانات الأولية
  const [isSaving, setIsSaving] = useState(false); // حالة الحفظ
  const [showToast, setShowToast] = useState(false);

  // 1. 🟢 جلب إعدادات المستخدم من Firestore عند الفتح
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

  // 2. دالة التغيير (Toggle)
  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. 🟢 دالة الحفظ في Firestore
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      // تحديث حقل "settings" داخل وثيقة المستخدم
      await setDoc(doc(db, "users", user.uid), {
        settings: preferences
      }, { merge: true });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce-in z-50 border border-green-400">
          <CheckCircle size={20} />
          <span className="font-bold">{lang === 'ar' ? 'تم حفظ الإعدادات!' : 'Settings Saved!'}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.settingsTitle}</h1>
          <p className="text-gray-500">{t.settingsSubtitle}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
          {isSaving ? t.saving : t.saveChanges}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Security Settings */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="text-blue-600" /> {t.securityTitle}
          </h3>
          
          <div className="space-y-6">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">{t.twoFactor}</p>
                <p className="text-xs text-gray-500">{t.twoFactorDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer" 
                  checked={preferences.twoFactor} onChange={() => handleToggle('twoFactor')} 
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">{t.autoPass}</p>
                <p className="text-xs text-gray-500">{t.autoPassDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer" 
                  checked={preferences.autoPassChange} onChange={() => handleToggle('autoPassChange')} 
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
              <button className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:underline">
                <Lock size={16} /> {t.changePass}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Notification Settings */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="text-orange-500" /> {t.notificationsTitle}
          </h3>
          
          <div className="space-y-6">
            {/* Toggle 3 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">{t.criticalAlerts}</p>
                <p className="text-xs text-gray-500">{t.criticalAlertsDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer" 
                  checked={preferences.criticalAlerts} onChange={() => handleToggle('criticalAlerts')} 
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">{t.emailReports}</p>
                <p className="text-xs text-gray-500">{t.emailReportsDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer" 
                  checked={preferences.emailReports} onChange={() => handleToggle('emailReports')} 
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Appearance Settings */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Smartphone className="text-purple-500" /> {t.appearanceTitle}
          </h3>
          <div className="flex gap-4">
             <button onClick={toggleTheme} className="flex-1 p-6 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col items-center gap-3 group">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                  {theme === 'dark' ? <Moon size={24}/> : <Sun size={24}/>}
                </div>
                <div>
                  <span className="font-bold block text-gray-800 dark:text-white">{t.themeToggle}</span>
                  <span className="text-xs text-gray-400">{t.themeDesc}</span>
                </div>
             </button>

             <button onClick={toggleLang} className="flex-1 p-6 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col items-center gap-3 group">
                <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:scale-110 transition-transform">
                  <Globe size={24}/>
                </div>
                <div>
                  <span className="font-bold block text-gray-800 dark:text-white">{t.langToggle}</span>
                  <span className="text-xs text-gray-400">{t.langDesc}</span>
                </div>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;