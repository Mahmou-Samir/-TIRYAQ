import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSettings } from '../../context/SettingsContext';
import { usePatient } from '../../context/PatientContext';
import {
  User, MapPin, CreditCard, Bell, Shield,
  HelpCircle, LogOut, Camera, Trash2, Plus, X,
  Sun, Moon, Globe, Gift, Wallet, Phone, Clock,
  Loader2, CheckCircle2, ChevronLeft, Mail,
  ShieldCheck, Star, TrendingUp, Zap, Eye, EyeOff,
  AlertCircle, Lock, ArrowUpRight, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ─────────────────────────────────────────────────────────────
const WALLET_TOPUP = [50, 100, 200, 500];

const CARD_GRADIENTS = [
  'from-slate-800 via-slate-900 to-slate-950',
  'from-blue-900 via-blue-950 to-slate-950',
  'from-violet-900 via-slate-900 to-slate-950',
];

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900',
  };
  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    info: <Bell size={16} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -48, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -24, x: '-50%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed top-6 left-1/2 z-[400] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold max-w-[88vw] ${styles[type] || styles.info}`}
    >
      {icons[type] || icons.info}
      <span>{message}</span>
    </motion.div>
  );
};

// ─── Language Switcher ────────────────────────────────────────────────────────
const LanguageSwitcher = ({ lang, onChange, labels }) => (
  <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
    {['ar', 'en'].map((code) => (
      <button
        key={code}
        type="button"
        onClick={() => onChange(code)}
        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
          lang === code
            ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        {labels[code]}
      </button>
    ))}
  </div>
);

