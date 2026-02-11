import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Navigation, Clock, Pill, ShoppingBag, LogOut, User, 
  CheckCircle2, XCircle, Loader2, Filter, Bell, ChevronRight, Home, 
  Calendar, Phone, Star, Plus, FileText, Heart, Shield, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config';
import { collection, query, getDocs } from 'firebase/firestore';

// --- Styles & Animations ---
const customStyles = `
  @keyframes fadeScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .animate-fade-scale { animation: fadeScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
  .dark .glass-card {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .active-nav-shadow { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
`;

const PatientHome = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // --- States ---
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' }); // نظام الإشعارات

  const categories = ['الكل', 'أدوية مزمنة', 'عناية', 'أطفال', 'معدات', 'فيتامينات'];

  // --- Helpers (Functions) ---
  
  // دالة لإظهار الإشعارات
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // دالة الاتصال
  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // دالة فتح الخرائط
  const handleMap = (locationName) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${locationName}`, '_blank');
  };

  // دالة الإجراءات السريعة
  const handleQuickAction = (action) => {
    switch(action) {
      case 'prescription': showToast('خاصية رفع الروشتة قريباً', 'info'); break;
      case 'favorites': showToast('تم فتح المفضلة', 'success'); break;
      case 'insurance': showToast('جاري التحقق من التأمين...', 'warning'); break;
      case 'map': handleMap('pharmacies near me'); break;
      default: break;
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) { console.error(error); }
  };

  // البحث
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const medicinesRef = collection(db, "medicines");
      const q = query(medicinesRef); 
      const querySnapshot = await getDocs(q);
      const found = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && data.name.toLowerCase().includes(term.toLowerCase())) {
          found.push({ id: doc.id, ...data });
        }
      });
      setTimeout(() => { setResults(found); setSearching(false); }, 600); 
    } catch (error) { console.error(error); setSearching(false); }
  };

  // --- Components for Tabs ---

  // 1. Home Tab Component
  const HomeView = () => (
    <div className="animate-fade-scale space-y-8">
      
      {/* Quick Actions Grid */}
      {!searching && searchTerm.length === 0 && (
        <div className="grid grid-cols-4 gap-4">
          <QuickAction onClick={() => handleQuickAction('prescription')} icon={<FileText size={22} />} label="روشتة" color="bg-orange-100 text-orange-600" />
          <QuickAction onClick={() => handleQuickAction('favorites')} icon={<Heart size={22} />} label="المفضلة" color="bg-red-100 text-red-600" />
          <QuickAction onClick={() => handleQuickAction('insurance')} icon={<Shield size={22} />} label="التأمين" color="bg-purple-100 text-purple-600" />
          <QuickAction onClick={() => handleQuickAction('map')} icon={<MapPin size={22} />} label="الخريطة" color="bg-green-100 text-green-600" />
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((cat, i) => (
          <button key={i} onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-105' 
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Results / Content */}
      <div className="min-h-[400px]">
        {searching ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card p-4 rounded-3xl animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white px-2">نتائج البحث ({results.length})</h3>
            {results.map((item) => (
              <div key={item.id} onClick={() => showToast(`تم إضافة ${item.name} للسلة`, 'success')} className="glass-card p-4 rounded-3xl flex justify-between items-center group active:scale-[0.98] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${Number(item.stock) > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                    <Pill size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-1.5">{item.category}</p>
                    {Number(item.stock) > 0 ? 
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold flex items-center w-fit gap-1"><CheckCircle2 size={10}/> متوفر</span> : 
                      <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-bold flex items-center w-fit gap-1"><XCircle size={10}/> غير متوفر</span>
                    }
                  </div>
                </div>
                <button className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><ChevronRight size={20} className="rtl:rotate-180"/></button>
              </div>
            ))}
          </div>
        ) : (
          /* Default View */
          <div className="space-y-6">
            
            {/* Banner - Functional */}
            <div onClick={() => showToast('صفحة العروض قادمة قريباً', 'info')} className="w-full h-40 rounded-[2rem] bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden flex items-center px-8 shadow-xl shadow-indigo-500/20 cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="relative z-10 text-white">
                <h3 className="text-xl font-bold mb-1">خصم 20%</h3>
                <p className="text-indigo-100 text-xs mb-3">على جميع الفيتامينات هذا الشهر</p>
                <button className="bg-white text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg">تصفح العروض</button>
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            </div>

            {/* Pharmacies List - Functional */}
            <div>
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Star size={18} className="text-yellow-500 fill-yellow-500"/> صيدليات مميزة</h3>
                <button onClick={() => showToast('عرض المزيد من الصيدليات', 'info')} className="text-xs font-bold text-blue-600 hover:underline">المزيد</button>
              </div>
              {[1, 2].map((i) => (
                <div key={i} onClick={() => showToast(`تم اختيار صيدلية العزبي فرع ${i}`, 'success')} className="glass-card p-4 mb-3 rounded-3xl flex gap-4 items-start cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
                    <img src={`https://source.unsplash.com/random/100x100?pharmacy&sig=${i}`} alt="Pharmacy" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-white/90 text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Star size={8} className="fill-yellow-500 text-yellow-500"/> 4.8</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">صيدلية العزبي - الدقي</h4>
                      <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-lg font-bold">مفتوح</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">12 شارع التحرير، بجوار محطة المترو</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={(e) => { e.stopPropagation(); handleMap('صيدلية العزبي الدقي'); }} className="flex-1 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-blue-600 hover:text-white transition-all"><Navigation size={12}/> خريطة</button>
                      <button onClick={(e) => { e.stopPropagation(); handleCall('19011'); }} className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><Phone size={12}/> اتصال</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 2. Orders Tab Component
  const OrdersView = () => (
    <div className="animate-fade-scale space-y-6 pt-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-2">طلباتي</h2>
      <div onClick={() => showToast('فتح تفاصيل الطلب #8921', 'info')} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 shadow-lg shadow-blue-500/5 relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag size={24}/></div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">أنسولين لانتوس</h3>
              <p className="text-xs text-slate-400 mt-1">طلب #8921 • اليوم 10:30 ص</p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full">جاري التوصيل</span>
        </div>
        <div className="relative pl-4 space-y-6 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
          <div className="relative"><span className="absolute -left-[21px] top-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow"></span><p className="text-xs font-bold text-slate-800 dark:text-white">تم التأكيد</p><p className="text-[10px] text-slate-400">10:30 ص</p></div>
          <div className="relative"><span className="absolute -left-[21px] top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 shadow animate-pulse"></span><p className="text-xs font-bold text-slate-800 dark:text-white">خرج للتوصيل</p><p className="text-[10px] text-slate-400">11:15 ص</p></div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex -space-x-2 rtl:space-x-reverse"><div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900"></div><div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold">+2</div></div>
          <button onClick={(e) => { e.stopPropagation(); handleMap('Live Tracking'); }} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl text-xs font-bold hover:opacity-90">تتبع السائق</button>
        </div>
      </div>
    </div>
  );

  // 3. Profile Tab Component
  const ProfileView = () => (
    <div className="animate-fade-scale pt-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden mb-6">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="relative z-10 -mt-2">
          <div className="w-24 h-24 bg-white dark:bg-slate-900 p-1.5 rounded-full mx-auto shadow-lg">
            <div className="w-full h-full bg-slate-200 rounded-full overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400"><User size={40}/></div>}
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-3">{user?.displayName || 'مستخدم جديد'}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-2 border border-slate-100 dark:border-slate-800">
        {[
          { icon: User, label: 'تعديل البيانات', action: () => showToast('تعديل البيانات قريباً') },
          { icon: MapPin, label: 'عناويني', action: () => showToast('إدارة العناوين قريباً') },
          { icon: Bell, label: 'الإشعارات', badge: '3', action: () => showToast('لا توجد إشعارات جديدة') },
          { icon: Shield, label: 'الخصوصية والأمان', action: () => showToast('سياسة الخصوصية') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <item.icon size={20} />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
              <ChevronRight size={18} className="text-slate-300 rtl:rotate-180 group-hover:text-blue-500 transition-colors"/>
            </div>
          </button>
        ))}
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
        <button onClick={handleLogout} className="w-full p-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors text-red-500">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center"><LogOut size={20}/></div>
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-32 transition-colors duration-300">
      <style>{customStyles}</style>
      
      {/* 🔮 Toast Notification System */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-orange-500' : 'bg-slate-800'} text-white`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} className="text-white/80" /> : <AlertCircle size={18} className="text-white/80" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* 🟢 Main Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 pt-safe-top pb-4 transition-all">
        <div className="px-6 pt-4 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 overflow-hidden">
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : <span className="font-bold text-lg">{user?.displayName?.charAt(0)}</span>}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">مرحباً بك</p>
              <h1 className="text-base font-black text-slate-800 dark:text-white">{user?.displayName?.split(' ')[0]}</h1>
            </div>
          </div>
          <button onClick={() => showToast('لا توجد إشعارات جديدة', 'info')} className="relative w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>

        {/* Smart Search Bar */}
        <div className="px-6">
          <div className={`bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center transition-all duration-300 ${searching ? 'shadow-lg ring-2 ring-blue-500/20' : ''}`}>
            <div className="p-2.5 text-slate-400"><Search size={20}/></div>
            <input 
              type="text" 
              placeholder="ابحث عن دواء، أعراض، صيدلية..." 
              className="flex-1 bg-transparent h-10 outline-none text-slate-800 dark:text-white font-bold text-sm placeholder:font-normal placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => { handleSearch(e.target.value); setActiveTab('home'); }}
            />
            {searching ? <Loader2 className="animate-spin text-blue-600 mr-3" size={18} /> : 
              <button onClick={() => setShowFilter(!showFilter)} className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm hover:scale-105 transition-transform"><Filter size={16} className="text-slate-600 dark:text-slate-300"/></button>
            }
          </div>
        </div>
      </div>

      {/* 🟢 Filter Panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out px-6 ${showFilter ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
          <button onClick={() => setShowFilter(false)} className="absolute top-2 left-2 text-slate-400 hover:text-red-500"><X size={16}/></button>
          <p className="text-xs font-bold text-slate-500 mb-2">نطاق البحث</p>
          <div className="flex gap-2">
            {['القاهرة', 'الجيزة', 'الإسكندرية'].map(city => <button key={city} onClick={() => showToast(`تم تحديد ${city}`, 'success')} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">{city}</button>)}
          </div>
        </div>
      </div>

      {/* 🟢 Dynamic Content */}
      <div className="px-6 pt-6">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'history' && <div className="flex flex-col items-center justify-center pt-20 text-slate-400"><Clock size={40} className="mb-4 opacity-50"/><p className="font-bold">سجل العمليات فارغ</p></div>}
      </div>

      {/* 🟢 Premium Floating Bottom Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="glass-card rounded-[2rem] p-2 flex justify-between items-center shadow-2xl shadow-blue-900/10 dark:shadow-black/50">
          <NavButton icon={Home} label="الرئيسية" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={ShoppingBag} label="طلباتي" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          
          <div className="relative -top-8 group cursor-pointer" onClick={() => { setActiveTab('home'); document.querySelector('input')?.focus(); }}>
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <button className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl relative z-10 transition-transform duration-300 group-hover:-translate-y-2 group-active:scale-95 border-4 border-white dark:border-slate-950">
              <Plus size={32} />
            </button>
          </div>

          <NavButton icon={Clock} label="السجل" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavButton icon={User} label="حسابي" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </div>

    </div>
  );
};

// --- Sub-Components ---
const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-14 h-14 justify-center rounded-2xl transition-all duration-300 ${
      active ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 translate-y-[-4px] active-nav-shadow' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    <Icon size={active ? 24 : 22} strokeWidth={active ? 2.5 : 2} />
    {active && <span className="text-[9px] font-extrabold animate-fade-scale">{label}</span>}
  </button>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{label}</span>
  </button>
);

export default PatientHome;