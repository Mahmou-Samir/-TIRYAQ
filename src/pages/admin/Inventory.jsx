import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, AlertCircle, CheckCircle2, XCircle, Loader2, PackageOpen, LayoutGrid, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { logActivity } from '../../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
import { db } from '../../firebase/config';
import { 
  collection, addDoc, deleteDoc, updateDoc, doc, 
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

// --- Animated Modal Sub-Component ---
const PremiumModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600"><PackageOpen size={24}/></div>
              {title}
            </h2>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors"><X size={20}/></button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Inventory = () => {
  const { t, lang } = useSettings(); 
  
  // States
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [newItem, setNewItem] = useState({ name: '', category: '', stock: '' });

  // 1. Data Fetching
  useEffect(() => {
    const q = query(collection(db, "medicines"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(medicines);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Save Data
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentId) {
        const docRef = doc(db, "medicines", currentId);
        await updateDoc(docRef, { ...newItem, stock: Number(newItem.stock) });
        await logActivity('Admin', `Updated item: ${newItem.name}`, 'info');
      } else {
        await addDoc(collection(db, "medicines"), {
          ...newItem,
          stock: Number(newItem.stock),
          createdAt: serverTimestamp()
        });
        await logActivity('Admin', `Added new item: ${newItem.name}`, 'success');
      }
      closeModal();
    } catch (error) {
      console.error("Error: ", error);
      alert(t.error || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Delete Data
  const handleDelete = async (id) => {
    const confirmMsg = lang === 'ar' ? "هل أنت متأكد من الحذف النهائي لهذا الصنف؟" : "Are you sure you want to permanently delete this item?";
    if (window.confirm(confirmMsg)) {
      try {
        await deleteDoc(doc(db, "medicines", id));
        await logActivity('Admin', `Deleted item from inventory`, 'warning');
      } catch (error) {
        console.error("Error deleting: ", error);
        alert(t.error);
      }
    }
  };

  const openEditModal = (item) => {
    setNewItem({ name: item.name, category: item.category, stock: item.stock });
    setCurrentId(item.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewItem({ name: '', category: '', stock: '' });
    setCurrentId(null);
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Badges
  const getStatusBadge = (stock) => {
    if (stock === 0) return (
      <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-xl text-xs font-black">
        <XCircle size={14}/> {t.status?.out || 'منعدم'}
      </span>
    );
    if (stock < 50) return (
      <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30 px-3 py-1.5 rounded-xl text-xs font-black">
        <AlertCircle size={14}/> {t.status?.low || 'رصيد حرج'}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-900/30 px-3 py-1.5 rounded-xl text-xs font-black">
        <CheckCircle2 size={14}/> {t.status?.good || 'متوفر'}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12 pt-6 px-4 md:px-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tighter">
            <LayoutGrid className="text-blue-600" size={36} />
            {t.inventoryTitle || 'إدارة المخزون'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {loading ? (t.loading || 'جاري التحميل...') : (lang === 'ar' ? `تحكم كامل في إجمالي ${data.length} صنف مسجل بالنظام` : `Managing total of ${data.length} registered items`)}
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setCurrentId(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Plus size={20} strokeWidth={3} /> {t.addItem || 'إضافة صنف جديد'}
        </motion.button>
      </motion.div>

      {/* 🟢 Advanced Search Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative group">
        <div className="absolute inset-0 bg-blue-600/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1.5rem] flex items-center p-2 shadow-sm group-focus-within:shadow-lg group-focus-within:border-blue-500/50 transition-all">
          <div className="p-3 text-slate-400"><Search size={22} strokeWidth={2} /></div>
          <input 
            type="text" 
            placeholder={t.search || 'ابحث عن اسم الدواء أو التصنيف...'} 
            className="flex-1 bg-transparent h-12 outline-none text-slate-800 dark:text-white font-bold text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>}
        </div>
      </motion.div>

      {/* 🟢 Data Grid (Table) */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-sm"
      >
        {loading ? (
          <div className="p-20 text-center flex flex-col justify-center items-center gap-4 text-slate-400">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="font-bold tracking-widest uppercase">{t.loading || 'جاري تحديث البيانات...'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-xs font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className={`px-8 py-5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table?.name || 'اسم الصنف'}</th>
                  <th className={`px-8 py-5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table?.category || 'التصنيف'}</th>
                  <th className={`px-8 py-5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table?.stock || 'الرصيد المتاح'}</th>
                  <th className={`px-8 py-5 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table?.status || 'الحالة الحالية'}</th>
                  <th className="px-8 py-5 text-center">{t.table?.actions || 'إجراءات'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className={`px-8 py-5 font-black text-slate-900 dark:text-white ${lang === 'en' && 'text-left'}`}>
                        {item.name}
                      </td>
                      <td className={`px-8 py-5 ${lang === 'en' && 'text-left'}`}>
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                          {item.category || 'غير مصنف'}
                        </span>
                      </td>
                      <td className={`px-8 py-5 font-black text-lg ${lang === 'en' && 'text-left'}`}>
                        {item.stock}
                      </td>
                      <td className={`px-8 py-5 ${lang === 'en' && 'text-left'}`}>
                        {getStatusBadge(Number(item.stock))}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => openEditModal(item)} 
                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-colors"
                          >
                            <Edit size={18} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-20">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <PackageOpen size={48} className="mb-4 opacity-50" />
                        <span className="font-bold text-lg">{t.noData || 'لا توجد بيانات مطابقة للبحث.'}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 🟢 Premium Add/Edit Modal */}
      <PremiumModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={currentId ? (t.editItem || 'تعديل بيانات الصنف') : (t.addItem || 'إضافة صنف جديد')}
      >
        <form onSubmit={handleSaveItem} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t.table?.name || 'اسم الدواء / الصنف'}</label>
            <input 
              required type="text" 
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all"
              value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t.table?.category || 'التصنيف الطبي'}</label>
            <select 
              required
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all cursor-pointer"
              value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
            >
              <option value="" disabled>{lang === 'ar' ? 'اختر تصنيفاً...' : 'Select Category...'}</option>
              <option value="مسكنات">مسكنات ومضادات التهاب (Painkillers)</option>
              <option value="مضاد حيوي">مضادات حيوية (Antibiotics)</option>
              <option value="قلب وضغط">أدوية القلب والضغط (Cardio)</option>
              <option value="سكر">أدوية السكري (Diabetes)</option>
              <option value="عناية وأطفال">عناية وأطفال (Care & Kids)</option>
              <option value="فيتامينات">فيتامينات (Vitamins)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t.table?.stock || 'الكمية المتاحة (الرصيد الافتتاحي)'}</label>
            <input 
              required type="number" min="0"
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-lg font-black text-blue-600 outline-none transition-all"
              value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} 
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="flex-[1] py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black hover:opacity-80 transition-opacity">
              {t.cancel || 'إلغاء'}
            </button>
            <button disabled={isSubmitting} type="submit" className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all">
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (currentId ? (t.saveChanges || 'حفظ التعديلات') : (t.addItem || 'تأكيد الإضافة'))}
            </button>
          </div>
        </form>
      </PremiumModal>

    </div>
  );
};

export default Inventory;