// ─── Bottom Sheet Modal ──────────────────────────────────────────────────────
const Sheet = ({ title, isOpen, onClose, children, size = 'md' }) => {
  const heights = { sm: 'max-h-[50vh]', md: 'max-h-[75vh]', lg: 'max-h-[90vh]' };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`relative w-full lg:max-w-xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col ${heights[size]}`}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 shrink-0 border-b border-slate-50 dark:border-white/5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Input Field ─────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, suffix, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon
          size={17}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
        />
      )}
      <input
        {...props}
        className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 ${
          Icon ? 'pr-11' : 'pr-4'
        } ${suffix ? 'pl-16' : 'pl-4'} ${
          error
            ? 'border-red-400'
            : 'border-transparent focus:border-blue-500'
        }`}
      />
      {suffix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="text-[11px] text-red-500 font-bold px-1">{error}</p>}
  </div>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <motion.div
      animate={{ x: value ? 24 : 4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
      style={{ right: 'auto', left: 0 }}
    />
  </button>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 'lg', onClick }) => {
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  const sizeClasses = {
    lg: 'w-28 h-28 text-2xl rounded-[2rem]',
    md: 'w-14 h-14 text-lg rounded-2xl',
    sm: 'w-10 h-10 text-sm rounded-xl',
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white overflow-hidden relative ${onClick ? 'cursor-pointer' : ''}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials || <User size={24} />}</span>
      )}
    </motion.div>
  );
};

// ─── Credit Card Visual ───────────────────────────────────────────────────────
const CardVisual = ({ card, holderName, gradientIdx = 0, labels = {} }) => (
  <div className={`relative bg-gradient-to-br ${CARD_GRADIENTS[gradientIdx % CARD_GRADIENTS.length]} rounded-[1.75rem] p-6 text-white overflow-hidden shadow-2xl select-none`}>
    {/* Decoration */}
    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
    <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

    <div className="relative z-10">
      <div className="flex justify-between items-start mb-8">
        <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-md opacity-90" />
        <span className="text-xs font-black tracking-widest opacity-70 italic">{card.type}</span>
      </div>
      <p className="text-lg font-black tracking-[0.22em] font-mono mb-6 opacity-95" dir="ltr">
        •••• •••• •••• {card.last4}
      </p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1">{labels.cardHolder || 'Card Holder'}</p>
          <p className="text-xs font-black uppercase tracking-wide">{holderName}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1">{labels.expires || 'Expires'}</p>
          <p className="text-xs font-black font-mono">{card.expiry}</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { theme, toggleTheme, lang, changeLanguage, t } = useSettings();
  const { recentOrders } = usePatient();
  const p = t.patient?.profile ?? {};
  const m = p.modals ?? {};
  const toastMsg = p.toast ?? {};
  const val = p.validation ?? {};
  const loyaltyHistory = p.loyaltyHistory ?? [];

  const [user, setUser] = useState({
    displayName: '',
    email: '',
    phone: '',
    photoURL: null,
    loyaltyPoints: 1250,
    walletBalance: 450.0,
    memberSince: '—',
    totalOrders: 0,
    savedAmount: 320,
  });

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'المنزل', details: 'شارع التحرير، الدقي، الجيزة', isDefault: true, icon: '🏠' },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4215', expiry: '12/26' },
  ]);

  const [settings, setSettings] = useState({
    notifications: true,
    orderUpdates: true,
    offerAlerts: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      const fbUser = auth.currentUser;
      if (!fbUser) return;

      let phone = '';
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) phone = snap.data().phone || '';
      } catch {}

      setUser((u) => ({
        ...u,
        displayName: fbUser.displayName || p.defaultUser || 'مستخدم ترياق',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL,
        phone: phone || u.phone,
        totalOrders: recentOrders.length,
        memberSince: fbUser.metadata?.creationTime
          ? new Date(fbUser.metadata.creationTime).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })
          : '—',
      }));
    };
    loadUser();
  }, [auth.currentUser?.uid, recentOrders.length, lang, p.defaultUser]);

  // ── UI State ──
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [newAddress, setNewAddress] = useState({ label: '', details: '', icon: '📍' });
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});

  const fileRef = useRef(null);
  const isRTL = lang === 'ar';

  // ── Toast ──
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const switchLang = useCallback((newLang) => {
    if (newLang === lang) return;
    changeLanguage(newLang);
    showToast(toastMsg.langChanged || 'Language changed', 'success');
  }, [lang, changeLanguage, toastMsg.langChanged, showToast]);

  // ── Image Upload ──
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast(toastMsg.imageLarge, 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setUser((u) => ({ ...u, photoURL: url }));
    showToast(toastMsg.photoUpdated, 'success');
  };

  // ── Profile Edit ──
  const openEditProfile = () => {
    setProfileForm({ name: user.displayName, phone: user.phone });
    setProfileErrors({});
    setModal('edit-profile');
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.name.trim() || profileForm.name.trim().length < 3)
      errs.name = val.nameMin;
    if (!/^01[0-9]{9}$/.test(profileForm.phone.replace(/\s/g, '')))
      errs.phone = val.phoneInvalid;
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setLoading(true);
    try {
      const fbUser = auth.currentUser;
      if (fbUser) {
        await updateProfile(fbUser, { displayName: profileForm.name.trim() });
        await updateDoc(doc(db, 'users', fbUser.uid), {
          phone: profileForm.phone,
          displayName: profileForm.name.trim(),
        }).catch(() => {});
      }
      setUser((u) => ({ ...u, displayName: profileForm.name.trim(), phone: profileForm.phone }));
      showToast(toastMsg.profileSaved, 'success');
      setModal(null);
    } catch {
      showToast(toastMsg.saveError, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Addresses ──
  const handleAddAddress = () => {
    if (!newAddress.label.trim() || !newAddress.details.trim()) {
      showToast(toastMsg.fillFields, 'error');
      return;
    }
    setAddresses((prev) => [
      ...prev,
      { id: Date.now(), ...newAddress, isDefault: prev.length === 0 },
    ]);
    setNewAddress({ label: '', details: '', icon: '📍' });
    setShowAddForm(false);
    showToast(toastMsg.addressAdded, 'success');
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast(toastMsg.addressDeleted, 'info');
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast(toastMsg.defaultSet, 'success');
  };

  // ── Cards ──
  const formatCardNum = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const validateCard = () => {
    const errs = {};
    const num = newCard.number.replace(/\s/g, '');
    if (num.length < 16) errs.number = val.cardNumber;
    if (!/^\d{2}\/\d{2}$/.test(newCard.expiry)) errs.expiry = val.cardExpiry;
    if (newCard.cvv.length < 3) errs.cvv = val.cardCvv;
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCard = () => {
    if (!validateCard()) return;
    const num = newCard.number.replace(/\s/g, '');
    setPaymentMethods((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: num.startsWith('4') ? 'Visa' : num.startsWith('5') ? 'MasterCard' : 'Card',
        last4: num.slice(-4),
        expiry: newCard.expiry,
      },
    ]);
    setNewCard({ number: '', expiry: '', cvv: '' });
    setCardErrors({});
    setShowAddForm(false);
    showToast(toastMsg.cardAdded, 'success');
  };

  const handleDeleteCard = (id) => {
    setPaymentMethods((prev) => prev.filter((c) => c.id !== id));
    showToast(toastMsg.cardDeleted, 'info');
  };

  const handleTopUp = () => {
    if (!topUpAmount) { showToast(toastMsg.topUpSelect, 'error'); return; }
    setLoading(true);
    setTimeout(() => {
      setUser((u) => ({ ...u, walletBalance: u.walletBalance + topUpAmount }));
      showToast((toastMsg.topUpDone || '').replace('{amount}', topUpAmount), 'success');
      setTopUpAmount(null);
      setLoading(false);
      setModal(null);
    }, 1100);
  };

  // ── Loyalty Redeem ──
  const handleRedeem = () => {
    if (user.loyaltyPoints < 500) return;
    setLoading(true);
    setTimeout(() => {
      setUser((u) => ({
        ...u,
        loyaltyPoints: u.loyaltyPoints - 500,
        walletBalance: u.walletBalance + 50,
      }));
      showToast(toastMsg.redeemDone, 'success');
      setLoading(false);
      setModal(null);
    }, 900);
  };

  // ── Language Switch ──
  // handled by switchLang + LanguageSwitcher

  const handleLogout = async () => {
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      setTimeout(() => setLogoutConfirm(false), 3500);
      return;
    }
    setLoading(true);
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      showToast(toastMsg.logoutFailed, 'error');
      setLoading(false);
      setLogoutConfirm(false);
    }
  };

  // ── Menu Config ──
  const menuGroups = useMemo(() => [
    {
      title: p.groups?.account,
      items: [
        {
          icon: User, label: p.menu?.personalInfo,
          desc: user.displayName, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10',
          action: openEditProfile,
        },
        {
          icon: MapPin, label: p.menu?.addresses,
          desc: `${addresses.length} ${p.menuDesc?.addresses}`,
          color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
          action: () => { setShowAddForm(false); setModal('addresses'); },
        },
        {
          icon: CreditCard, label: p.menu?.payments,
          desc: `${paymentMethods.length} ${p.menuDesc?.cards}`,
          color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10',
          action: () => { setShowAddForm(false); setModal('payments'); },
        },
      ],
    },
    {
      title: p.groups?.preferences,
      items: [
        {
          icon: theme === 'dark' ? Sun : Moon,
          label: p.menu?.theme,
          desc: theme === 'dark' ? p.theme?.dark : p.theme?.light,
          color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10',
          toggle: true, value: theme === 'dark',
          action: toggleTheme,
        },
        {
          icon: Bell, label: p.menu?.notifications,
          desc: settings.notifications ? p.notif?.on : p.notif?.off,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
          toggle: true, value: settings.notifications,
          action: () => {
            setSettings((s) => {
              const next = !s.notifications;
              showToast(next ? toastMsg.notifOn : toastMsg.notifOff, 'info');
              return { ...s, notifications: next };
            });
          },
        },
      ],
    },
    {
      title: p.groups?.more,
      items: [
        {
          icon: ShieldCheck, label: p.menu?.security,
          desc: p.menuDesc?.security,
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
          action: () => setModal('security'),
        },
        {
          icon: HelpCircle, label: p.menu?.help,
          desc: p.menuDesc?.help,
          color: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
          action: () => showToast(toastMsg.helpOpening, 'info'),
        },
        {
          icon: Clock, label: p.menu?.activity,
          desc: p.menuDesc?.activity,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
          action: () => navigate('/patient/history'),
        },
      ],
    },
  ], [p, settings, addresses.length, paymentMethods.length, user.displayName, theme, toggleTheme, navigate, showToast, toastMsg]);

  return (
    <div className="pb-4 transition-colors duration-500">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

      <div className="max-w-5xl mx-auto lg:max-w-none">

        {/* Hero */}
        <div className="relative mb-6 lg:mb-8 overflow-hidden rounded-[2rem] lg:rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 shadow-xl shadow-blue-600/15">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="absolute rounded-full border border-white/20"
                style={{ width: `${100 + i * 80}px`, height: `${100 + i * 80}px`, top: `${-30 + i * 15}px`, right: `${-30 + i * 12}px` }}
              />
            ))}
          </div>

          <div className="relative z-10 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 lg:gap-8">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-[2.25rem] shadow-2xl">
                  <Avatar src={user.photoURL} name={user.displayName} size="lg" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -left-1 w-10 h-10 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Camera size={16} />
                </motion.button>
              </div>

              <div className="flex-1 text-center sm:text-right text-white min-w-0">
                <h1 className="text-2xl lg:text-3xl font-black leading-tight truncate">{user.displayName || p.defaultUser}</h1>
                <p className="text-blue-100/90 text-sm font-medium mt-1 truncate">{user.email}</p>
                {user.phone && (
                  <p className="text-blue-200/80 text-xs font-bold mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone size={12} /> {user.phone}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-300 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                    <Star size={11} fill="currentColor" /> {p.premiumMember}
                  </span>
                  <span className="text-[10px] text-blue-200 font-medium">
                    {p.memberSince} {user.memberSince}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={openEditProfile}
                className="shrink-0 self-center sm:self-end flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 rounded-2xl text-white text-sm font-black transition-colors"
              >
                <Edit3 size={16} />
                {p.editProfile}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats + Wallet */}
        <div className="mb-6 lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 grid grid-cols-3 gap-3">
            {[
              { label: p.stats?.orders, value: user.totalOrders, icon: Zap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
              { label: p.stats?.saved, value: `${user.savedAmount} ${p.currency}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
              { label: p.stats?.points, value: user.loyaltyPoints, icon: Gift, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                  <s.icon size={15} />
                </div>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{s.value}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 mt-3 lg:mt-0">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setModal('wallet')}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl text-white text-right shadow-lg shadow-blue-600/20 relative overflow-hidden"
          >
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <Wallet size={22} className="mb-3 relative z-10" />
            <p className="text-[10px] font-bold opacity-70 mb-0.5 relative z-10">{p.wallet}</p>
            <p className="text-xl font-black relative z-10">
              {user.walletBalance.toFixed(0)}
              <span className="text-xs font-bold opacity-70 mr-1">{p.currency}</span>
            </p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setModal('loyalty')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-white text-right shadow-lg shadow-amber-500/20 relative overflow-hidden"
          >
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <Gift size={22} className="mb-3 relative z-10" />
            <p className="text-[10px] font-bold opacity-70 mb-0.5 relative z-10">{p.loyalty}</p>
            <p className="text-xl font-black relative z-10">
              {user.loyaltyPoints.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
              <span className="text-xs font-bold opacity-70 mr-1">{p.pointsUnit}</span>
            </p>
          </motion.button>
          </div>
        </div>

        {/* Language */}
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Globe size={19} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{p.menu?.language}</p>
              <p className="text-[10px] text-slate-400 font-medium">{lang === 'ar' ? p.language?.ar : p.language?.en}</p>
            </div>
          </div>
          <LanguageSwitcher
            lang={lang}
            onChange={switchLang}
            labels={{ ar: p.language?.ar, en: p.language?.en }}
          />
        </div>

        {/* Settings Groups */}
        <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {menuGroups.map((group, gi) => (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + gi * 0.08 }}
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">
                {group.title}
              </p>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-slate-50 dark:divide-white/5">
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    onClick={!item.toggle ? item.action : undefined}
                    className={`flex items-center justify-between px-4 py-4 transition-colors ${!item.toggle ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10' : ''}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon size={19} strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    {item.toggle ? (
                      <Toggle value={item.value} onChange={item.action} />
                    ) : (
                      <ChevronLeft size={17} className={`text-slate-300 dark:text-slate-600 ${isRTL ? '' : 'rotate-180'}`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={loading}
            className={`lg:col-span-2 w-full py-4 rounded-2xl border font-black text-sm flex items-center justify-center gap-2 transition-all ${
              logoutConfirm
                ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/25'
                : 'bg-white dark:bg-slate-900 text-red-500 border-red-100 dark:border-red-900/30'
            }`}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <LogOut size={18} />
                {logoutConfirm ? p.logoutConfirm : p.logout}
              </>
            )}
          </motion.button>

          <p className="lg:col-span-2 text-center text-[10px] text-slate-300 dark:text-slate-700 font-medium pb-4">
            {p.version} · {p.rights} ©2025
          </p>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Edit Profile */}
      <Sheet title={m.editProfile} isOpen={modal === 'edit-profile'} onClose={() => setModal(null)}>
        <div className="space-y-5">
          <Field label={m.fullName} icon={User} value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            error={profileErrors.name} placeholder={lang === 'ar' ? 'محمود أحمد' : 'John Doe'} />
          <Field label={m.phone} icon={Phone} value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
            error={profileErrors.phone} type="tel" dir="ltr" placeholder="01xxxxxxxxx" />
          <Field label={m.email} icon={Mail} value={user.email} readOnly
            className="opacity-60 cursor-not-allowed" placeholder="email@example.com" />
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveProfile} disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : m.save}
          </motion.button>
        </div>
      </Sheet>

      <Sheet title={m.addresses} isOpen={modal === 'addresses'} onClose={() => setModal(null)} size="lg">
        <AnimatePresence mode="wait">
          {!showAddForm ? (
            <motion.div key="list" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 flex items-start gap-3 border border-slate-100 dark:border-white/5">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0">
                    {addr.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm text-slate-900 dark:text-white">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">
                          {m.default}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{addr.details}</p>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[10px] text-blue-600 font-black mt-1.5"
                      >
                        {m.setDefault}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border-2 border-dashed border-blue-200 dark:border-blue-900/50 text-blue-600 text-sm font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <Plus size={18} strokeWidth={2.5} />
                {m.addAddress}
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.icon}</p>
                <div className="flex gap-2">
                  {['🏠', '🏢', '🏥', '📍', '🏫'].map((ico) => (
                    <button
                      key={ico}
                      onClick={() => setNewAddress((a) => ({ ...a, icon: ico }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newAddress.icon === ico ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500' : 'bg-slate-100 dark:bg-slate-800'}`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
              <Field label={m.addressLabel} value={newAddress.label}
                onChange={(e) => setNewAddress((a) => ({ ...a, label: e.target.value }))}
                placeholder={m.addressLabelPh} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.addressDetails}</label>
                <textarea value={newAddress.details}
                  onChange={(e) => setNewAddress((a) => ({ ...a, details: e.target.value }))}
                  placeholder={m.addressDetailsPh} rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none resize-none placeholder:text-slate-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm">{m.cancel}</button>
                <button onClick={handleAddAddress} className="flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg">{m.saveAddress}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>

      {/* Payments */}
      <Sheet title={m.payments} isOpen={modal === 'payments'} onClose={() => setModal(null)} size="lg">
        <AnimatePresence mode="wait">
          {!showAddForm ? (
            <motion.div key="list" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-4">
              {paymentMethods.map((card, ci) => (
                <div key={card.id} className="relative">
                  <CardVisual card={card} holderName={user.displayName} gradientIdx={ci} labels={m} />
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-red-500/80 rounded-xl transition-colors text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => { setCardErrors({}); setNewCard({ number: '', expiry: '', cvv: '' }); setShowAddForm(true); }}
                className="w-full py-4 border-2 border-dashed border-blue-200 dark:border-blue-900/50 text-blue-600 text-sm font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <Plus size={18} strokeWidth={2.5} />
                {m.addCard}
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              {/* Live card preview */}
              <CardVisual
                card={{ type: newCard.number.replace(/\s/g, '').startsWith('4') ? 'Visa' : 'MasterCard', last4: newCard.number.replace(/\s/g, '').slice(-4) || '••••', expiry: newCard.expiry || 'MM/YY' }}
                holderName={user.displayName}
                gradientIdx={1}
                labels={m}
              />
              <Field label={m.cardNumber} value={newCard.number}
                onChange={(e) => setNewCard((c) => ({ ...c, number: formatCardNum(e.target.value) }))}
                error={cardErrors.number}
                dir="ltr"
                placeholder="•••• •••• •••• ••••"
                maxLength={19}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label={m.expiry} value={newCard.expiry}
                  onChange={(e) => setNewCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                  error={cardErrors.expiry}
                  dir="ltr"
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <div className="relative">
                  <Field
                    label="CVV"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    error={cardErrors.cvv}
                    type={showCvv ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="•••"
                    maxLength={3}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv((v) => !v)}
                    className="absolute left-3 bottom-3.5 text-slate-400"
                  >
                    {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm">{m.cancel}</button>
                <button onClick={handleAddCard} className="flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg">{m.saveCard}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>

      {/* Wallet */}
      <Sheet title={m.wallet} isOpen={modal === 'wallet'} onClose={() => setModal(null)}>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <p className="text-xs font-bold opacity-70 mb-1">{m.currentBalance}</p>
            <p className="text-4xl font-black">{user.walletBalance.toFixed(2)}</p>
            <p className="text-sm opacity-70 mt-1">{p.currency}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.selectTopUp}</p>
            <div className="grid grid-cols-4 gap-2">
              {WALLET_TOPUP.map((amt) => (
                <motion.button
                  key={amt}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setTopUpAmount(topUpAmount === amt ? null : amt)}
                  className={`py-3 rounded-2xl font-black text-sm transition-all ${
                    topUpAmount === amt
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-white/5'
                  }`}
                >
                  {amt}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleTopUp}
            disabled={loading || !topUpAmount}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>{(m.topUp || '').replace('{amount}', topUpAmount || '—')} <ArrowUpRight size={18} /></>
            )}
          </motion.button>
        </div>
      </Sheet>

      {/* Loyalty */}
      <Sheet title={m.loyalty} isOpen={modal === 'loyalty'} onClose={() => setModal(null)} size="lg">
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <Gift size={28} className="mx-auto mb-2 opacity-90" />
            <p className="text-4xl font-black">{user.loyaltyPoints.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</p>
            <p className="text-sm opacity-70 mt-1">{m.availablePoints}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {m.redeemText}
              <span className="text-amber-600 font-black"> 50 {p.currency} </span>
              {m.redeemWallet}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleRedeem}
            disabled={loading || user.loyaltyPoints < 500}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : m.redeemNow}
          </motion.button>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.pointsHistory}</p>
            <div className="space-y-2">
              {loyaltyHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{h.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{h.date}</p>
                  </div>
                  <span className={`text-sm font-black ${h.type === 'earn' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {h.type === 'earn' ? '+' : ''}{h.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Sheet>

      {/* Security */}
      <Sheet title={m.security} isOpen={modal === 'security'} onClose={() => setModal(null)}>
        <div className="space-y-4">
          {[
            { icon: Lock, label: m.changePassword, desc: m.changePasswordDesc, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
            { icon: Phone, label: m.twoFactor, desc: m.twoFactorDesc, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', badge: m.twoFactorActive },
            { icon: Shield, label: m.privacy, desc: m.privacyDesc, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => showToast(`${item.label} — ${toastMsg.securitySoon}`, 'info')}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon size={18} strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
              </div>
              <ChevronLeft size={16} className={`text-slate-300 dark:text-slate-600 shrink-0 ${isRTL ? '' : 'rotate-180'}`} />
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}