import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, MapPin, Clock, Pill, ShoppingBag, User,
  CheckCircle2, XCircle, Loader2, Bell, ChevronRight, Home,
  Plus, FileText, Heart, X, AlertCircle, Phone, ShoppingCart, Info,
  Trash2, Minus, ArrowRight, Camera, Upload, CreditCard, Settings,
  Navigation, Activity, Moon, Sun, Star, Package, Zap, TrendingUp,
  ChevronDown, RefreshCw, Check, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['الكل', 'أدوية مزمنة', 'عناية', 'أطفال', 'فيتامينات'];
const DELIVERY_FEE = 15;

const MOCK_MEDICINES = [
  { id: '1', name: 'باندول اكسترا', category: 'أدوية مزمنة', stock: 10, price: 45, description: 'مسكن للألم وخافض للحرارة فعّال ويُستخدم لعلاج الصداع وآلام الأسنان.', dosage: 'قرص كل 6 ساعات (لا تتجاوز 4 أقراص يومياً)' },
  { id: '2', name: 'كونجستال', category: 'أطفال', stock: 5, price: 30, description: 'لعلاج أعراض البرد والأنفلونزا عند الأطفال.', dosage: '5 مل 3 مرات يومياً للأطفال 6–12 سنة' },
  { id: '3', name: 'فيتامين سي', category: 'فيتامينات', stock: 0, price: 85, description: 'مكمل غذائي لتعزيز المناعة ومضاد للأكسدة.', dosage: 'قرص فوار واحد يومياً بعد الأكل' },
  { id: '4', name: 'أوميبرازول', category: 'أدوية مزمنة', stock: 15, price: 60, description: 'لعلاج حموضة المعدة وقرحة الاثني عشر وارتداد المعدة.', dosage: 'قرص واحد قبل الإفطار بـ 30 دقيقة' },
  { id: '5', name: 'فيتامين د3', category: 'فيتامينات', stock: 8, price: 120, description: 'ضروري لامتصاص الكالسيوم وصحة العظام والجهاز المناعي.', dosage: 'قرص واحد يومياً مع وجبة دسمة' },
  { id: '6', name: 'ديتول 250 مل', category: 'عناية', stock: 20, price: 55, description: 'معقّم متعدد الاستخدامات للبشرة والأسطح.', dosage: 'للاستخدام الخارجي فقط — خفّف 1:40 مع الماء' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'طلبك في الطريق!', body: 'ORD-48291 سيصل خلال 20 دقيقة.', time: 'الآن', icon: <Navigation size={16}/>, color: 'text-blue-600 bg-blue-50' },
  { id: 2, title: 'تخفيض 20% على الفيتامينات', body: 'عرض لأوقات محدودة هذا الأسبوع.', time: '2 ساعة', icon: <Zap size={16}/>, color: 'text-amber-600 bg-amber-50' },
  { id: 3, title: 'تذكير بالدواء', body: 'حان وقت جرعة الأوميبرازول الصباحية.', time: 'أمس', icon: <Clock size={16}/>, color: 'text-emerald-600 bg-emerald-50' },
];

const CATEGORY_ICONS = {
  'أدوية مزمنة': '💊',
  'عناية': '🧴',
  'أطفال': '🍼',
  'فيتامينات': '🌿',
  'الكل': '✨',
};

// ─── Utility Hooks ─────────────────────────────────────────────────────────────

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? initialValue; }
    catch { return initialValue; }
  });
  const set = useCallback((value) => {
    setState(value);
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key]);
  return [state, set];
};

// ─── Small Components ──────────────────────────────────────────────────────────

