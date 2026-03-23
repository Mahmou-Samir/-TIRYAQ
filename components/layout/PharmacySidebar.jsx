import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, UploadCloud, Package, 
  ClipboardList, LogOut, Activity, Settings 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { useSettings } from '../../context/SettingsContext';

const PharmacySidebar = ({ isSidebarOpen }) => {
  const { t, lang } = useSettings();
  const navigate = useNavigate();

  // 🛡️ حماية البيانات: استخدام ?. للوصول الآمن و || للنصوص البديلة
  const menuItems = [
    { 
      path: '/pharmacy', 
      icon: <LayoutDashboard size={22} />, 
      label: t?.pharmacy?.sidebar?.dashboard || (lang === 'ar' ? 'لوحة القيادة' : 'Dashboard') 
    },
    { 
      path: '/pharmacy/upload', 
      icon: <UploadCloud size={22} />, 
      label: t?.pharmacy?.sidebar?.upload || (lang === 'ar' ? 'رفع المخزون' : 'Upload Stock') 
    },
    { 
      path: '/pharmacy/inventory', 
      icon: <Package size={22} />, 
      label: t?.pharmacy?.sidebar?.inventory || (lang === 'ar' ? 'إدارة الأدوية' : 'Inventory') 
    },
    { 
      path: '/pharmacy/orders', 
      icon: <ClipboardList size={22} />, 
      label: t?.pharmacy?.sidebar?.orders || (lang === 'ar' ? 'طلبات المرضى' : 'Orders') 
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between py-8 overflow-hidden relative select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 1. Logo Section */}
      <div className={`flex items-center px-6 mb-10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${!isSidebarOpen && 'justify-center px-0'}`}>
        <div className="relative group cursor-pointer" onClick={() => navigate('/pharmacy')}>
          <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/10">
            <Activity size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
        
        <div className={`mx-4 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap flex flex-col justify-center ${isSidebarOpen ? 'w-40 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}`}>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
            {t?.appTitle || (lang === 'ar' ? 'ترياق' : 'Tiryaq')}
          </h1>
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Pharmacy OS
          </span>
        </div>
      </div>

      {/* 🟢 2. Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2 relative">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/pharmacy'}
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
                {/* 🔵 Active Background Pill (Framer Motion) */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] rounded-2xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className={`relative z-10 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-6'}`}>
                  {item.icon}
                </div>
                
                <span className={`relative z-10 text-sm font-bold transition-all duration-500 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute'}`}>
                  {item.label}
                </span>

                {/* 💡 Smart Tooltip (Adapts to RTL/LTR) */}
                {!isSidebarOpen && (
                  <div className={`absolute ${lang === 'ar' ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-xl border border-white/10 flex items-center`}>
                    {item.label}
                    {/* Tiny Arrow matching direction */}
                    <div className={`w-2 h-2 bg-slate-900 rotate-45 absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? '-right-1 border-t border-r' : '-left-1 border-b border-l'} border-white/10`}></div>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 🟢 3. Bottom Actions */}
      <div className="px-4 space-y-2 mt-auto relative z-10">
        <button 
          onClick={() => navigate('/pharmacy/settings')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300 transition-all font-bold group ${!isSidebarOpen && 'justify-center px-0'}`}
        >
           <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500 shrink-0" />
           <span className={`text-sm transition-all duration-500 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
             {t?.settings || (lang === 'ar' ? 'الإعدادات' : 'Settings')}
           </span>
        </button>

        <button 
          onClick={handleLogout}
          className={`relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-600 transition-all font-black group shadow-sm hover:shadow-lg hover:shadow-red-500/30 overflow-hidden ${!isSidebarOpen && 'justify-center px-0'}`}
        >
          {/* قلب أيقونة الخروج في النسخة العربية */}
          <LogOut size={22} className={`relative z-10 transition-transform shrink-0 ${lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          <span className={`relative z-10 text-sm transition-all duration-500 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'w-0 opacity-0 absolute'}`}>
            {t?.logout || (lang === 'ar' ? 'تسجيل الخروج' : 'Logout')}
          </span>
        </button>
      </div>

    </div>
  );
};

export default PharmacySidebar;