import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations'; // ✅ تأكد أنك أنشأت ملف الترجمات

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // 1. تهيئة الحالة (نحاول قراءة القيم المحفوظة أولاً)
  const [lang, setLang] = useState(localStorage.getItem('app-lang') || 'ar');
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  // 2. استخراج كائن الترجمة بناءً على اللغة الحالية
  // إذا كانت اللغة 'ar' سيجلب نصوص العربي، وإلا الإنجليزي
  const t = translations[lang] || translations['ar']; 

  // 3. دالة تغيير اللغة
  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  // 4. دالة تغيير المظهر (Theme)
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  // 5. تأثيرات جانبية (تطبيق التغييرات على الصفحة فعلياً)
  
  // أ) عند تغيير اللغة: نغير اتجاه الصفحة (RTL/LTR)
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // ب) عند تغيير المظهر: نضيف أو نزيل كلاس 'dark'
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // القيم التي سيتم تمريرها لكل التطبيق
  const value = {
    lang,
    changeLanguage, // الدالة التي يستدعيها الزر
    theme,
    toggleTheme,
    t // كائن النصوص المترجمة لاستخدامه في الصفحات
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook مخصص لسهولة الاستخدام
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};