const Badge = ({ count }) =>
  count > 0 ? (
    <motion.span
      key={count}
      initial={{ scale: 1.5 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 z-10"
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  ) : null;

const StatusPill = ({ inStock }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black w-fit flex items-center gap-1.5 ${inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
    {inStock ? <CheckCircle2 size={10}/> : <XCircle size={10}/>}
    {inStock ? 'متوفر' : 'غير متوفر'}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"/>
      <div className="space-y-2.5">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"/>
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg"/>
        <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg"/>
      </div>
    </div>
    <div className="flex flex-col items-end gap-3">
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full"/>
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"/>
    </div>
  </div>
);

const EmptyState = ({ icon, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center px-6"
  >
    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
      {icon}
    </div>
    <p className="font-black text-slate-600 dark:text-slate-300 mb-1">{title}</p>
    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
  </motion.div>
);

const QuickAction = ({ icon, label, color, badge, action }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={action}
    className="flex flex-col items-center gap-2 group relative"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-sm border border-white/20 transition-all duration-300 group-hover:shadow-lg relative`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: 1.8 })}
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
  </motion.button>
);

const NavButton = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-14 transition-all duration-300 relative ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
  >
    <div className={`p-2 rounded-2xl transition-all duration-300 relative ${active ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 1.8 })}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span className={`text-[9px] font-black transition-all ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

// ─── Medicine Card ─────────────────────────────────────────────────────────────

const MedicineCard = React.memo(({ item, onSelect, onAdd, isFavorite, onToggleFavorite }) => {
  const inStock = Number(item.stock) > 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(item)}
      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
    >
      {/* colored left-border accent */}
      <span className={`absolute top-0 right-0 h-full w-1 rounded-r-3xl ${inStock ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}/>
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl select-none ${inStock ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
          {CATEGORY_ICONS[item.category] ?? '💊'}
        </div>
        <div>
          <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight mb-1">{item.name}</h3>
          <p className="text-[11px] text-slate-400 mb-2">{item.category}</p>
          <StatusPill inStock={inStock} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={e => { e.stopPropagation(); onToggleFavorite(item.id); }}
          className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-300 hover:text-rose-400'}`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>
        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{item.price} ج.م</p>
        <motion.button
          whileTap={{ scale: 0.8 }}
          disabled={!inStock}
          onClick={e => { e.stopPropagation(); onAdd(item); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${!inStock ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-600/25 hover:bg-blue-700'}`}
        >
          <Plus size={20} strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  );
});

// ─── Toast ─────────────────────────────────────────────────────────────────────

const TOAST_STYLES = {
  success: 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-200',
  warning: 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-200',
  error:   'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-200',
  info:    'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-200',
};
const TOAST_ICONS = { success: <Check size={18}/>, warning: <AlertTriangle size={18}/>, error: <AlertCircle size={18}/>, info: <Info size={18}/> };

const Toast = ({ show, message, type }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 20, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md pointer-events-none"
      >
        <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${TOAST_STYLES[type] ?? TOAST_STYLES.info}`}>
          {TOAST_ICONS[type]}
          <p className="text-sm font-bold">{message}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const PatientSearch = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const searchRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab]       = useState('home');
  const [searchTerm, setSearchTerm]     = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [darkMode, setDarkMode]         = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  // Persisted state
  const [cart, setCart]         = useLocalStorage('teryaq_cart', []);
  const [favorites, setFavorites] = useLocalStorage('teryaq_favs', []);
  const [orders, setOrders]     = useLocalStorage('teryaq_orders', []);

  // UI state
  const [isCartOpen, setIsCartOpen]                     = useState(false);
  const [selectedDrug, setSelectedDrug]                 = useState(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen]     = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen]             = useState(false);
  const [isTrackingOpen, setIsTrackingOpen]             = useState(false);
  const [isMapOpen, setIsMapOpen]                       = useState(false);
  const [isNotifOpen, setIsNotifOpen]                   = useState(false);
  const [currentOrder, setCurrentOrder]                 = useState(null);
  const [paymentMethod, setPaymentMethod]               = useState('كاش عند الاستلام');
  const [checkoutLoading, setCheckoutLoading]           = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [unreadNotifs, setUnreadNotifs]                 = useState(MOCK_NOTIFICATIONS.length);

  const debouncedSearch = useDebounce(searchTerm, 280);

  // ── Dark mode ──────────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'medicines'));
        const data = snap.docs.map(doc => ({
          id: doc.id,
          price: 50,
          description: 'هذا الدواء يستخدم لعلاج الحالات المرضية المختلفة تحت إشراف طبي.',
          dosage: 'قرص واحد مرتين يومياً',
          ...doc.data(),
        }));
        setAllMedicines(data);
      } catch {
        setAllMedicines(MOCK_MEDICINES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const isFiltering = debouncedSearch.length > 0 || activeCategory !== 'الكل';

  const filteredResults = useMemo(() => {
    let filtered = allMedicines;
    if (activeCategory !== 'الكل') filtered = filtered.filter(m => m.category === activeCategory);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [debouncedSearch, activeCategory, allMedicines]);

  const cartTotal  = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount  = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const favMeds    = useMemo(() => allMedicines.filter(m => favorites.includes(m.id)), [allMedicines, favorites]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  const addToCart = useCallback((item) => {
    if (Number(item.stock) <= 0) { showToast('عذراً، هذا الدواء غير متوفر حالياً', 'warning'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) { showToast('وصلت للحد الأقصى المتاح', 'warning'); return prev; }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`تمت إضافة ${item.name} ✓`, 'success');
  }, [setCart, showToast]);

  const removeFromCart = useCallback(id => setCart(p => p.filter(i => i.id !== id)), [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('تم إفراغ السلة', 'info');
  }, [setCart, showToast]);

  const updateQuantity = useCallback((id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const qty = Math.max(1, item.quantity + delta);
      if (delta > 0 && qty > item.stock) { showToast('لا يوجد مخزون كافٍ', 'warning'); return item; }
      return { ...item, quantity: qty };
    }));
  }, [setCart, showToast]);

  const toggleFavorite = useCallback((id) => {
    const isFav = favorites.includes(id);
    setFavorites(prev => isFav ? prev.filter(f => f !== id) : [...prev, id]);
    showToast(isFav ? 'تم الحذف من المفضلة' : 'تمت الإضافة للمفضلة ❤️', 'info');
  }, [favorites, setFavorites, showToast]);

  const handleCheckout = useCallback(async () => {
    if (!cart.length || checkoutLoading) return;
    setCheckoutLoading(true);
    const newOrder = {
      id: `ORD-${String(Date.now()).slice(-5)}`,
      items: [...cart],
      total: cartTotal + DELIVERY_FEE,
      status: 'جاري التجهيز',
      date: new Date().toLocaleString('ar-EG'),
      payment: paymentMethod,
    };
    try {
      await addDoc(collection(db, 'orders'), {
        ...newOrder,
        userId: user?.uid ?? 'guest',
        createdAt: serverTimestamp(),
      });
    } catch { /* saved locally */ }

    setOrders(p => [newOrder, ...p]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCurrentOrder(newOrder);
    setCheckoutLoading(false);
    setIsTrackingOpen(true);
    showToast('تم إرسال طلبك بنجاح 🚀', 'success');
  }, [cart, cartTotal, checkoutLoading, paymentMethod, user, setCart, setOrders, showToast]);

  const handleLogout = useCallback(async () => {
    try { await signOut(auth); navigate('/login'); }
    catch { showToast('فشل تسجيل الخروج', 'error'); }
  }, [auth, navigate, showToast]);

  const resetFilters = useCallback(() => { setSearchTerm(''); setActiveCategory('الكل'); }, []);

  // ── Renders ────────────────────────────────────────────────────────────────

  const renderHome = () => (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">أهلاً بك 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">كيف يمكننا مساعدتك اليوم؟</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="w-11 h-11 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-white/5"
          >
            {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <button
            onClick={() => { setIsNotifOpen(true); setUnreadNotifs(0); }}
            className="w-11 h-11 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-white/5 relative"
          >
            <Bell size={18}/>
            {unreadNotifs > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"/>
            )}
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 relative"
          >
            <ShoppingCart size={18}/>
            <Badge count={cartCount}/>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <QuickAction icon={<FileText/>}  label="روشتة"    color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"    action={() => setIsPrescriptionOpen(true)} />
        <QuickAction icon={<MapPin/>}    label="صيدليات"  color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"  action={() => setIsMapOpen(true)} />
        <QuickAction icon={<Phone/>}     label="طوارئ"    color="bg-rose-50 dark:bg-rose-900/20 text-rose-600"    action={() => window.open('tel:123')} />
        <QuickAction icon={<TrendingUp/>} label="عروض"   color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"  action={() => showToast('قريباً: العروض والخصومات 🎁')} />
      </div>

      {/* Categories */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">الأقسام</h2>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-black transition-all flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">أدوية شائعة</h2>
        {loading
          ? [1, 2, 3].map(i => <SkeletonCard key={i}/>)
          : allMedicines.slice(0, 5).map(item => (
              <MedicineCard
                key={item.id} item={item}
                onSelect={setSelectedDrug} onAdd={addToCart}
                isFavorite={favorites.includes(item.id)} onToggleFavorite={toggleFavorite}
              />
            ))
        }
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-5 pb-32">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">طلباتي</h2>
      {orders.length > 0 ? orders.map(order => (
        <div key={order.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">رقم الطلب</p>
              <h4 className="font-black text-slate-800 dark:text-white text-sm">{order.id}</h4>
            </div>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[10px] font-black">
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5"><Clock size={12}/> {order.date}</p>
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {order.items.slice(0, 3).map((item, i) => (
              <span key={i} className="text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
            ))}
            {order.items.length > 3 && (
              <span className="text-xs text-slate-400 font-bold">+{order.items.length - 3} أخرى</span>
            )}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-white/5">
            <p className="text-sm font-black text-blue-600">{order.total.toFixed(2)} ج.م</p>
            <button
              onClick={() => { setCurrentOrder(order); setIsTrackingOpen(true); }}
              className="text-xs font-black text-slate-400 flex items-center gap-1 hover:text-blue-500 transition-colors"
            >
              تتبع الطلب <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      )) : (
        <EmptyState icon={<ShoppingBag size={36}/>} title="لا توجد طلبات سابقة" subtitle="ستظهر طلباتك هنا بعد الشراء"/>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-4 pb-32">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">المفضلة ❤️</h2>
      {favMeds.length > 0 ? (
        favMeds.map(item => (
          <MedicineCard
            key={item.id} item={item}
            onSelect={setSelectedDrug} onAdd={addToCart}
            isFavorite onToggleFavorite={toggleFavorite}
          />
        ))
      ) : (
        <EmptyState icon={<Heart size={36}/>} title="المفضلة فارغة" subtitle="اضغط على ❤️ لحفظ الأدوية المهمة"/>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 pb-32">
      {/* Avatar */}
      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-600/20 mb-4">
          {user?.displayName?.charAt(0) ?? 'م'}
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">{user?.displayName ?? 'مستخدم ترياق'}</h2>
        <p className="text-slate-400 text-sm">{user?.email ?? 'user@teryaq.app'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'طلبات', value: orders.length, color: 'text-blue-600' },
          { label: 'مفضلة', value: favorites.length, color: 'text-rose-500' },
          { label: 'مجموع', value: `${orders.reduce((s, o) => s + o.total, 0).toFixed(0)} ج.م`, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-4 rounded-3xl text-center border border-slate-100 dark:border-white/5 shadow-sm">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="grid gap-3">
        {[
          { icon: <User size={20}/>,       label: 'تعديل الملف الشخصي',  color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { icon: <MapPin size={20}/>,     label: 'عناوين التوصيل',       color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { icon: <CreditCard size={20}/>, label: 'طرق الدفع',            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: <Settings size={20}/>,   label: 'الإعدادات',            color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
        ].map((item, i) => (
          <button key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm group">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${item.color}`}>{item.icon}</div>
              <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-3xl font-black text-sm"
      >
        تسجيل الخروج
      </button>
    </div>
  );

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Cairo'] text-right" dir="rtl">
      <Toast {...toast}/>

      {/* ── Search Header ── */}
      <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 pt-6 pb-3">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18}/>
          <input
            ref={searchRef}
            id="searchInput"
            type="text"
            placeholder="ابحث عن دواء، فيتامين، أو قسم..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pr-12 pl-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white font-bold text-sm outline-none transition-all"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => setSearchTerm('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={13}/>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-2xl mx-auto px-4 pt-3">
        <AnimatePresence mode="wait">
          {isFiltering ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pb-32">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black text-slate-800 dark:text-white">
                  نتائج البحث <span className="text-blue-600">({filteredResults.length})</span>
                </h2>
                <button onClick={resetFilters} className="text-xs text-blue-600 font-black flex items-center gap-1">
                  <X size={12}/> إلغاء الفلترة
                </button>
              </div>
              {filteredResults.length > 0 ? (
                filteredResults.map(item => (
                  <MedicineCard
                    key={item.id} item={item}
                    onSelect={setSelectedDrug} onAdd={addToCart}
                    isFavorite={favorites.includes(item.id)} onToggleFavorite={toggleFavorite}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Search size={36}/>}
                  title={`لا نتائج لـ "${debouncedSearch}"`}
                  subtitle="جرّب كلمة أخرى أو تصفّح الأقسام"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'home'    && renderHome()}
              {activeTab === 'orders'  && renderOrders()}
              {activeTab === 'favs'    && renderFavorites()}
              {activeTab === 'profile' && renderProfile()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl shadow-slate-900/10">
          <NavButton icon={<Home/>}        label="الرئيسية" active={activeTab === 'home'}    onClick={() => setActiveTab('home')} />
          <NavButton icon={<ShoppingBag/>} label="طلباتي"   active={activeTab === 'orders'}  onClick={() => setActiveTab('orders')} badge={orders.filter(o => o.status === 'جاري التجهيز').length} />
          <div className="relative -top-7">
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => { setActiveTab('home'); setTimeout(() => searchRef.current?.focus(), 150); }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 border-[5px] border-slate-50 dark:border-slate-950"
            >
              <Search size={26} strokeWidth={2.5}/>
            </motion.button>
          </div>
          <NavButton icon={<Heart/>} label="المفضلة" active={activeTab === 'favs'}    onClick={() => setActiveTab('favs')} badge={favorites.length} />
          <NavButton icon={<User/>}  label="حسابي"   active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>

      {/* ─────────── Modals ─────────── */}

      {/* Medicine Details */}
      <AnimatePresence>
        {selectedDrug && (
          <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDrug(null)}/>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-7 sm:hidden"/>
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-4xl">
                  {CATEGORY_ICONS[selectedDrug.category] ?? '💊'}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleFavorite(selectedDrug.id)}
                    className={`p-3 rounded-2xl ${favorites.includes(selectedDrug.id) ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    <Heart size={20} fill={favorites.includes(selectedDrug.id) ? 'currentColor' : 'none'}/>
                  </motion.button>
                  <button onClick={() => setSelectedDrug(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><X size={20}/></button>
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedDrug.name}</h2>
              <span className="inline-block text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-xs mb-6">{selectedDrug.category}</span>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">السعر</p>
                  <p className="text-2xl font-black text-blue-600">{selectedDrug.price} <span className="text-sm font-bold text-slate-400">ج.م</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">التوفر</p>
                  <StatusPill inStock={Number(selectedDrug.stock) > 0}/>
                  {Number(selectedDrug.stock) > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">{selectedDrug.stock} قطعة متبقية</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-3">
                <h4 className="font-black text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Info size={15} className="text-blue-500"/> عن الدواء</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{selectedDrug.description}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6">
                <h4 className="font-black text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Clock size={15} className="text-orange-500"/> الجرعة الموصى بها</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{selectedDrug.dosage}</p>
              </div>

              <button
                disabled={Number(selectedDrug.stock) <= 0}
                onClick={() => { addToCart(selectedDrug); setSelectedDrug(null); setIsCartOpen(true); }}
                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  Number(selectedDrug.stock) <= 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700'
                }`}
              >
                <ShoppingCart size={18}/>
                {Number(selectedDrug.stock) > 0 ? 'أضف إلى السلة' : 'غير متوفر حالياً'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[160] flex justify-start" dir="rtl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}/>
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={22} className="text-blue-600"/> سلتك ({cartCount})
                </h2>
                <div className="flex gap-2">
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="text-xs text-rose-500 font-bold px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center gap-1">
                      <Trash2 size={12}/> إفراغ
                    </button>
                  )}
                  <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"><X size={18}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length > 0 ? cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {CATEGORY_ICONS[item.category] ?? '💊'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-blue-600 font-black">{(item.price * item.quantity).toFixed(2)} ج.م</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-2 py-1 border border-slate-200 dark:border-white/5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-blue-600"><Minus size={13}/></button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-blue-600"><Plus size={13}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-400 font-bold">حذف</button>
                    </div>
                  </div>
                )) : (
                  <EmptyState icon={<ShoppingCart size={32}/>} title="السلة فارغة" subtitle="أضف أدوية للمتابعة"/>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span className="font-bold">المجموع الفرعي</span>
                      <span className="font-black">{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span className="font-bold">التوصيل</span>
                      <span className="font-black text-emerald-600">{DELIVERY_FEE} ج.م</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                      <span className="font-black text-slate-900 dark:text-white">الإجمالي</span>
                      <span className="text-xl font-black text-blue-600">{(cartTotal + DELIVERY_FEE).toFixed(2)} ج.م</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    متابعة الدفع <ArrowRight size={18} className="rtl:rotate-180"/>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}/>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">إتمام الطلب</h2>
              <div className="space-y-3 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><MapPin size={18}/></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">التوصيل إلى</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">المنزل — شارع التحرير، الدقي</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><CreditCard size={18}/></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">طريقة الدفع</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{paymentMethod}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentMethod(p => p.includes('كاش') ? 'بطاقة ائتمانية (Visa)' : 'كاش عند الاستلام')}
                    className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl font-black"
                  >
                    تغيير
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white">الإجمالي</span>
                  <span className="text-xl font-black text-blue-600">{(cartTotal + DELIVERY_FEE).toFixed(2)} ج.م</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm">إلغاء</button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {checkoutLoading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>}
                  {checkoutLoading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Tracking */}
      <AnimatePresence>
        {isTrackingOpen && currentOrder && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTrackingOpen(false)}/>
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-600"/> تتبع الطلب
                </h2>
                <button onClick={() => setIsTrackingOpen(false)} className="p-2 text-slate-400"><X size={18}/></button>
              </div>
              <div className="flex flex-col items-center mb-7 bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-5">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mb-3 shadow-xl shadow-blue-600/30"
                >
                  <Navigation size={30}/>
                </motion.div>
                <h3 className="font-black text-slate-800 dark:text-white">{currentOrder.status}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentOrder.id} • {currentOrder.date}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-5 relative before:absolute before:right-[11px] before:top-2 before:bottom-8 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5 mb-7">
                {[
                  { label: 'تم استلام الطلب', time: currentOrder.date, done: true },
                  { label: 'جاري تجهيز الأدوية', time: 'الآن', done: true },
                  { label: 'في الطريق إليك', time: 'قريباً (~20 دقيقة)', done: false },
                  { label: 'تم التسليم', time: '', done: false },
                ].map((step, i) => (
                  <div key={i} className={`relative pr-8 ${!step.done ? 'opacity-35' : ''}`}>
                    <div className={`absolute right-0 top-1 w-6 h-6 rounded-full border-[3px] z-10 flex items-center justify-center ${step.done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                      {step.done && <Check size={12} strokeWidth={3}/>}
                    </div>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{step.label}</p>
                    {step.time && <p className="text-xs text-slate-400">{step.time}</p>}
                  </div>
                ))}
              </div>

              <button onClick={() => setIsTrackingOpen(false)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm">
                حسناً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription */}
      <AnimatePresence>
        {isPrescriptionOpen && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPrescriptionOpen(false)}/>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">طلب بالروشتة</h2>
                <button onClick={() => setIsPrescriptionOpen(false)} className="p-2 text-slate-400"><X size={18}/></button>
              </div>
              <p className="text-slate-400 text-sm mb-6">صوّر الروشتة وسنوفر الأدوية لك فوراً</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={() => showToast('جاري فتح الكاميرا...')} className="flex flex-col items-center gap-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-blue-600">
                  <Camera size={28}/><span className="text-xs font-black">الكاميرا</span>
                </button>
                <button onClick={() => showToast('اختر ملف الروشتة')} className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-500">
                  <Upload size={28}/><span className="text-xs font-black">رفع ملف</span>
                </button>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl mb-6 flex gap-3 items-start">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-bold">
                  سيراجع صيدلي متخصص روشتتك قبل تأكيد الطلب لضمان سلامتك.
                </p>
              </div>
              <button
                onClick={() => { setIsPrescriptionOpen(false); showToast('تم استلام الروشتة — جاري المراجعة', 'success'); }}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black"
              >
                إرسال الروشتة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pharmacy Radar */}
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setIsMapOpen(false)}/>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="relative text-center w-full max-w-sm">
              <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                {[0, 8, 16].map(i => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, ease: 'easeOut' }}
                    style={{ margin: `${i}px` }}
                  />
                ))}
                {[
                  { top: '15%', right: '20%', delay: 1.2 },
                  { bottom: '25%', left: '15%', delay: 2.4 },
                  { top: '55%', right: '10%', delay: 1.8 },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: pos.delay }}
                    style={{ position: 'absolute', ...pos }}
                    className="w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_20px_#4ade80]"
                  />
                ))}
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_60px_rgba(37,99,235,0.8)] z-10 border-4 border-slate-950">
                  <MapPin size={32} strokeWidth={2}/>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">جاري مسح المنطقة...</h2>
              <p className="text-blue-200/70 text-sm mb-8 leading-relaxed">نبحث عن أقرب الصيدليات المشتركة</p>
              <button
                onClick={() => { setIsMapOpen(false); showToast('تم العثور على 3 صيدليات قريبة ✓', 'success'); }}
                className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold border border-white/10 backdrop-blur-md transition-colors"
              >
                إلغاء البحث
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {isNotifOpen && (
          <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsNotifOpen(false)}/>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5 sm:hidden"/>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell size={20} className="text-blue-600"/> الإشعارات
                </h2>
                <button onClick={() => setIsNotifOpen(false)} className="p-2 text-slate-400"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className={`p-2.5 rounded-xl shrink-0 ${n.color}`}>{n.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0 mt-0.5">{n.time}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsNotifOpen(false)} className="w-full mt-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm">
                حسناً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientSearch;