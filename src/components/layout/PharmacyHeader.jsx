import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, Search, ChevronDown, 
  Sun, Moon, Maximize, Minimize, Command, 
  LogOut, User, Settings, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { usePharmacy } from '../../context/PharmacyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const PharmacyHeader = ({ toggleSidebar, pageTitle, pageSubtitle }) => {
  const { theme, toggleTheme, lang, changeLanguage, t } = useSettings();
  const { notifications, unreadCount, markAllRead, markRead } = usePharmacy();
  const navigate = useNavigate();
  
  // 1. استخراج بيانات المستخدم الفعلي
  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || uiText.pharmacist || (lang === 'ar' ? 'صيدلي' : 'Pharmacist');
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = currentUser?.email || '';

  // States
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notifications', 'profile', or null
  
  const searchInputRef = useRef(null);

  // 🛡️ حماية الترجمة (Safe UI Texts)
  const uiText = t?.pharmacy?.header || {};

  // 2. اختصار الكيبورد (Cmd/Ctrl + K) للبحث
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. تنفيذ البحث عند الضغط على Enter وتوجيهه لصفحة المخزون
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue.trim() !== '') {
      navigate(`/pharmacy/inventory?q=${encodeURIComponent(searchValue)}`);
      setSearchFocused(false);
      setSearchValue('');
      searchInputRef.current?.blur();
    }
  };

  // 4. منطق ملء الشاشة (Fullscreen)
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // 5. تسجيل الخروج
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Toggle Dropdowns
  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Dropdown Animation Variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95, pointerEvents: 'none' },
    visible: { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto', transition: { type: "spring", stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 15, scale: 0.95, pointerEvents: 'none', transition: { duration: 0.2 } }
  };

  return (
    <header className="h-24 px-6 md:px-8 flex items-center justify-between bg-white/70 dark:bg-[#0b1121]/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-[100] transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🌑 Overlay لإغلاق القوائم المنسدلة عند النقر خارجها */}
      {activeDropdown && (
        <div className="fixed inset-0 z-[90] bg-transparent" onClick={() => setActiveDropdown(null)} />
      )}

      {/* 🟢 1. القسم الأول: زر القائمة الجانبية ومسار الصفحة */}
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleSidebar} 
          className="p-3 rounded-2xl bg-white dark:bg-white/5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/5 transition-all active:scale-90 hover:shadow-emerald-500/10 hover:shadow-lg outline-none"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            <span className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => navigate('/pharmacy')}>
              {t?.pharmacy?.layout?.breadcrumb || 'Pharmacy'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-600 dark:text-emerald-400">{t?.pharmacy?.layout?.workspace || 'Workspace'}</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none flex items-center gap-2">
            {pageTitle || uiText.title || (lang === 'ar' ? 'مركز العمليات' : 'Command Center')}
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
          </h2>
          {pageSubtitle && (
            <p className="text-xs text-slate-400 font-medium mt-1 hidden lg:block">{pageSubtitle}</p>
          )}
        </div>
      </div>

      {/* 🟢 2. القسم الأوسط: محرك البحث الذكي */}
      <div 
        className={`hidden xl:flex items-center w-[480px] transition-all duration-300 ${
          isSearchFocused 
            ? 'bg-white dark:bg-slate-900 shadow-2xl shadow-emerald-500/20 border-emerald-500 ring-4 ring-emerald-500/10 scale-105' 
            : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900'
        } border rounded-2xl px-4 py-3.5 group relative z-[100]`}
      >
        <Search 
          size={20} 
          className={`transition-colors duration-300 ${isSearchFocused ? 'text-emerald-500' : 'text-slate-400'}`} 
        />
        <input 
          ref={searchInputRef}
          type="text" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder={uiText.search || (lang === 'ar' ? "ابحث عن دواء، أو طلب (#123)..." : "Search medicine or order...")} 
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-white w-full px-4 placeholder:font-medium placeholder:text-slate-400"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-black transition-colors ${isSearchFocused ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 border-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}>
          <Command size={10} /> <span>K</span>
        </div>
      </div>

      {/* 🟢 3. القسم الأخير: أدوات النظام والبروفايل */}
      <div className="flex items-center gap-3 sm:gap-4 relative z-[100]">
        
        {/* أزرار التحكم السريعة */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/5 backdrop-blur-md">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-amber-500 transition-all active:scale-90 outline-none" title={lang === 'ar' ? 'المظهر' : 'Theme'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/10 mx-1"></div>
          
          <button onClick={() => changeLanguage(lang === 'ar' ? 'en' : 'ar')} className="p-2.5 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-500 transition-all active:scale-90 font-black text-xs w-10 outline-none">
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/10 mx-1"></div>
          <button onClick={toggleFullScreen} className="hidden sm:block p-2.5 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-purple-500 transition-all active:scale-90 outline-none" title={lang === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

        {/* 🔔 الإشعارات (Dropdown) */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown('notifications')}
            className={`relative p-3.5 rounded-2xl border transition-all duration-300 outline-none ${activeDropdown === 'notifications' ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 text-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200/50 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'} shadow-sm`}
          >
            <Bell size={20} className={activeDropdown === 'notifications' ? 'fill-emerald-600' : ''} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {activeDropdown === 'notifications' && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className={`absolute top-full mt-4 w-80 md:w-96 bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl z-[110] ${lang === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
              >
                <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                  <h3 className="font-black text-slate-800 dark:text-white">
                    {uiText.notifications || (lang === 'ar' ? 'الإشعارات' : 'Notifications')}
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full mx-2">{unreadCount}</span>
                    )}
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      {uiText.markAllRead || (lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read')}
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 font-medium py-8">
                      {uiText.noNotifications || (lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications')}
                    </p>
                  ) : notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative"
                      onClick={() => { markRead(n.id); navigate('/pharmacy/orders'); setActiveDropdown(null); }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {uiText.newOrder || 'New order'} {n.orderId}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          {n.patientName || uiText.pharmacist} · {n.createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.read && (
                        <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full ${lang === 'ar' ? 'left-4' : 'right-4'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 👤 قائمة المستخدم (Profile Dropdown) - تعمل بنسبة 100% */}
        <div className="relative">
          <button 
            onClick={() => toggleDropdown('profile')}
            className={`flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-[1.2rem] border transition-all cursor-pointer group outline-none ${activeDropdown === 'profile' ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500/50' : 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-white/5 hover:border-emerald-500/30'}`}
          >
            <div className={`text-left hidden lg:block ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-emerald-500 transition-colors">
                 {uiText.pharmacy || (lang === 'ar' ? 'الصيدلية' : 'Pharmacy')}
              </p>
              <div className="flex items-center gap-1 justify-end">
                <p className="text-sm font-black text-slate-800 dark:text-white leading-none mt-0.5 truncate max-w-[90px]">{displayName}</p>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
            </div>
            
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg flex items-center justify-center text-white font-black text-lg">
               <div className="w-full h-full bg-white/20 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
                 {userInitial}
               </div>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${activeDropdown === 'profile' ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>

          <AnimatePresence>
            {activeDropdown === 'profile' && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className={`absolute top-full mt-4 w-64 bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden backdrop-blur-3xl z-[110] ${lang === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'}`}
              >
                <div className="p-6 border-b border-slate-100 dark:border-white/5 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 mb-3 shadow-lg flex items-center justify-center text-white font-black text-3xl">
                     {userInitial}
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white text-lg truncate">{displayName}</h4>
                  <p className="text-xs text-slate-500 font-bold truncate mt-1">{userEmail}</p>
                </div>
                
                {/* 👇 الأزرار الفعالة للتنقل 👇 */}
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { navigate('/pharmacy/profile'); setActiveDropdown(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm transition-colors outline-none"
                  >
                    <User size={18}/> {uiText.profile || (lang === 'ar' ? 'الملف الشخصي' : 'Profile')}
                  </button>
                  
                  <button 
                    onClick={() => { navigate('/pharmacy/settings'); setActiveDropdown(null); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm transition-colors outline-none"
                  >
                    <Settings size={18}/> {t?.settings || (lang === 'ar' ? 'إعدادات النظام' : 'Settings')}
                  </button>
                  
                  <div className="h-[1px] bg-slate-100 dark:bg-white/5 my-1 mx-2"></div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-bold text-sm transition-colors outline-none group"
                  >
                    <LogOut size={18} className={`group-hover:scale-110 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`}/> 
                    {t?.logout || (lang === 'ar' ? 'تسجيل الخروج' : 'Logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default PharmacyHeader;