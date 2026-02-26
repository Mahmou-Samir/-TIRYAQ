import React, { useState, useRef, useCallback } from 'react';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  Loader2, Download, Trash2, Database
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

// --- Toast Component ---
const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-3 w-[90%] max-w-xs backdrop-blur-xl border ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 
      'bg-red-500/10 border-red-500/30 text-red-500'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
    <span className="text-sm font-black">{message}</span>
  </motion.div>
);

const UploadStock = () => {
  const { t, lang } = useSettings();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // 🛡️ حماية الترجمة (Safe i18n variables)
  const uiText = t?.pharmacy?.upload || {};
  const loadingText = t?.loading || (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...');

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 1. Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 2. Process Excel File
  const processFile = (selectedFile) => {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(selectedFile.type)) {
      showToast(uiText.errorFile || (lang === 'ar' ? 'صيغة الملف غير مدعومة' : 'Invalid file format'), "error");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        if (jsonData.length === 0) {
          showToast(uiText.errorEmpty || (lang === 'ar' ? 'الملف فارغ' : 'File is empty'), "error");
          setFile(null);
        } else {
          setData(jsonData);
          showToast(lang === 'ar' ? `تم قراءة ${jsonData.length} صنف` : `${jsonData.length} items loaded`, "success");
        }
      } catch (error) {
        console.error(error);
        showToast(lang === 'ar' ? "حدث خطأ أثناء القراءة" : "Error parsing file", "error");
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // 3. Upload to Firebase
  const handleUploadToFirebase = async () => {
    if (data.length === 0) return;
    setUploading(true);
    
    try {
      const currentUser = auth.currentUser;
      const pharmacyId = currentUser ? currentUser.uid : 'GUEST_PHARMACY';
      
      const batchPromises = data.map(item => {
        // التحقق المزدوج للغة الأسماء في الإكسيل
        const medicineData = {
          name: item['اسم الدواء'] || item['Name'] || item['Drug Name'] || 'Unknown',
          stock: Number(item['الكمية'] || item['Quantity'] || item['Stock'] || 0),
          category: item['التصنيف'] || item['Category'] || item['Type'] || 'General',
          price: Number(item['السعر'] || item['Price'] || 0),
          expiry: item['تاريخ الصلاحية'] || item['Expiry'] || null,
          pharmacyId: pharmacyId,
          updatedAt: serverTimestamp(),
          searchKeywords: [
             (item['اسم الدواء'] || item['Name'] || '').toLowerCase(),
             (item['التصنيف'] || item['Category'] || '').toLowerCase()
          ]
        };
        return addDoc(collection(db, "medicines"), medicineData);
      });
      
      await Promise.all(batchPromises);
      
      showToast(uiText.success || (lang === 'ar' ? 'تم الرفع بنجاح' : 'Uploaded successfully'), "success");
      
      setTimeout(() => {
        setData([]);
        setFile(null);
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      showToast(lang === 'ar' ? "حدث خطأ في الاتصال" : "Connection Error", "error");
    } finally {
      setUploading(false);
    }
  };

  // 4. Download Template (Binary Safe Blob)
  const downloadTemplate = () => {
    const templateData = [
      { 'Name': 'Panadol Extra', 'اسم الدواء': 'Panadol Extra', 'Category': 'Analgesic', 'التصنيف': 'مسكنات', 'Quantity': 100, 'الكمية': 100, 'Price': 45, 'السعر': 45, 'Expiry': '2026-12-01', 'تاريخ الصلاحية': '2026-12-01' },
      { 'Name': 'Augmentin 1g', 'اسم الدواء': 'Augmentin 1g', 'Category': 'Antibiotic', 'التصنيف': 'مضاد حيوي', 'Quantity': 50, 'الكمية': 50, 'Price': 90, 'السعر': 90, 'Expiry': '2025-05-20', 'تاريخ الصلاحية': '2025-05-20' }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock_Template");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Tiryaq_Stock_Template.xlsx";
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      <AnimatePresence>
        {toast && <Toast {...toast} />}
      </AnimatePresence>

      {/* 🟢 Hero Section */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-[80px] animate-pulse"></div>
        
        <div className="relative z-10 w-full md:w-2/3">
          <div className="flex items-center gap-2 text-emerald-100 mb-4 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
            <Database size={16} />
            <span className="text-[10px] font-black tracking-widest uppercase">Smart Sync v2.0</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter">
            {uiText.title || (lang === 'ar' ? 'مركز تحديث المخزون' : 'Stock Update Center')}
          </h1>
          <p className="text-emerald-100/90 leading-relaxed font-medium text-sm md:text-base max-w-xl">
            {uiText.subtitle || (lang === 'ar' ? 'ارفع شيت الإكسيل لمزامنة المخزون لحظياً' : 'Upload Excel sheet to sync inventory instantly')}
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={downloadTemplate}
          className="relative z-10 w-full md:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-8 py-5 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3 whitespace-nowrap group/btn"
        >
          <Download size={20} className="group-hover/btn:translate-y-1 transition-transform" /> 
          {uiText.downloadTemplate || (lang === 'ar' ? 'تحميل القالب القياسي' : 'Download Template')}
        </motion.button>
      </motion.div>

      {/* 🟢 Drag & Drop Zone */}
      <motion.div variants={itemVariants}>
        <div 
          className={`relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed transition-all duration-300 p-16 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group
          ${dragActive ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input type="file" ref={fileInputRef} hidden accept=".xlsx, .xls" onChange={handleChange} />
          
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-all duration-500 shadow-xl ${dragActive ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500'}`}>
            <UploadCloud size={56} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
            {file ? <span className="text-emerald-600">{file.name}</span> : (uiText.dragDrop || (lang === 'ar' ? 'اسحب وأفلت الملف هنا' : 'Drag & Drop file here'))}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {file 
              ? (lang === 'ar' ? 'اضغط لتغيير الملف' : 'Click to change file') 
              : (uiText.browse || (lang === 'ar' ? 'أو اضغط لاستعراض الملفات' : 'Or click to browse'))}
          </p>
        </div>
      </motion.div>

      {/* 🟢 Data Preview Table */}
      <AnimatePresence>
        {data.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Table Header Controls */}
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-500" size={24}/> 
                  {uiText.preview || (lang === 'ar' ? 'معاينة البيانات' : 'Data Preview')}
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                   {lang === 'ar' ? 'تم إيجاد' : 'Found'} <span className="font-black text-emerald-600 px-1 bg-emerald-100 dark:bg-emerald-500/20 rounded">{data.length}</span> {lang === 'ar' ? 'أصناف.' : 'items.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => {setData([]); setFile(null);}} 
                  className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={handleUploadToFirebase} disabled={uploading}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {uploading ? loadingText : (uiText.uploadBtn || (lang === 'ar' ? 'تأكيد الرفع' : 'Confirm Upload'))}
                </button>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="overflow-x-auto max-h-[500px] hide-scrollbar">
              <table className="w-full text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs font-black uppercase tracking-widest sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="px-6 py-5 text-center text-slate-500 dark:text-slate-400">#</th>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className={`px-6 py-5 text-slate-700 dark:text-white ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-400 text-center">{index + 1}</td>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className={`px-6 py-4 font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default UploadStock;