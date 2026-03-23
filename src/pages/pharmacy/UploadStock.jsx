import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  Loader2, Download, Trash2, Database, Search, X, 
  ChevronUp, ChevronDown, Eye, EyeOff, RefreshCw,
  ShieldCheck, Zap, BarChart3, AlertCircle, ArrowRight,
  Filter, SortAsc, FileCheck, Clock, Package
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -60, scale: 0.85 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -30, scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    className={`fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-2xl max-w-sm w-[90%]
      ${type === 'success'
        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
        : type === 'error'
        ? 'bg-red-950/80 border-red-500/40 text-red-300'
        : 'bg-sky-950/80 border-sky-500/40 text-sky-300'}`}
  >
    <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
      ${type === 'success' ? 'bg-emerald-500/20' : type === 'error' ? 'bg-red-500/20' : 'bg-sky-500/20'}`}>
      {type === 'success' ? <CheckCircle2 size={16}/> : type === 'error' ? <AlertTriangle size={16}/> : <Zap size={16}/>}
    </span>
    <span className="text-sm font-semibold flex-1 leading-snug">{message}</span>
    <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
      <X size={14}/>
    </button>
  </motion.div>
);

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-4 bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 backdrop-blur-md`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={18}/>
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{label}</p>
      <p className="text-xl font-black text-white leading-tight">{value}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────── */
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   VALIDATION BADGE
───────────────────────────────────────────── */
const ValidationBadge = ({ issues }) => {
  if (issues === 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
      <ShieldCheck size={12}/> Valid
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
      <AlertCircle size={12}/> {issues} issues
    </span>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const UploadStock = () => {
  const { t, lang } = useSettings();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const [visibleCols, setVisibleCols] = useState(null);
  const [showColMenu, setShowColMenu] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [step, setStep] = useState('idle'); // idle | preview | uploading | done
  const [validationIssues, setValidationIssues] = useState(0);
  const fileInputRef = useRef(null);
  const colMenuRef = useRef(null);

  const isRTL = lang === 'ar';
  const uiText = t?.pharmacy?.upload || {};
  const loadingText = t?.loading || (isRTL ? 'جاري المعالجة...' : 'Processing...');

  // Close column menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setShowColMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Drag Handlers ── */
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  /* ── Validate Rows ── */
  const validateData = (rows) => {
    let issues = 0;
    rows.forEach(row => {
      const name = row['اسم الدواء'] || row['Name'] || row['Drug Name'];
      const qty = row['الكمية'] || row['Quantity'] || row['Stock'];
      const price = row['السعر'] || row['Price'];
      if (!name || name === '') issues++;
      if (isNaN(Number(qty)) || Number(qty) < 0) issues++;
      if (isNaN(Number(price)) || Number(price) < 0) issues++;
    });
    return issues;
  };

  /* ── Process File ── */
  const processFile = (selectedFile) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(selectedFile.type)) {
      showToast(isRTL ? 'صيغة الملف غير مدعومة (.xlsx أو .xls فقط)' : 'Unsupported format — use .xlsx or .xls', 'error');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        if (jsonData.length === 0) {
          showToast(isRTL ? 'الملف فارغ أو لا يحتوي بيانات' : 'File is empty or has no data', 'error');
          setFile(null); return;
        }
        const issues = validateData(jsonData);
        setData(jsonData);
        setValidationIssues(issues);
        setVisibleCols(Object.keys(jsonData[0]));
        setStep('preview');
        showToast(
          isRTL ? `تم تحميل ${jsonData.length} صنف بنجاح` : `${jsonData.length} items loaded successfully`,
          'success'
        );
      } catch {
        showToast(isRTL ? 'خطأ في قراءة الملف' : 'Error reading file', 'error');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  /* ── Upload to Firebase ── */
  const handleUpload = async () => {
    if (!data.length) return;
    setUploading(true);
    setStep('uploading');
    setUploadProgress(0);

    try {
      const pharmacyId = auth?.currentUser?.uid || 'GUEST_PHARMACY';
      let uploaded = 0;

      for (const item of data) {
        const medicineData = {
          name: item['اسم الدواء'] || item['Name'] || item['Drug Name'] || 'Unknown',
          stock: Number(item['الكمية'] || item['Quantity'] || item['Stock'] || 0),
          category: item['التصنيف'] || item['Category'] || item['Type'] || 'General',
          price: Number(item['السعر'] || item['Price'] || 0),
          expiry: item['تاريخ الصلاحية'] || item['Expiry'] || null,
          pharmacyId,
          updatedAt: serverTimestamp(),
          searchKeywords: [
            (item['اسم الدواء'] || item['Name'] || '').toLowerCase(),
            (item['التصنيف'] || item['Category'] || '').toLowerCase(),
          ],
        };
        await addDoc(collection(db, 'medicines'), medicineData);
        uploaded++;
        setUploadProgress(Math.round((uploaded / data.length) * 100));
      }

      setUploadHistory(prev => [{
        filename: file?.name || 'unknown',
        count: data.length,
        time: new Date().toLocaleTimeString(),
        status: 'success'
      }, ...prev.slice(0, 4)]);

      setStep('done');
      showToast(isRTL ? `تم رفع ${data.length} صنف بنجاح 🎉` : `${data.length} items uploaded! 🎉`, 'success');
      setTimeout(resetState, 2500);
    } catch (err) {
      console.error(err);
      showToast(isRTL ? 'خطأ في الاتصال بالخادم' : 'Server connection error', 'error');
      setStep('preview');
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setData([]); setFile(null); setStep('idle');
    setSearchQuery(''); setSortConfig({ key: null, dir: 'asc' });
    setVisibleCols(null); setUploadProgress(0);
  };

  /* ── Download Template ── */
  const downloadTemplate = () => {
    const templateData = [
      { Name: 'Panadol Extra', 'اسم الدواء': 'Panadol Extra', Category: 'Analgesic', التصنيف: 'مسكنات', Quantity: 100, الكمية: 100, Price: 45, السعر: 45, Expiry: '2026-12-01', 'تاريخ الصلاحية': '2026-12-01' },
      { Name: 'Augmentin 1g', 'اسم الدواء': 'Augmentin 1g', Category: 'Antibiotic', التصنيف: 'مضاد حيوي', Quantity: 50, الكمية: 50, Price: 90, السعر: 90, Expiry: '2025-05-20', 'تاريخ الصلاحية': '2025-05-20' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock_Template');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'Tiryaq_Stock_Template.xlsx' }).click();
    URL.revokeObjectURL(url);
  };

  /* ── Sort & Filter ── */
  const columns = data.length ? Object.keys(data[0]) : [];
  const displayed = visibleCols || columns;

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const av = a[sortConfig.key] ?? ''; const bv = b[sortConfig.key] ?? '';
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortConfig.dir === 'asc' ? cmp : -cmp;
  });

  const filteredData = sortedData.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSort = (key) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  /* ── Stats ── */
  const totalValue = data.reduce((s, r) => s + (Number(r['السعر'] || r['Price'] || 0) * Number(r['الكمية'] || r['Quantity'] || 0)), 0);
  const categories = [...new Set(data.map(r => r['التصنيف'] || r['Category'] || ''))].filter(Boolean).length;

  /* ── Animations ── */
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="max-w-6xl mx-auto space-y-6 pb-16 font-sans"
    >
      {/* TOAST */}
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── HERO ── */}
      <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/5 shadow-2xl">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        {/* Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
              <Zap size={12} />
              Smart Stock Sync · v2.5
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 leading-tight">
              {uiText.title || (isRTL ? 'مركز تحديث المخزون' : 'Stock Update Center')}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {uiText.subtitle || (isRTL
                ? 'ارفع ملف Excel لمزامنة المخزون فوراً مع التحقق التلقائي من البيانات'
                : 'Upload Excel sheets to sync inventory instantly with automatic data validation')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={downloadTemplate}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 text-sm font-semibold px-5 py-3 rounded-xl transition-all"
            >
              <Download size={16} />
              {isRTL ? 'تحميل القالب' : 'Download Template'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <UploadCloud size={16} />
              {isRTL ? 'رفع ملف' : 'Upload File'}
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── UPLOAD ZONE ── */}
      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.div key="dropzone" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.97 }}>
            <input type="file" ref={fileInputRef} hidden accept=".xlsx,.xls" onChange={handleChange} />
            <div
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-20 px-8 text-center overflow-hidden group
                ${dragActive
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-emerald-500/[0.03]'}`}
            >
              <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 border
                ${dragActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 scale-110' : 'bg-slate-900 border-slate-800 text-slate-500 group-hover:border-emerald-500/30 group-hover:text-emerald-400 group-hover:bg-emerald-500/5'}`}>
                <UploadCloud size={40} strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {dragActive
                  ? (isRTL ? 'أفلت الملف هنا' : 'Drop it here!')
                  : (isRTL ? 'اسحب وأفلت ملف Excel' : 'Drag & drop your Excel file')}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {isRTL ? 'أو اضغط لاختيار الملف من جهازك' : 'Or click anywhere to browse your files'}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {['.xlsx', '.xls', isRTL ? 'حتى 10,000 صنف' : 'Up to 10k rows', isRTL ? 'UTF-8 + Arabic' : 'Bilingual support'].map(tag => (
                  <span key={tag} className="text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── UPLOADING OVERLAY ── */}
        {step === 'uploading' && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-3xl bg-slate-950 border border-white/5 p-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Database size={32} className="text-emerald-400" />
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#064e3b" strokeWidth="4" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="#10b981" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - uploadProgress / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-1">{isRTL ? 'جاري الرفع...' : 'Uploading to database...'}</p>
              <p className="text-slate-500 text-sm">{uploadProgress}% — {Math.round(data.length * uploadProgress / 100)} / {data.length} {isRTL ? 'صنف' : 'items'}</p>
            </div>
            <div className="w-full max-w-xs">
              <ProgressBar progress={uploadProgress} />
            </div>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-3xl bg-emerald-950/40 border border-emerald-500/20 p-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
            <p className="text-emerald-300 font-black text-2xl">{isRTL ? 'تم بنجاح!' : 'Upload Complete!'}</p>
            <p className="text-slate-400 text-sm">{isRTL ? 'سيتم إعادة التعيين تلقائياً' : 'Resetting automatically...'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STATS (when data loaded) ── */}
      <AnimatePresence>
        {data.length > 0 && step === 'preview' && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Package} label={isRTL ? 'إجمالي الأصناف' : 'Total Items'} value={data.length.toLocaleString()} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={BarChart3} label={isRTL ? 'القيمة الإجمالية' : 'Total Value'} value={`${totalValue.toLocaleString()} EGP`} color="bg-blue-500/10 text-blue-400" />
            <StatCard icon={Filter} label={isRTL ? 'التصنيفات' : 'Categories'} value={categories || '—'} color="bg-violet-500/10 text-violet-400" />
            <StatCard icon={ShieldCheck} label={isRTL ? 'التحقق' : 'Validation'} value={<ValidationBadge issues={validationIssues}/>} color={validationIssues === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PREVIEW TABLE ── */}
      <AnimatePresence>
        {data.length > 0 && step === 'preview' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="rounded-3xl bg-slate-950 border border-white/5 overflow-hidden shadow-2xl"
          >
            {/* ─ Table toolbar ─ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/5 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileSpreadsheet size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{file?.name}</p>
                  <p className="text-xs text-slate-500">
                    {filteredData.length} / {data.length} {isRTL ? 'صنف معروض' : 'rows shown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-52">
                  <Search size={14} className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                    className={`w-full bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-600 rounded-xl py-2 focus:outline-none focus:border-emerald-500/50 transition-colors ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
                  />
                </div>

                {/* Column visibility */}
                <div className="relative" ref={colMenuRef}>
                  <button onClick={() => setShowColMenu(!showColMenu)}
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                    {showColMenu ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                  <AnimatePresence>
                    {showColMenu && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className={`absolute z-50 mt-2 w-52 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-3 ${isRTL ? 'left-0' : 'right-0'}`}>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">{isRTL ? 'الأعمدة' : 'Columns'}</p>
                        {columns.map(col => (
                          <label key={col} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                            <input type="checkbox" checked={displayed.includes(col)} onChange={() => {
                              setVisibleCols(prev =>
                                (prev || columns).includes(col)
                                  ? (prev || columns).filter(c => c !== col)
                                  : [...(prev || columns), col]
                              );
                            }} className="accent-emerald-500 rounded" />
                            <span className="text-xs text-slate-300 font-medium truncate">{col}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Clear */}
                <button onClick={resetState}
                  className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 size={15}/>
                </button>

                {/* Confirm upload */}
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {uploading
                    ? <><Loader2 size={15} className="animate-spin"/> {loadingText}</>
                    : <><CheckCircle2 size={15}/> {isRTL ? 'تأكيد الرفع' : 'Confirm Upload'}</>}
                </motion.button>
              </div>
            </div>

            {/* ─ Table ─ */}
            <div className="overflow-x-auto" style={{ maxHeight: 460 }}>
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-900">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center text-xs font-bold text-slate-500 border-b border-white/5">#</th>
                    {displayed.map(col => (
                      <th key={col}
                        onClick={() => toggleSort(col)}
                        className={`px-4 py-3 text-xs font-bold text-slate-400 border-b border-white/5 cursor-pointer hover:text-emerald-400 hover:bg-white/[0.02] select-none whitespace-nowrap transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className="inline-flex items-center gap-1">
                          {col}
                          {sortConfig.key === col
                            ? (sortConfig.dir === 'asc' ? <ChevronUp size={12} className="text-emerald-400"/> : <ChevronDown size={12} className="text-emerald-400"/>)
                            : <SortAsc size={10} className="opacity-20"/>}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => {
                    const hasIssue = !row['اسم الدواء'] && !row['Name'] && !row['Drug Name'];
                    return (
                      <tr key={i}
                        className={`group border-b border-white/[0.04] transition-colors
                          ${hasIssue ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-white/[0.025]'}`}>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center mx-auto
                            ${hasIssue ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'}`}>
                            {i + 1}
                          </span>
                        </td>
                        {displayed.map((col, j) => (
                          <td key={j} className={`px-4 py-3 text-slate-300 font-medium whitespace-nowrap group-hover:text-white transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
                            {row[col] ?? <span className="text-slate-600 italic text-xs">—</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Search size={32} className="text-slate-700" />
                  <p className="text-slate-500 text-sm">{isRTL ? 'لا توجد نتائج' : 'No results found'}</p>
                </div>
              )}
            </div>

            {/* Validation warning banner */}
            {validationIssues > 0 && (
              <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/5 border-t border-amber-500/15">
                <AlertCircle size={16} className="text-amber-400 shrink-0" />
                <p className="text-sm text-amber-300 font-medium">
                  {isRTL
                    ? `تحذير: تم اكتشاف ${validationIssues} صنف بمشاكل محتملة في البيانات. تحقق منها قبل الرفع.`
                    : `Warning: ${validationIssues} row(s) have potential data issues. Review before uploading.`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── UPLOAD HISTORY ── */}
      <AnimatePresence>
        {uploadHistory.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}
            className="rounded-3xl bg-slate-950 border border-white/5 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <Clock size={16} className="text-slate-500" />
              <p className="text-sm font-bold text-slate-400">{isRTL ? 'سجل الرفع' : 'Upload History'}</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {uploadHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <FileCheck size={15} className="text-emerald-400" />
                    <span className="text-sm font-medium text-slate-300 truncate max-w-[200px]">{h.filename}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">{h.count} {isRTL ? 'صنف' : 'items'}</span>
                    <span className="text-xs text-slate-600">{h.time}</span>
                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">✓</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default UploadStock;