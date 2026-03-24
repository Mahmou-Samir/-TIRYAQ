import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Brain, Sliders, Sparkles, TrendingUp, DollarSign, RefreshCw, CalendarDays, Calendar, CalendarRange } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

// القائمة الحقيقية (نفس القائمة السابقة)
const PRODUCT_CATALOG = {
  "Revolution Puppy Kitten": { "product": "Revolution Puppy Kitten - 155", "group": "Parasiticides", "item": "Rev Mauv PupKit           - 10000320" },
  "Revolution Feline": { "product": "Revolution Feline - 154", "group": "Parasiticides", "item": "Rev 3pk Blu/Cat           - 10000335" },
  "Revolution Canine": { "product": "Revolution Canine - 107", "group": "Parasiticides", "item": "Rev 3pk Brn Dog           - 10000337" },
  "Clavamox": { "product": "Clavamox - 032", "group": "Anti-infective", "item": "Clava Tab 125mg           - 10000483" },
  "Convenia": { "product": "Convenia - 167", "group": "Anti-infective", "item": "Convenia 10ml             - 10001498" },
  "Albon": { "product": "Albon - 031", "group": "Anti-infective", "item": "Albon Oral 5%             - 10000296" },
  "Antisedan": { "product": "Antisedan - Canine - 069", "group": "Sedatives", "item": "Antisedan 10ml            - 10000449" },
  "Rimadyl Chewable": { "product": "Rimadyl Chewable - 047", "group": "Pain", "item": "Rimadyl Chew 10           - 10000318" },
  "Propoflo": { "product": "Propoflo - 196", "group": "Anesthetic", "item": "PROPOFLO 28 INJ (10MG/ML) - 20ML - AAH049440401" },
  "High Titer Parvo": { "product": "High Titer Parvo - 009", "group": "Biologicals", "item": "Vanguard Plus 5           - 10000442" }
};

const TERRITORIES = ["Portland N, OR - 3226", "Medford, OR - 3217"];

