import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, ClipboardList, TrendingUp, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Activity, Wallet, 
  Clock, CheckCircle2, MoreHorizontal, Loader2, Zap
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useSettings } from '../../context/SettingsContext';

// --- 1. مكون الكارت الإحصائي ---
const PharmacyStatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay, loading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay, duration: 0.4 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="relative overflow-hidden bg-white/70 dark:bg-[#0b1121]/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/5 shadow-xl group cursor-default"
  >
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:opacity-40 ${color}`}></div>
    
    <div className="relative z-10 flex justify-between items-start mb-4">
      <div className={`p-3.5 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 text-')} bg-opacity-10 shadow-sm`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}
      </div>
    </div>
    
    <div className="relative z-10">
      {loading ? (
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-1"></div>
      ) : (
        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">{value}</h3>
      )}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </motion.div>
);

// --- 2. الرسم البياني البسيط (مترجم) ---
const SimpleBarChart = ({ lang }) => {
  const data = [40, 65, 45, 80, 55, 90, 70];
  // الترجمة الديناميكية للأيام
  const daysAr = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
  const daysEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const days = lang === 'ar' ? daysAr : daysEn;
  
  return (
    <div className="flex justify-between items-end h-48 w-full gap-2 mt-4">
      {data.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
          <div className="relative w-full rounded-xl bg-slate-100 dark:bg-white/5 h-full overflow-hidden flex items-end">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
              className="w-full bg-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity rounded-t-xl relative"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
};

// --- 3. الصفحة الرئيسية ---
const PharmacyDashboard = () => {
  const { t, lang } = useSettings();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalStock: 0,
    shortages: 0,
    activeOrders: 0,
    dailySales: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 جلب البيانات من Firebase
  useEffect(() => {
    const pharmacyId = auth.currentUser?.uid || 'GUEST_PHARMACY';
    setLoading(true);

    const medicinesQuery = query(collection(db, "medicines"), where("pharmacyId", "==", pharmacyId));
    const unsubscribeMedicines = onSnapshot(medicinesQuery, (snapshot) => {
      let total = 0;
      let lowStock = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        total += 1; 
        if (Number(data.stock) < 10) lowStock += 1; 
      });
      setStats(prev => ({ ...prev, totalStock: total, shortages: lowStock }));
    });

    const ordersQuery = query(
      collection(db, "orders"), 
      where("pharmacyId", "==", pharmacyId),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      let active = 0;
      let todaySales = 0;
      const activities = [];
      const today = new Date().setHours(0,0,0,0);

      snapshot.forEach(doc => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

        if (['pending', 'processing', 'accepted', 'preparing'].includes(data.status)) {
          active += 1;
        }

        if (data.status === 'completed' && orderDate >= today) {
          todaySales += Number(data.totalPrice || 0);
        }

        if (activities.length < 5) {
          activities.push({
            id: doc.id,
            type: 'order',
            name: (lang === 'ar' ? 'طلب #' : 'Order #') + doc.id.slice(0, 5),
            status: data.status,
            time: orderDate,
            color: data.status === 'completed' ? 'text-green-500 bg-green-100 dark:bg-green-500/10' : 
                   data.status === 'pending' ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/10' : 
                   'text-blue-500 bg-blue-100 dark:bg-blue-500/10'
          });
        }
      });

      setStats(prev => ({ ...prev, activeOrders: active, dailySales: todaySales }));
      setRecentActivity(activities);
      setLoading(false);
    });

    return () => {
      unsubscribeMedicines();
      unsubscribeOrders();
    };
  }, [lang]);

  // أدوات المساعدة للترجمة (Helpers)
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    if (diffInMinutes < 60) return lang === 'ar' ? `منذ ${diffInMinutes} د` : `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return lang === 'ar' ? `منذ ${diffInHours} س` : `${diffInHours}h ago`;
    return lang === 'ar' ? 'أمس' : 'Yesterday';
  };

  const translateStatus = (status) => {
    const statusMap = {
      pending: lang === 'ar' ? 'جديد' : 'New',
      accepted: lang === 'ar' ? 'مقبول' : 'Accepted',
      preparing: lang === 'ar' ? 'تجهيز' : 'Preparing',
      ready: lang === 'ar' ? 'جاهز' : 'Ready',
      completed: lang === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: lang === 'ar' ? 'ملغى' : 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // حماية الترجمات
  const d_t = t?.pharmacy?.dashboard || {}; 

  return (
    <div className="space-y-8 animate-fade-in pb-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 Hero Welcome Section */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/10 group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-600/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <Activity size={14} /> 
              <span>
                {lang === 'ar' ? 'النظام: ' : 'System: '} 
                {loading ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : (lang === 'ar' ? 'متصل ومباشر' : 'Online & Live')}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
              {d_t.welcome || (lang === 'ar' ? 'أهلاً بك' : 'Welcome')}, {auth.currentUser?.displayName?.split(' ')[0] || (lang === 'ar' ? 'دكتور' : 'Doctor')} 👋
            </h1>
            <p className="text-slate-300 font-medium max-w-lg leading-relaxed">
              {lang === 'ar' ? 'لديك' : 'You have'} <span className="text-white font-black">{stats.activeOrders}</span> {lang === 'ar' ? 'طلبات نشطة تحتاج لمراجعتك. الذكاء الاصطناعي يراقب المخزون لتجنب النواقص.' : 'active orders. AI is monitoring stock to prevent shortages.'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <button 
               onClick={() => navigate('/pharmacy/inventory')}
               className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
             >
               <Package size={18}/> {t?.pharmacy?.sidebar?.inventory || (lang === 'ar' ? 'المخزون' : 'Inventory')}
             </button>
             <button 
               onClick={() => navigate('/pharmacy/orders')}
               className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/10 active:scale-95 flex items-center gap-2"
             >
               <ClipboardList size={18}/> {t?.pharmacy?.sidebar?.orders || (lang === 'ar' ? 'الطلبات' : 'Orders')}
             </button>
          </div>
        </div>
      </div>

      {/* 🟢 Stats Grid (Live Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PharmacyStatCard 
          title={d_t.totalStock || (lang === 'ar' ? 'إجمالي الأصناف' : 'Total Items')} 
          value={stats.totalStock} 
          icon={Package} 
          trend="up" trendValue={lang === 'ar' ? "مستقر" : "Stable"} 
          color="bg-blue-500" 
          delay={0.1} loading={loading}
        />
        <PharmacyStatCard 
          title={d_t.activeOrders || (lang === 'ar' ? 'طلبات نشطة' : 'Active Orders')} 
          value={stats.activeOrders} 
          icon={ClipboardList} 
          trend="up" trendValue={lang === 'ar' ? "يحتاج انتباه" : "Needs Action"} 
          color="bg-emerald-500" 
          delay={0.2} loading={loading}
        />
        <PharmacyStatCard 
          title={d_t.shortages || (lang === 'ar' ? 'نواقص حرجة' : 'Shortages')} 
          value={stats.shortages} 
          icon={AlertCircle} 
          trend={stats.shortages > 0 ? "down" : "up"} trendValue={stats.shortages > 0 ? (lang === 'ar' ? "خطر" : "Risk") : (lang === 'ar' ? "آمن" : "Safe")} 
          color="bg-red-500" 
          delay={0.3} loading={loading}
        />
        <PharmacyStatCard 
          title={d_t.dailySales || (lang === 'ar' ? 'مبيعات اليوم' : 'Daily Sales')} 
          value={`${stats.dailySales} ${lang === 'ar' ? 'ج.م' : 'EGP'}`} 
          icon={Wallet} 
          trend="up" trendValue="+18%" 
          color="bg-purple-500" 
          delay={0.4} loading={loading}
        />
      </div>

      {/* 🟢 Analytics & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-[#0b1121]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col justify-between">
           <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white">
                 {lang === 'ar' ? 'تحليل النشاط الأسبوعي' : 'Weekly Activity Analysis'}
               </h3>
               <p className="text-sm text-slate-500 font-bold">
                 {lang === 'ar' ? 'معدل استجابة الطلبات' : 'Order Response Rate'}
               </p>
             </div>
             <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-400 transition-colors">
               <MoreHorizontal size={20}/>
             </button>
           </div>
           <SimpleBarChart lang={lang} />
        </div>

        {/* Smart Insights & Recent */}
        <div className="space-y-6">
          
          {/* AI Insight Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden ${stats.shortages > 5 ? 'bg-gradient-to-br from-rose-600 to-red-700' : 'bg-gradient-to-br from-emerald-600 to-teal-700'}`}
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3 bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                 <Zap size={14} className="text-yellow-300 fill-yellow-300"/> 
                 <span className="text-[10px] font-black uppercase tracking-wider">{d_t.smartTip || 'AI Insight'}</span>
               </div>
               <p className="font-bold leading-relaxed mb-5 text-sm opacity-95">
                 {stats.shortages > 5 
                   ? (lang === 'ar' ? `لديك ${stats.shortages} أصناف ناقصة تؤثر على تقييمك. يرجى المراجعة فوراً.` : `You have ${stats.shortages} shortages affecting your rating. Review immediately.`) 
                   : (d_t.tipContent || (lang === 'ar' ? "المخزون مستقر. التوقعات تشير لزيادة الطلب على المسكنات غداً." : "Stock is stable. AI predicts high demand for painkillers tomorrow."))}
               </p>
               <button 
                onClick={() => navigate(stats.shortages > 5 ? '/pharmacy/inventory' : '/pharmacy/orders')}
                className={`w-full py-3 bg-white rounded-xl font-black text-sm shadow-lg transition-transform active:scale-95 ${stats.shortages > 5 ? 'text-red-700' : 'text-teal-700'}`}
               >
                 {stats.shortages > 5 ? (lang === 'ar' ? 'مراجعة النواقص' : 'Review Shortages') : (lang === 'ar' ? 'متابعة الطلبات' : 'Track Orders')}
               </button>
             </div>
          </motion.div>

          {/* Recent Orders List */}
          <div className="bg-white/70 dark:bg-[#0b1121]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl min-h-[250px] flex flex-col">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              {lang === 'ar' ? 'أحدث النشاطات' : 'Recent Activity'}
            </h3>
            <div className="space-y-3 flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 min-h-[150px]">
                   <Loader2 className="animate-spin" />
                   <span className="text-xs">{lang === 'ar' ? 'جاري التحديث...' : 'Updating...'}</span>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <div key={i} onClick={() => navigate('/pharmacy/orders')} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                        {item.status === 'pending' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{translateStatus(item.status)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold shrink-0">
                      <Clock size={10} /> {formatTimeAgo(item.time)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full min-h-[150px] text-slate-400 text-sm font-bold text-center px-4">
                  {d_t.noOrders || (lang === 'ar' ? 'لا توجد نشاطات حديثة' : 'No recent activity')}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;