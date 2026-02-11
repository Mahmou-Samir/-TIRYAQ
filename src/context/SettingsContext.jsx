import React, { createContext, useContext, useState, useEffect } from 'react';

// 👇 1. تم تعديل المسار ليقرأ من utils بدلاً من data
import { translations } from '../utils/translations';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // 2. قراءة الإعدادات المحفوظة (localStorage) عشان تفضل ثابتة بعد الريفريش
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  // تحديد نصوص الترجمة الحالية
  const t = translations[lang];

  // تأثير تغيير اللغة والاتجاه
  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang); // حفظ اللغة
  }, [lang]);

  // تأثير تغيير الثيم (Dark/Light)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme); // حفظ الثيم
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);