const Predictions = () => {
  const { lang, theme } = useSettings();
  
  const [selectedProduct, setSelectedProduct] = useState("Revolution Puppy Kitten");
  const [selectedTerritory, setSelectedTerritory] = useState(TERRITORIES[0]);
  const [targetQuantity, setTargetQuantity] = useState(15);
  const [timeHorizon, setTimeHorizon] = useState('months'); // 'days', 'months', 'years'
  
  const [predictedSales, setPredictedSales] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // تجميع الأدوية
  const groupedProducts = useMemo(() => {
    const groups = {};
    Object.keys(PRODUCT_CATALOG).forEach(key => {
      const groupName = PRODUCT_CATALOG[key].group;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(key);
    });
    return groups;
  }, []);

  // 🚀 الاتصال بالـ API
  const fetchPrediction = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const prodData = PRODUCT_CATALOG[selectedProduct];
      const payload = {
        corp_account: "Non Corp Acct",
        product: prodData.product,
        therapeutic_group: prodData.group,
        territory: selectedTerritory,
        item: prodData.item,
        cad_fte_vets: 1.0,
        glr_quantity: targetQuantity
      };

      const response = await fetch('https://mahmoud1412-tiryaq-backend.hf.space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setPredictedSales(data.predicted_sales_usd);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setApiError(lang === 'ar' ? 'فشل الاتصال بسيرفر الذكاء الاصطناعي.' : 'Failed to connect to AI server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchPrediction(), 500);
    return () => clearTimeout(timer);
  }, [selectedProduct, selectedTerritory, targetQuantity]);

  // 🚀 محرك الإسقاط الزمني (Time-Series Projection Engine)
  const chartData = useMemo(() => {
    let data = [];
    if (predictedSales === 0) return data;

    const baseValue = predictedSales;
    const currentYear = new Date().getFullYear();

    if (timeHorizon === 'days') {
      // 🟢 توقع 30 يوم قادمة (تذبذب يومي يحاكي حركة الزبائن)
      for (let i = 1; i <= 30; i++) {
        const volatility = (Math.random() * 0.2) - 0.1; // تذبذب 10% صعوداً وهبوطاً
        data.push({
          timeLabel: lang === 'ar' ? `يوم ${i}` : `Day ${i}`,
          revenue: Math.round(baseValue * (1 + volatility)),
        });
      }
    } 
    else if (timeHorizon === 'months') {
      // 🟢 توقع 12 شهر قادمة (منحنى موسمي)
      const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 0; i < 12; i++) {
        // تأثير موسمي (الذروة في الشتاء والصيف)
        const seasonality = Math.sin((i / 11) * Math.PI) * 0.15; 
        const growth = i * 0.02; // نمو تدريجي 2% شهرياً
        
        data.push({
          timeLabel: lang === 'ar' ? monthsAr[i] : monthsEn[i],
          revenue: Math.round(baseValue * (1 + seasonality + growth)),
        });
      }
    } 
    else if (timeHorizon === 'years') {
      // 🟢 توقع 5 سنوات قادمة (نمو سنوي مركب)
      for (let i = 0; i < 5; i++) {
        const annualGrowth = Math.pow(1.12, i); // نمو سنوي 12%
        data.push({
          timeLabel: `${currentYear + i}`,
          revenue: Math.round(baseValue * annualGrowth),
        });
      }
    }
    return data;
  }, [predictedSales, timeHorizon, lang]);


  return (
    <div className="space-y-8 pb-12 pt-6 px-4 md:px-8">
      
      {/* 🟢 Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-4 tracking-tighter">
            {lang === 'ar' ? 'التوقعات الزمنية المستقبلية' : 'Future Time Forecast'}
            <motion.span 
              animate={{ boxShadow: ['0 0 0 rgba(168,85,247,0)', '0 0 20px rgba(168,85,247,0.5)', '0 0 0 rgba(168,85,247,0)'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 text-[10px] px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-500/20 flex items-center gap-1.5 uppercase tracking-widest font-bold"
            >
              <Sparkles size={14} /> AI Engine
            </motion.span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            {lang === 'ar' ? 'قم بإسقاط المبيعات المتوقعة للأدوية على مدار الأيام، الشهور، والسنوات القادمة لبناء استراتيجية مالية قوية.' : 'Project predicted drug sales over upcoming days, months, and years to build a robust financial strategy.'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🟢 Settings Panel */}
        <motion.div 
          initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-lg h-fit relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600"><Sliders size={20} /></div>
            {lang === 'ar' ? 'معطيات التحليل' : 'Analysis Inputs'}
          </h3>
          
          <div className="space-y-6 relative z-10">
            
            {/* الدواء */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'المنتج الدوائي' : 'Product'}</label>
              <select 
                value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-sm"
              >
                {Object.keys(groupedProducts).map(group => (
                  <optgroup key={group} label={`-- ${group} --`} className="bg-slate-100 dark:bg-slate-900 font-black text-blue-600">
                    {groupedProducts[group].map(prod => (
                      <option key={prod} value={prod} className="text-slate-800 dark:text-white font-medium bg-white dark:bg-slate-800">{prod}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* الكمية */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{lang === 'ar' ? 'الكمية المستهدفة' : 'Target Qty'}</label>
                <div className="px-3 py-1 rounded-lg text-sm font-black bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  {targetQuantity} {lang === 'ar' ? 'وحدة' : 'Units'}
                </div>
              </div>
              <input 
                type="range" min="1" max="100" step="1" value={targetQuantity} onChange={(e) => setTargetQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 outline-none"
              />
            </div>

            {/* AI Output */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={predictedSales}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-2 font-bold text-blue-100 mb-2 text-sm">
                  {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Brain size={18} />}
                  {lang === 'ar' ? 'توقع XGBoost الأساسي' : 'Base XGBoost Prediction'}
                </div>
                {apiError ? (
                  <div className="text-red-200 text-xs font-bold mt-2 bg-red-900/30 p-2 rounded-lg">{apiError}</div>
                ) : (
                  <div className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <DollarSign size={28} className="text-emerald-400" />
                    {predictedSales.toLocaleString()}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </motion.div>

        {/* 🟢 Time-Series Chart Panel */}
        <motion.div 
          initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-lg flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <TrendingUp size={24} className="text-emerald-500" />
              {lang === 'ar' ? 'الإسقاط الزمني للأرباح' : 'Time Projection'}
            </h3>
            
            {/* 🟢 Time Horizon Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button onClick={() => setTimeHorizon('days')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeHorizon === 'days' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                <CalendarDays size={16} /> {lang === 'ar' ? '30 يوم' : '30 Days'}
              </button>
              <button onClick={() => setTimeHorizon('months')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeHorizon === 'months' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                <Calendar size={16} /> {lang === 'ar' ? '12 شهر' : '12 Months'}
              </button>
              <button onClick={() => setTimeHorizon('years')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeHorizon === 'years' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                <CalendarRange size={16} /> {lang === 'ar' ? '5 سنوات' : '5 Years'}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 'bold'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 'bold'}} tickMargin={10} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                
                <Tooltip 
                   contentStyle={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', color: theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                   formatter={(value) => [`$${value.toLocaleString()}`, lang === 'ar' ? 'المبيعات المتوقعة' : 'Predicted Sales']}
                />
                
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Predictions;
