import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Brain, Sliders, AlertTriangle, Sparkles, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

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
      // جلب اسم الشهر من مصفوفة الترجمة
      const monthName = t.months[index];

      // لو البيانات فعلية (تاريخية)، نرجعها زي ما هي
      if (item.actual !== null) return { ...item, month: monthName };

      // معادلة المحاكاة للبيانات المستقبلية
      let newPredicted = item.predicted - (infectionRate * 500) + (importSpeed * 300);
      
      return { 
        ...item, 
        month: monthName,
        predicted: newPredicted > 0 ? newPredicted : 0 
      };
    });
  }, [infectionRate, importSpeed, t.months]);

  // تحديد مستوى الخطر
  const riskLevel = infectionRate > 1.5 ? 'critical' : infectionRate > 1.2 ? 'high' : 'normal';

  // إعادة ضبط المحاكاة
  const resetSimulation = () => {
    setInfectionRate(1);
    setImportSpeed(1);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            {t.predictionsTitle}
            <span className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 animate-pulse flex items-center gap-1">
              <Sparkles size={12} /> AI Powered
            </span>
          </h1>
          <p className="text-gray-500 max-w-2xl">
            {t.predictionsSubtitle}
          </p>
        </div>
        <button onClick={resetSimulation} className="text-xs flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors">
          <RefreshCw size={14} /> {lang === 'ar' ? 'إعادة ضبط' : 'Reset'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Simulation Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm h-fit">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Sliders size={20} className="text-blue-600" />
            {t.simulationPanel}
          </h3>
          
          <div className="space-y-8">
            {/* Slider 1 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.demandRate}</label>
                <span className={`text-sm font-bold ${infectionRate > 1 ? 'text-red-500' : 'text-green-500'}`}>
                  {infectionRate}x
                </span>
              </div>
              <input 
                type="range" min="0.5" max="3" step="0.1"
                value={infectionRate}
                onChange={(e) => setInfectionRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Slider 2 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.supplyEfficiency}</label>
                <span className="text-sm font-bold text-blue-600">{importSpeed}x</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.1"
                value={importSpeed}
                onChange={(e) => setImportSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Analysis Result */}
            <div className={`p-4 rounded-xl border transition-colors duration-300 ${
              riskLevel === 'critical' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' :
              riskLevel === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-400' :
              'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <Brain size={18} />
                {t.aiAnalysis}:
              </div>
              <p className="text-sm leading-relaxed">
                {riskLevel === 'critical' 
                  ? (lang === 'ar' ? 'تحذير: النظام يتوقع انهيار المخزون خلال 60 يوم!' : 'Warning: Inventory collapse predicted within 60 days!') 
                  : riskLevel === 'high' 
                  ? (lang === 'ar' ? 'تنبيه: المخزون تحت الضغط، يرجى زيادة التوريد.' : 'Alert: Inventory under pressure, increase supply.') 
                  : (lang === 'ar' ? 'الحالة مستقرة: الإمدادات تكفي لتغطية الطلب.' : 'Status Stable: Supply covers expected demand.')}
              </p>
            </div>
          </div>
        </div>

        {/* 3. The Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.chartTitle}</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-gray-500"><span className="w-3 h-3 rounded-full bg-blue-500"></span> {t.actualData}</span>
              <span className="flex items-center gap-1 text-gray-500"><span className="w-3 h-3 rounded-full bg-purple-500 border border-dashed border-white dark:border-slate-800"></span> {t.predictedData}</span>
            </div>
          </div>

          <div className="h-[400px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} vertical={false} />
                
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                
                <Tooltip 
                   contentStyle={{ 
                     backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
                     borderRadius: '12px',
                     borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                     color: theme === 'dark' ? '#fff' : '#000'
                   }}
                />
                
                {/* خط فاصل عند بداية التنبؤ (الشهر الخامس - مايو) */}
                <ReferenceLine x={t.months[4]} stroke="red" strokeDasharray="3 3" label={{ position: 'top', value: t.today, fill: 'red', fontSize: 12 }} />

                {/* البيانات الفعلية */}
                <Area type="monotone" dataKey="actual" name={t.actualData} stroke="#3b82f6" fill="transparent" strokeWidth={3} />
                
                {/* البيانات المتوقعة */}
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  name={t.predictedData}
                  stroke="#a855f7" 
                  strokeDasharray="5 5" 
                  fill="url(#colorPredicted)" 
                  strokeWidth={3} 
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recommendations */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4 flex items-center gap-2">
        <Sparkles className="text-yellow-500" size={20}/> {t.recommendations}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-l-green-500 border border-gray-100 dark:border-slate-700 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-800 dark:text-white">{t.rec1.title}</h4>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10">{t.rec1.desc}</p>
          <button className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-3 py-2 rounded-lg font-bold w-full text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            {t.rec1.action}
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-l-orange-500 border border-gray-100 dark:border-slate-700 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-800 dark:text-white">{t.rec2.title}</h4>
            <AlertTriangle size={20} className="text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10">{t.rec2.desc}</p>
          <button className="text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 px-3 py-2 rounded-lg font-bold w-full text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            {t.rec2.action}
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-l-blue-500 border border-gray-100 dark:border-slate-700 shadow-sm hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-800 dark:text-white">{t.rec3.title}</h4>
            <TrendingDown size={20} className="text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10">{t.rec3.desc}</p>
          <button className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-2 rounded-lg font-bold w-full text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            {t.rec3.action}
          </button>
        </div>

      </div>

    </div>
  );
};

export default Predictions;