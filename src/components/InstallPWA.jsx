import React, { useState, useEffect } from 'react';
import { Download, X, AppWindow, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان التطبيق مثبتًا بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; 
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // إظهار البانر بعد ثانيتين من تحميل الصفحة لجذب الانتباه بشكل أفضل
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // التحقق مرة أخرى عند تغيير حجم الشاشة (في حال فتح الـ DevTools)
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
    setShowPrompt(false); // إخفاء البانر الخاص بنا فوراً
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Tiryaq Installed successfully 🎉');
    } else {
      console.log('Install dismissed by user');
      // اختياري: يمكن إظهار رسالة شكر صغيرة حتى لو رفض
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // اختياري: حفظ تفرغ المستخدم في الـ localStorage لعدم إزعاجه مرة أخرى قريباً
    // localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // تنسيق الأنميشن للبانر
  const bannerVariants = {
    hidden: { y: 150, opacity: 0, scale: 0.9 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 120, 
        damping: 18,
        delay: 0.2 // تأخير بسيط للأنميشن الداخلي
      }
    },
    exit: { 
      y: 100, 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          // جعل البانر في المنتصف أسفل الشاشة في الموبايل، وعلي اليمين في اللابتوب
          className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm md:left-auto md:right-6 md:mx-0 z-[9999]"
          dir="rtl"
        >
          {/* حاوية زجاجية احترافية */}
          <div className="relative bg-white/70 dark:bg-slate-950/80 backdrop-blur-lg border border-gray-100 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-3xl p-6 overflow-hidden">
            
            {/* زخرفة خلفية خفيفة بلون الـ Emerald */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl" />
            
            {/* زر الإغلاق الذكي */}
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="absolute top-4 left-4 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
            >
              <X size={18} />
            </motion.button>

            <div className="flex flex-col items-center gap-5 relative z-10">
              
              {/* قسم الأيقونة والعنوان */}
              <div className="flex items-center gap-4 w-full">
                {/* أيقونة احترافية دائرية بتدرج ناعم */}
                <div className="shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-slate-900 p-4 rounded-full shadow-inner border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
                  <AppWindow size={28} strokeWidth={1.5} />
                </div>

                {/* النصوص بضبط دقيق */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-950 dark:text-white text-base tracking-tight">
                      ثبّت تطبيق ترياق
                    </h4>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                      className="text-amber-500"
                    >
                      <Star size={14} fill="currentColor" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    استمتع بتجربة أسرع وأفضل، ووصول فوري لبياناتك حتى في حال انقطاع الإنترنت.
                  </p>
                </div>
              </div>

              {/* أزرار الأكشن بتنسيق أفقي احترافي */}
              <div className="grid grid-cols-2 gap-3 w-full pt-1">
                {/* زر ليس الآن - Ghost Button */}
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDismiss}
                  className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-3 px-5 rounded-full transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                >
                  ليس الآن
                </motion.button>

                {/* زر التثبيت الأساسي - بتدرج وظل عميق */}
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstallClick}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-3 px-5 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_15px_-1px_rgba(16,185,129,0.3)] transition-all"
                >
                  <Download size={15} strokeWidth={2.5} />
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
