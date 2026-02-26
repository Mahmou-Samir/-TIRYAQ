import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Brain, Sliders, AlertTriangle, Sparkles, TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

// البيانات الخام (بدون أسماء الشهور، سنضيفها ديناميكياً)
const rawData = [
  { id: 1, actual: 4000, predicted: 4000 },
  { id: 2, actual: 3000, predicted: 3000 },
  { id: 3, actual: 3500, predicted: 3500 },
  { id: 4, actual: 2780, predicted: 2780 },
  { id: 5, actual: null, predicted: 2600 }, // نقطة البداية (مايو)
  { id: 6, actual: null, predicted: 2200 },
  { id: 7, actual: null, predicted: 1800 },
  { id: 8, actual: null, predicted: 1200 },
  { id: 9, actual: null, predicted: 500 },
];

const Predictions = () => {
  const { t, lang, theme } = useSettings();
  
  // حالة المحاكاة
  const [infectionRate, setInfectionRate] = useState(1);
  const [importSpeed, setImportSpeed] = useState(1);

  // 1. 🟢 دمج البيانات مع الشهور المترجمة + منطق المحاكاة
  const chartData = useMemo(() => {
    return rawData.map((item, index) => {
      // توفير fallback في حالة عدم وجود ترجمة لضمان عدم حدوث خطأ
      const monthName = t.months ? t.months[index] : `M${index + 1}`;

      if (item.actual !== null) return { ...item, month: monthName };

      let newPredicted = item.predicted - (infectionRate * 500) + (importSpeed * 300);
      
      return { 
        ...item, 
        month: monthName,
        predicted: newPredicted > 0 ? newPredicted : 0 
      };
    });
  }, [infectionRate, importSpeed, t.months]);

  const riskLevel = infectionRate > 1.5 ? 'critical' : infectionRate > 1.2 ? 'high' : 'normal';

  const resetSimulation = () => {
    setInfectionRate(1);
    setImportSpeed(1);
  };

  // دوال للترجمة الاحتياطية (لو t مش محملة بالكامل)
  const getTrans = (key, fallback) => t[key] || fallback;

  return (
    <div className="space-y-8 pb-12 pt-6 px-4 md:px-8">
      
      {/* 🟢 Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-4 tracking-tighter">
            {getTrans('predictionsTitle', 'توقعات الذكاء الاصطناعي')}
            <motion.span 
              animate={{ boxShadow: ['0 0 0 rgba(168,85,247,0)', '0 0 20px rgba(168,85,247,0.5)', '0 0 0 rgba(168,85,247,0)'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 text-[10px] px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-500/20 flex items-center gap-1.5 uppercase tracking-widest font-bold"
            >
              <Sparkles size={14} /> AI Powered
            </motion.span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            {getTrans('predictionsSubtitle', 'استخدم أدوات المحاكاة المتقدمة لتحليل تأثير المتغيرات على المخزون والتنبؤ بمواعيد النفاذ المحتملة.')}
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={resetSimulation} 
          className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-bold"
        >
          <RefreshCw size={16} /> {lang === 'ar' ? 'إعادة الضبط' : 'Reset'}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🟢 Simulation Panel */}
        <motion.div 
          initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none h-fit relative overflow-hidden"
        >
          {/* خلفية جمالية */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600"><Sliders size={20} /></div>
            {getTrans('simulationPanel', 'لوحة التحكم والمحاكاة')}
          </h3>
          
          <div className="space-y-10 relative z-10">
            {/* Slider 1: Infection/Demand Rate */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{getTrans('demandRate', 'معدل الطلب المتوقع')}</label>
                <div className={`px-3 py-1 rounded-lg text-sm font-black ${infectionRate > 1.2 ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {infectionRate}x
                </div>
              </div>
              <input 
                type="range" min="0.5" max="3" step="0.1" value={infectionRate} onChange={(e) => setInfectionRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Slider 2: Import/Supply Speed */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{getTrans('supplyEfficiency', 'كفاءة سلسلة الإمداد')}</label>
                <div className="px-3 py-1 rounded-lg bg-green-50 text-green-600 dark:bg-green-500/10 text-sm font-black">
                  {importSpeed}x
                </div>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1" value={importSpeed} onChange={(e) => setImportSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>

            {/* AI Analysis Result */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={riskLevel}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`p-6 rounded-[1.5rem] border backdrop-blur-sm transition-all duration-500 ${
                  riskLevel === 'critical' ? 'bg-red-50/80 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300' :
                  riskLevel === 'high' ? 'bg-orange-50/80 border-orange-200 text-orange-800 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-300' :
                  'bg-blue-50/80 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 font-black mb-3">
                  <Brain size={20} className={riskLevel === 'critical' ? 'animate-pulse' : ''} />
                  {getTrans('aiAnalysis', 'تحليل الذكاء الاصطناعي')}:
                </div>
                <p className="text-sm leading-relaxed font-medium">
                  {riskLevel === 'critical' 
                    ? (lang === 'ar' ? '🚨 تحذير حرج: النظام يتوقع انهيار كامل في المخزون لبعض الأدوية الأساسية خلال 60 يوم إذا استمرت هذه المعدلات!' : '🚨 Critical Warning: Inventory collapse predicted within 60 days!') 
                    : riskLevel === 'high' 
                    ? (lang === 'ar' ? '⚠️ تنبيه: المخزون تحت ضغط متزايد، يرجى تفعيل خطط الطوارئ لزيادة التوريد.' : '⚠️ Alert: Inventory under pressure, activate emergency supply plans.') 
                    : (lang === 'ar' ? '✅ الحالة مستقرة: معدلات الإمداد الحالية كافية لتغطية الطلب المتوقع بأمان.' : '✅ Status Stable: Supply covers expected demand safely.')}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 🟢 The Chart Panel */}
        <motion.div 
          initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Activity size={24} className="text-purple-500" />
              {getTrans('chartTitle', 'منحنى التوقعات المستقبلية')}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> 
                {getTrans('actualData', 'البيانات الفعلية')}
              </span>
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-purple-500 border border-dashed border-white dark:border-slate-800 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span> 
                {getTrans('predictedData', 'التوقعات')}
              </span>
            </div>
          </div>

          <div className="h-[400px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 'bold'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 'bold'}} tickMargin={10} axisLine={false} tickLine={false} />
                
                <Tooltip 
                   contentStyle={{ 
                     backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                     backdropFilter: 'blur(10px)',
                     borderRadius: '16px',
                     border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                     boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                     color: theme === 'dark' ? '#fff' : '#0f172a',
                     fontWeight: 'bold'
                   }}
                />
                
                {/* خط البداية للتوقعات */}
                <ReferenceLine x={t.months ? t.months[4] : 'M5'} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: getTrans('today', 'اليوم'), fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />

                <Area type="monotone" dataKey="actual" name={getTrans('actualData', 'فعلي')} stroke="#3b82f6" fill="url(#colorActual)" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="predicted" name={getTrans('predictedData', 'متوقع')} stroke="#a855f7" strokeDasharray="5 5" fill="url(#colorPredicted)" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 🟢 Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
          <Sparkles className="text-yellow-500" size={24}/> 
          {getTrans('recommendations', 'توصيات استراتيجية')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <motion.div whileHover={{ y: -5 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border-t-4 border-t-green-500 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h4 className="font-black text-lg text-slate-800 dark:text-white">{getTrans('rec1Title', 'زيادة المخزون الاستراتيجي')}</h4>
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-500"><TrendingUp size={20} /></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed relative z-10 h-14">
              {getTrans('rec1Desc', 'يوصى بزيادة طلبات الاستيراد للأدوية المزمنة بنسبة 15% لتجنب النقص المتوقع الشهر القادم.')}
            </p>
            <button className="w-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 py-3 rounded-xl font-bold text-sm hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors relative z-10">
              {getTrans('rec1Action', 'إنشاء أمر توريد')}
            </button>
          </motion.div>

          {/* Card 2 */}
          <motion.div whileHover={{ y: -5 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border-t-4 border-t-orange-500 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h4 className="font-black text-lg text-slate-800 dark:text-white">{getTrans('rec2Title', 'تنبيه أدوية الأطفال')}</h4>
              <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-500"><AlertTriangle size={20} /></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed relative z-10 h-14">
              {getTrans('rec2Desc', 'توقع بارتفاع حاد في طلبات أدوية خافض الحرارة للأطفال. يجب إعادة توزيع المخزون بين الفروع.')}
            </p>
            <button className="w-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-colors relative z-10">
              {getTrans('rec2Action', 'إدارة النواقص')}
            </button>
          </motion.div>

          {/* Card 3 */}
          <motion.div whileHover={{ y: -5 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border-t-4 border-t-blue-500 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h4 className="font-black text-lg text-slate-800 dark:text-white">{getTrans('rec3Title', 'تحسين مسارات التوصيل')}</h4>
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500"><TrendingDown size={20} /></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed relative z-10 h-14">
              {getTrans('rec3Desc', 'تقليل الاعتماد على صيدليات المركز وتوجيه الطلبات للأطراف لتقليل زمن التوصيل بنسبة 20%.')}
            </p>
            <button className="w-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors relative z-10">
              {getTrans('rec3Action', 'مراجعة اللوجستيات')}
            </button>
          </motion.div>

        </div>
      </motion.div>

    </div>
  );
};

export default Predictions;