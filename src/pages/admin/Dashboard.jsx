import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Package, AlertTriangle, Truck, Activity, Send, 
  Calendar, MoreVertical, ShieldAlert, Navigation, Clock,
  CheckCircle2, X
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';

// Components (تأكد من تحديث StatCard لاستخدام NextGenStatCard الذي أعطيته لك سابقاً إذا أردت أقصى فخامة)
import StatCard from '../../components/dashboard/StatCard';
import InventoryChart from '../../components/dashboard/InventoryChart'; 
import DistributionChart from '../../components/dashboard/DistributionChart';
import ActivityLog from '../../components/dashboard/ActivityLog';
import EgyptMap from '../../components/maps/EgyptMap';

// Firebase
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, serverTimestamp, query } from 'firebase/firestore';

const GOVERNORATES_LIST = [
  "القاهرة", "الإسكندرية", "الجيزة", "القليوبية", "الدقهلية", "الشرقية", "الغربية", "المنوفية", "البحيرة", "كفر الشيخ", 
  "دمياط", "بورسعيد", "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم", "المنيا", "أسيوط", 
  "الوادي الجديد", "البحر الأحمر", "سوهاج", "قنا", "الأقصر", "أسوان", "مطروح"
];

// --- 🌟 المكون السحري للكروت (Mouse Tracking Glow Container) ---
const SpatialCard = ({ children, className = "", glowColor = "59, 130, 246" }) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-[2.5rem] bg-white/60 dark:bg-[#0b1121]/80 backdrop-blur-3xl border border-slate-200/50 dark:border-white/5 shadow-2xl ${className}`}
    >
      {/* إضاءة داخلية تتبع الماوس */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(${glowColor}, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      {/* إضاءة للحدود الخارجية تتبع الماوس */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              250px circle at ${mouseX}px ${mouseY}px,
              rgba(${glowColor}, 0.6),
              transparent 80%
            )
          `,
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' rx='40' stroke='black' stroke-width='2' /%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 w-full h-full p-6 md:p-8">
        {children}
      </div>
    </motion.div>
  );
};

// --- Custom Toast Component ---
const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 w-[90%] max-w-xs backdrop-blur-2xl border ${
      type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
      type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
      'bg-slate-900/80 border-white/10 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
    <span className="text-xs font-black tracking-wide">{message}</span>
  </motion.div>
);

// --- Spatial Modal Sub-Component ---
const PremiumModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }} 
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="absolute inset-0 bg-[#020617]/60" onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }} 
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20, rotateX: -10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white/90 dark:bg-[#0b1121]/90 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10"
        >
          {/* إضاءة داخلية للمودال */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shadow-inner border border-red-500/20"><ShieldAlert size={24}/></div>
              {title}
            </h2>
            <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"><X size={20}/></button>
          </div>
          <div className="relative z-10">
             {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Ultra Skeleton ---
const DashboardSkeleton = () => (
  <div className="space-y-8 p-4 xl:px-8 xl:py-6">
    <div className="h-48 bg-slate-200/50 dark:bg-white/5 rounded-[2.5rem] w-full animate-pulse border border-slate-100 dark:border-white/5"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-200/50 dark:bg-white/5 rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-white/5"></div>)}
    </div>
  </div>
);

// --- Main Component ---
const Dashboard = () => {
  const { t, lang } = useSettings();
  
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);

  const [reportData, setReportData] = useState({ governorate: '', hospital: '', drug: '', priority: 'high' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return t.greetingMorning || 'صباح الخير';
    if (hour < 18) return t.greetingEvening || 'مساء الخير';
    return t.greetingEvening || 'مساء الخير';
  }, [currentTime, t]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "medicines"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMedicines(data);
        setLoading(false);
      }, 
      (error) => {
        console.error("Firestore Error:", error);
        showToast("فشل في جلب البيانات", "error");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [showToast]);

  const { totalMedicines, criticalShortages, totalStockValue, criticalItems } = useMemo(() => {
    const critical = medicines.filter(m => Number(m.stock) < 50);
    return {
      totalMedicines: medicines.length,
      criticalShortages: critical.length,
      totalStockValue: medicines.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0),
      criticalItems: critical
    };
  }, [medicines]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) return showToast("لا يوجد اتصال بالإنترنت", "error");

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), { ...reportData, status: 'pending', createdAt: serverTimestamp() });
      setIsReportModalOpen(false);
      setReportData({ governorate: '', hospital: '', drug: '', priority: 'high' });
      showToast(lang === 'ar' ? "تم إرسال التنبيه العاجل لغرفة العمليات بنجاح." : "Urgent alert sent successfully.", "success");
    } catch (error) {
      showToast(t.error || "حدث خطأ أثناء الإرسال", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12 pt-6 px-4 md:px-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <AnimatePresence>
        {toast && <Toast {...toast} />}
      </AnimatePresence>

      {/* 🔮 Spatial Aurora Hero Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-end gap-6 bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/10 text-white relative overflow-hidden group">
        
        {/* Animated Aurora Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, 90, 0],
              x: [0, 100, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -right-[20%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[100px] mix-blend-screen"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1], 
              rotate: [0, -90, 0],
              x: [0, -100, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[50%] -left-[20%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen"
          />
        </div>
        
        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-blue-200 mb-4 bg-white/5 w-fit px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 shadow-inner">
            <Clock size={16} className="text-blue-400" />
            <span className="text-[11px] font-black tracking-widest uppercase">
              {currentTime.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            {getGreeting()}، <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">Admin</span>
          </h1>
          <p className="text-slate-300 max-w-lg leading-relaxed font-medium text-sm md:text-base">
             {lang === 'ar' ? `النظام يراقب المستشفيات. لديك ` : `System monitoring active. You have `}
             <span className="font-black px-2 py-0.5 mx-1 rounded-md bg-red-500/20 border border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
               {criticalShortages}
             </span>
             {lang === 'ar' 
               ? ` تنبيهات حرجة في سلاسل الإمداد.`
               : ` critical supply chain alerts.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 w-full lg:w-auto justify-end">
          <div className="text-right hidden sm:block bg-white/5 p-5 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-2xl">
             <div className="text-4xl font-mono font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
               {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="text-[10px] text-blue-300 font-black uppercase tracking-[0.3em] mt-2">
               {lang === 'ar' ? 'توقيت القاهرة' : 'Cairo Time (EET)'}
             </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setIsReportModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 px-8 py-5 rounded-[2rem] font-black shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-3 border border-red-400/30"
          >
            <ShieldAlert size={24} />
            {t.reportEmergency || 'إطلاق إنذار نواقص'}
          </motion.button>
        </div>
      </motion.div>

      {/* 🟢 Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <StatCard title={t.stats?.totalItems || 'إجمالي الأصناف'} value={totalMedicines} icon={<Package size={26} strokeWidth={2}/>} trend="up" trendValue="4.5%" subtitle={lang === 'ar' ? "صنف مسجل" : "Registered"} color="blue"/>
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title={t.stats?.criticalShortage || 'نواقص حرجة'} value={criticalShortages} icon={<AlertTriangle size={26} strokeWidth={2}/>} trend={criticalShortages > 0 ? "down" : "neutral"} trendValue={t.urgent || 'عاجل'} color="red" subtitle={lang === 'ar' ? "أصناف تحت حد الخطر" : "Below safety line"}/>
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title={t.stats?.totalStock || 'حجم المخزون الفعلي'} value={totalStockValue.toLocaleString()} icon={<Activity size={26} strokeWidth={2}/>} trend="up" trendValue="12%" subtitle={lang === 'ar' ? "وحدة دواء" : "Units"} color="green"/>
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title={t.stats?.incomingShipments || 'شحنات قادمة'} value="5" icon={<Truck size={26} strokeWidth={2}/>} trend="up" trendValue={t.stable || 'مستقر'} subtitle={lang === 'ar' ? "أوامر توريد" : "Supply orders"} color="orange"/>
        </motion.div>
      </motion.div>

      {/* 🟢 Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Right Column (Map & Charts) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Spatial Map Section */}
          <motion.div variants={itemVariants}>
            <SpatialCard glowColor="59, 130, 246">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                     <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"><Navigation size={20}/></div>
                     {t.mapTitle || 'الرادار اللوجستي'}
                   </h3>
                   <p className="text-sm text-slate-500 font-medium mt-2">{t.mapSubtitle || 'توزيع المخزون المركزي والمستشفيات التابعة على مستوى الجمهورية'}</p>
                 </div>
                 <span className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-3 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-inner">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div> LIVE
                 </span>
               </div>
               <div className="h-[450px] w-full bg-slate-50 dark:bg-[#050b14] rounded-[2rem] flex items-center justify-center border border-slate-200/50 dark:border-white/5 relative z-10 overflow-hidden shadow-inner">
                  <EgyptMap />
               </div>
            </SpatialCard>
          </motion.div>

          {/* Spatial Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <SpatialCard glowColor="59, 130, 246">
                <h3 className="font-black text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Activity size={18}/></div>
                  {t.charts?.inventoryAnalysis || 'تحليل حركة المخزون'}
                </h3>
                <div className="h-[300px] w-full"><InventoryChart medicines={medicines} /></div>
              </SpatialCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SpatialCard glowColor="168, 85, 247">
                <h3 className="font-black text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Package size={18}/></div>
                  {t.charts?.categoryDistribution || 'التوزيع حسب التصنيف'}
                </h3>
                <div className="h-[300px] w-full"><DistributionChart medicines={medicines} /></div>
              </SpatialCard>
            </motion.div>
          </div>
        </div>

        {/* Left Column (Alerts & Logs) */}
        <div className="space-y-8">
          
          {/* Spatial Live Alerts Panel */}
          <motion.div variants={itemVariants} className="h-full">
            <SpatialCard glowColor="239, 68, 68" className="h-full flex flex-col p-0">
              <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                  <span className="flex h-4 w-4 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                  </span>
                  {t.liveAlerts || 'شاشة الإنذار المبكر'}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 hide-scrollbar min-h-[400px]">
                <AnimatePresence>
                  {criticalShortages > 0 ? (
                    criticalItems.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }} 
                        className="p-5 rounded-2xl border border-red-200 dark:border-red-900/30 bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-slate-900/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-black text-red-700 dark:text-red-400 text-base">{item.name}</span>
                          <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 text-[9px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase animate-pulse border border-red-200 dark:border-red-500/30">{t.urgent || 'تدخل عاجل'}</span>
                        </div>
                        <p className="text-xs text-red-800/70 dark:text-red-300/70 font-bold flex justify-between items-center">
                          {lang === 'ar' ? 'الرصيد المتبقي بالسيستم:' : 'Remaining Stock:'}
                          <span className="text-red-600 dark:text-red-400 font-black text-sm bg-red-50 dark:bg-red-900/40 px-2 py-0.5 rounded-lg">{item.stock} علبة</span>
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                      <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <CheckCircle2 size={48} strokeWidth={1.5}/>
                      </div>
                      <p className="font-black text-xl text-slate-800 dark:text-white mb-2 tracking-tight">{t.stable || 'النظام مستقر تماماً'}</p>
                      <p className="text-sm font-medium">لا توجد أي نواقص حرجة في المخزون حالياً.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SpatialCard>
          </motion.div>

        </div>
      </div>

      {/* 🟢 Spatial Emergency Report Modal */}
      <PremiumModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={t.reportTitle || 'إطلاق إنذار نواقص عاجل'}>
        <form onSubmit={handleReportSubmit} className="space-y-6">
          
          <div className="p-5 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-[1.5rem] text-xs font-bold border border-amber-200 dark:border-amber-500/20 flex gap-4 leading-relaxed shadow-inner">
              <AlertTriangle size={24} className="shrink-0 text-amber-500"/>
              <p>{lang === 'ar' ? "هذا الإجراء سيقوم بتنبيه غرفة العمليات المركزية فوراً وإصدار إشعار لجميع مديري الإمداد. يرجى توخي الدقة." : "This will immediately alert the central operations room. Please be accurate."}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{t.governorate || 'المحافظة'}</label>
              <select required value={reportData.governorate} onChange={e => setReportData({...reportData, governorate: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm">
                <option value="" disabled>{lang === 'ar' ? "اختر المحافظة..." : "Select..."}</option>
                {GOVERNORATES_LIST.map(gov => <option key={gov} value={gov}>{gov}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{t.hospitalName || 'اسم المستشفى / المركز'}</label>
              <input required type="text" value={reportData.hospital} onChange={e => setReportData({...reportData, hospital: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{t.drugName || 'اسم الدواء أو الصنف'}</label>
            <input required type="text" value={reportData.drug} onChange={e => setReportData({...reportData, drug: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none text-sm font-bold text-slate-900 dark:text-white transition-all shadow-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{t.priority || 'درجة الأهمية'}</label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level} type="button" onClick={() => setReportData({...reportData, priority: level})}
                  className={`py-4 rounded-2xl text-xs font-black border-2 transition-all ${
                    reportData.priority === level 
                    ? (level === 'high' ? 'bg-red-500 text-white border-red-500 shadow-[0_10px_20px_rgba(239,68,68,0.3)]' : level === 'medium' ? 'bg-orange-500 text-white border-orange-500 shadow-[0_10px_20px_rgba(249,115,22,0.3)]' : 'bg-yellow-500 text-white border-yellow-500 shadow-[0_10px_20px_rgba(234,179,8,0.3)]')
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {level === 'high' ? (t.priorities?.high || 'قصوى') : level === 'medium' ? (t.priorities?.medium || 'متوسطة') : (t.priorities?.low || 'عادية')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-[1] py-4 rounded-2xl font-black text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{t.cancel || 'إلغاء الأمر'}</button>
            <button disabled={isSubmitting} type="submit" className="flex-[2] py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black shadow-[0_10px_30px_rgba(220,38,38,0.4)] flex justify-center items-center gap-2 active:scale-95 transition-transform disabled:opacity-70">
               {isSubmitting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : <><Send size={18} /> {t.sendReport || 'تأكيد وإرسال التنبيه'}</>}
            </button>
          </div>
        </form>
      </PremiumModal>

    </motion.div>
  );
};

export default Dashboard;