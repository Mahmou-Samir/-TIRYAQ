import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Store, Upload, ShoppingCart, LogOut, LayoutGrid, Bell, Search, User 
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const PharmacyLayout = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { path: '/pharmacy', name: 'نظرة عامة', icon: <LayoutGrid size={20} /> },
    { path: '/pharmacy/stock', name: 'مخزوني', icon: <Store size={20} /> },
    { path: '/pharmacy/upload', name: 'رفع شيت إكسيل', icon: <Upload size={20} /> },
    { path: '/pharmacy/orders', name: 'طلبات التوريد', icon: <ShoppingCart size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-cairo text-right" dir="rtl">
      
      {/* Sidebar للصيدلية */}
      <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white ml-3">
            <Store size={18} />
          </div>
          <h1 className="font-bold text-lg text-slate-800">بوابة الصيدليات</h1>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              end={item.path === '/pharmacy'}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold">
            <LogOut size={20} /> تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header للصيدلية */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="بحث في مخزون الصيدلية..." className="w-full bg-slate-50 border-none rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 relative bg-slate-50 rounded-xl hover:bg-slate-100">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-800">صيدلية د. محمود</p>
                <p className="text-xs text-slate-500">فرع المعادي</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 border-2 border-white shadow-sm">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PharmacyLayout;