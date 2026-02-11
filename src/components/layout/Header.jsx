import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Globe, Search, Bell, User, LogOut, Settings, 
  Menu, Command, ChevronDown, X, AlertCircle, Clock, CheckCircle2
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";

// Firebase
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

const Header = ({ toggleSidebar }) => {
  const { theme, toggleTheme, lang, toggleLang, t } = useSettings();
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

  // الاستماع للإشعارات الحية (Real-time Alerts)
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) { console.error(error); }
  };

  // إغلاق القوائم عند النقر الخارج
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

  return (
    <header 
      ref={wrapperRef} 
      className="h-20 sticky top-0 z-50 w-full px-4 md:px-8 flex items-center justify-between
      bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 transition-all duration-300"
    >
      
      {/* 🟢 القسم الأيسر: التحكم والبحث */}
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* شريط البحث الاحترافي */}
        <div className="relative hidden md:block w-full max-w-md group">
          <div className={`flex items-center px-4 h-11 rounded-2xl transition-all duration-300 border 
            ${isSearchOpen 
              ? 'bg-white dark:bg-slate-800 border-blue-500 ring-4 ring-blue-500/10 shadow-lg' 
              : 'bg-gray-100/50 dark:bg-slate-800/40 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
            
            <Search className={`w-4 h-4 transition-colors ${isSearchOpen ? 'text-blue-500' : 'text-gray-400'}`} />
            
            <input 
              type="text" 
              placeholder={lang === 'ar' ? "بحث عن دواء، بلاغ، أو محافظة..." : "Search medicines, alerts..."}
              value={searchValue}
              onChange={(e) => {setSearchValue(e.target.value); setIsSearchOpen(e.target.value.length > 0);}}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-transparent border-none outline-none px-3 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium"
            />
            
            {!isSearchOpen && (
              <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                <Command size={10} className="text-gray-400"/>
                <span className="text-[10px] font-bold text-gray-400">K</span>
              </div>
            )}
            {isSearchOpen && <button onClick={() => {setSearchValue(''); setIsSearchOpen(false)}}><X size={14} className="text-gray-400 hover:text-red-500"/></button>}
          </div>
        </div>
      </div>

      {/* 🟢 القسم الأيمن: الإشعارات والبروفايل */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* كبسولة الأزرار */}
        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-slate-800/40 p-1 rounded-2xl border border-gray-200/30 dark:border-slate-700/30">
          
          {/* اللغة */}
          <button onClick={toggleLang} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-all hover:text-blue-500">
            <Globe size={18} />
          </button>
          
          {/* الثيم */}
          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-all hover:text-orange-500">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* 🔔 الإشعارات الذكية */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} 
              className={`p-2.5 rounded-xl transition-all relative 
              ${showNotifications ? 'bg-blue-600 text-white shadow-blue-500/20 shadow-lg' : 'hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-14 left-0 md:left-auto md:-right-2 w-[calc(100vw-32px)] md:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50">
                <div className="p-5 border-b border-gray-50 dark:border-slate-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/80 backdrop-blur-sm">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {lang === 'ar' ? 'استغاثات عاجلة' : 'Emergency Alerts'} 
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                  </h3>
                  <CheckCircle2 size={16} className="text-blue-500 cursor-pointer hover:scale-110 transition-transform" />
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                      className="p-4 border-b border-gray-50 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0 p-2.5 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600">
                          <AlertCircle size={18}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-1.5 rounded-md">{notif.governorate}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium"><Clock size={10}/> {notif.timeString}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 truncate transition-colors">
                            {lang === 'ar' ? `نقص: ${notif.drug}` : `Shortage: ${notif.drug}`}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{notif.hospital}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                       <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500">
                          <CheckCircle2 size={32}/>
                       </div>
                       <p className="text-sm font-medium text-gray-400">{lang === 'ar' ? 'جميع البلاغات مكتملة' : 'All clear'}</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => { navigate('/alerts'); setShowNotifications(false); }}
                  className="w-full p-4 text-xs font-black text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700/50"
                >
                  {lang === 'ar' ? 'غرفة العمليات المركزية' : 'View Command Center'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🟢 البروفايل الفاخر */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} 
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700/50"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-[2px] shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden -rotate-3 group-hover:rotate-0 transition-transform">
                  {photoURL ? (
                    <img src={photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-blue-600">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-800 dark:text-gray-100 leading-none mb-1">{displayName.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute top-14 left-0 w-72 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-700 p-3 animate-in fade-in zoom-in-95 origin-top-left z-50">
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-700/50 rounded-[1.5rem] mb-2 flex items-center gap-4 border border-gray-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-gray-800 dark:text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold truncate tracking-tight">{user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-1 px-1">
                <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all">
                  <div className="p-2 bg-gray-100 dark:bg-slate-900 rounded-lg"><User size={16} /></div>
                  {t.profile}
                </button>
                <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all">
                  <div className="p-2 bg-gray-100 dark:bg-slate-900 rounded-lg"><Settings size={16} /></div>
                  {t.settings}
                </button>
              </div>
              
              <div className="h-px bg-gray-100 dark:bg-slate-700 my-2 mx-4"></div>
              
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group">
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                {t.logout}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;