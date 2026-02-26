import React, { useState, useCallback, useRef, useMemo } from 'react';
import { 
  User, MapPin, CreditCard, Bell, Shield, 
  HelpCircle, LogOut, ChevronRight, Camera, 
  Trash2, Plus, X, Sun, Moon, Globe, Gift, 
  Wallet, Phone, Loader2, CheckCircle2, ChevronLeft, ArrowRight,
  Mail, Smartphone, ShieldCheck, CreditCard as CardIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * --- UI Components ---
 * Separated for better maintainability and reusability.
 */

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: <CheckCircle2 size={20} className="text-green-300"/>, style: 'bg-green-600/90 border-green-500/50' },
    error: { icon: <X size={20} className="text-red-300"/>, style: 'bg-red-600/90 border-red-500/50' },
    info: { icon: <Bell size={20} className="text-blue-400"/>, style: 'bg-slate-900/95 dark:bg-white/95 border-slate-800 dark:border-white/20 text-white dark:text-slate-900' }
  };

  const { icon, style } = config[type] || config.info;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-8 left-1/2 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 w-[90%] max-w-xs backdrop-blur-xl border ${style} text-white`}
    >
      {icon}
      <span className="text-xs font-black">{message}</span>
    </motion.div>
  );
};

// Modal Component
const Modal = ({ title, isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
        />
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl max-h-[90vh] flex flex-col"
        >
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden shrink-0" />
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
              <X size={20}/>
            </button>
          </div>
          <div className="overflow-y-auto hide-scrollbar pb-4 flex-1">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Input Field Component
const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-xs font-black text-slate-400 px-1 uppercase tracking-widest">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />}
      <input 
        {...props}
        className={`w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-4 ${Icon ? 'pr-12' : 'pr-5'} pl-4 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all`} 
      />
    </div>
  </div>
);

/**
 * --- Main Profile Component ---
 */
const Profile = () => {
  // --- State Management ---
  const [user, setUser] = useState({
    displayName: 'محمود أحمد',
    email: 'mahmoud@example.com',
    phone: '01012345678',
    photoURL: null,
    loyaltyPoints: 1250,
    walletBalance: 450.00
  });

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'المنزل', details: 'شارع التحرير، الدقي، الجيزة', isDefault: true },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4215', expiry: '12/26' }
  ]);

  const [settings, setSettings] = useState({
    theme: 'dark', 
    lang: 'ar',
    notifications: true
  });

  const [activeModal, setActiveModal] = useState(null); 
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  // Form States
  const [newAddress, setNewAddress] = useState({ label: '', details: '' });
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)", "error");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setUser(prev => ({ ...prev, photoURL: imageUrl }));
      showToast("تم تحديث صورتك الشخصية بنجاح ✨", "success");
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const phone = formData.get('phone');
    
    // Simulate API Call
    setTimeout(() => {
      setUser(prev => ({ ...prev, displayName: name, phone: phone }));
      showToast("تم تحديث البيانات بنجاح", "success");
      setLoading(false);
      setActiveModal(null);
    }, 1000);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.label.trim() || !newAddress.details.trim()) return;
    
    setAddresses(prev => [...prev, { 
      id: Date.now(), 
      ...newAddress, 
      isDefault: prev.length === 0 
    }]);
    setNewAddress({ label: '', details: '' });
    setShowAddForm(false);
    showToast("تم إضافة العنوان الجديد 📍", "success");
  };

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast("تم حذف العنوان", "info");
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const cleanNumber = newCard.number.replace(/\s/g, '');
    if (cleanNumber.length < 16 || !newCard.expiry) {
      showToast("يرجى التأكد من بيانات البطاقة", "error");
      return;
    }
    
    setPaymentMethods(prev => [...prev, { 
      id: Date.now(), 
      type: cleanNumber.startsWith('4') ? 'Visa' : 'MasterCard', 
      last4: cleanNumber.slice(-4), 
      expiry: newCard.expiry 
    }]);
    setNewCard({ number: '', expiry: '', cvv: '' });
    setShowAddForm(false);
    showToast("تم إضافة البطاقة بنجاح 💳", "success");
  };

  const handleLanguageSwitch = () => {
    setIsSimulatingLoad(true);
    setTimeout(() => {
      setSettings(s => ({ ...s, lang: s.lang === 'ar' ? 'en' : 'ar' }));
      setIsSimulatingLoad(false);
      showToast("تم تغيير لغة التطبيق", "success");
    }, 1000);
  };

  // --- Menu Configuration ---
  const menuGroups = useMemo(() => [
    {
      title: settings.lang === 'ar' ? "إعدادات الحساب" : "Account Settings",
      items: [
        { 
          icon: User, 
          label: settings.lang === 'ar' ? "البيانات الشخصية" : "Personal Info", 
          desc: settings.lang === 'ar' ? "تعديل الاسم ورقم الهاتف" : "Edit name and phone", 
          color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", 
          action: () => setActiveModal('edit-profile') 
        },
        { 
          icon: MapPin, 
          label: settings.lang === 'ar' ? "عناوين التوصيل" : "Delivery Addresses", 
          desc: settings.lang === 'ar' ? `${addresses.length} عناوين مسجلة` : `${addresses.length} saved addresses`, 
          color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10", 
          action: () => { setActiveModal('addresses'); setShowAddForm(false); } 
        },
        { 
          icon: CreditCard, 
          label: settings.lang === 'ar' ? "المحفظة والدفع" : "Wallet & Payments", 
          desc: settings.lang === 'ar' ? "إدارة البطاقات والرصيد" : "Manage cards and balance", 
          color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10", 
          action: () => { setActiveModal('payments'); setShowAddForm(false); } 
        },
      ]
    },
    {
      title: settings.lang === 'ar' ? "تفضيلات التطبيق" : "App Preferences",
      items: [
        { 
          icon: settings.theme === 'dark' ? Sun : Moon, 
          label: settings.lang === 'ar' ? "مظهر التطبيق" : "App Theme", 
          desc: settings.theme === 'dark' ? (settings.lang === 'ar' ? "الوضع الداكن" : "Dark Mode") : (settings.lang === 'ar' ? "الوضع الفاتح" : "Light Mode"), 
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
          type: "toggle",
          value: settings.theme === 'dark',
          action: () => setSettings(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        },
        { 
          icon: Globe, 
          label: settings.lang === 'ar' ? "لغة التطبيق" : "App Language", 
          desc: settings.lang === 'ar' ? "العربية" : "English", 
          color: "text-teal-600 bg-teal-50 dark:bg-teal-500/10",
          action: handleLanguageSwitch
        },
        { 
          icon: Bell, 
          label: settings.lang === 'ar' ? "الإشعارات الذكية" : "Smart Notifications", 
          desc: settings.notifications ? (settings.lang === 'ar' ? "مفعلة" : "Enabled") : (settings.lang === 'ar' ? "صامت" : "Muted"), 
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10",
          type: "toggle",
          value: settings.notifications,
          action: () => {
            setSettings(s => ({ ...s, notifications: !s.notifications }));
            showToast(settings.notifications ? "تم كتم الإشعارات" : "تم تفعيل الإشعارات", "info");
          }
        },
      ]
    },
    {
      title: settings.lang === 'ar' ? "أخرى" : "Others",
      items: [
        { icon: HelpCircle, label: settings.lang === 'ar' ? "مركز المساعدة" : "Help Center", desc: settings.lang === 'ar' ? "تواصل مع فريق الدعم" : "Contact support", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", action: () => window.open("https://wa.me/201000000000", "_blank") },
        { icon: Shield, label: settings.lang === 'ar' ? "الخصوصية والأمان" : "Privacy & Security", desc: settings.lang === 'ar' ? "سياسة الاستخدام" : "Terms of use", color: "text-slate-600 bg-slate-100 dark:bg-slate-800", action: () => showToast("سياسة الخصوصية مشفرة ومؤمنة", "info") },
      ]
    }
  ], [settings, addresses.length, handleLanguageSwitch, showToast]);

  const isRTL = settings.lang === 'ar';

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark bg-[#020617]' : 'bg-[#F8FAFC]'} font-sans pb-32 transition-colors duration-500`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSimulatingLoad && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-[#F8FAFC] dark:bg-[#020617] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-slate-800 dark:text-white tracking-widest uppercase animate-pulse">TIRYAQ OS</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="relative mb-12">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-b-[3rem] shadow-lg shadow-blue-900/20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative px-6 pt-24 text-center">
          {/* Avatar Upload */}
          <div className="relative inline-block group">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 p-1.5 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl mx-auto overflow-hidden border-4 border-[#F8FAFC] dark:border-[#020617]"
            >
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </motion.div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-2xl shadow-xl border-4 border-white dark:border-slate-900 hover:bg-blue-700 transition-colors z-10"
            >
              <Camera size={18} />
            </motion.button>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-4">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{user.displayName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">{user.email}</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mt-8">
            <motion.div 
              whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('loyalty')} 
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-center cursor-pointer group text-right"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Gift size={20} /></div>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">{isRTL ? 'نقاط الولاء' : 'Loyalty Points'}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{user.loyaltyPoints.toLocaleString()}</p>
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('wallet')}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col justify-center cursor-pointer group text-right"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">{isRTL ? 'المحفظة' : 'Wallet'}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{user.walletBalance.toFixed(0)} <span className="text-xs text-slate-400">{isRTL ? 'ج.م' : 'EGP'}</span></p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Settings Lists */}
      <div className="px-6 space-y-8">
        {menuGroups.map((group, index) => (
          <motion.div key={index} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + (index * 0.1) }}>
            <h3 className="text-[11px] font-black text-slate-400 mb-3 px-2 uppercase tracking-widest">{group.title}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
              {group.items.map((item, i) => (
                <div key={i}>
                  <div 
                    onClick={item.type === 'toggle' ? undefined : item.action}
                    className={`w-full p-5 flex items-center justify-between transition-all ${item.type !== 'toggle' ? 'hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center ${item.color}`}>
                        <item.icon size={22} strokeWidth={2} />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    {item.type === 'toggle' ? (
                      <button onClick={item.action} className={`w-12 h-7 rounded-full transition-colors relative ${item.value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <motion.div 
                          animate={{ x: item.value ? (isRTL ? -20 : 20) : (isRTL ? -4 : 4) }} 
                          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm" 
                          style={{ right: isRTL ? 0 : 'auto', left: !isRTL ? 0 : 'auto' }}
                        />
                      </button>
                    ) : (
                      <ChevronLeft size={20} className={`text-slate-300 dark:text-slate-600 ${isRTL ? 'rotate-0' : 'rotate-180'}`} />
                    )}
                  </div>
                  {i < group.items.length - 1 && <div className="h-px bg-slate-50 dark:bg-white/5 mx-6"></div>}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.button 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          onClick={() => {
            setLoading(true);
            setTimeout(() => { showToast(isRTL ? "تم تسجيل الخروج بنجاح" : "Logged out successfully", "success"); setLoading(false); }, 1500);
          }} 
          disabled={loading}
          className="w-full bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 shadow-sm flex items-center justify-center gap-3 group active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {loading ? <Loader2 size={24} className="text-red-500 animate-spin" /> : (
            <>
              <LogOut size={22} className={`text-red-500 ${isRTL ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              <span className="font-black text-base text-red-600 dark:text-red-400">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Modals */}
      
      {/* 1. Edit Profile Modal */}
      <Modal title={isRTL ? "تعديل البيانات" : "Edit Profile"} isOpen={activeModal === 'edit-profile'} onClose={() => setActiveModal(null)}>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <InputField label={isRTL ? "الاسم الكامل" : "Full Name"} name="name" type="text" defaultValue={user.displayName} icon={User} required />
          <InputField label={isRTL ? "رقم الهاتف" : "Phone Number"} name="phone" type="tel" defaultValue={user.phone} icon={Phone} dir="ltr" required className="text-right" />
          <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-600/20 mt-4 active:scale-95 transition-transform flex justify-center">
            {loading ? <Loader2 className="animate-spin" size={24}/> : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </button>
        </form>
      </Modal>

      {/* 2. Addresses Modal */}
      <Modal title={isRTL ? "عناوين التوصيل" : "Addresses"} isOpen={activeModal === 'addresses'} onClose={() => setActiveModal(null)}>
        <AnimatePresence mode="wait">
          {!showAddForm ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {addresses.length === 0 && <p className="text-center text-slate-400 py-4 font-bold">{isRTL ? 'لا توجد عناوين مسجلة' : 'No addresses found'}</p>}
              {addresses.map(addr => (
                <div key={addr.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex justify-between items-center border border-slate-100 dark:border-white/5">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><MapPin size={24} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-slate-800 dark:text-white">{addr.label}</p>
                        {addr.isDefault && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[9px] px-2 py-0.5 rounded-md font-black">{isRTL ? 'الأساسي' : 'Default'}</span>}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{addr.details}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={20}/></button>
                </div>
              ))}
              <button onClick={() => setShowAddForm(true)} className="w-full py-5 border-2 border-dashed border-blue-200 dark:border-blue-900/50 text-blue-600 rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Plus size={20} strokeWidth={3} /> {isRTL ? 'إضافة عنوان جديد' : 'Add New Address'}
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleAddAddress} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <InputField placeholder={isRTL ? "اسم العنوان (مثال: المنزل)" : "Address Label (e.g. Home)"} required value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
              <textarea placeholder={isRTL ? "التفاصيل (الشارع، العمارة، الدور)" : "Details (Street, Building, Floor)"} required value={newAddress.details} onChange={e => setNewAddress({...newAddress, details: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-5 font-bold outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-slate-900 dark:text-white"></textarea>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-[1] py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">{isRTL ? 'حفظ العنوان' : 'Save Address'}</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Modal>

      {/* 3. Payments Modal */}
      <Modal title={isRTL ? "طرق الدفع" : "Payment Methods"} isOpen={activeModal === 'payments'} onClose={() => setActiveModal(null)}>
        <AnimatePresence mode="wait">
          {!showAddForm ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              {paymentMethods.map(pm => (
                <motion.div whileHover={{ scale: 1.02 }} key={pm.id} className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8"><CardIcon size={28} className="opacity-80" /><p className="text-sm font-black italic tracking-widest">{pm.type}</p></div>
                    <p className="text-xl font-black tracking-[0.3em] mb-6 font-mono" dir="ltr">**** **** **** {pm.last4}</p>
                    <div className="flex justify-between items-end">
                      <div><p className="text-[9px] font-bold opacity-60 uppercase mb-1">Card Holder</p><p className="text-xs font-black uppercase">{user.displayName}</p></div>
                      <div><p className="text-[9px] font-bold opacity-60 uppercase mb-1">Expires</p><p className="text-xs font-black font-mono">{pm.expiry}</p></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                </motion.div>
              ))}
              <button onClick={() => setShowAddForm(true)} className="w-full py-5 border-2 border-dashed border-blue-200 dark:border-blue-900/50 text-blue-600 rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Plus size={20} strokeWidth={3} /> {isRTL ? 'إضافة بطاقة ائتمان' : 'Add Credit Card'}
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleAddCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <InputField 
                placeholder={isRTL ? "رقم البطاقة" : "Card Number"} 
                maxLength="19" 
                required 
                value={newCard.number} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                  setNewCard({...newCard, number: val});
                }} 
                className="font-mono tracking-widest" 
                dir="ltr"
              />
              <div className="flex gap-4">
                <InputField 
                  placeholder="MM/YY" 
                  maxLength="5" 
                  required 
                  value={newCard.expiry} 
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                    setNewCard({...newCard, expiry: val});
                  }} 
                  className="text-center font-mono" 
                  dir="ltr"
                />
                <InputField 
                  placeholder="CVV" 
                  maxLength="3" 
                  type="password"
                  required 
                  value={newCard.cvv}
                  onChange={e => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '')})}
                  className="text-center font-mono" 
                  dir="ltr"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-[1] py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">{isRTL ? 'حفظ البطاقة' : 'Save Card'}</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Modal>

      {/* 4. Wallet Action Modal */}
      <Modal title={isRTL ? "المحفظة" : "Wallet"} isOpen={activeModal === 'wallet'} onClose={() => setActiveModal(null)}>
        <div className="text-center pb-4">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Wallet size={40}/></div>
          <p className="text-sm font-bold text-slate-500 mb-1">{isRTL ? 'الرصيد المتاح' : 'Available Balance'}</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{user.walletBalance.toFixed(2)} <span className="text-lg text-slate-400">{isRTL ? 'ج.م' : 'EGP'}</span></h3>
          <button onClick={() => { showToast(isRTL ? "جاري تحويلك لبوابة الدفع لشحن الرصيد" : "Redirecting to payment gateway..."); setActiveModal(null); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Plus size={20} strokeWidth={3}/> {isRTL ? 'شحن المحفظة' : 'Top Up Wallet'}
          </button>
        </div>
      </Modal>

      {/* 5. Loyalty Points Modal */}
      <Modal title={isRTL ? "نقاط الولاء" : "Loyalty Points"} isOpen={activeModal === 'loyalty'} onClose={() => setActiveModal(null)}>
        <div className="text-center pb-4">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"><Gift size={40}/></div>
          <p className="text-sm font-bold text-slate-500 mb-1">{isRTL ? 'إجمالي النقاط' : 'Total Points'}</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{user.loyaltyPoints} <span className="text-lg text-slate-400">{isRTL ? 'نقطة' : 'Points'}</span></h3>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300">
            {isRTL ? (
              <>يمكنك استبدال نقاطك بخصم <span className="text-orange-600">50 ج.م</span> على طلبك القادم.</>
            ) : (
              <>You can redeem your points for a <span className="text-orange-600">50 EGP</span> discount on your next order.</>
            )}
          </div>
          <button 
            disabled={user.loyaltyPoints < 500}
            onClick={() => { 
              setUser(p => ({...p, loyaltyPoints: p.loyaltyPoints - 500, walletBalance: p.walletBalance + 50})); 
              showToast(isRTL ? "تم تحويل 500 نقطة إلى 50 ج.م في محفظتك!" : "Redeemed 500 points for 50 EGP!", "success"); 
              setActiveModal(null); 
            }} 
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isRTL ? 'استبدال النقاط الآن' : 'Redeem Points Now'}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Profile;
