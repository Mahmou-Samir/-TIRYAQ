import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ClipboardList, AlertCircle,
  ArrowUpRight, ArrowDownRight, Activity, Wallet,
  Clock, CheckCircle2, Loader2, Zap, TrendingUp,
  Pill, ShoppingCart, Bell, RefreshCw, ChevronRight,
  Users, Star, BarChart2, Calendar, Target, Shield,
  Flame, Eye
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useSettings } from '../../context/SettingsContext';

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startTime = performance.now();
    const from = start.current;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
      else start.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

/* ══════════════════════════════════════════
   SPARKLINE SVG
══════════════════════════════════════════ */
const Sparkline = ({ data, color = '#10b981', height = 40 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100, h = height;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h * 0.8) - h * 0.1
  ]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
};

/* ══════════════════════════════════════════
   WEEKLY BAR CHART
══════════════════════════════════════════ */
const WeeklyChart = ({ lang, data = [42, 68, 51, 84, 62, 91, 73] }) => {
  const days = lang === 'ar'
    ? ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const max = Math.max(...data);

  return (
    <div className="flex items-end justify-between gap-2 h-44 pt-4">
      {data.map((v, i) => {
        const isLast = i === data.length - 1;
        const pct = (v / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1 group">
            <motion.div
              className="relative w-full rounded-lg overflow-hidden cursor-pointer"
              style={{ height: '148px', display: 'flex', alignItems: 'flex-end' }}
              title={`${v}%`}
            >
              <div className="w-full rounded-md bg-slate-800/60 absolute inset-0" />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.9, delay: i * 0.07, type: 'spring', damping: 20 }}
                className={`relative w-full rounded-md ${isLast ? 'bg-emerald-400' : 'bg-emerald-600/50 group-hover:bg-emerald-500/70'} transition-colors`}
              />
              <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${isLast ? 'text-emerald-400' : 'text-slate-400'}`}>
                {v}%
              </span>
            </motion.div>
            <span className={`text-[10px] font-semibold ${isLast ? 'text-emerald-400' : 'text-slate-600'}`}>{days[i]}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════ */
const StatCard = ({ title, value, icon: Icon, trend, trendLabel, accent, delay, loading, sparkData, prefix = '', suffix = '' }) => {
  const up = trend === 'up';
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 24 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-slate-950 border border-white/[0.06] rounded-2xl p-5 overflow-hidden group cursor-default flex flex-col gap-4"
    >
      {/* Glow */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accent.glow}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${accent.iconBg} ${accent.iconBorder}`}>
          <Icon size={18} className={accent.iconColor} />
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border ${up ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {trendLabel}
        </div>
      </div>

      <div className="relative z-10">
        {loading
          ? <div className="h-8 w-20 bg-slate-800 rounded-lg animate-pulse mb-1" />
          : <p className={`text-2xl font-black tracking-tight mb-0.5 ${accent.valueColor}`}>
              <AnimatedCounter value={typeof value === 'number' ? value : 0} prefix={prefix} suffix={suffix} />
              {typeof value === 'string' && !isNaN(parseFloat(value)) ? null : (typeof value === 'string' ? <span>{value}</span> : null)}
            </p>
        }
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{title}</p>
      </div>

      {sparkData && (
        <div className="relative z-10 -mx-1 -mb-1">
          <Sparkline data={sparkData} color={accent.sparkColor} height={36} />
        </div>
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   ACTIVITY ITEM
══════════════════════════════════════════ */
const ActivityItem = ({ item, onClick, isRTL, translateStatus, formatTimeAgo }) => {
  const statusStyles = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
    preparing: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
    accepted:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
    cancelled: 'bg-red-500/10    text-red-400    border-red-500/20',
  };
  const cls = statusStyles[item.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group border border-transparent hover:border-white/[0.05]"
    >
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cls}`}>
          {item.status === 'completed' ? <CheckCircle2 size={15} /> : <ShoppingCart size={15} />}
        </div>
        <div className={isRTL ? 'text-right' : ''}>
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{item.name}</p>
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 mt-0.5 ${cls}`}>
            {translateStatus(item.status)}
          </span>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-slate-600 text-[10px] font-medium shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Clock size={10} />
        {formatTimeAgo(item.time)}
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   QUICK ACTION BUTTON
══════════════════════════════════════════ */
const QuickAction = ({ icon: Icon, label, onClick, accent }) => (
  <motion.button
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group ${accent}`}
  >
    <Icon size={20} className="group-hover:scale-110 transition-transform" />
    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors text-center leading-tight">{label}</span>
  </motion.button>
);

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
const PharmacyDashboard = () => {
  const { t, lang } = useSettings();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const [stats, setStats] = useState({ totalStock: 0, shortages: 0, activeOrders: 0, dailySales: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [topMeds] = useState([
    { name: 'Panadol Extra', sold: 142, trend: '+12%', up: true },
    { name: 'Augmentin 1g',  sold: 98,  trend: '+8%',  up: true },
    { name: 'Voltaren Gel',  sold: 76,  trend: '-3%',  up: false },
    { name: 'Nexium 40mg',   sold: 65,  trend: '+21%', up: true },
  ]);

  const d_t = t?.pharmacy?.dashboard || {};

  /* ── Firebase listeners ── */
  useEffect(() => {
    const pharmacyId = auth.currentUser?.uid || 'GUEST_PHARMACY';
    setLoading(true);

    const unsubMeds = onSnapshot(
      query(collection(db, 'medicines'), where('pharmacyId', '==', pharmacyId)),
      (snap) => {
        let total = 0, low = 0;
        snap.forEach(doc => { total++; if (Number(doc.data().stock) < 10) low++; });
        setStats(prev => ({ ...prev, totalStock: total, shortages: low }));
        setLastUpdate(new Date());
      }
    );

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('pharmacyId', '==', pharmacyId), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => {
        let active = 0, todaySales = 0;
        const activities = [];
        const today = new Date().setHours(0, 0, 0, 0);

        snap.forEach(doc => {
          const d = doc.data();
          const orderDate = d.createdAt?.toDate?.() || new Date();
          if (['pending', 'processing', 'accepted', 'preparing'].includes(d.status)) active++;
          if (d.status === 'completed' && orderDate >= today) todaySales += Number(d.totalPrice || 0);
          if (activities.length < 6)
            activities.push({ id: doc.id, type: 'order', name: (isRTL ? 'طلب #' : 'Order #') + doc.id.slice(0, 5), status: d.status, time: orderDate });
        });

        setStats(prev => ({ ...prev, activeOrders: active, dailySales: todaySales }));
        setRecentActivity(activities);
        setLoading(false);
        setLastUpdate(new Date());
      }
    );

    return () => { unsubMeds(); unsubOrders(); };
  }, [lang]);

  const formatTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 1) return isRTL ? 'الآن' : 'Now';
    if (diff < 60) return isRTL ? `${diff}د` : `${diff}m`;
    const h = Math.floor(diff / 60);
    if (h < 24) return isRTL ? `${h}س` : `${h}h`;
    return isRTL ? 'أمس' : 'Yesterday';
  };

  const translateStatus = (s) => ({
    pending:   isRTL ? 'جديد'    : 'New',
    accepted:  isRTL ? 'مقبول'   : 'Accepted',
    preparing: isRTL ? 'تجهيز'   : 'Preparing',
    ready:     isRTL ? 'جاهز'    : 'Ready',
    completed: isRTL ? 'مكتمل'   : 'Completed',
    cancelled: isRTL ? 'ملغى'    : 'Cancelled',
  }[s] || s);

  const userName = auth?.currentUser?.displayName?.split(' ')[0] || (isRTL ? 'دكتور' : 'Doctor');
  const criticalAlert = stats.shortages > 5;

  /* ── accent presets ── */
  const accents = {
    blue:    { glow: 'bg-blue-500',    iconBg: 'bg-blue-500/10',    iconBorder: 'border-blue-500/20',    iconColor: 'text-blue-400',    valueColor: 'text-white', sparkColor: '#60a5fa' },
    emerald: { glow: 'bg-emerald-500', iconBg: 'bg-emerald-500/10', iconBorder: 'border-emerald-500/20', iconColor: 'text-emerald-400', valueColor: 'text-white', sparkColor: '#34d399' },
    rose:    { glow: 'bg-rose-500',    iconBg: 'bg-rose-500/10',    iconBorder: 'border-rose-500/20',    iconColor: 'text-rose-400',    valueColor: 'text-white', sparkColor: '#fb7185' },
    amber:   { glow: 'bg-amber-500',   iconBg: 'bg-amber-500/10',   iconBorder: 'border-amber-500/20',   iconColor: 'text-amber-400',   valueColor: 'text-white', sparkColor: '#fbbf24' },
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="space-y-5 pb-16 min-h-screen"
      style={{ fontFamily: "'DM Sans', 'Cairo', sans-serif" }}
    >

      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/[0.06] shadow-2xl"
      >
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-emerald-600/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[200px] bg-teal-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-7 md:p-10">
          <div className="flex-1">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {loading ? (isRTL ? 'جاري التحديث' : 'Syncing') : (isRTL ? 'مباشر · محدّث' : 'Live · Synced')}
              <span className="text-emerald-600 font-medium">{lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
              {d_t.welcome || (isRTL ? 'أهلاً،' : 'Welcome back,')} {userName} 👋
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              {criticalAlert
                ? (isRTL ? `تنبيه: لديك ${stats.shortages} أصناف منخفضة المخزون تحتاج مراجعة فورية.` : `Alert: ${stats.shortages} items are critically low and need immediate attention.`)
                : (isRTL ? `لديك ${stats.activeOrders} طلبات نشطة. المخزون مستقر والنظام يعمل بكفاءة.` : `You have ${stats.activeOrders} active orders. Stock is stable and system is running efficiently.`)}
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-2 w-full lg:w-auto">
            {[
              { icon: Package,      label: isRTL ? 'المخزون'  : 'Inventory',  path: '/pharmacy/inventory', accent: 'bg-blue-500/5 border-blue-500/15 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30' },
              { icon: ClipboardList, label: isRTL ? 'الطلبات'  : 'Orders',     path: '/pharmacy/orders',    accent: 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30' },
              { icon: TrendingUp,   label: isRTL ? 'التقارير' : 'Reports',    path: '/pharmacy/reports',   accent: 'bg-violet-500/5 border-violet-500/15 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30' },
              { icon: Bell,         label: isRTL ? 'التنبيهات': 'Alerts',     path: '/pharmacy/alerts',    accent: `${criticalAlert ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15' : 'bg-amber-500/5 border-amber-500/15 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30'}` },
            ].map(a => (
              <QuickAction key={a.path} icon={a.icon} label={a.label} onClick={() => navigate(a.path)} accent={a.accent} />
            ))}
          </div>
        </div>

        {/* Critical alert strip */}
        <AnimatePresence>
          {criticalAlert && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="relative z-10 flex items-center gap-3 px-7 md:px-10 py-3 bg-red-500/10 border-t border-red-500/20">
              <Flame size={15} className="text-red-400 shrink-0 animate-pulse" />
              <p className="text-sm text-red-300 font-semibold flex-1">
                {isRTL
                  ? `${stats.shortages} أصناف أقل من الحد الأدنى — يُنصح بإعادة الطلب فوراً`
                  : `${stats.shortages} items below minimum threshold — reorder recommended immediately`}
              </p>
              <button onClick={() => navigate('/pharmacy/inventory')}
                className="shrink-0 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                {isRTL ? 'عرض الكل' : 'View all'} <ChevronRight size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={d_t.totalStock || (isRTL ? 'إجمالي الأصناف' : 'Total Items')}
          value={stats.totalStock}
          icon={Package}
          trend="up" trendLabel={isRTL ? 'مستقر' : 'Stable'}
          accent={accents.blue} delay={0.05} loading={loading}
          sparkData={[30, 35, 28, 40, 38, 45, stats.totalStock % 50 || 42]}
        />
        <StatCard
          title={d_t.activeOrders || (isRTL ? 'طلبات نشطة' : 'Active Orders')}
          value={stats.activeOrders}
          icon={ClipboardList}
          trend="up" trendLabel={isRTL ? 'جديد' : 'New'}
          accent={accents.emerald} delay={0.10} loading={loading}
          sparkData={[5, 8, 6, 11, 9, 14, stats.activeOrders || 7]}
        />
        <StatCard
          title={d_t.shortages || (isRTL ? 'نواقص حرجة' : 'Shortages')}
          value={stats.shortages}
          icon={AlertCircle}
          trend={stats.shortages > 0 ? 'down' : 'up'}
          trendLabel={stats.shortages > 0 ? (isRTL ? 'خطر' : 'Risk') : (isRTL ? 'آمن' : 'Safe')}
          accent={accents.rose} delay={0.15} loading={loading}
          sparkData={[2, 4, 3, 6, 5, 8, stats.shortages || 3]}
        />
        <StatCard
          title={d_t.dailySales || (isRTL ? 'مبيعات اليوم' : 'Today Sales')}
          value={stats.dailySales}
          icon={Wallet}
          trend="up" trendLabel="+18%"
          accent={accents.amber} delay={0.20} loading={loading}
          suffix=" EGP"
          sparkData={[1200, 1800, 1400, 2200, 1900, 2600, stats.dailySales || 2100]}
        />
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT: Chart + Top Meds */}
        <div className="xl:col-span-2 space-y-5">

          {/* Weekly chart card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-slate-950 border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isRTL ? 'نشاط الطلبات الأسبوعي' : 'Weekly Order Activity'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRTL ? 'معدل الاستجابة — الأسبوع الحالي' : 'Response rate — Current week'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} /> +14%
                </div>
                <button className="w-8 h-8 rounded-xl bg-slate-900 border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                  <BarChart2 size={14} />
                </button>
              </div>
            </div>

            {/* Summary numbers */}
            <div className="grid grid-cols-3 gap-3 my-4">
              {[
                { label: isRTL ? 'متوسط يومي' : 'Daily Avg',  val: '68%',  color: 'text-white' },
                { label: isRTL ? 'أعلى يوم'   : 'Peak Day',   val: '91%',  color: 'text-emerald-400' },
                { label: isRTL ? 'أدنى يوم'   : 'Lowest Day', val: '42%',  color: 'text-slate-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/60 rounded-xl p-3 border border-white/[0.04]">
                  <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <WeeklyChart lang={lang} />
          </motion.div>

          {/* Top selling meds */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-slate-950 border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <h3 className="text-sm font-bold text-white">{isRTL ? 'الأدوية الأكثر مبيعاً' : 'Top Selling Medicines'}</h3>
              </div>
              <button onClick={() => navigate('/pharmacy/inventory')}
                className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium">
                {isRTL ? 'عرض الكل' : 'View all'} <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {topMeds.map((med, i) => (
                <motion.div key={med.name} initial={{ opacity: 0, x: isRTL ? 16 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-slate-500">{i + 1}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                    <Pill size={15} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{med.name}</p>
                    <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden w-full">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(med.sold / 150) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-emerald-500/60 rounded-full"
                      />
                    </div>
                  </div>
                  <div className={`text-right shrink-0`}>
                    <p className="text-sm font-bold text-white">{med.sold}</p>
                    <p className={`text-[11px] font-semibold ${med.up ? 'text-emerald-400' : 'text-red-400'}`}>{med.trend}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: AI Insight + Activity + Mini Stats */}
        <div className="space-y-5">

          {/* AI Insight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 }}
            className={`relative rounded-2xl overflow-hidden border p-5 ${criticalAlert ? 'bg-red-950/40 border-red-500/20' : 'bg-emerald-950/40 border-emerald-500/15'}`}
          >
            <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${criticalAlert ? 'bg-red-500/15' : 'bg-emerald-500/10'}`} />
            <div className="relative z-10">
              <div className={`inline-flex items-center gap-1.5 mb-3 text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${criticalAlert ? 'bg-red-500/15 text-red-400 border-red-500/25' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                <Zap size={11} className={criticalAlert ? 'text-red-400' : 'fill-emerald-400 text-emerald-400'} />
                AI Insight
              </div>
              <p className={`text-sm font-semibold leading-relaxed mb-4 ${criticalAlert ? 'text-red-200' : 'text-emerald-100/90'}`}>
                {criticalAlert
                  ? (isRTL ? `⚠️ ${stats.shortages} أصناف وصلت للحد الحرج. قد يؤثر ذلك على تقييم الصيدلية.` : `⚠️ ${stats.shortages} items reached critical threshold. This may affect your pharmacy rating.`)
                  : (d_t.tipContent || (isRTL ? '📈 المخزون مستقر. الذكاء الاصطناعي يتوقع ارتفاع الطلب على المسكنات الأسبوع القادم بنسبة 23%.' : '📈 Stock stable. AI forecasts 23% surge in painkiller demand next week.'))}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(criticalAlert ? '/pharmacy/inventory' : '/pharmacy/orders')}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                  ${criticalAlert ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'}`}
              >
                {criticalAlert ? (isRTL ? 'مراجعة النواقص' : 'Review Shortages') : (isRTL ? 'متابعة الطلبات' : 'Track Orders')}
                <ArrowUpRight size={15} />
              </motion.button>
            </div>
          </motion.div>

          {/* Mini performance stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="bg-slate-950 border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={15} className="text-violet-400" />
              <h3 className="text-sm font-bold text-white">{isRTL ? 'أداء اليوم' : "Today's Performance"}</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: isRTL ? 'معدل إتمام الطلبات' : 'Order Completion', val: 84, color: 'bg-emerald-500' },
                { label: isRTL ? 'سرعة الاستجابة'    : 'Response Speed',   val: 91, color: 'bg-blue-500' },
                { label: isRTL ? 'رضا العملاء'        : 'Customer Rating',  val: 76, color: 'bg-violet-500' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">{m.label}</span>
                    <span className="text-xs font-bold text-white">{m.val}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }} transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${m.color}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-white">4.8</span>
                <span className="text-xs text-slate-500">{isRTL ? '/ تقييم الصيدلية' : '/ pharmacy score'}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {isRTL ? 'ممتاز' : 'Excellent'}
              </span>
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            className="bg-slate-950 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-slate-500" />
                <h3 className="text-sm font-bold text-white">{isRTL ? 'النشاطات الأخيرة' : 'Recent Activity'}</h3>
              </div>
              {loading
                ? <Loader2 size={14} className="animate-spin text-slate-600" />
                : <button onClick={() => setLastUpdate(new Date())} className="text-slate-600 hover:text-slate-400 transition-colors">
                    <RefreshCw size={13} />
                  </button>}
            </div>

            <div className="px-2 py-2 min-h-[200px]">
              {loading ? (
                <div className="flex items-center justify-center min-h-[200px] gap-2 text-slate-600">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-xs font-medium">{isRTL ? 'جاري التحديث...' : 'Syncing...'}</span>
                </div>
              ) : recentActivity.length > 0 ? (
                <AnimatePresence>
                  {recentActivity.map((item, i) => (
                    <ActivityItem key={item.id} item={item} onClick={() => navigate('/pharmacy/orders')}
                      isRTL={isRTL} translateStatus={translateStatus} formatTimeAgo={formatTimeAgo} />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-slate-600">
                  <Eye size={24} />
                  <span className="text-xs font-medium">{d_t.noOrders || (isRTL ? 'لا توجد نشاطات حديثة' : 'No recent activity')}</span>
                </div>
              )}
            </div>

            {recentActivity.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.05]">
                <button onClick={() => navigate('/pharmacy/orders')}
                  className="w-full text-xs font-semibold text-slate-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                  {isRTL ? 'عرض جميع الطلبات' : 'View all orders'}
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default PharmacyDashboard;