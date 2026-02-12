import React, { useState, useCallback } from 'react';
import { 
  User, MapPin, CreditCard, Bell, Shield, 
  HelpCircle, LogOut, ChevronRight, Camera, 
  Trash2, Plus, X, Sun, Moon, Globe, Gift, 
  Wallet, Phone, Loader2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-Components ---

const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: -50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: -20, x: '-50%' }}
    className={`fixed top-6 left-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : 'bg-slate-800'} text-white`}
  >
    {type === 'success' ? <Check size={18}/> : <Bell size={18}/>}
    <span className="text-sm font-bold">{message}</span>
  </motion.div>
);

const Modal = ({ title, isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
        ></motion.div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 text-slate-400"><X size={20}/></button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Main Component ---

const Profile = () => {
  // --- States ---
  const [user] = useState({
    displayName: 'محمود أحمد',
    email: 'mahmoud@example.com',
    phone: '01012345678',
    photoURL: null,
    loyaltyPoints: 1250,
    walletBalance: 450.00
  });

  const [addresses] = useState([
    { id: 1, label: 'المنزل', details: 'شارع التحرير، الدقي، الجيزة', isDefault: true },
    { id: 2, label: 'العمل', details: 'القرية الذكية، طريق مصر إسكندرية الصحراوي', isDefault: false }
  ]);

  const [paymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4215', expiry: '12/26' }
  ]);

  const [settings, setSettings] = useState({
    theme: 'light',
    lang: 'ar',
    notifications: true
  });

  const [activeModal, setActiveModal] = useState(null); // 'edit-profile', 'addresses', 'payments'
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Handlers ---
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("TIRYAQ-2025");
    setCopied(true);
    showToast("تم نسخ كود الدعوة بنجاح", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateProfile = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast("تم تحديث البيانات بنجاح", "success");
      setLoading(false);
      setActiveModal(null);
    }, 1000);
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      showToast("تم تسجيل الخروج بنجاح", "info");
      setLoading(false);
    }, 1000);
  };

  // --- Menu Data ---
  const menuGroups = [
    {
      title: "الحساب الشخصي",
      items: [
        { icon: User, label: "تعديل البيانات", desc: "الاسم، الهاتف، الصورة", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", action: () => setActiveModal('edit-profile') },
        { icon: MapPin, label: "عناويني المسجلة", desc: `${addresses.length} عناوين مسجلة`, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20", action: () => setActiveModal('addresses') },
        { icon: CreditCard, label: "طرق الدفع", desc: paymentMethods.length > 0 ? `Visa **** ${paymentMethods[0].last4}` : "أضف بطاقة دفع", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", action: () => setActiveModal('payments') },
      ]
    },
    {
      title: "تفضيلات التطبيق",
      items: [
        { 
          icon: settings.theme === 'dark' ? Sun : Moon, 
          label: "الوضع الليلي", 
          desc: settings.theme === 'dark' ? "مفعل" : "معطل", 
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
          type: "toggle",
          value: settings.theme === 'dark',
          action: () => setSettings(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        },
        { 
          icon: Globe, 
          label: "اللغة / Language", 
          desc: settings.lang === 'ar' ? "العربية" : "English", 
          color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20",
          action: () => setSettings(s => ({ ...s, lang: s.lang === 'ar' ? 'en' : 'ar' }))
        },
        { 
          icon: Bell, 
          label: "الإشعارات", 
          desc: settings.notifications ? "مفعلة" : "صامت", 
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
          type: "toggle",
          value: settings.notifications,
          action: () => setSettings(s => ({ ...s, notifications: !s.notifications }))
        },
      ]
    },
    {
      title: "الدعم والأمان",
      items: [
        { icon: HelpCircle, label: "الدعم الفني", desc: "تواصل معنا 24/7", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20", action: () => window.open("https://wa.me/201000000000", "_blank") },
        { icon: Shield, label: "سياسة الخصوصية", desc: "الشروط والأحكام", color: "text-slate-600 bg-slate-50 dark:bg-slate-800", action: () => showToast("سيتم عرض السياسة قريباً") },
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark bg-[#020617]' : 'bg-[#F8FAFC]'} font-sans pb-32 transition-colors duration-500`} dir="rtl">
      
      {/* 🔮 Toast System */}
      <AnimatePresence>
        {toast && <Toast {...toast} />}
      </AnimatePresence>

      {/* 🟢 Header Card */}
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-[3rem] shadow-lg"></div>
        
        <div className="relative px-6 pt-20 text-center">
          {/* Avatar */}
          <div className="relative inline-block group">
            <div className="w-32 h-32 p-1.5 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl mx-auto overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-[2.2rem] overflow-hidden flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
            </div>
            <button 
              onClick={() => setActiveModal('edit-profile')}
              className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900 hover:bg-blue-700 transition-colors"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Info */}
          <div className="mt-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user.displayName}</h1>
            <p className="text-sm text-slate-400 font-bold mt-1">{user.email}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode} 
              className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 cursor-pointer relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                <Gift size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">نقاط الولاء</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{user.loyaltyPoints.toLocaleString()}</p>
              </div>
              {copied && <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center text-green-600 text-xs font-black">تم النسخ!</div>}
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={() => showToast(`رصيدك الحالي: ${user.walletBalance} ج.م`)}
              className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">المحفظة</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{user.walletBalance.toFixed(2)}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 🟢 Settings Groups */}
      <div className="px-6 space-y-8">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="text-xs font-black text-slate-400 mb-4 px-2 uppercase tracking-widest">{group.title}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
              {group.items.map((item, i) => (
                <div key={i}>
                  <div 
                    onClick={item.type === 'toggle' ? undefined : item.action}
                    className={`w-full p-5 flex items-center justify-between transition-all ${item.type !== 'toggle' ? 'hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:scale-[0.98]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                        <item.icon size={22} />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    {item.type === 'toggle' ? (
                      <button 
                        onClick={item.action}
                        className={`w-12 h-7 rounded-full transition-colors relative ${item.value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <motion.div 
                          animate={{ x: item.value ? -20 : -4 }}
                          className="absolute top-1 right-0 w-5 h-5 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    ) : (
                      <ChevronRight size={18} className="text-slate-300" />
                    )}
                  </div>
                  {i < group.items.length - 1 && <div className="h-px bg-slate-50 dark:bg-white/5 mx-6"></div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 🟢 Logout Button */}
        <button 
          onClick={handleLogout} 
          disabled={loading}
          className="w-full bg-red-50 dark:bg-red-500/10 p-5 rounded-[2rem] border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-3 group active:scale-95 transition-all disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={20} className="text-red-500 animate-spin" />
          ) : (
            <>
              <LogOut size={20} className="text-red-500 group-hover:translate-x-1 transition-transform" />
              <span className="font-black text-sm text-red-600 dark:text-red-400">تسجيل الخروج من التطبيق</span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 font-black pt-4 pb-8 uppercase tracking-widest">
          Tiryaq App v2.5.0 • 2026
        </p>
      </div>

      {/* 🟢 Modals */}
      
      {/* Edit Profile Modal */}
      <Modal title="تعديل البيانات" isOpen={activeModal === 'edit-profile'} onClose={() => setActiveModal(null)}>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 px-1">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" defaultValue={user.displayName}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 px-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="tel" defaultValue={user.phone}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 mt-4">
            {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "حفظ التغييرات"}
          </button>
        </form>
      </Modal>

      {/* Addresses Modal */}
      <Modal title="عناويني" isOpen={activeModal === 'addresses'} onClose={() => setActiveModal(null)}>
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{addr.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{addr.details}</p>
                </div>
              </div>
              <button className="text-red-400 p-2"><Trash2 size={18}/></button>
            </div>
          ))}
          <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <Plus size={18} /> إضافة عنوان جديد
          </button>
        </div>
      </Modal>

      {/* Payments Modal */}
      <Modal title="طرق الدفع" isOpen={activeModal === 'payments'} onClose={() => setActiveModal(null)}>
        <div className="space-y-4">
          {paymentMethods.map(pm => (
            <div key={pm.id} className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black opacity-60 mb-4">{pm.type}</p>
                <p className="text-lg font-black tracking-widest mb-4">**** **** **** {pm.last4}</p>
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold opacity-80">EXPIRES: {pm.expiry}</p>
                  <CreditCard size={24} className="opacity-40" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          ))}
          <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black flex items-center justify-center gap-2">
            <Plus size={18} /> إضافة بطاقة جديدة
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Profile;
