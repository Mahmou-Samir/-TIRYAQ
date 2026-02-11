import React, { useState } from 'react';
import { 
  User, MapPin, CreditCard, FileText, Bell, Shield, 
  HelpCircle, LogOut, ChevronRight, Edit2, Wallet, 
  Gift, Heart, Moon, Globe, Copy, Check, Loader2, Phone 
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext'; // استيراد الإعدادات

// --- Custom Styles ---
const customStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
  
  /* Toggle Switch Style */
  .toggle-checkbox:checked {
    right: 0;
    border-color: #3b82f6;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #3b82f6;
  }
`;

const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { theme, toggleTheme, lang, toggleLang } = useSettings(); // استخدام الكونتكست الحقيقي

  // States
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  // --- Actions ---
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      // محاكاة تأخير بسيط لتجربة مستخدم أفضل
      setTimeout(async () => {
        await signOut(auth);
        navigate('/login');
      }, 800);
    } catch (error) {
      console.error("Error logging out:", error);
      setLoadingLogout(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("TIRYAQ-2025");
    setCopied(true);
    showToast("تم نسخ كود الدعوة بنجاح", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const openSupport = () => {
    window.open("https://wa.me/201000000000", "_blank"); // ربط بواتساب
  };

  // --- Menu Data Structure ---
  const menuGroups = [
    {
      title: "الحساب الشخصي",
      items: [
        { 
          icon: User, 
          label: "تعديل البيانات", 
          desc: "الاسم، كلمة المرور", 
          color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
          action: () => showToast("سيتم فتح نموذج التعديل قريباً", "info")
        },
        { 
          icon: MapPin, 
          label: "عناويني المسجلة", 
          desc: "المنزل، العمل", 
          color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
          action: () => showToast("جاري تحميل الخريطة...", "info")
        },
        { 
          icon: CreditCard, 
          label: "طرق الدفع", 
          desc: "**** 4215", 
          color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
          action: () => showToast("إدارة البطاقات البنكية", "info")
        },
      ]
    },
    {
      title: "تفضيلات التطبيق",
      items: [
        { 
          icon: Moon, 
          label: "الوضع الليلي", 
          desc: theme === 'dark' ? "مفعل" : "معطل", 
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
          type: "toggle",
          value: theme === 'dark',
          action: toggleTheme
        },
        { 
          icon: Globe, 
          label: "اللغة / Language", 
          desc: lang === 'ar' ? "العربية" : "English", 
          color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20",
          action: toggleLang
        },
        { 
          icon: Bell, 
          label: "الإشعارات", 
          desc: notificationsEnabled ? "مفعلة" : "صامت", 
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
          type: "toggle",
          value: notificationsEnabled,
          action: () => setNotificationsEnabled(!notificationsEnabled)
        },
      ]
    },
    {
      title: "الدعم والأمان",
      items: [
        { 
          icon: HelpCircle, 
          label: "الدعم الفني", 
          desc: "تواصل معنا 24/7", 
          color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20",
          action: openSupport
        },
        { 
          icon: Shield, 
          label: "سياسة الخصوصية", 
          desc: "الشروط والأحكام", 
          color: "text-slate-600 bg-slate-50 dark:bg-slate-800",
          action: () => window.open("#", "_blank")
        },
      ]
    }
  ];

  return (
    <div className="animate-fade-in pb-28 font-sans">
      <style>{customStyles}</style>
      
      {/* 🔮 Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-slate-800'} text-white transition-all`}>
          {toast.type === 'success' ? <Check size={18}/> : <Bell size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* 🟢 1. Header Card */}
      <div className="relative mb-6">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-[2.5rem] shadow-lg"></div>
        
        <div className="relative px-6 pt-16 text-center">
          {/* Avatar */}
          <div className="relative inline-block group cursor-pointer" onClick={() => showToast("فتح الصورة الشخصية")}>
            <div className="w-28 h-28 p-1 bg-white dark:bg-slate-900 rounded-full shadow-xl mx-auto overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-slate-400 select-none">{user?.displayName?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900 hover:bg-blue-700 transition-colors">
              <Edit2 size={14} />
            </button>
          </div>

          {/* Info */}
          <div className="mt-3">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{user?.displayName || 'ضيف ترياق'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium dir-ltr">{user?.email}</p>
          </div>

          {/* Stats Row (Interactive) */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div onClick={handleCopyCode} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform group relative overflow-hidden">
              {copied && <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center text-green-600 text-xs font-bold">تم النسخ!</div>}
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                {copied ? <Check size={20}/> : <Gift size={20} />}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold">نقاط الولاء</p>
                <p className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-1">
                  1,250 <Copy size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </p>
              </div>
            </div>

            <div onClick={() => showToast("رصيدك الحالي 450 ج.م")} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold">المحفظة</p>
                <p className="text-lg font-black text-slate-800 dark:text-white">450 ج.م</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 2. Settings Groups (Dynamic) */}
      <div className="px-6 space-y-6">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="text-sm font-bold text-slate-400 mb-3 px-2">{group.title}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              {group.items.map((item, i) => (
                <div key={i}>
                  <div 
                    onClick={item.type === 'toggle' ? undefined : item.action}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${item.type !== 'toggle' ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:bg-slate-100 dark:active:bg-slate-700' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                        <item.icon size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700 dark:text-white">{item.label}</p>
                        {item.desc && <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>}
                      </div>
                    </div>

                    {/* Conditional Rendering based on Type */}
                    {item.type === 'toggle' ? (
                      <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                        <input 
                          type="checkbox" 
                          name="toggle" 
                          id={`toggle-${index}-${i}`} 
                          className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                          style={{ top: '4px', left: item.value ? '20px' : '4px', borderColor: 'transparent' }}
                          checked={item.value}
                          onChange={item.action}
                        />
                        <label 
                          htmlFor={`toggle-${index}-${i}`} 
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${item.value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        ></label>
                      </div>
                    ) : (
                      <ChevronRight size={18} className="text-slate-300 rtl:rotate-180" />
                    )}
                  </div>
                  {/* Divider */}
                  {i < group.items.length - 1 && <div className="h-px bg-slate-100 dark:bg-slate-800 mx-16"></div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 🟢 3. Logout Button (With Loading) */}
        <button 
          onClick={handleLogout} 
          disabled={loadingLogout}
          className="w-full bg-red-50 dark:bg-red-900/10 p-4 rounded-3xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-3 group active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loadingLogout ? (
            <Loader2 size={20} className="text-red-500 animate-spin" />
          ) : (
            <>
              <LogOut size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-red-600 dark:text-red-400">تسجيل الخروج من التطبيق</span>
            </>
          )}
        </button>

        {/* Version Info */}
        <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 font-mono pt-4 pb-8">
          Tiryaq App v2.4.0 (Build 2025)
        </p>
      </div>

    </div>
  );
};

export default Profile;