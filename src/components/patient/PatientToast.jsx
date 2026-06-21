import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

const STYLES = {
  success: 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-200',
  warning: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-200',
  error: 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-200',
  info: 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-200',
};

const ICONS = {
  success: <Check size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

export default function PatientToast() {
  const { toast } = usePatient();

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
