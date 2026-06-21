import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UploadCloud, Package, ClipboardList,
  Bell, User, BarChart2, ShoppingCart,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { PharmacyProvider, usePharmacy } from '../../context/PharmacyContext';
import PharmacySidebar from './PharmacySidebar';
import PharmacyHeader from './PharmacyHeader';
import PharmacyToast from '../pharmacy/PharmacyToast';

const PATH_KEYS = {
  '/pharmacy': 'home',
  '/pharmacy/upload': 'upload',
  '/pharmacy/inventory': 'inventory',
  '/pharmacy/orders': 'orders',
  '/pharmacy/sales': 'sales',
  '/pharmacy/reports': 'reports',
  '/pharmacy/alerts': 'alerts',
  '/pharmacy/profile': 'profile',
  '/pharmacy/settings': 'settings',
};

const MOBILE_NAV = [
  { key: 'home', path: '/pharmacy', icon: LayoutDashboard, exact: true },
  { key: 'orders', path: '/pharmacy/orders', icon: ClipboardList, badgeKey: 'pending' },
  { key: 'sales', path: '/pharmacy/sales', icon: ShoppingCart },
  { key: 'inventory', path: '/pharmacy/inventory', icon: Package },
  { key: 'alerts', path: '/pharmacy/alerts', icon: Bell, badgeKey: 'alerts' },
  { key: 'profile', path: '/pharmacy/profile', icon: User },
];

const PharmacyShell = () => {
  const { lang, theme, t } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingCount, unreadCount } = usePharmacy();
  const L = t.pharmacy?.layout ?? {};
  const pages = L.pages ?? {};

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isRtl = lang === 'ar';
  const pageKey = PATH_KEYS[location.pathname] || 'home';
  const meta = pages[pageKey] || pages.home || { title: '', subtitle: '' };

  const mobileNav = useMemo(() => MOBILE_NAV.map((item) => ({
    ...item,
    label: L[item.key] || item.key,
    badge: item.badgeKey === 'pending' ? pendingCount : item.badgeKey === 'alerts' ? unreadCount : 0,
  })), [L, pendingCount, unreadCount]);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 1024;
      setIsMobile(mobileView);
      if (mobileView) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.99, filter: 'blur(5px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -15, scale: 0.99, filter: 'blur(5px)' },
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div
      className="relative min-h-screen bg-slate-50 dark:bg-[#020617] flex font-sans selection:bg-emerald-500/30 overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <PharmacyToast />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] dark:opacity-20 mix-blend-overlay" />
        <div className="absolute -top-[10%] -right-[10%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] -left-[10%] w-[35vw] h-[35vw] min-w-[350px] min-h-[350px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeSidebarOnMobile}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full z-50
          bg-white/80 dark:bg-[#0b1121]/90 backdrop-blur-2xl
          ${isRtl ? 'border-l' : 'border-r'} border-slate-200/50 dark:border-white/5
          shadow-[0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(0,0,0,0.2)]
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-24 lg:w-24'}
          ${!isSidebarOpen && isMobile ? (isRtl ? 'translate-x-full' : '-translate-x-full') : ''}
        `}
      >
        <PharmacySidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setSidebarOpen} isMobile={isMobile} />
      </aside>

      <main
        className={`
          relative z-10 flex-1 flex flex-col min-h-screen w-full
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${!isMobile ? (
            isSidebarOpen
              ? (isRtl ? 'mr-72' : 'ml-72')
              : (isRtl ? 'mr-24' : 'ml-24')
          ) : 'm-0'}
          pb-24 lg:pb-0
        `}
      >
        <PharmacyHeader
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          pageTitle={meta.title}
          pageSubtitle={meta.subtitle}
        />

        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-x-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 h-full w-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-[120] bg-white/95 dark:bg-[#0b1121]/95 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/10 safe-area-pb">
        <div className="flex justify-around items-center px-2 py-2">
          {mobileNav.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all ${
                  active ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <div className={`relative p-2 rounded-xl ${active ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black truncate max-w-[56px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const PharmacyLayout = () => (
  <PharmacyProvider>
    <PharmacyShell />
  </PharmacyProvider>
);

export default PharmacyLayout;
