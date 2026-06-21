import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UploadCloud, Package,
  ClipboardList, LogOut, Activity, Settings,
  BarChart2, Bell, User, ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { useSettings } from '../../context/SettingsContext';
import { usePharmacy } from '../../context/PharmacyContext';

const PharmacySidebar = ({ isSidebarOpen }) => {
  const { t, lang } = useSettings();
  const { pendingCount } = usePharmacy();
  const navigate = useNavigate();
  const S = t?.pharmacy?.sidebar ?? {};
  const L = t?.pharmacy?.layout ?? {};

  const menuItems = [
    { path: '/pharmacy', icon: <LayoutDashboard size={22} />, label: S.dashboard, exact: true },
    { path: '/pharmacy/upload', icon: <UploadCloud size={22} />, label: S.upload },
    { path: '/pharmacy/inventory', icon: <Package size={22} />, label: S.inventory },
    { path: '/pharmacy/orders', icon: <ClipboardList size={22} />, label: S.orders, badge: pendingCount },
    { path: '/pharmacy/sales', icon: <ShoppingCart size={22} />, label: S.sales },
    { path: '/pharmacy/reports', icon: <BarChart2 size={22} />, label: S.reports },
    { path: '/pharmacy/alerts', icon: <Bell size={22} />, label: S.alerts },
    { path: '/pharmacy/profile', icon: <User size={22} />, label: S.profile },
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
        <div className="relative group cursor-pointer" onClick={() => navigate('/pharmacy')}>
          <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/10">
            <Activity size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
        <div className={`mx-4 transition-all duration-500 overflow-hidden whitespace-nowrap flex flex-col justify-center ${isSidebarOpen ? 'w-40 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}`}>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
            {t?.appTitle || 'Tiryaq'}
          </h1>
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
            {L.portal || 'Pharmacy OS'}
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
                : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400'}
              ${!isSidebarOpen && 'justify-center px-0'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] rounded-2xl z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-6'}`}>
                  {item.icon}
                  {item.badge > 0 && !isSidebarOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`relative z-10 text-sm font-bold transition-all duration-500 whitespace-nowrap flex-1 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute'}`}>
                  {item.label}
                </span>
                {item.badge > 0 && isSidebarOpen && (
                  <span className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
                {!isSidebarOpen && (
                  <div className={`absolute ${lang === 'ar' ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-xl border border-white/10 flex items-center`}>
                    {item.label}
                    <div className={`w-2 h-2 bg-slate-900 rotate-45 absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? '-right-1 border-t border-r' : '-left-1 border-b border-l'} border-white/10`} />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 space-y-2 mt-auto relative z-10">
        <button
          onClick={() => navigate('/pharmacy/settings')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300 transition-all font-bold group ${!isSidebarOpen && 'justify-center px-0'}`}
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500 shrink-0" />
          <span className={`text-sm transition-all duration-500 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            {L.settings || t?.settings}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className={`relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-600 transition-all font-black group shadow-sm hover:shadow-lg hover:shadow-red-500/30 overflow-hidden ${!isSidebarOpen && 'justify-center px-0'}`}
        >
          <LogOut size={22} className={`relative z-10 transition-transform shrink-0 ${lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          <span className={`relative z-10 text-sm transition-all duration-500 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'w-0 opacity-0 absolute'}`}>
            {L.logout || t?.logout}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PharmacySidebar;
