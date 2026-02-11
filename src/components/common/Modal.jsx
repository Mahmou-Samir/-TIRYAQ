import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-light-card dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl border border-light-border dark:border-dark-border transform transition-all scale-100 p-6">
        <div className="flex justify-between items-center mb-6 border-b border-light-border dark:border-dark-border pb-4">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;