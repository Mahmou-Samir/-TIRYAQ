import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // الاستماع لحدث جاهزية التطبيق للتثبيت
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // منع ظهور الرسالة الافتراضية للمتصفح
      setDeferredPrompt(e); // حفظ الحدث عشان نشغله لما اليوزر يدوس على الزرار
      setShowPrompt(true); // إظهار البانر بتاعنا
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // تنظيف الـ Event Listener
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // إظهار رسالة التثبيت الخاصة بالنظام (أندرويد/ويندوز)
    deferredPrompt.prompt();

    // انتظار رد فعل المستخدم (وافق أم رفض)
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // تصفير الحالة لأن الحدث لا يمكن استخدامه إلا مرة واحدة
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[999]"
          dir="rtl"
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl rounded-2xl p-4 flex items-center gap-4">
            
            {/* الأيقونة */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl text-white shadow-lg">
              <Smartphone size={24} />
            </div>

            {/* النصوص */}
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                تطبيق ترياق متاح الآن!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                قم بتثبيت التطبيق للوصول السريع حتى بدون إنترنت.
              </p>
            </div>

            {/* أزرار الأكشن */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Download size={14} /> تثبيت
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-medium p-1 flex justify-center items-center transition-colors"
              >
                ليس الآن
              </button>
            </div>

            {/* زرار الإغلاق الصغير */}
            <button 
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-full p-1 shadow-md transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;