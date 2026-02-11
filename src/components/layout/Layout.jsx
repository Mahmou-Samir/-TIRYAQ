import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSettings } from '../../context/SettingsContext';

const Layout = () => {
  const { lang } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // 1. 🟢 إغلاق السايدبار تلقائياً عند تغيير الصفحة (في الموبايل)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans flex overflow-hidden relative`}>
      
      {/* 2. 🟢 Overlay: خلفية سوداء تظهر في الموبايل لما السايدبار يفتح */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        ></div>
      )}

      {/* 3. 🟢 السايدبار المتجاوب */}
      <aside 
        className={`
          fixed top-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${lang === 'ar' ? 'right-0' : 'left-0'} 
          ${/* في الشاشات الكبيرة (lg) دايما ظاهر، في الموبايل حسب الـ State */ ''}
          ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}
          lg:translate-x-0
        `}
      >
        <Sidebar />
      </aside>

      {/* 4. 🟢 منطقة المحتوى */}
      <main 
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300
          ${/* الهامش موجود بس في الشاشات الكبيرة */ ''}
          ${lang === 'ar' ? 'lg:mr-72' : 'lg:ml-72'}
        `}
      >
        {/* نمرر دالة الفتح للهيدر عشان زرار المنيو يشتغل */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* مساحة المحتوى */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default Layout;