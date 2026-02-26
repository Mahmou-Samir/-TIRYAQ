import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { lang } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // 1. 🟢 إغلاق السايدبار تلقائياً عند تغيير الصفحة (في الموبايل)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    // الاعتماد على ألوان النظام الأساسية (F8FAFC / 020617)
    <div 
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 font-sans flex overflow-hidden selection:bg-blue-500/30" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* 2. 🟢 Premium Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. 🟢 السايدبار المتجاوب (بفيزياء حركة ناعمة جداً) */}
      <aside 
        className={`
          fixed top-0 bottom-0 z-50 w-[280px] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-3xl
          transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          border-slate-200/50 dark:border-white/5
          ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} 
          ${isSidebarOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.2)]' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}
          lg:translate-x-0 lg:shadow-none
        `}
      >
        <Sidebar />
      </aside>

      {/* 4. 🟢 منطقة المحتوى */}
      <main 
        className={`
          flex-1 flex flex-col min-h-screen h-screen overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${lang === 'ar' ? 'lg:mr-[280px]' : 'lg:ml-[280px]'}
        `}
      >
        {/* نمرر دالة الفتح للهيدر عشان زرار المنيو يشتغل */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* مساحة المحتوى مع تأثيرات الانتقال بين الصفحات */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // المفتاح السحري اللي بيخلي الأنيميشن يشتغل مع كل تغيير للرابط
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, type: "spring", bounce: 0 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

    </div>
  );
};

export default Layout;