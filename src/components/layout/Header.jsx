import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Globe, Search, Bell, User, LogOut, Settings, 
  Menu, Command, ChevronDown, X, AlertCircle, Clock, CheckCircle2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

const Header = ({ toggleSidebar }) => {
  // ✅ تم التعديل: استخدام changeLanguage بدلاً من toggleLang
  const { theme, toggleTheme, lang, changeLanguage, t } = useSettings();
  const navigate = useNavigate();
  const auth = getAuth();
  
  // States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = auth.currentUser;
  const displayName = user?.displayName || 'Admin User';
  const photoURL = user?.photoURL;

  // 1. Fetch Real-time Notifications
  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timeString: doc.data().createdAt?.toDate().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          hour: '2-digit', minute: '2-digit'
        })
      }));
      setNotifications(activeAlerts);
      setUnreadCount(activeAlerts.length);
    });
    return () => unsubscribe();
  }, [lang]);

  // 2. Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) { console.error("Logout Error:", error); }
  };

  // ✅ 3. دالة تبديل اللغة
  const handleToggleLang = () => {
    changeLanguage(lang === 'ar' ? 'en' : 'ar');
  };

  // 4. Click Outside Handler (Close Dropdowns)
  const wrapperRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Framer Motion Variants for Dropdowns
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <header 
      ref={wrapperRef} 
      className="h-24 sticky top-0 z-50 w-full px-6 md:px-10 flex items-center justify-between
      bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 transition-colors duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-none"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* 🟢 القسم الأيسر/الأيمن: القائمة الجانبية والبحث */}
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        
        {/* Mobile Menu Button */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar} 
          className="lg:hidden p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-white/5 text-slate-500 hover:text-blue-600 transition-colors shadow-sm"
        >
          <Menu size={22} strokeWidth={2.5} />
        </motion.button>

        {/* 🔍 Smart Search Bar */}
        <div className="relative hidden md:block w-full max-w-md">
          <motion.div 
            animate={{ 
              width: isSearchOpen ? '100%' : '280px',
              backgroundColor: isSearchOpen ? (theme === 'dark' ? '#0f172a' : '#ffffff') : (theme === 'dark' ? '#1e293b80' : '#f8fafc'),
              borderColor: isSearchOpen ? '#3b82f6' : 'transparent',
              boxShadow: isSearchOpen ? '0 10px 25px -5px rgba(59, 130, 246, 0.2)' : 'none'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center px-4 h-12 rounded-[1.2rem] border-2 transition-colors relative z-10 group"
          >
            <Search className={`w-5 h-5 transition-colors ${isSearchOpen ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'}`} />
            
            <input 
              type="text" 
              placeholder={lang === 'ar' ? "ابحث هنا (دواء، مريض، بلاغ)..." : "Search (Medicine, Patient, Alert)..."}
              value={searchValue}
              onChange={(e) => {setSearchValue(e.target.value); setIsSearchOpen(e.target.value.length > 0);}}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-transparent border-none outline-none px-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-bold"
            />
            
            <AnimatePresence mode="wait">
              {!isSearchOpen ? (
                <motion.div 
                  key="shortcut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <Command size={12} className="text-slate-400"/>
                  <span className="text-[10px] font-black text-slate-400">K</span>
                </motion.div>
              ) : (
                <motion.button 
                  key="close" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {setSearchValue(''); setIsSearchOpen(false)}}
                  className="p-1 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                >
                  <X size={14} strokeWidth={3}/>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 🟢 القسم الآخر: أدوات التحكم والبروفايل */}
      <div className="flex items-center gap-4">
        
        {/* Quick Tools Capsule */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-sm">
          
          {/* ✅ زر تغيير اللغة المُعدّل */}
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleToggleLang} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors flex items-center justify-center font-black text-xs w-9 h-9">
            {lang === 'ar' ? 'EN' : 'ع'}
          </motion.button>
          
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            {theme === 'dark' ? <Moon size={18} strokeWidth={2.5} className="text-purple-400"/> : <Sun size={18} strokeWidth={2.5} className="text-orange-400"/>}
          </motion.button>

          {/* 🔔 Notifications */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} 
              className={`p-2.5 rounded-xl transition-colors relative ${showNotifications ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
            >
              <Bell size={18} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                  className={`absolute top-14 ${lang === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} w-[calc(100vw-48px)] sm:w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-50`}
                >
                  <div className="p-5 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md">
                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {lang === 'ar' ? 'استغاثات النظام' : 'System Alerts'} 
                      {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md">{unreadCount}</span>}
                    </h3>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-blue-500 bg-blue-50 dark:bg-blue-500/10 p-1.5 rounded-lg"><CheckCircle2 size={16} strokeWidth={3}/></motion.button>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto hide-scrollbar">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => { navigate('/admin/alerts'); setShowNotifications(false); }}
                        className="p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex gap-4">
                          <div className="shrink-0 p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                            <AlertCircle size={20} strokeWidth={2}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{notif.governorate}</span>
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock size={10}/> {notif.timeString}</span>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                              {lang === 'ar' ? `نقص حاد: ${notif.drug}` : `Critical: ${notif.drug}`}
                            </p>
                            <p className="text-xs text-slate-500 font-medium mt-1 truncate">{notif.hospital}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center flex flex-col items-center gap-3 text-slate-400">
                         <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2"><CheckCircle2 size={32} strokeWidth={2}/></div>
                         <p className="font-black text-slate-800 dark:text-white">{lang === 'ar' ? 'المنظومة مستقرة' : 'All systems clear'}</p>
                         <p className="text-xs">{lang === 'ar' ? 'لا توجد بلاغات نواقص حالياً.' : 'No active shortage reports.'}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { navigate('/admin/alerts'); setShowNotifications(false); }}
                    className="w-full p-4 text-xs font-black text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-50 dark:border-white/5"
                  >
                    {lang === 'ar' ? 'الذهاب لغرفة العمليات' : 'Go to Command Center'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 🟢 Profile Button & Dropdown */}
        <div className="relative">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} 
            className="flex items-center gap-3 p-1.5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 hover:border-blue-500/50 shadow-sm transition-all group outline-none"
          >
            <div className="w-11 h-11 rounded-[1.2rem] bg-gradient-to-tr from-blue-600 to-indigo-700 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[1rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-white/20 transition-all">
                {photoURL ? (
                  <img src={photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-lg text-blue-600">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            
            <div className="text-right hidden sm:block pl-2">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{displayName.split(' ')[0]}</p>
              <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">Admin OS</p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ml-1 ${showProfileMenu ? 'rotate-180' : ''}`} strokeWidth={3} />
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                className={`absolute top-16 ${lang === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} w-72 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/10 p-3 z-50`}
              >
                <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] mb-3 border border-slate-100 dark:border-white/5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-2xl shadow-inner border border-blue-100 dark:border-blue-900/30">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-slate-900 dark:text-white truncate text-base mb-1">{displayName}</p>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button onClick={() => { navigate('/admin/profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all group">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors"><User size={18} /></div>
                    {t?.profile || 'الملف الشخصي'}
                  </button>
                  <button onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all group">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors"><Settings size={18} /></div>
                    {t?.settings || 'إعدادات النظام'}
                  </button>
                </div>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-3 mx-4"></div>
                
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group">
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform"><LogOut size={18} /></div>
                  {t?.logout || 'تسجيل الخروج'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Header;