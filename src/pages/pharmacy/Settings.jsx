import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Lock, CheckCircle2, Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { auth } from '../../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

const PharmacySettings = () => {
  const { lang, changeLanguage, theme, toggleTheme, t } = useSettings();
  
  // States
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [passwordStatus, setPasswordStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  // 1. دالة إرسال رابط تغيير كلمة المرور
  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setPasswordStatus('loading');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordStatus('success');
      // إعادة الزر لحالته الطبيعية بعد 3 ثوانٍ
      setTimeout(() => setPasswordStatus('idle'), 3000);
    } catch (error) {
      console.error("Error sending reset email:", error);
      setPasswordStatus('error');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    }
  };

  // مكون فرعي لصفوف الإعدادات (لتنظيف الكود)
  const SettingRow = ({ icon: Icon, title, desc, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-colors group gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-500 group-hover:text-emerald-500 shadow-sm transition-colors shrink-0">
          <Icon size={22} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-base">{title}</h4>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-sm">{desc}</p>
        </div>
      </div>
      <div className="flex-shrink-0 sm:self-center self-end">{action}</div>
    </div>
  );

  // إعدادات الحركة (Animation Variants)
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show" 
      className="max-w-4xl mx-auto space-y-8 pb-10" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* 🟢 Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600">
             <SettingsIcon size={28} />
          </div>
          {t?.settings || (lang === 'ar' ? 'إعدادات النظام' : 'System Settings')}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2 relative z-10">
          {lang === 'ar' ? 'تخصيص الواجهة، التنبيهات، وحماية الحساب.' : 'Customize interface, alerts, and account security.'}
        </p>
      </motion.div>

      {/* 🟢 Content */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#0b1121] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl p-6 md:p-8 relative z-10 space-y-6">
        
        {/* قسم التفضيلات */}
        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2 px-2">{lang === 'ar' ? 'تفضيلات العرض' : 'Display Preferences'}</h3>
        
        <SettingRow 
          icon={theme === 'dark' ? Moon : Sun}
          title={lang === 'ar' ? 'المظهر (Theme)' : 'Theme'}
          desc={lang === 'ar' ? 'التبديل بين الوضع الليلي لراحة العين والوضع النهاري' : 'Toggle between dark mode for eye comfort and light mode'}
          action={
            <button 
              onClick={toggleTheme} 
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors flex items-center gap-2 outline-none active:scale-95"
            >
              {theme === 'dark' ? (lang === 'ar' ? 'تفعيل النهاري' : 'Light Mode') : (lang === 'ar' ? 'تفعيل الليلي' : 'Dark Mode')}
            </button>
          }
        />

        <SettingRow 
          icon={Globe}
          title={lang === 'ar' ? 'لغة النظام' : 'System Language'}
          desc={lang === 'ar' ? 'تغيير لغة العرض الحالية للواجهة بالكامل' : 'Change the current display language for the entire interface'}
          action={
            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1.5 border border-slate-300 dark:border-slate-700">
              <button 
                onClick={() => changeLanguage('ar')} 
                className={`px-5 py-2 rounded-lg font-black text-sm transition-all outline-none ${lang === 'ar' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 scale-95'}`}
              >
                عربي
              </button>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`px-5 py-2 rounded-lg font-black text-sm transition-all outline-none ${lang === 'en' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 scale-95'}`}
              >
                English
              </button>
            </div>
          }
        />

        <div className="h-px bg-slate-100 dark:bg-slate-800/50 my-8 mx-2"></div>
        
        {/* قسم الأمان والإشعارات */}
        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2 px-2">{lang === 'ar' ? 'الإشعارات والأمان' : 'Notifications & Security'}</h3>

        <SettingRow 
          icon={Bell}
          title={lang === 'ar' ? 'إشعارات الطلبات' : 'Order Notifications'}
          desc={lang === 'ar' ? 'استقبال تنبيه صوتي ومرئي عند وصول طلب جديد' : 'Receive audio and visual alerts on new orders'}
          action={
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 outline-none ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'} ${lang === 'ar' ? (notificationsEnabled ? 'justify-start' : 'justify-end') : (notificationsEnabled ? 'justify-end' : 'justify-start')}`}
            >
              <motion.div 
                layout 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
          }
        />

        <SettingRow 
          icon={Lock}
          title={lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          desc={lang === 'ar' ? 'سيتم إرسال رابط آمن لبريدك الإلكتروني لإعادة التعيين' : 'A secure link will be sent to your email to reset it'}
          action={
            <button 
              onClick={handlePasswordReset}
              disabled={passwordStatus !== 'idle'}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 outline-none border ${
                passwordStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10' :
                passwordStatus === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10' :
                'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95'
              }`}
            >
              {passwordStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
              {passwordStatus === 'success' && <MailCheck size={16} />}
              {passwordStatus === 'error' && <AlertTriangle size={16} />}
              {passwordStatus === 'idle' && (lang === 'ar' ? 'إرسال الرابط' : 'Send Link')}
              
              {passwordStatus === 'success' && (lang === 'ar' ? 'تم الإرسال!' : 'Sent!')}
              {passwordStatus === 'error' && (lang === 'ar' ? 'حدث خطأ' : 'Error')}
            </button>
          }
        />

      </motion.div>
    </motion.div>
  );
};

export default PharmacySettings;