import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Stethoscope, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { useSettings } from '../../context/SettingsContext';
import { useDoctor } from '../../context/DoctorContext';

const DoctorSidebar = ({ isSidebarOpen }) => {
  const { t, lang } = useSettings();
  const { pendingCount } = useDoctor();
  const navigate = useNavigate();
  const S = t?.doctor?.sidebar ?? {};
  const L = t?.doctor?.layout ?? {};

  const menuItems = [
    { path: '/doctor', icon: <LayoutDashboard size={22} />, label: S.dashboard, exact: true },
    { path: '/doctor/consultations', icon: <MessageSquare size={22} />, label: S.consultations, badge: pendingCount },
    { path: '/doctor/profile', icon: <User size={22} />, label: S.profile },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between py-8 overflow-hidden relative select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`flex items-center px-6 mb-10 transition-all duration-500 ${!isSidebarOpen && 'justify-center px-0'}`}>
        <div className="relative group cursor-pointer" onClick={() => navigate('/doctor')}>
          <div className="absolute inset-0 bg-teal-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/10">
            <Stethoscope size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
        <div className={`mx-4 transition-all duration-500 overflow-hidden whitespace-nowrap flex flex-col justify-center ${isSidebarOpen ? 'w-40 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}`}>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
            {t?.appTitle || 'Tiryaq'}
          </h1>
          <span className="text-teal-500 text-[10px] font-black uppercase tracking-widest mt-1">
            {L.portal || 'Doctor Portal'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 relative overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
              ${isActive
                ? 'text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-500/5 hover:text-teal-600 dark:hover:text-teal-400'}
              ${!isSidebarOpen && 'justify-center px-0'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeDoctorSidebarPill"
                    className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-[0_10px_20px_-5px_rgba(20,184,166,0.4)] rounded-2xl z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 shrink-0">{item.icon}</span>
                <span className={`relative z-10 font-bold text-sm transition-all duration-500 ${!isSidebarOpen ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
                {item.badge > 0 && isSidebarOpen && (
                  <span className="relative z-10 ms-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-sm ${!isSidebarOpen && 'justify-center px-0'}`}
        >
          <LogOut size={22} />
          <span className={`transition-all duration-500 ${!isSidebarOpen ? 'w-0 opacity-0 overflow-hidden' : ''}`}>
            {L.logout || 'تسجيل الخروج'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
