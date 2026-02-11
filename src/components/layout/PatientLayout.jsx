import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Clock, User, Bell, LogOut, Search } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

// --- Custom Styles (للشريط الزجاجي والأنميشن) ---
const customStyles = `
  .glass-nav {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255, 255, 255, 0.4);
  }
  .dark .glass-nav {
    background: rgba(15, 23, 42, 0.9);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
`;

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-28 transition-colors duration-300">
      <style>{customStyles}</style>
      
      {/* 🟢 Header (يظهر في جميع الصفحات) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-xl shadow-blue-900/20 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} className="w-full h-full object-cover" alt="User" />
              ) : (
                <User size={24} />
              )}
            </div>
            <div>
              <p className="text-blue-200 text-xs font-medium mb-0.5">مرحباً بك 👋</p>
              <h1 className="text-lg font-bold">{user?.displayName?.split(' ')[0] || 'ضيف'}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-indigo-600"></span>
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 Page Content (هنا يتم عرض الصفحات الفرعية) */}
      <div className="-mt-10 relative z-20 px-6">
        <Outlet />
      </div>

      {/* 🟢 Bottom Navigation (عائم وثابت) */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="glass-nav rounded-3xl p-2.5 flex justify-between items-center shadow-2xl shadow-blue-900/10 dark:shadow-black/50">
          
          <NavButton 
            icon={<Home size={22}/>} 
            label="الرئيسية" 
            path="/patient" 
            active={location.pathname === '/patient'} 
          />
          
          <NavButton 
            icon={<ShoppingBag size={22}/>} 
            label="طلباتي" 
            path="/patient/orders" 
            active={location.pathname === '/patient/orders'} 
          />
          
          {/* Main Action Button (Search) */}
          <div className="relative -top-8 group cursor-pointer" onClick={() => navigate('/patient')}>
            <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <button className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl relative z-10 transition-transform group-hover:-translate-y-1 group-active:scale-95 border-4 border-white dark:border-slate-950">
              <Search size={28} />
            </button>
          </div>

          <NavButton 
            icon={<Clock size={22}/>} 
            label="السجل" 
            path="/patient/history" 
            active={location.pathname === '/patient/history'} 
          />
          
          <NavButton 
            icon={<User size={22}/>} 
            label="حسابي" 
            path="/patient/profile" 
            active={location.pathname === '/patient/profile'} 
          />
          
        </div>
      </div>

    </div>
  );
};

// Helper Component for Navigation Buttons
const NavButton = ({ icon, label, path, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-2xl transition-all duration-300 ${
        active 
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-[-4px]' 
        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      {icon}
      {active && <span className="text-[9px] font-bold animate-fade-in">{label}</span>}
    </button>
  );
};

export default PatientLayout;