import React, { useState, useEffect } from 'react';
import { Download, X, AppWindow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; 
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    mediaQueryList.addEventListener('change', (e) => {
      if (e.matches) setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Tiryaq Installed successfully 🎉');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const bannerVariants = {
    hidden: { y: 100, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 150, damping: 20 }
    },
    exit: { y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          // تصغير العرض الأقصى (max-w-[320px]) ليكون ملموم وصغير
          className="fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-[320px] md:left-auto md:right-4 md:mx-0 z-[9999]"
          dir="rtl"
        >
          {/* حاوية أصغر (p-4 بدلاً من p-6) وتحديث الألوان للدرجات الزرقاء */}
          <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border border-blue-100 dark:border-slate-700 shadow-2xl rounded-2xl p-4 overflow-hidden">
            
            {/* إضاءة زرقاء خفيفة في الخلفية */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="absolute top-2 left-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </motion.button>

            <div className="flex flex-col gap-3 relative z-10">
              
              <div className="flex items-center gap-3">
                {/* تصغير الأيقونة والاعتماد على اللون الأزرق */}
                <div className="shrink-0 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-slate-800 p-2.5 rounded-full shadow-sm border border-blue-200/50 dark:border-blue-700/50 text-blue-600 dark:text-blue-400">
                  <AppWindow size={20} strokeWidth={1.5} />
                </div>

                <div className="flex-1 mt-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    تطبيق ترياق
                  </h4>
                  {/* تصغير حجم الخط الوصفي */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight pr-1">
                    ثبّت التطبيق لتجربة أسرع بدون إنترنت.
                  </p>
                </div>
              </div>

              {/* تصغير الأزرار وتقليل المسافات */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDismiss}
                  className="text-slate-500 dark:text-slate-400 text-[11px] font-medium py-2 px-2 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                >
                  ليس الآن
                </motion.button>

                {/* زر التثبيت الأزرق */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstallClick}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_10px_-2px_rgba(37,99,235,0.3)] transition-all"
                >
                  <Download size={13} strokeWidth={2.5} />
                  تثبيت الآن
                </motion.button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;