import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    // AnimatePresence تسمح للمكون بتشغيل أنيميشن "الخروج" قبل أن يختفي من الـ DOM
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          
          {/* 🟢 Backdrop (الخلفية المضببة) */}
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-slate-900/60" 
            onClick={onClose} // الإغلاق عند الضغط خارج المودال
          />

          {/* 🟢 Modal Container (النافذة الزجاجية) */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }} 
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20, rotateX: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white/90 dark:bg-[#0b1121]/90 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* تأثير إضاءة داخلية (Aurora Glow) */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* الهيدر */}
            <div className="flex justify-between items-center mb-8 relative z-10 shrink-0">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
              <button 
                onClick={onClose} 
                className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* المحتوى */}
            <div className="relative z-10 overflow-y-auto hide-scrollbar flex-1 -mx-2 px-2 pb-2">
              {children}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;