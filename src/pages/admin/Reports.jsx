import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Printer, Download, Calendar, Loader2, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Reports = () => {
  const { t, lang, theme } = useSettings();
  const [reportType, setReportType] = useState('inventory'); // inventory, shortage
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب البيانات
  useEffect(() => {
    const q = query(collection(db, "medicines"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedicines(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. فلترة البيانات
  const reportData = useMemo(() => {
    if (reportType === 'shortage') {
      return medicines.filter(item => Number(item.stock) < 50);
    }
    return medicines;
  }, [reportType, medicines]);

  // الطباعة
  const handlePrint = () => {
    window.print();
  };

  // تاريخ ورقم التقرير
  const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const refNumber = useMemo(() => Math.floor(Math.random() * 90000) + 10000, []);

  // نصوص التقرير
  const reportTexts = {
    header: lang === 'ar' ? "جمهورية مصر العربية" : "Arab Republic of Egypt",
    ministry: lang === 'ar' ? "وزارة الصحة والسكان" : "Ministry of Health",
    sector: lang === 'ar' ? "قطاع التموين الطبي (ترياق)" : "Medical Supply Sector (Tiryaq)",
    title: reportType === 'inventory' 
      ? (lang === 'ar' ? 'كشف جرد المخزون العام' : 'Full Inventory Report') 
      : (lang === 'ar' ? 'تقرير النواقص الحرجة' : 'Critical Shortage Report'),
    subjectTitle: lang === 'ar' ? "الموضوع:" : "Subject:",
    subjectBody: reportType === 'inventory'
      ? (lang === 'ar' ? 'فيما يلي بيان تفصيلي بجميع الأرصدة المتاحة بالمخازن والمنصرفة حتى تاريخه، معتمد من النظام الآلي.' : 'Below is a detailed statement of all available stock in warehouses to date, certified by the automated system.')
      : (lang === 'ar' ? 'يرجى الإحاطة بوجود عجز في الأرصدة الموضحة أدناه، ونوصي باتخاذ إجراءات سريعة لتوريد الكميات المطلوبة لتجنب توقف الخدمة الطبية.' : 'Please note the shortage in the items listed below; urgent supply is recommended to avoid medical service interruption.'),
    recTitle: lang === 'ar' ? "توصيات النظام الآلي:" : "Automated Recommendations:",
    recSafe: lang === 'ar' ? "المخزون في الحدود الآمنة ولا يحتاج لتوريد عاجل." : "Stock levels are safe. No urgent supply needed.",
    recDanger: lang === 'ar' ? `يوجد عدد (${reportData.filter(i => i.stock < 50).length}) صنف تحت حد الخطر.` : `There are (${reportData.filter(i => i.stock < 50).length}) items below safety level.`,
    footerNote: lang === 'ar' ? "تم استخراج هذا التقرير آلياً وموثق من نظام ترياق (Tiryaq OS)." : "Automatically generated & certified by Tiryaq OS.",
    signStore: lang === 'ar' ? "أمين المخزن العهدة" : "Store Keeper",
    signManager: lang === 'ar' ? "المدير الطبي" : "Medical Director"
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 tracking-widest uppercase animate-pulse">جاري تحضير الوثائق...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 pt-6 px-4 md:px-8">
      
      {/* 🟢 Header (يختفي عند الطباعة) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tighter">
            <FileText className="text-blue-600" size={36} />
            {t.reports || 'التقارير الرسمية'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            {lang === 'ar' ? 'استخراج وثائق الجرد والنواقص بصيغة A4 جاهزة للاعتماد والطباعة المباشرة.' : 'Extract inventory and shortage documents in A4 format ready for direct printing.'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
        
        {/* 🟢 1. لوحة التحكم (Control Panel) - تختفي عند الطباعة */}
        <motion.div 
          initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/50 dark:border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none h-fit print:hidden relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

          <h3 className="font-black text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            {lang === 'ar' ? 'إعدادات الوثيقة' : 'Document Settings'}
          </h3>
          
          <div className="space-y-6 relative z-10">
            {/* Toggle Report Type */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{lang === 'ar' ? 'نوع التقرير' : 'Report Type'}</label>
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex relative">
                <motion.div 
                  layoutId="report-tab-bg"
                  className="absolute top-1.5 bottom-1.5 w-[48%] bg-white dark:bg-slate-700 rounded-xl shadow-sm z-0"
                  animate={{ x: reportType === 'inventory' ? 0 : (lang === 'ar' ? '-104%' : '104%') }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                ></motion.div>
                <button 
                  onClick={() => setReportType('inventory')} 
                  className={`flex-1 py-3 text-xs font-black text-center relative z-10 transition-colors ${reportType === 'inventory' ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {lang === 'ar' ? 'جرد شامل' : 'Full Inventory'}
                </button>
                <button 
                  onClick={() => setReportType('shortage')} 
                  className={`flex-1 py-3 text-xs font-black text-center relative z-10 transition-colors ${reportType === 'shortage' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {lang === 'ar' ? 'النواقص فقط' : 'Shortages'}
                </button>
              </div>
            </div>

            {/* Date Display */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{lang === 'ar' ? 'تاريخ الاستخراج' : 'Date'}</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-800 dark:text-white">
                <Calendar size={18} className="text-blue-600" />
                <span className="font-bold text-sm">{today}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-slate-500">{lang === 'ar' ? 'إجمالي السجلات:' : 'Total Records:'}</p>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-lg font-black text-sm">{reportData.length}</span>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handlePrint} 
                className="w-full py-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
              >
                <Printer size={20} />
                {lang === 'ar' ? 'طباعة الوثيقة' : 'Print Document'}
              </motion.button>
              
              <button onClick={() => window.print()} className="w-full mt-3 py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Download size={18} />
                {lang === 'ar' ? 'حفظ كـ PDF' : 'Save as PDF'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🟢 2. ورقة التقرير (A4 Realistic View) */}
        <div className="lg:col-span-3 print:w-full print:col-span-4 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' }}
            // Styles for screen (Realistic Paper) vs Print (Plain text)
            className="bg-white text-slate-900 p-10 md:p-16 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(255,255,255,0.05)] w-full max-w-[794px] min-h-[1123px] relative border border-slate-200 print:shadow-none print:m-0 print:w-full print:p-0 print:border-none print:min-h-0" 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            
            {/* ترويسة التقرير (Header) */}
            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start print:border-black">
              <div>
                <h2 className="text-xl font-black mb-1">{reportTexts.header}</h2>
                <h3 className="text-lg font-bold text-slate-700 print:text-black">{reportTexts.ministry}</h3>
                <p className="text-sm font-bold text-slate-500 print:text-black mt-1">{reportTexts.sector}</p>
              </div>
              <div className={`text-${lang === 'ar' ? 'left' : 'right'}`}>
                <h1 className={`text-2xl font-black mb-2 uppercase ${reportType === 'shortage' ? 'text-red-700 print:text-black' : 'text-blue-800 print:text-black'}`}>
                    {reportTexts.title}
                </h1>
                <p className="text-sm font-bold text-slate-600 print:text-black">REF: TRQ-{refNumber}</p>
                <p className="text-sm font-bold text-slate-600 print:text-black">{today}</p>
              </div>
            </div>

            {/* المحتوى النصي */}
            <div className="mb-8">
              <h4 className="text-lg font-black border-b border-slate-200 print:border-black pb-2 mb-4">
                {reportTexts.subjectTitle} <span className="font-bold text-base text-slate-700 print:text-black">{reportTexts.title}</span>
              </h4>
              <p className="text-justify leading-relaxed mb-8 text-sm font-medium">
                {reportTexts.subjectBody}
              </p>

              {/* الجدول */}
              <table className="w-full border-collapse border border-slate-900 print:border-black text-center text-sm mb-8">
                <thead className="bg-slate-100 print:bg-gray-200 text-slate-900 print:text-black font-black uppercase tracking-wider">
                  <tr>
                    <th className="border border-slate-900 print:border-black p-3 w-12">#</th>
                    <th className={`border border-slate-900 print:border-black p-3 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table?.name || 'اسم الصنف'}</th>
                    <th className="border border-slate-900 print:border-black p-3">{t.table?.category || 'التصنيف'}</th>
                    <th className="border border-slate-900 print:border-black p-3">{t.table?.stock || 'الرصيد الفعلي'}</th>
                    <th className="border border-slate-900 print:border-black p-3">{t.table?.status || 'الحالة'}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? (
                    reportData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50 print:hover:bg-transparent transition-colors">
                        <td className="border border-slate-400 print:border-black p-2.5 font-bold text-slate-600 print:text-black">{index + 1}</td>
                        <td className={`border border-slate-400 print:border-black p-2.5 font-black text-slate-800 print:text-black ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{item.name}</td>
                        <td className="border border-slate-400 print:border-black p-2.5 font-bold text-slate-600 print:text-black">{item.category}</td>
                        <td className={`border border-slate-400 print:border-black p-2.5 font-black text-lg ${Number(item.stock) < 50 ? 'text-red-600 print:text-black' : 'text-slate-800 print:text-black'}`}>
                          {item.stock}
                        </td>
                        <td className="border border-slate-400 print:border-black p-2.5 text-xs font-bold">
                           {Number(item.stock) === 0 ? (
                             <span className="flex items-center justify-center gap-1 text-red-600 print:text-black"><AlertTriangle size={14}/> {t.status?.out || 'منعدم'}</span>
                           ) : Number(item.stock) < 50 ? (
                             <span className="flex items-center justify-center gap-1 text-orange-600 print:text-black"><AlertTriangle size={14}/> {t.status?.low || 'حرج'}</span>
                           ) : (
                             <span className="flex items-center justify-center gap-1 text-green-600 print:text-black"><CheckCircle2 size={14}/> {t.status?.good || 'جيد'}</span>
                           )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="border border-slate-400 print:border-black p-8 text-slate-400 print:text-black font-bold">
                        {t.noData || 'لا توجد بيانات متاحة لهذا التقرير.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* التوصيات الآلية */}
              <div className="bg-slate-50 print:bg-white p-5 border border-slate-200 print:border-black rounded-xl text-sm mb-12">
                <strong className="flex items-center gap-2 mb-3 text-slate-800 print:text-black">
                  <Filter size={18} /> {reportTexts.recTitle}
                </strong>
                <ul className={`list-disc space-y-2 ${lang === 'ar' ? 'mr-6' : 'ml-6'} font-bold`}>
                  {reportType === 'shortage' || reportData.some(i => Number(i.stock) < 50) ? (
                    <>
                      <li className="text-red-600 print:text-black">{reportTexts.recDanger}</li>
                      <li className="text-slate-700 print:text-black">{lang === 'ar' ? 'بناءً على بروتوكول التشغيل، يرجى التوجيه بإصدار أوامر توريد فورية للأصناف المذكورة.' : 'Based on protocol, immediate supply orders are recommended.'}</li>
                    </>
                  ) : (
                    <li className="text-green-600 print:text-black">{reportTexts.recSafe}</li>
                  )}
                  <li className="text-slate-400 print:text-black italic font-medium mt-2">{reportTexts.footerNote}</li>
                </ul>
              </div>
            </div>

            {/* التوقيعات والختم */}
            <div className="flex justify-between mt-auto pt-10 break-inside-avoid relative">
              <div className="text-center z-10">
                <p className="font-black text-slate-800 print:text-black mb-10">{reportTexts.signStore}</p>
                <p className="text-slate-300 print:text-black">......................................</p>
              </div>
              <div className="text-center z-10">
                <p className="font-black text-slate-800 print:text-black mb-10">{reportTexts.signManager}</p>
                <p className="text-slate-300 print:text-black">......................................</p>
              </div>
              
              {/* الختم الديناميكي (Animated Stamp) */}
              <motion.div 
                animate={{ rotate: [-10, -15, -10], scale: [0.95, 1, 0.95] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className={`absolute bottom-5 ${lang === 'ar' ? 'left-32' : 'right-32'} opacity-30 border-4 border-blue-800 text-blue-800 p-6 rounded-full font-black text-xl print:opacity-50 print:border-black print:text-black flex flex-col items-center justify-center w-40 h-40 z-0`}
              >
                <span className="tracking-widest">TIRYAQ</span>
                <span className="text-xs tracking-widest mt-1 border-t-2 border-blue-800 print:border-black pt-1">CERTIFIED</span>
                <span className="text-[10px] mt-1">{today.split(' ')[2]}</span>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Reports;