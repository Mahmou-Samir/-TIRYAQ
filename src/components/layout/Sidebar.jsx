import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Brain, Package, Truck, 
  FileText, Activity, AlertCircle, LifeBuoy 
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = () => {
  const { t } = useSettings();

  // قائمة الروابط (تأكد أن المسارات تبدأ بـ /admin إذا كان الروت يتطلب ذلك)
  const navItems = [
    { path: '/admin', name: t.dashboard, icon: <LayoutDashboard size={20} /> },
    { path: '/admin/inventory', name: t.inventory, icon: <Package size={20} /> },
    { path: '/admin/logistics', name: t.logistics, icon: <Truck size={20} /> },
    { path: '/admin/alerts', name: t.alerts, icon: <AlertCircle size={20} /> },
    { path: '/admin/reports', name: t.reports, icon: <FileText size={20} /> },
    { path: '/admin/predictions', name: t.predictions, icon: <Brain size={20} /> },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* 1. منطقة الشعار (Logo Header) */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide font-sans">
              ترياق <span className="text-blue-600">.</span>
            </h1>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase block -mt-1">
              Medical Command
            </span>
          </div>
        </div>
      </div>

      {/* 2. قائمة التنقل (Navigation Links) */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
          القائمة الرئيسية
        </p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'} // لمنع تفعيل "الرئيسية" مع كل الصفحات الفرعية
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm select-none
              ${isActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm font-bold' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            {/* استخدام Render Props للوصول لحالة النشاط داخلياً بدون تداخل الروابط */}
            {({ isActive }) => (
              <>
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {item.icon}
                </span>
                
                <span className="flex-1">{item.name}</span>
                
                {/* ✅ الإصلاح: استخدام div بدلاً من NavLink للنقطة الزرقاء */}
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. بطاقة الدعم (Support Card) */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden group">
          {/* تأثير جمالي في الخلفية */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <LifeBuoy size={20} className="text-blue-300"/>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-0.5">مركز الدعم</h4>
              <p className="text-[10px] text-slate-300 leading-tight mb-3 opacity-80">
                هل تواجه مشكلة تقنية؟
              </p>
              <button className="text-[10px] font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm w-full text-center">
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
        
        {/* تذييل القائمة */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400 font-medium font-mono">© 2026 Tiryaq v2.0</p>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;