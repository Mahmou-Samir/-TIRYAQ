import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, MapPin, Clock, Pill, ShoppingBag, User, 
  CheckCircle2, XCircle, Loader2, Filter, Bell, ChevronRight, Home, 
  Plus, FileText, Heart, X, AlertCircle, Phone, ShoppingCart, Info,
  Trash2, Minus, ArrowRight, Camera, Upload, CreditCard, Settings, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-Components ---

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

const MedicineCard = ({ item, onSelect, onAdd, isFavorite, onToggleFavorite }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    onClick={() => onSelect(item)} 
    className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
  >
    <div className="flex items-center gap-4">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${Number(item.stock) > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'} dark:bg-opacity-10`}>
        <Pill size={32} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-black text-slate-800 dark:text-white text-base">{item.name}</h3>
        <p className="text-[11px] text-slate-400 mb-2">{item.category}</p>
        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black w-fit flex items-center gap-1.5 ${Number(item.stock) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} dark:bg-opacity-20`}>
          {Number(item.stock) > 0 ? <CheckCircle2 size={10}/> : <XCircle size={10}/>}
          {Number(item.stock) > 0 ? 'متوفر' : 'غير متوفر'}
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
        onClick={(event) => { event.stopPropagation(); onAdd(item); }}
        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} strokeWidth={3} />
      </motion.button>
    </div>
  </motion.div>
);

// --- Main Component ---

const PatientSearch = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // --- States ---
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [allMedicines, setAllMedicines] = useState([]);
  const [results, setResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(true);

  const categories = ['الكل', 'أدوية مزمنة', 'عناية', 'أطفال', 'فيتامينات'];

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
    
    const savedFavs = localStorage.getItem('teryaq_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedCart = localStorage.getItem('teryaq_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedOrders = localStorage.getItem('teryaq_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('teryaq_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('teryaq_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('teryaq_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    let filtered = allMedicines;
    if (activeCategory !== 'الكل') {
      filtered = filtered.filter(m => m.category === activeCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setResults(searchTerm || activeCategory !== 'الكل' ? filtered : []);
  }, [searchTerm, activeCategory, allMedicines]);

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
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`تم إضافة ${item.name} إلى السلة`, 'success');
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
    const isNowFav = !favorites.includes(id);
    showToast(isNowFav ? 'تمت الإضافة للمفضلة' : 'تم الحذف من المفضلة', 'info');
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      items: [...cart],
      total: cartTotal + 15, 
      status: 'جاري التجهيز',
      date: new Date().toLocaleString('ar-EG'),
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, "orders"), {
        ...newOrder,
        userId: user?.uid || 'guest',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.log("Firestore save skipped, using local storage", error);
    }

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
    setCurrentOrder(newOrder);
    setIsOrderTrackingOpen(true);
    showToast('تم إرسال طلبك بنجاح!', 'success');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      showToast('حدث خطأ أثناء تسجيل الخروج', 'error');
      console.error(error);
    }
  };

  // --- Renderers ---

  const renderHome = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-2">
        <QuickAction action={() => setIsPrescriptionModalOpen(true)} icon={<FileText/>} label="روشتة" color="bg-orange-50 dark:bg-orange-500/10 text-orange-600" />
        <QuickAction action={() => setActiveTab('orders')} icon={<ShoppingBag/>} label="طلباتي" color="bg-blue-50 dark:bg-blue-500/10 text-blue-600" />
        <QuickAction action={() => showToast('جاري تحديد أقرب الصيدليات...')} icon={<MapPin/>} label="الخريطة" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" />
        <QuickAction action={() => { window.location.href = 'tel:12345'; }} icon={<Phone/>} label="اتصال" color="bg-rose-50 dark:bg-rose-500/10 text-rose-600" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black backdrop-blur-md">عرض محدود</span>
          </div>
          <h3 className="text-2xl font-black mb-2">توصيل مجاني 🚗</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-[200px] leading-relaxed">على أول 3 طلبات لك من تطبيق ترياق</p>
          <button onClick={() => { setActiveCategory('الكل'); document.querySelector('input')?.focus(); }} className="bg-white text-indigo-700 px-6 py-3 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-transform">اطلب الآن</button>
        </div>
        <ShoppingBag size={180} className="absolute -bottom-10 -left-10 text-white/10 -rotate-12" />
      </motion.div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-slate-800 dark:text-white">الأكثر طلباً</h2>
          <button onClick={() => setActiveCategory('الكل')} className="text-blue-600 text-xs font-bold">عرض الكل</button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
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
    <div className="space-y-6 py-4">
      <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">طلباتي الأخيرة</h2>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold mb-1">{order.id}</p>
                  <h4 className="font-black text-slate-800 dark:text-white">{order.items.length} أصناف</h4>
                </div>
                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-white/5">
                <p className="text-sm font-black text-blue-600">{order.total.toFixed(2)} ج.م</p>
                <button 
                  onClick={() => { setCurrentOrder(order); setIsOrderTrackingOpen(true); }}
                  className="text-xs font-bold text-slate-500 flex items-center gap-1"
                >
                  تتبع الطلب <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-blue-600" />
          </div>
          <h3 className="text-slate-800 dark:text-white font-black text-lg">لا توجد طلبات نشطة</h3>
          <p className="text-slate-400 text-sm mt-2">ابدأ بالبحث عن أدويتك وإضافتها للسلة</p>
          <button onClick={() => setActiveTab('home')} className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm">اكتشف الأدوية</button>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl mb-4 relative">
          <User size={48} />
          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-blue-600 border-4 border-[#F8FAFC] dark:border-[#020617]">
            <Camera size={18} />
          </button>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.displayName || 'محمود أحمد'}</h2>
        <p className="text-slate-400 text-sm">{user?.email || 'mahmoud@example.com'}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 border border-slate-100 dark:border-white/5 shadow-sm">
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[2rem] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600"><MapPin size={20}/></div>
            <span className="font-bold text-slate-700 dark:text-slate-200">عناوين التوصيل</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[2rem] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600"><CreditCard size={20}/></div>
            <span className="font-bold text-slate-700 dark:text-slate-200">طرق الدفع</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[2rem] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600"><Settings size={20}/></div>
            <span className="font-bold text-slate-700 dark:text-slate-200">الإعدادات</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-[2rem] font-black flex items-center justify-center gap-3"
      >
        <LogOut size={20} /> تسجيل الخروج
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-sans pb-40 transition-colors duration-500" dir="rtl">
      
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[200] w-[90%] max-w-xs bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-blue-400" />}
            <span className="text-xs font-black">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-[#F8FAFC]/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 pb-6">
        <div className="px-6 pt-8 flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
               <User size={24} />
            </div>
            <div>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">ترياق</p>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">أهلاً، {user?.displayName?.split(' ')[0] || 'محمود'}</h1>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="relative w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200/50 dark:border-white/5 shadow-sm"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cart.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#F8FAFC] dark:border-[#020617]"
                >
                  {cart.length}
                </motion.span>
              )}
            </motion.button>
            <button className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200/50 dark:border-white/5 shadow-sm">
              <Bell size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="px-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1.5rem] flex items-center p-1.5 shadow-sm group-focus-within:shadow-xl group-focus-within:border-blue-500/50 transition-all">
              <div className="p-3 text-slate-400"><Search size={20} strokeWidth={2} /></div>
              <input 
                type="text" 
                placeholder="ابحث عن دواء، أعراض، صيدلية..." 
                className="flex-1 bg-transparent h-12 outline-none text-slate-800 dark:text-white font-bold text-sm"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-red-500"><X size={18}/></button>}
              <button className="p-3 text-blue-600"><Filter size={20}/></button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 pt-8">
        <div className="flex gap-3 overflow-x-auto pb-8 hide-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat} onClick={() => { setActiveCategory(cat); setActiveTab('home'); }}
              className={`px-7 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200/50 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {searchTerm || activeCategory !== 'الكل' ? (
            <motion.div 
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {results.length > 0 ? (
                results.map(item => (
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
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold">لم نجد نتائج مطابقة لبحثك</p>
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
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">المفضلة</h2>
                  {favorites.length > 0 ? (
                    allMedicines.filter(m => favorites.includes(m.id)).map(item => (
                      <MedicineCard 
                        key={item.id} 
                        item={item} 
                        onSelect={setSelectedDrug} 
                        onAdd={addToCart} 
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-bold">قائمة المفضلة فارغة</div>
                  )}
                </div>
              )}
              {activeTab === 'profile' && renderProfile()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] p-2.5 flex justify-between items-center shadow-2xl shadow-blue-900/10">
          <NavButton icon={<Home/>} label="الرئيسية" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon={<ShoppingBag/>} label="طلباتي" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          
          <div className="relative -top-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setActiveTab('home'); document.querySelector('input')?.focus(); }}
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 border-[6px] border-[#F8FAFC] dark:border-[#020617]"
            >
              <Plus size={32} strokeWidth={3} />
            </motion.button>
          </div>

          <NavButton icon={<Heart/>} label="المفضلة" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavButton icon={<User/>} label="حسابي" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>

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
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600">
                  <Pill size={40} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { toggleFavorite(selectedDrug.id); }} className={`p-3 rounded-2xl ${favorites.includes(selectedDrug.id) ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Heart size={20} fill={favorites.includes(selectedDrug.id) ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setSelectedDrug(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><X size={20}/></button>
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedDrug.name}</h2>
              <p className="text-blue-600 font-bold mb-6">{selectedDrug.category}</p>
              
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-400 mb-1">السعر</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{selectedDrug.price?.toFixed(2)} ج.م</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-400 mb-1">التوفر</p>
                    <p className={`text-lg font-black ${Number(selectedDrug.stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(selectedDrug.stock) > 0 ? 'متاح' : 'غير متاح'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Info size={16}/> عن الدواء</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{selectedDrug.description}</p>
                </div>

                <div>
                  <h4 className="font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Clock size={16}/> الجرعة الموصى بها</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{selectedDrug.dosage}</p>
                </div>
              </div>
              
              <button 
                onClick={() => { addToCart(selectedDrug); setSelectedDrug(null); }}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
              >
                <Plus size={20} strokeWidth={3} /> إضافة للسلة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[160] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setIsCartOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={24} className="text-blue-600" /> سلة الطلبات
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Pill size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-blue-600 font-black">{item.price} ج.م</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-white/5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-blue-600"><Minus size={16}/></button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-blue-600"><Plus size={16}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-1"><Trash2 size={18}/></button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <ShoppingCart size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">السلة فارغة حالياً</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-4 text-blue-600 font-bold text-sm">ابدأ التسوق الآن</button>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-white/5">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">المجموع الفرعي</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold">{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">رسوم التوصيل</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold">15.00 ج.م</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                      <span className="text-slate-900 dark:text-white font-black">الإجمالي</span>
                      <span className="text-xl font-black text-blue-600">{(cartTotal + 15).toFixed(2)} ج.م</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    متابعة الدفع <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsCheckoutModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">إتمام الطلب</h2>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <p className="text-[10px] text-slate-400 mb-1">عنوان التوصيل</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">المنزل - شارع التحرير، القاهرة</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] text-slate-400 mb-1">طريقة الدفع</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-600" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">الدفع عند الاستلام</span>
                    </div>
                    <button className="text-xs text-blue-600 font-bold">تغيير</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleCheckout}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20"
                >
                  تأكيد الطلب
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrderTrackingOpen && currentOrder && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsOrderTrackingOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">تتبع الطلب</h2>
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

      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsPrescriptionModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl"
            >
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

    </div>
  );
};

export default PatientSearch;
