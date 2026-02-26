import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Package, Truck, 
  FileText, Activity, AlertCircle, LifeBuoy, ChevronLeft,
  Settings as SettingsIcon, User // 🟢 أضفنا أيقونات الإعدادات والبروفايل
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { t } = useSettings();
  const location = useLocation();

  // 🟢 القائمة الشاملة لجميع الروابط
  const navItems = [
    { path: '/admin', name: t.dashboard || 'لوحة القيادة', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/inventory', name: t.inventory || 'المخزون', icon: <Package size={20} /> },
    { path: '/admin/logistics', name: t.logistics || 'الخدمات اللوجستية', icon: <Truck size={20} /> },
    { path: '/admin/alerts', name: t.alerts || 'التنبيهات', icon: <AlertCircle size={20} /> },
    { path: '/admin/reports', name: t.reports || 'التقارير', icon: <FileText size={20} /> },
    { path: '/admin/predictions', name: t.predictions || 'التوقعات الذكية', icon: <Brain size={20} /> },
    // الروابط الجديدة التي أضفناها:
    { path: '/admin/settings', name: t.settings || 'الإعدادات', icon: <SettingsIcon size={20} /> },
    { path: '/admin/profile', name: t.profile || 'الملف الشخصي', icon: <User size={20} /> },
  ];

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-[#020617]/80 backdrop-blur-3xl border-l border-slate-200/50 dark:border-white/5 transition-colors duration-500 font-sans shadow-[20px_0_50px_rgba(0,0,0,0.02)] dark:shadow-none" dir="rtl">
      
      {/* 1. منطقة الشعار (Logo Header) */}
      <div className="h-24 flex items-center px-6 border-b border-slate-100 dark:border-white/5 shrink-0">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl relative z-10 border border-white/20">
              <Activity size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              ترياق<span className="text-blue-600">.</span>
            </h1>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-black tracking-[0.2em] uppercase mt-1 block">
              Command Center
            </span>
          </div>
        </motion.div>
      </div>

      {/* 2. قائمة التنقل (Smart Navigation) */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto hide-scrollbar">
        <p className="px-4 text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">
          القائمة الرئيسية
        </p>
        
        {navItems.map((item) => {
          // حساب الحالة النشطة بدقة (لوحة القيادة لها حالة خاصة لأنها الروت الأساسي)
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin' 
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className="block relative group outline-none"
            >
              <motion.div 
                whileHover={{ x: -4 }} // حركة خفيفة لليسار عند التمرير
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl z-10 transition-colors duration-300 ${
                  isActive 
                  ? 'text-blue-700 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {/* خلفية العنصر النشط (Liquid Animation) */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 border border-blue-100/50 dark:border-blue-500/20 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {React.cloneElement(item.icon, { strokeWidth: isActive ? 2.5 : 2 })}
                </div>
                
                {/* Text */}
                <span className={`flex-1 relative z-10 text-sm transition-all duration-300 ${isActive ? 'font-black' : 'font-bold'}`}>
                  {item.name}
                </span>
                
                {/* Indicator */}
                {isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse relative z-10"></div>
                ) : (
                  <ChevronLeft size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-300" />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* 3. بطاقة الدعم (Ultra Premium Support Card) */}
      <div className="p-6 shrink-0">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-[2rem] p-5 text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-slate-700 dark:border-white/10"
        >
          {/* Glass Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
              <LifeBuoy size={24} className="text-blue-300"/>
            </div>
            <div>
              <h4 className="font-black text-sm text-white tracking-wide">مركز الدعم</h4>
              <p className="text-[10px] text-blue-200/80 font-bold mt-0.5">متاح 24/7 للمساعدة</p>
            </div>
          </div>
          
          <button className="w-full bg-white text-slate-900 dark:bg-blue-600 dark:text-white py-3 rounded-xl text-xs font-black shadow-lg hover:shadow-xl active:scale-95 transition-all">
            تحدث معنا الآن
          </button>
        </motion.div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
            Tiryaq Admin OS <span className="text-blue-500">v2.0</span>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;