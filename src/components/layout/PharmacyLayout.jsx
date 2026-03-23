import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

// ✅ استيراد المكونات الفرعية
import PharmacySidebar from './PharmacySidebar';
import PharmacyHeader from './PharmacyHeader'; 

const PharmacyLayout = () => {
  const { lang, theme } = useSettings();
  const location = useLocation();
  
  // 🟢 حالات التحكم
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isRtl = lang === 'ar';

  // 📱 اكتشاف حجم الشاشة للتعامل مع الموبايل بذكاء
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 1024; // Tailwind 'lg' breakpoint
      setIsMobile(mobileView);
      if (mobileView) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    handleResize(); // التشغيل المبدئي
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // دالة إغلاق السايدبار على الموبايل
  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // 🎬 إعدادات الأنيميشن السينمائي المدمج (لتحسين أداء الريندر)
  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.99, filter: 'blur(5px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -15, scale: 0.99, filter: 'blur(5px)' }
  };

  const pageTransition = {
    duration: 0.4, 
    ease: [0.22, 1, 0.36, 1] // Custom Bezier Curve for Apple-like smoothness
  };

  return (
    <div 
      className="relative min-h-screen bg-slate-50 dark:bg-[#020617] flex font-sans selection:bg-emerald-500/30 overflow-hidden" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* 🌌 1. الخلفية الحية (Ambient Background Layer) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] dark:opacity-20 mix-blend-overlay"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-[10%] -right-[10%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[40%] -left-[10%] w-[35vw] h-[35vw] min-w-[350px] min-h-[350px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[80px]"></div>
      </div>

      {/* 🛡️ Mobile Overlay (يظهر فقط في الشاشات الصغيرة عند فتح القائمة) */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeSidebarOnMobile}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* 🟢 2. Sidebar (Glassmorphism Style) */}
      <aside 
        className={`
          fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full z-50 
          bg-white/80 dark:bg-[#0b1121]/90 backdrop-blur-2xl 
          ${isRtl ? 'border-l' : 'border-r'} border-slate-200/50 dark:border-white/5 
          shadow-[0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(0,0,0,0.2)]
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-24 lg:w-24'}
          ${!isSidebarOpen && isMobile ? (isRtl ? 'translate-x-full' : '-translate-x-full') : ''}
        `}
      >
        <PharmacySidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setSidebarOpen} isMobile={isMobile} />
      </aside>

      {/* 🟢 3. Main Content Wrapper */}
      <main 
        className={`
          relative z-10 flex-1 flex flex-col min-h-screen w-full
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${!isMobile ? (
            isSidebarOpen 
              ? (isRtl ? 'mr-72' : 'ml-72') 
              : (isRtl ? 'mr-24' : 'ml-24')
          ) : 'm-0'} 
        `}
      >
        
        {/* الهيدر */}
        <PharmacyHeader 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
          isMobile={isMobile}
        />

        {/* 🟢 4. Dynamic Page Container with Cinematic Transition */}
        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-x-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="flex-1 h-full w-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        
      </main>
    </div>
  );
};

export default PharmacyLayout;