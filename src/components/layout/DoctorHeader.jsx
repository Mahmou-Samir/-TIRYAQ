import React, { useState } from 'react';
import { Menu, Sun, Moon, ChevronDown, LogOut, User } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const DoctorHeader = ({ toggleSidebar, pageTitle, pageSubtitle }) => {
  const { theme, toggleTheme, lang, t } = useSettings();
  const navigate = useNavigate();
  const uiText = t?.doctor?.header || {};
  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || uiText.doctor || (lang === 'ar' ? 'طبيب' : 'Doctor');
  const userInitial = displayName.charAt(lang === 'ar' ? 0 : 0).toUpperCase();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#0b1121]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={toggleSidebar} className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white truncate">{pageTitle}</h1>
            {pageSubtitle && <p className="text-xs text-slate-400 font-medium truncate hidden sm:block">{pageSubtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
              className="flex items-center gap-2 p-1.5 pe-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-black text-sm">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : userInitial}
              </div>
              <span className="hidden md:block text-sm font-bold text-slate-700 dark:text-white max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {activeDropdown === 'profile' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute end-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden z-50"
                  >
                    <button type="button" onClick={() => { navigate('/doctor/profile'); setActiveDropdown(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20">
                      <User size={16} /> {uiText.profile || 'الملف'}
                    </button>
                    <button type="button" onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-100 dark:border-white/5">
                      <LogOut size={16} /> {uiText.logout || 'خروج'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
