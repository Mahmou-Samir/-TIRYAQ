import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Clock, User, Bell, LogOut, Search,
  Heart, LayoutGrid, ShoppingCart, Pill, Stethoscope, BookOpen,
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { Magnetic } from '../home/Shared';
import { PatientProvider, usePatient } from '../../context/PatientContext';
import { useSettings } from '../../context/SettingsContext';
import PatientToast from '../patient/PatientToast';
import PatientCartDrawer from '../patient/PatientCartDrawer';
import AiChatbot from '../patient/AiChatbot';

const PATH_KEYS = {
  '/patient': 'home',
  '/patient/orders': 'orders',
  '/patient/favorites': 'favorites',
  '/patient/history': 'history',
  '/patient/doctors': 'doctors',
  '/patient/health': 'health',
  '/patient/profile': 'profile',
};

const NAV_CONFIG = [
  { icon: LayoutGrid, key: 'home', path: '/patient', exact: true },
  { icon: ShoppingBag, key: 'orders', path: '/patient/orders', badgeKey: 'orders' },
  { icon: Heart, key: 'favorites', path: '/patient/favorites' },
  { icon: Stethoscope, key: 'doctors', path: '/patient/doctors' },
  { icon: BookOpen, key: 'health', path: '/patient/health' },
  { icon: Clock, key: 'history', path: '/patient/history' },
  { icon: User, key: 'profile', path: '/patient/profile' },
];

const PatientShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen, recentOrders, favorites } = usePatient();
  const { t } = useSettings();
  const L = t.patient?.layout ?? {};
  const pages = L.pages ?? {};

  const pageKey = PATH_KEYS[location.pathname] || 'home';
  const meta = pages[pageKey] || pages.home || { title: '', subtitle: '' };

  const navItems = useMemo(() => NAV_CONFIG.map((item) => ({
    ...item,
    label: L[item.key] || item.key,
  })), [L]);

  const activeOrders = recentOrders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const getBadge = (item) => {
    if (item.badgeKey === 'orders') return activeOrders;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500">
      <PatientToast />
      <PatientCartDrawer />
      <AiChatbot />

      {/* Desktop background accents */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">

        {/* ── Desktop Sidebar (RTL: right) ── */}
        <aside className="hidden lg:flex flex-col fixed inset-y-0 right-0 w-72 xl:w-80 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-white/5 shadow-xl z-[90]">
          {/* Brand */}
          <div className="p-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
                <Pill size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.appTitle || 'ترياق'}</h2>
                <p className="text-[11px] text-slate-400 font-bold">{L.portal}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item);
              const badge = getBadge(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    active
                      ? 'bg-gradient-to-l from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  <span className="flex-1 text-right">{item.label}</span>
                  {badge > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Search shortcut */}
            <button
              onClick={() => navigate('/patient')}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-colors font-bold text-sm"
            >
              <Search size={18} />
              <span>{L.quickSearch}</span>
            </button>
          </nav>

          {/* User card */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shrink-0 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || L.profile?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                  {user?.displayName || L.profile}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors"
            >
              <LogOut size={16} />
              {L.logout}
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-h-screen lg:mr-72 xl:mr-80 pb-32 lg:pb-0">

          {/* Header */}
          <header className={`sticky top-0 z-[80] transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 shadow-sm'
              : 'bg-transparent'
          }`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-5 flex justify-between items-center gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hidden sm:block">
                  {meta.subtitle}
                </p>
                <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white truncate">
                  {meta.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                {/* Desktop stats pills */}
                <div className="hidden md:flex items-center gap-2">
                  {activeOrders > 0 && (
                    <button
                      onClick={() => navigate('/patient/orders')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-xs font-black border border-blue-100 dark:border-blue-800"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      {activeOrders} {L.activeOrders}
                    </button>
                  )}
                  {favorites.length > 0 && (
                    <button
                      onClick={() => navigate('/patient/favorites')}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl text-xs font-black"
                    >
                      <Heart size={14} fill="currentColor" />
                      {favorites.length} {L.favoritesCount}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-2 px-3 lg:px-5 py-2.5 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl lg:rounded-2xl font-black text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
                >
                  <ShoppingCart size={18} />
                  <span className="hidden sm:inline">{L.cart}</span>
                  {cartCount > 0 && (
                    <span className="bg-white text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>

                <button className="p-2.5 lg:p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 border border-slate-200/60 dark:border-white/10 shadow-sm hover:text-blue-600 transition-colors">
                  <Bell size={18} />
                </button>

                {/* Mobile-only logout (desktop has sidebar) */}
                <button
                  onClick={handleLogout}
                  className="lg:hidden p-2.5 bg-white dark:bg-slate-900 rounded-xl text-red-500 border border-slate-200/60 dark:border-white/10 shadow-sm"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-50 dark:from-[#020617] to-transparent pointer-events-none z-[110]" />
      <nav className="lg:hidden fixed bottom-5 inset-x-4 z-[120]">
        <div className="max-w-lg mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl">
          <MobileNavButton icon={<LayoutGrid />} label={L.home} path="/patient" active={location.pathname === '/patient'} />
          <MobileNavButton icon={<ShoppingBag />} label={L.orders} path="/patient/orders" active={location.pathname === '/patient/orders'} badge={activeOrders} />

          <div className="relative -top-7">
            <Magnetic strength={0.2}>
              <button
                onClick={() => navigate('/patient')}
                className="relative w-[4.25rem] h-[4.25rem] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 border-[5px] border-slate-50 dark:border-[#020617] active:scale-90 transition-transform"
              >
                <Search size={26} strokeWidth={2.5} />
              </button>
            </Magnetic>
          </div>

          <MobileNavButton icon={<Heart />} label={L.favorites} path="/patient/favorites" active={location.pathname === '/patient/favorites'} />
          <MobileNavButton icon={<Stethoscope />} label={L.doctors} path="/patient/doctors" active={location.pathname === '/patient/doctors'} />
        </div>
      </nav>
    </div>
  );
};

const MobileNavButton = ({ icon, label, path, active, badge }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-col items-center gap-0.5 w-14 transition-all relative ${active ? 'text-blue-600' : 'text-slate-400'}`}
    >
      <div className={`p-2 rounded-2xl relative ${active ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
        {React.cloneElement(icon, { size: 21, strokeWidth: active ? 2.5 : 1.8 })}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={`text-[9px] font-black ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
};

const PatientLayout = () => (
  <PatientProvider>
    <PatientShell />
  </PatientProvider>
);

export default PatientLayout;
