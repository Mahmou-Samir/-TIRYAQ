import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, ShoppingBag, Clock, User, Bell, LogOut, Search, 
  Settings, Heart, ChevronLeft, LayoutGrid 
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { Magnetic } from '../home/Shared'; // 👈 استيراد الـ Magnetic لزيادة الفخامة

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;
  const [scrolled, setScrolled] = useState(false);

  // مراقبة التمرير لتصغير الـ Header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-sans transition-colors duration-500 pb-32">
      
      {/* 🟢 Header: الـ "Smart Island" العلوي */}
      <header 
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 px-6 ${
          scrolled 
          ? 'py-3 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5' 
          : 'py-8 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`relative transition-all duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full rounded-[14px] overflow-hidden border-2 border-white/20">
                    {user?.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" alt="User" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                        {user?.displayName?.charAt(0) || 'M'}
                      </div>
                    )}
                  </div>
               </div>
               <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#F8FAFC] dark:border-[#020617] rounded-full"></span>
            </div>
            
            <div className={`transition-all duration-500 ${scrolled ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100'}`}>
              <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">ترياق سيستم</p>
              <h1 className="text-slate-900 dark:text-white font-black text-lg">يا {user?.displayName?.split(' ')[0] || 'محمود'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 border border-slate-200/50 dark:border-white/10 shadow-sm hover:text-blue-600 transition-all active:scale-90">
              <Bell size={20} strokeWidth={2} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-red-500 border border-slate-200/50 dark:border-white/10 shadow-sm active:scale-90 transition-all">
              <LogOut size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* 🟢 Page Content: مع مراعاة ارتفاع الـ Header */}
      <main className="pt-32 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Outlet />
      </main>

      {/* 🟢 Bottom Navigation: الـ "Floating Island" الفاخرة */}
      <div className="fixed bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#F8FAFC] dark:from-[#020617] via-[#F8FAFC]/80 dark:via-[#020617]/80 to-transparent pointer-events-none z-[110]"></div>
      
      <nav className="fixed bottom-8 inset-x-6 z-[120] pointer-events-auto">
        <div className="max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <NavButton 
            icon={<LayoutGrid/>} 
            label="الرئيسية" 
            path="/patient" 
            active={location.pathname === '/patient'} 
          />
          
          <NavButton 
            icon={<ShoppingBag/>} 
            label="طلباتي" 
            path="/patient/orders" 
            active={location.pathname === '/patient/orders'} 
          />
          
          {/* Main Action: Search (With Magnetic Effect) */}
          <div className="relative -top-8 transition-all duration-300">
            <Magnetic strength={0.2}>
              <div className="relative group cursor-pointer" onClick={() => navigate('/patient')}>
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 group-hover:opacity-50 animate-pulse transition-opacity"></div>
                <button className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 border-[6px] border-[#F8FAFC] dark:border-[#020617] group-active:scale-90 transition-transform">
                  <Search size={30} strokeWidth={3} />
                </button>
              </div>
            </Magnetic>
          </div>

          <NavButton 
            icon={<Clock/>} 
            label="السجل" 
            path="/patient/history" 
            active={location.pathname === '/patient/history'} 
          />
          
          <NavButton 
            icon={<Settings/>} 
            label="حسابي" 
            path="/patient/profile" 
            active={location.pathname === '/patient/profile'} 
          />
          
        </div>
      </nav>

    </div>
  );
};

// --- المكون الداخلي للأزرار (تحسين الـ UX) ---
const NavButton = ({ icon, label, path, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className={`flex flex-col items-center gap-1 w-14 transition-all duration-500 ${
        active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
      }`}
    >
      <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-50 dark:bg-blue-500/10 scale-110' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
        {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 1.8 })}
      </div>
      <span className={`text-[9px] font-black transition-all duration-300 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {label}
      </span>
    </button>
  );
};

export default PatientLayout;