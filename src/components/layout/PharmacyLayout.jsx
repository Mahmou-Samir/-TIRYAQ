import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ استيراد المكونات الفرعية
import PharmacySidebar from './PharmacySidebar';
import PharmacyHeader from './PharmacyHeader'; 

const PharmacyLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation(); // نحتاجه لعمل مفتاح فريد للانيميشن

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex font-sans selection:bg-emerald-500/30 overflow-hidden" dir="rtl">
      
      {/* 🌌 1. الخلفية الحية (Ambient Background Layer) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* نويز خفيف ليعطي ملمس احترافي */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* فقاعات ضوئية (Aurora Blobs) */}
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[80px]"></div>
      </div>

      {/* 🟢 2. Sidebar (Glassmorphism Style) */}
      <aside 
        className={`
          fixed top-0 right-0 h-full z-50 
          bg-white/80 dark:bg-[#0b1121]/90 backdrop-blur-xl 
          border-l border-white/20 dark:border-white/5 
          shadow-[0_0_50px_rgba(0,0,0,0.1)]
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'w-72' : 'w-24'}
        `}
      >
        <PharmacySidebar isSidebarOpen={isSidebarOpen} />
      </aside>

      {/* 🟢 3. Main Content Wrapper */}
      <main 
        className={`
          relative z-10 flex-1 flex flex-col min-h-screen 
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'mr-72' : 'mr-24'}
        `}
      >
        
        {/* الهيدر */}
        <PharmacyHeader 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
        />

        {/* 🟢 4. Dynamic Page Container with Cinematic Transition */}
        <div className="p-6 md:p-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // مفتاح فريد لإعادة تشغيل الأنيميشن مع كل صفحة
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, scale: 0.98, filter: 'blur(10px)' }}
              transition={{ 
                duration: 0.4, 
                ease: [0.22, 1, 0.36, 1] // Custom Bezier for ultra-smooth feel
              }}
              className="h-full"
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