import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, MapPin, Clock, Pill, ShoppingBag, User, 
  CheckCircle2, XCircle, Loader2, Filter, Bell, ChevronRight, Home, 
  Plus, FileText, Heart, X, AlertCircle, Phone, ShoppingCart, Info,
  Trash2, Minus, ArrowRight, Camera, Upload, CreditCard, Settings, Navigation, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
const CATEGORIES = ['الكل', 'أدوية مزمنة', 'عناية', 'أطفال', 'فيتامينات'];
const DELIVERY_FEE = 15;

// --- Utility Components ---

const QuickAction = ({ icon, label, color, action }) => (
  <motion.button 
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={action} 
    className="flex flex-col items-center gap-2.5 group"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-sm border border-white/20 transition-all duration-300 group-hover:shadow-lg`}>
      {React.cloneElement(icon, { size: 26, strokeWidth: 1.5 })}
    </div>
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
  </motion.button>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 w-14 transition-all duration-300 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
  >
    <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.8 })}
    </div>
    <span className={`text-[9px] font-black transition-all ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>{label}</span>
  </button>
);

const MedicineCard = ({ item, onSelect, onAdd, isFavorite, onToggleFavorite }) => {
  const isOutOfStock = Number(item.stock) <= 0;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(item)} 
      className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${!isOutOfStock ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'} dark:bg-opacity-10`}>
          <Pill size={32} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-black text-slate-800 dark:text-white text-base">{item.name}</h3>
          <p className="text-[11px] text-slate-400 mb-2">{item.category}</p>
          <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black w-fit flex items-center gap-1.5 ${!isOutOfStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} dark:bg-opacity-20`}>
            {!isOutOfStock ? <CheckCircle2 size={10}/> : <XCircle size={10}/>}
            {!isOutOfStock ? 'متوفر' : 'غير متوفر'}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <button 
          onClick={(event) => { event.stopPropagation(); onToggleFavorite(item.id); }}
          className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-300 hover:text-rose-400'}`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <motion.button 
          whileTap={{ scale: 0.8 }}
          disabled={isOutOfStock}
          onClick={(event) => { event.stopPropagation(); onAdd(item); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'}`}
        >
          <Plus size={20} strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
      </div>
    </div>
    <div className="flex flex-col items-end gap-3">
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
    </div>
  </div>
);

// --- Custom Hooks ---

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Main Component ---

const PatientSearch = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // --- States ---
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [allMedicines, setAllMedicines] = useState([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  
  // Storage States
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('teryaq_cart') || '[]'));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('teryaq_favs') || '[]'));
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('teryaq_orders') || '[]'));
  
  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Core Variables
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('كاش (الدفع عند الاستلام)');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "medicines"));
        const data = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          price: doc.data().price || Math.floor(Math.random() * 200) + 20,
          description: doc.data().description || "هذا الدواء يستخدم لعلاج الحالات المرضية المختلفة تحت إشراف طبي.",
          dosage: doc.data().dosage || "قرص واحد مرتين يومياً",
          ...doc.data() 
        }));
        setAllMedicines(data);
      } catch (err) { 
        console.error("Fetch error:", err);
        // Mock data on failure
        setAllMedicines([
          { id: '1', name: 'باندول اكسترا', category: 'أدوية مزمنة', stock: 10, price: 45, description: 'مسكن للألم وخافض للحرارة.', dosage: 'قرص كل 6 ساعات' },
          { id: '2', name: 'كونجستال', category: 'أطفال', stock: 5, price: 30, description: 'لعلاج أعراض البرد والأنفلونزا.', dosage: '5 مل 3 مرات يومياً' },
          { id: '3', name: 'فيتامين سي', category: 'فيتامينات', stock: 0, price: 85, description: 'مكمل غذائي لتعزيز المناعة.', dosage: 'قرص فوار يومياً' },
          { id: '4', name: 'أوميبرازول', category: 'أدوية مزمنة', stock: 15, price: 60, description: 'لعلاج حموضة المعدة وقرحة الاثني عشر.', dosage: 'قرص قبل الإفطار' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync with LocalStorage
  useEffect(() => { localStorage.setItem('teryaq_favs', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('teryaq_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('teryaq_orders', JSON.stringify(orders)); }, [orders]);

  // Advanced Filtering
  const filteredResults = useMemo(() => {
    let filtered = allMedicines;
    if (activeCategory !== 'الكل') {
      filtered = filtered.filter(m => m.category === activeCategory);
    }
    if (debouncedSearch) {
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        m.category?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    return (debouncedSearch || activeCategory !== 'الكل') ? filtered : [];
  }, [debouncedSearch, activeCategory, allMedicines]);

  // --- Handlers ---
  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  const addToCart = (item) => {
    if (Number(item.stock) <= 0) {
      showToast('عذراً، هذا الدواء غير متوفر حالياً', 'warning');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          showToast('وصلت للحد الأقصى المتاح من هذا الدواء', 'warning');
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`تم إضافة ${item.name} إلى السلة`, 'success');
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > item.stock) {
          showToast('لا يوجد مخزون كافٍ', 'warning');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]);
    showToast(!favorites.includes(id) ? 'تمت الإضافة للمفضلة ❤️' : 'تم الحذف من المفضلة', 'info');
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      items: [...cart],
      total: cartTotal + DELIVERY_FEE,
      status: 'جاري التجهيز',
      date: new Date().toLocaleString('ar-EG'),
      timestamp: Date.now(),
      payment: paymentMethod
    };

    try {
      await addDoc(collection(db, "orders"), {
        ...newOrder,
        userId: user?.uid || 'guest',
        createdAt: serverTimestamp()
      });
    } catch (error) { console.log("Firestore sync failed, saved locally."); }

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
    setCurrentOrder(newOrder);
    setIsOrderTrackingOpen(true);
    showToast('تم إرسال طلبك بنجاح! 🚀', 'success');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) { showToast('فشل تسجيل الخروج', 'error'); }
  };

  // --- Render Helpers ---

  const renderHome = () => (
    <div className="space-y-8 pb-32">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">أهلاً بك 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">كيف يمكننا مساعدتك اليوم؟</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsNotifOpen(true)} className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-white/5 relative">
            <Bell size={22} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 relative">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <QuickAction icon={<FileText/>} label="روشتة" color="bg-blue-50 text-blue-600" action={() => setIsPrescriptionModalOpen(true)} />
        <QuickAction icon={<MapPin/>} label="صيدليات" color="bg-purple-50 text-purple-600" action={() => setIsMapModalOpen(true)} />
        <QuickAction icon={<Phone/>} label="طوارئ" color="bg-rose-50 text-rose-600" action={() => window.open('tel:123')} />
        <QuickAction icon={<Info/>} label="نصائح" color="bg-amber-50 text-amber-600" action={() => showToast('قريباً: نصائح طبية مخصصة')} />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">الأقسام</h2>
          <button className="text-blue-600 text-xs font-black">عرض الكل</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-black transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured/Recent Medicines */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">أدوية شائعة</h2>
        <div className="grid gap-4">
          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : (
            allMedicines.slice(0, 4).map(item => (
              <MedicineCard 
                key={item.id} 
                item={item} 
                onSelect={setSelectedDrug} 
                onAdd={addToCart} 
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 pb-32">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">طلباتي السابقة</h2>
      {orders.length > 0 ? (
        orders.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">رقم الطلب</p>
                <h4 className="font-black text-slate-800 dark:text-white">{order.id}</h4>
              </div>
              <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[10px] font-black">
                {order.status}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-blue-600">
                    <Pill size={14} />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mr-2">{order.items.length} أصناف</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-white/5">
              <p className="text-sm font-black text-blue-600">{order.total.toFixed(2)} ج.م</p>
              <button onClick={() => { setCurrentOrder(order); setIsOrderTrackingOpen(true); }} className="text-xs font-black text-slate-400 flex items-center gap-1">تتبع الطلب <ChevronRight size={14}/></button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">لا توجد طلبات سابقة</p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-600/20 mb-4">
          {user?.displayName?.charAt(0) || 'م'}
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.displayName || 'مستخدم ترياق'}</h2>
        <p className="text-slate-400 text-sm">{user?.email || 'user@example.com'}</p>
      </div>

      <div className="grid gap-4">
        {[
          { icon: <User size={20}/>, label: 'تعديل الملف الشخصي', color: 'text-blue-600' },
          { icon: <MapPin size={20}/>, label: 'عناوين التوصيل', color: 'text-purple-600' },
          { icon: <CreditCard size={20}/>, label: 'طرق الدفع', color: 'text-emerald-600' },
          { icon: <Settings size={20}/>, label: 'الإعدادات', color: 'text-slate-600' },
        ].map((item, i) => (
          <button key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${item.color}`}>{item.icon}</div>
              <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-3xl font-black flex items-center justify-center gap-2"
      >
        تسجيل الخروج
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-['Cairo'] text-right" dir="rtl">
      
      {/* 🔔 Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 
              toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' : 
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={20}/> : <Info size={20}/>}
              <p className="text-sm font-black">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 Search Header */}
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/80 dark:bg-[#020617]/80 backdrop-blur-xl px-6 pt-8 pb-4">
        <div className="max-w-2xl mx-auto relative">
          <div className="relative group">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              id="searchInput"
              type="text" 
              placeholder="ابحث عن دواء، فيتامين، أو قسم..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pr-14 pl-6 bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-xl shadow-blue-900/5 focus:ring-2 focus:ring-blue-500/20 dark:text-white font-bold transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute left-5 top-1/2 -translate-y-1/2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-4">
        <AnimatePresence mode="wait">
          {debouncedSearch || activeCategory !== 'الكل' ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pb-32"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">نتائج البحث ({filteredResults.length})</h2>
                <button onClick={() => { setSearchTerm(''); setActiveCategory('الكل'); }} className="text-xs text-slate-400 font-bold">إلغاء الفلترة</button>
              </div>
              {filteredResults.length > 0 ? (
                filteredResults.map(item => (
                  <MedicineCard 
                    key={item.id} 
                    item={item} 
                    onSelect={setSelectedDrug} 
                    onAdd={addToCart} 
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold">لم نجد نتائج مطابقة لـ "{debouncedSearch}"</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && renderHome()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'history' && (
                <div className="space-y-4 pb-32">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">أدويتك المفضلة ❤️</h2>
                  {favorites.length > 0 ? (
                    allMedicines.filter(m => favorites.includes(m.id)).map(item => (
                      <MedicineCard key={item.id} item={item} onSelect={setSelectedDrug} onAdd={addToCart} isFavorite={true} onToggleFavorite={toggleFavorite} />
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">قائمة المفضلة فارغة حالياً</div>
                  )}
                </div>
              )}
              {activeTab === 'profile' && renderProfile()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🟢 Bottom Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] p-2.5 flex justify-between items-center shadow-2xl shadow-blue-900/10">
          <NavButton icon={<Home/>} label="الرئيسية" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<ShoppingBag/>} label="طلباتي" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          
          <div className="relative -top-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setActiveTab('home'); document.querySelector('#searchInput')?.focus(); }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 relative z-10 border-[6px] border-[#F8FAFC] dark:border-[#020617]"
            >
              <Plus size={32} strokeWidth={3} />
            </motion.button>
          </div>

          <NavButton icon={<Heart/>} label="المفضلة" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavButton icon={<User/>} label="حسابي" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>

      {/* 💊 Medicine Details Modal */}
      <AnimatePresence>
        {selectedDrug && (
          <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedDrug(null)}
            ></motion.div>
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 sm:hidden"></div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800">
                  <Pill size={40} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleFavorite(selectedDrug.id)} className={`p-3 rounded-2xl ${favorites.includes(selectedDrug.id) ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Heart size={20} fill={favorites.includes(selectedDrug.id) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setSelectedDrug(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><X size={20}/></button>
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedDrug.name}</h2>
              <p className="text-blue-600 font-bold mb-6 bg-blue-50 dark:bg-blue-900/30 w-fit px-3 py-1 rounded-lg text-sm">{selectedDrug.category}</p>
              
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase">السعر</p>
                    <p className="text-2xl font-black text-blue-600">{selectedDrug.price?.toFixed(2)} <span className="text-sm font-bold text-slate-400">ج.م</span></p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase">التوفر</p>
                    <p className={`text-lg font-black ${Number(selectedDrug.stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(selectedDrug.stock) > 0 ? 'متاح فوري' : 'غير متاح'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                  <h4 className="font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Info size={16} className="text-blue-500"/> عن الدواء</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{selectedDrug.description}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                  <h4 className="font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Clock size={16} className="text-orange-500"/> الجرعة الموصى بها</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{selectedDrug.dosage}</p>
                </div>
              </div>
              
              <button 
                disabled={Number(selectedDrug.stock) <= 0}
                onClick={() => { addToCart(selectedDrug); setSelectedDrug(null); setIsCartOpen(true); }}
                className={`w-full py-5 rounded-[1.5rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${Number(selectedDrug.stock) <= 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700'}`}
              >
                <ShoppingCart size={20} strokeWidth={2} /> {Number(selectedDrug.stock) > 0 ? 'أضف إلى السلة' : 'غير متوفر حالياً'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛒 Cart Sidebar Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[160] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><ShoppingCart size={24} /></div> سلتك
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 p-4 rounded-3xl shadow-sm">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600">
                        <Pill size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{item.name}</h4>
                        <p className="text-sm text-blue-600 font-black">{item.price?.toFixed(2)} ج.م</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                         <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-white/5">
                           <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Minus size={14}/></button>
                           <span className="text-xs font-black w-3 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Plus size={14}/></button>
                         </div>
                         <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"><Trash2 size={10}/> حذف</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-32">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm">أضف بعض الأدوية لتتمكن من الشراء.</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10">
                  <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl">
                    <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400">
                      <span>المجموع الفرعي</span>
                      <span>{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400">
                      <span>رسوم التوصيل</span>
                      <span className="text-green-500">مجاناً</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-white/10 mt-2">
                      <span className="text-slate-900 dark:text-white font-black text-lg">الإجمالي</span>
                      <span className="text-2xl font-black text-blue-600">{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    متابعة الدفع <ArrowRight size={20} className="rtl:rotate-180" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💳 Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutModalOpen(false)}></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">إتمام الطلب</h2>
              
              <div className="space-y-4 mb-8">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
                  <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">عنوان التوصيل</p>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><MapPin size={20} /></div>
                    <div>
                       <span className="block text-sm font-black text-slate-800 dark:text-white">المنزل</span>
                       <span className="text-xs text-slate-500">شارع التحرير، الدقي، القاهرة</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">طريقة الدفع</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><CreditCard size={20} /></div>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{paymentMethod}</span>
                    </div>
                    <button onClick={() => setPaymentMethod(p => p.includes('كاش') ? 'بطاقة ائتمانية (Visa)' : 'كاش (الدفع عند الاستلام)')} className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg font-black hover:bg-blue-100 transition-colors">تغيير</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-[1] py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black">إلغاء</button>
                <button onClick={handleCheckout} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">تأكيد ({cartTotal.toFixed(0)} ج.م) <CheckCircle2 size={18}/></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 Order Tracking Modal */}
      <AnimatePresence>
        {isOrderTrackingOpen && currentOrder && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOrderTrackingOpen(false)}></motion.div>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Activity className="text-blue-600"/> تتبع الطلب</h2>
                <button onClick={() => setIsOrderTrackingOpen(false)} className="p-2 text-slate-400"><X size={20}/></button>
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <Navigation size={40} className="animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">{currentOrder.status}</h3>
                <p className="text-sm text-slate-400">رقم الطلب: {currentOrder.id}</p>
              </div>

              <div className="space-y-6 relative before:absolute before:right-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
                <div className="relative pr-10">
                  <div className="absolute right-0 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900 z-10"></div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">تم استلام الطلب</p>
                  <p className="text-xs text-slate-400">{currentOrder.date}</p>
                </div>
                <div className="relative pr-10">
                  <div className="absolute right-0 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900 z-10"></div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">جاري تجهيز الأدوية</p>
                  <p className="text-xs text-slate-400">الآن</p>
                </div>
                <div className="relative pr-10 opacity-30">
                  <div className="absolute right-0 top-1 w-6 h-6 bg-slate-200 rounded-full border-4 border-white dark:border-slate-900 z-10"></div>
                  <p className="text-sm font-black text-slate-400">في الطريق إليك</p>
                </div>
              </div>

              <button 
                onClick={() => setIsOrderTrackingOpen(false)}
                className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black"
              >
                حسناً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🧾 Prescription Modal */}
      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPrescriptionModalOpen(false)}></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">طلب بالروشتة</h2>
                <button onClick={() => setIsPrescriptionModalOpen(false)} className="p-2 text-slate-400"><X size={20}/></button>
              </div>
              <p className="text-slate-400 text-sm mb-8">صور الروشتة وسنقوم بتوفير الأدوية لك فوراً</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => showToast('جاري فتح الكاميرا...')} className="flex flex-col items-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-100 transition-colors">
                  <Camera size={32} />
                  <span className="text-xs font-black">كاميرا</span>
                </button>
                <button onClick={() => showToast('اختر ملف الروشتة')} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 transition-colors">
                  <Upload size={32} />
                  <span className="text-xs font-black">رفع ملف</span>
                </button>
              </div>

              <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-2xl mb-8 flex gap-3 items-start">
                <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-700 dark:text-orange-400 leading-relaxed font-bold">
                  سيتم مراجعة الروشتة من قبل صيدلي متخصص قبل تأكيد الطلب لضمان سلامتك.
                </p>
              </div>

              <button 
                onClick={() => { setIsPrescriptionModalOpen(false); showToast('تم استلام الروشتة، جاري مراجعتها', 'success'); }}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl"
              >
                إرسال الروشتة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🗺️ Radar Map Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsMapModalOpen(false)}></motion.div>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative text-center w-full max-w-sm">
               <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-8 border-2 border-blue-500/40 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-16 border-2 border-blue-500/60 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} className="absolute top-10 right-10 w-4 h-4 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80]"></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-16 left-8 w-3 h-3 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80]"></motion.div>
                  
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.8)] relative z-10 border-4 border-slate-900">
                    <MapPin size={36} strokeWidth={2.5} />
                  </div>
               </div>
               
               <h2 className="text-3xl font-black text-white mb-3">جاري مسح المنطقة...</h2>
               <p className="text-blue-200/80 mb-10 text-sm leading-relaxed">نبحث عن أقرب الصيدليات المشتركة في ترياق لضمان التوصيل السريع.</p>
               
               <button 
                 onClick={() => { setIsMapModalOpen(false); showToast('تم العثور على 3 صيدليات في نطاق 2 كم', 'success'); }} 
                 className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] font-bold backdrop-blur-md transition-colors border border-white/10"
               >
                 إلغاء البحث
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatientSearch;
