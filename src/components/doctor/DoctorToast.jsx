import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useDoctor } from '../../context/DoctorContext';

const STYLES = {
  success: 'bg-teal-50 border-teal-100 text-teal-800 dark:bg-teal-900/40 dark:border-teal-800 dark:text-teal-200',
  warning: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-200',
  error: 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-200',
  info: 'bg-cyan-50 border-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:border-cyan-800 dark:text-cyan-200',
};

const ICONS = {
  success: <Check size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

export default function DoctorToast() {
  const { toast } = useDoctor();
  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ y: -60, opacity: 0, x: '-50%' }}
          animate={{ y: 24, opacity: 1, x: '-50%' }}
          exit={{ y: -60, opacity: 0, x: '-50%' }}
          className="fixed top-0 left-1/2 z-[1000] w-[90%] max-w-md pointer-events-none"
        >
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-sm ${STYLES[toast.type] ?? STYLES.info}`}>
            {ICONS[toast.type]}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
