import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const PharmacySettings = () => {
  const { lang, changeLanguage, theme, toggleTheme } = useSettings();

  const SettingRow = ({ icon: Icon, title, desc, action }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-500 group-hover:text-emerald-500 shadow-sm transition-colors">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 Header */}
      <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 relative z-10">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600">
             <SettingsIcon size={28} />
          </div>
          {lang === 'ar' ? 'إعدادات النظام' : 'System Settings'}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2 relative z-10">
          {lang === 'ar' ? 'تخصيص الواجهة، التنبيهات، والأمان.' : 'Customize interface, alerts, and security.'}
        </p>
      </div>

      {/* 🟢 Content */}
      <div className="bg-white dark:bg-[#0b1121] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl p-6 md:p-8 relative z-10 space-y-6">
        
        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">{lang === 'ar' ? 'تفضيلات العرض' : 'Display Preferences'}</h3>
        
        <SettingRow 
          icon={theme === 'dark' ? Moon : Sun}
          title={lang === 'ar' ? 'المظهر (Theme)' : 'Theme'}
          desc={lang === 'ar' ? 'تبديل بين الوضع الليلي والنهاري' : 'Toggle dark/light mode'}
          action={
            <button onClick={toggleTheme} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-bold text-sm hover:bg-emerald-500 hover:text-white transition-colors">
              {theme === 'dark' ? (lang === 'ar' ? 'تفعيل النهاري' : 'Light Mode') : (lang === 'ar' ? 'تفعيل الليلي' : 'Dark Mode')}
            </button>
          }
        />

        <SettingRow 
          icon={Globe}
          title={lang === 'ar' ? 'لغة النظام' : 'System Language'}
          desc={lang === 'ar' ? 'تغيير لغة العرض الحالية' : 'Change current display language'}
          action={
            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
              <button onClick={() => changeLanguage('ar')} className={`px-4 py-1.5 rounded-md font-bold text-sm transition-colors ${lang === 'ar' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>عربي</button>
              <button onClick={() => changeLanguage('en')} className={`px-4 py-1.5 rounded-md font-bold text-sm transition-colors ${lang === 'en' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>English</button>
            </div>
          }
        />

        <div className="h-px bg-slate-100 dark:bg-slate-800/50 my-6"></div>
        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">{lang === 'ar' ? 'الإشعارات والأمان' : 'Notifications & Security'}</h3>

        <SettingRow 
          icon={Bell}
          title={lang === 'ar' ? 'إشعارات الطلبات' : 'Order Notifications'}
          desc={lang === 'ar' ? 'استقبال تنبيه صوتي عند وصول طلب جديد' : 'Play sound on new order'}
          action={
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${lang === 'ar' ? 'left-1' : 'right-1'}`}></div>
            </div>
          }
        />

        <SettingRow 
          icon={Lock}
          title={lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          desc={lang === 'ar' ? 'تحديث كلمة المرور لحماية حسابك' : 'Update your password for security'}
          action={
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {lang === 'ar' ? 'تعديل' : 'Edit'}
            </button>
          }
        />

      </div>
    </div>
  );
};

export default PharmacySettings;