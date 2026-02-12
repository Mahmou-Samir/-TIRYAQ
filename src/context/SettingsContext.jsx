import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  
  // 1. تحديد الثيم المبدئي (نحترم إعدادات جهاز المستخدم لو مفيش حاجة محفوظة)
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // لو مفيش، نشوف إعدادات الجهاز
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar');

  // التأكد من وجود الترجمة لتجنب الانهيار
  const t = translations[lang] || translations['ar'];

  // 2. تأثير تغيير اللغة + تغيير الخط
  useEffect(() => {
    const root = document.documentElement;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.lang = lang;
    
    // تغيير الخط ديناميكياً (تجميلية قوية جداً)
    if (lang === 'ar') {
      document.body.style.fontFamily = "'Cairo', sans-serif"; // تأكد إنك مستدعي الخط في index.html
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
    }

    localStorage.setItem('lang', lang);
  }, [lang]);

  // 3. تأثير تغيير الثيم
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
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