import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Truck, Activity, Send, 
  Calendar, MoreVertical 
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

// Components
import StatCard from '../../components/dashboard/StatCard';
import InventoryChart from '../../components/dashboard/InventoryChart'; 
import DistributionChart from '../../components/dashboard/DistributionChart';
import ActivityLog from '../../components/dashboard/ActivityLog';
import EgyptMap from '../../components/maps/EgyptMap';
import Modal from '../../components/common/Modal';

// Firebase
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// 🟢 قائمة المحافظات
const GOVERNORATES_LIST = [
  "القاهرة", "الإسكندرية", "الجيزة", "القليوبية", "الدقهلية", "الشرقية", "الغربية", "المنوفية", "البحيرة", "كفر الشيخ", 
  "دمياط", "بورسعيد", "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم", "المنيا", "أسيوط", 
  "الوادي الجديد", "البحر الأحمر", "سوهاج", "قنا", "الأقصر", "أسوان", "مطروح"
];

// 👇 مكون Skeleton Loading
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse p-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-3xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-3xl"></div>)}
    </div>
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 h-96 bg-gray-200 dark:bg-slate-700 rounded-3xl"></div>
      <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-3xl"></div>
    </div>
  </div>
);

const Dashboard = () => {
  const { t, lang } = useSettings();
  
  // States
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // State البلاغ
  const [reportData, setReportData] = useState({ 
    governorate: '', 
    hospital: '', 
    drug: '', 
    priority: 'high' 
  });

  // 1. تحديث الوقت (تنظيف التايمر ضروري)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 18) return t.greetingEvening;
    return t.greetingEvening;
  };

  // 2. جلب البيانات من Firebase (إصلاح الـ Unsubscribe)
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const q = query(collection(db, "medicines")); // يمكن إضافة orderBy هنا لاحقاً
      
      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMedicines(data);
          setLoading(false);
        }, 
        (error) => {
          console.error("Firestore Error:", error);
          setLoading(false); // إيقاف التحميل حتى لو فشل الاتصال
        }
      );
    } catch (error) {
      console.error("Connection Error:", error);
      setLoading(false);
    }

    // 🟢 التنظيف عند الخروج من الصفحة (أهم خطوة لمنع الأخطاء)
    return () => unsubscribe();
  }, []);

  // 3. حسابات الإحصائيات
  const totalMedicines = medicines.length;
  const criticalShortages = medicines.filter(m => Number(m.stock) < 50).length;
  const totalStockValue = medicines.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

  // 4. إرسال البلاغ
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) {
      alert("لا يوجد اتصال بالإنترنت");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), {
        ...reportData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsReportModalOpen(false);
      setReportData({ governorate: '', hospital: '', drug: '', priority: 'high' });
      alert(lang === 'ar' ? "تم إرسال البلاغ بنجاح" : "Report sent successfully");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(t.error || "حدث خطأ أثناء الإرسال");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 🟢 Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        
        {/* الخلفية الزخرفية */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-100 mb-1">
            <Calendar size={18} />
            <span className="text-sm font-medium">
              {currentTime.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {getGreeting()}، <span className="text-blue-200">Admin 👋</span>
          </h1>
          <p className="text-blue-100 max-w-lg leading-relaxed opacity-90">
             {lang === 'ar' 
               ? `لديك ${criticalShortages} تنبيهات عاجلة تتطلب انتباهك اليوم.`
               : `You have ${criticalShortages} urgent alerts requiring attention today.`
             }
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <div className="text-right hidden sm:block">
             <div className="text-3xl font-mono font-bold">
               {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="text-xs text-blue-200 uppercase tracking-widest">
               {lang === 'ar' ? 'توقيت القاهرة' : 'Cairo Time'}
             </div>
          </div>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 group"
          >
            <AlertTriangle className="group-hover:text-red-500 transition-colors" size={20} />
            {t.reportEmergency}
          </button>
        </div>
      </div>

      {/* 🟢 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.stats.totalItems} 
          value={totalMedicines} 
          icon={<Package size={24} />} 
          trend="up" trendValue="4.5%" 
          subtitle={lang === 'ar' ? "صنف مسجل" : "Registered"}
          color="blue"
        />
        <StatCard 
          title={t.stats.criticalShortage} 
          value={criticalShortages} 
          icon={<AlertTriangle size={24} />} 
          trend={criticalShortages > 0 ? "down" : "neutral"} trendValue={t.urgent} 
          color="red" 
          subtitle={lang === 'ar' ? "أقل من 50 عبوة" : "< 50 Units"}
        />
        <StatCard 
          title={t.stats.totalStock} 
          value={totalStockValue.toLocaleString()} 
          icon={<Activity size={24} />} 
          trend="up" trendValue="12%" 
          subtitle={lang === 'ar' ? "وحدة دواء" : "Units"}
          color="green"
        />
        <StatCard 
          title={t.stats.incomingShipments} 
          value="5" 
          icon={<Truck size={24} />} 
          trend="up" trendValue={t.stable} 
          subtitle={lang === 'ar' ? "متوقع غداً" : "Expected Tomorrow"}
          color="orange"
        />
      </div>

      {/* 🟢 Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* العمود الأيمن */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Map */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
               <div>
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                   {t.mapTitle}
                 </h3>
                 <p className="text-sm text-gray-500">{t.mapSubtitle}</p>
               </div>
             </div>
             <div className="h-[400px] w-full bg-gray-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700">
                <EgyptMap />
             </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t.charts.inventoryAnalysis}</h3>
              {/* 🟢 تحديد ارتفاع ثابت للشارت لحل مشكلة Recharts */}
              <div className="h-[300px] w-full">
                 <InventoryChart medicines={medicines} />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t.charts.categoryDistribution}</h3>
              {/* 🟢 تحديد ارتفاع ثابت للشارت */}
              <div className="h-[300px] w-full">
                 <DistributionChart medicines={medicines} />
              </div>
            </div>
          </div>
        </div>

        {/* العمود الأيسر */}
        <div className="space-y-8">
          
          {/* Live Alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                {t.liveAlerts}
              </h3>
              <span className="text-xs font-mono text-gray-400">LIVE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {criticalShortages > 0 ? (
                medicines.filter(m => Number(m.stock) < 50).map((item) => (
                  <div key={item.id} className="group p-4 rounded-2xl border border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-red-700 dark:text-red-300">{item.name}</span>
                      <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold">{t.urgent}</span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                      {lang === 'ar' ? `الرصيد: ${item.stock} علبة فقط` : `Stock: ${item.stock} only`}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-6">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500"><Activity size={32}/></div>
                  <p>{t.stable}</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white">{t.activityLog}</h3>
              <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
            </div>
            <ActivityLog limit={3} />
          </div>

        </div>
      </div>

      {/* 🟢 Modal with Translations */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={t.reportTitle}>
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl text-sm border border-amber-200 dark:border-amber-900/30 flex gap-2">
              <AlertTriangle size={18}/>
              <p>{lang === 'ar' ? "تنبيه: البيانات الدقيقة تساعد في سرعة وصول الدعم." : "Accurate data ensures faster support."}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.governorate}</label>
              <select 
                required 
                value={reportData.governorate} 
                onChange={e => setReportData({...reportData, governorate: e.target.value})}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
              >
                <option value="">{lang === 'ar' ? "اختر..." : "Select..."}</option>
                {GOVERNORATES_LIST.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.hospitalName}</label>
              <input 
                required 
                value={reportData.hospital} 
                onChange={e => setReportData({...reportData, hospital: e.target.value})} 
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.drugName}</label>
            <input 
              required 
              value={reportData.drug} 
              onChange={e => setReportData({...reportData, drug: e.target.value})} 
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.priority}</label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level} type="button" onClick={() => setReportData({...reportData, priority: level})}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    reportData.priority === level 
                    ? (level === 'high' ? 'bg-red-500 text-white border-red-500' : level === 'medium' ? 'bg-orange-500 text-white border-orange-500' : 'bg-yellow-500 text-white border-yellow-500')
                    : 'bg-white dark:bg-slate-800 border-gray-200 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {level === 'high' ? t.priorities.high : level === 'medium' ? t.priorities.medium : t.priorities.low}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">{t.cancel}</button>
            <button disabled={isSubmitting} type="submit" className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2">
               {isSubmitting ? t.loading : <><Send size={18} /> {t.sendReport}</>}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Dashboard;