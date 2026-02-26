import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Sun, Moon, Globe, Menu, X, 
  LogOut, Settings, Bell, LayoutDashboard,
  CheckCircle2, Clock, Truck
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Navbar = () => {
  const navigate = useNavigate();
  // ✅ التعديل هنا: استخدام changeLanguage بدلاً من toggleLang
  const { theme, toggleTheme, lang, changeLanguage, t } = useSettings();
  const auth = getAuth();
  
  // States
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const menuRef = useRef(null);

  // Nav Links
  const navLinks = [
    { id: 'features', label: t?.home?.nav?.features || 'المميزات' },
    { id: 'about', label: t?.home?.nav?.about || 'عن النظام' },
    { id: 'app', label: t?.home?.nav?.app || 'التطبيق' },
    { id: 'testimonials', label: t?.home?.testimonials?.title || 'آراء العملاء' },
  ];

  // Notifications Mock
  const notifications = [
    { id: 1, title: 'تم تأكيد طلبك #921', time: 'منذ دقيقتين', icon: <CheckCircle2 size={16} className="text-green-500"/> },
    { id: 2, title: 'السائق في الطريق إليك', time: 'منذ 15 دقيقة', icon: <Truck size={16} className="text-blue-500"/> },
    { id: 3, title: 'تذكير: موعد الدواء', time: 'منذ ساعة', icon: <Clock size={16} className="text-orange-500"/> },
  ];

  // Effects
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) setUserRole(docSnap.data().role);
        } catch (e) { console.error(e); }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    const paths = { admin: '/admin', pharmacy: '/pharmacy', patient: '/patient' };
    navigate(paths[userRole] || '/patient');
  };

  // ✅ التبديل السريع للغة
  const handleToggleLang = () => {
    changeLanguage(lang === 'ar' ? 'en' : 'ar');
  };

  // Nav Item Component
  const NavItem = ({ to, label, mobile }) => (
    <a 
      href={`#${to}`}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`font-bold transition-all duration-200 ${
        mobile 
        ? 'block w-full py-4 text-lg border-b border-slate-100 dark:border-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5 px-4' 
        : 'text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      {label}
    </a>
  );

  return (
    <>
      {/* 🟢 1. الـ Navbar الأساسي (Fixed Top) */}
      <nav 
        className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 ${
          scrolled || isMobileMenuOpen
          ? 'bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 py-3 shadow-sm' 
          : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer z-[101] group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Activity size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {t?.appTitle || (lang === 'ar' ? 'ترياق' : 'Tiryaq')}
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-full border border-slate-200/50 dark:border-white/5">
            {navLinks.map(link => (
              <NavItem key={link.id} to={link.id} label={link.label} />
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3" ref={menuRef}>
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleToggleLang} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95 flex items-center justify-center font-black text-xs w-9 h-9">
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Notifications Icon (Desktop) */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'notif' ? null : 'notif')}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 rounded-full relative transition-colors"
                  >
                    <Bell size={20} className={activeDropdown === 'notif' ? 'text-blue-600 dark:text-blue-400' : ''} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  {/* Notification Dropdown */}
                  {activeDropdown === 'notif' && (
                    <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden z-[102]">
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 font-bold text-sm dark:text-white flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                        {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">3 جديد</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="p-3 border-b border-slate-50 dark:border-white/5 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="mt-1">{n.icon}</div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu (Desktop) */}
                <div className="relative">
                  <button onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-white max-w-[80px] truncate">
                      {currentUser.displayName?.split(' ')[0]}
                    </span>
                  </button>
                  {/* User Dropdown */}
                  {activeDropdown === 'user' && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden z-[102]">
                      <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <p className="font-bold text-slate-900 dark:text-white">{currentUser.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button onClick={handleDashboardRedirect} className="w-full flex items-center gap-3 p-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors rounded-xl">
                          <LayoutDashboard size={18} className="text-blue-500"/> {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-xl">
                          <LogOut size={18} /> {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                  {t?.home?.nav?.login || 'دخول'}
                </button>
                <button onClick={() => navigate('/register')} className="px-5 py-2 text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
                  {t?.home?.nav?.start || 'ابدأ الآن'}
                </button>
              </div>
            )}
          </div>

          {/* 🟢 Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white z-[101] active:scale-95 transition-transform"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </nav>

      {/* 🟢 2. Mobile Menu Overlay (Full Screen Fix) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] bg-white dark:bg-[#0B1120] pt-24 px-6 overflow-y-auto h-screen animate-fade-in flex flex-col">
          
          <div className="flex flex-col gap-2 mb-8 flex-1">
            {navLinks.map((item) => (
              <NavItem key={item.id} to={item.id} label={item.label} mobile />
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="border-t border-slate-100 dark:border-white/10 pt-6 pb-10 space-y-6">
            
            {/* Theme & Lang Controls */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={toggleTheme} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-white/5 font-bold text-slate-700 dark:text-white active:scale-95 transition-transform">
                {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>} {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button onClick={handleToggleLang} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-white/5 font-bold text-slate-700 dark:text-white active:scale-95 transition-transform">
                <Globe size={18}/> {lang === 'ar' ? 'English' : 'عربي'}
              </button>
            </div>

            {/* Auth Buttons / User Profile */}
            {currentUser ? (
              <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.displayName}</p>
                    <p className="text-xs text-slate-500 truncate uppercase tracking-widest">{userRole}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button onClick={handleDashboardRedirect} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                    <LayoutDashboard size={18}/> {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                  </button>
                  <button onClick={handleLogout} className="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <LogOut size={18}/> {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-8">
                <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full py-4 rounded-xl border-2 border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all">
                  {t?.home?.nav?.login || 'دخول'}
                </button>
                <button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-xl active:scale-95 transition-all">
                  {t?.home?.nav?.start || 'ابدأ الآن'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;