import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Package, AlertTriangle, 
  Plus, Minus, Trash2, Tag, RefreshCw, Loader2
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

const InventoryManager = () => {
  const { t, lang } = useSettings();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, low

  // 🛡️ حماية الترجمة (Safe UI Texts)
  const uiText = t?.pharmacy?.inventory || {};
  const dashText = t?.pharmacy?.dashboard || {};

  // 1. جلب بيانات أدوية الصيدلية (Real-time)
  useEffect(() => {
    const pharmacyId = auth.currentUser?.uid || 'GUEST_PHARMACY';
    
    const q = query(
      collection(db, "medicines"), 
      where("pharmacyId", "==", pharmacyId),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        updatedAtDate: doc.data().updatedAt?.toDate() || new Date() 
      }));
      setMedicines(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory:", error);
      // Fallback if index is missing
      const qFallback = query(collection(db, "medicines"), where("pharmacyId", "==", pharmacyId));
      onSnapshot(qFallback, (snap) => {
         const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setMedicines(data);
         setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  // 2. تحديث الكمية (Optimistic Update)
  const updateStock = useCallback(async (id, currentStock, change) => {
    const newStock = Math.max(0, Number(currentStock) + change);
    try {
      const docRef = doc(db, "medicines", id);
      await updateDoc(docRef, { 
        stock: newStock,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  }, []);

  // 3. حذف دواء
  const handleDelete = async (id) => {
    const confirmMessage = uiText.deleteConfirm || (lang === 'ar' ? 'هل أنت متأكد من حذف هذا الصنف نهائياً؟' : 'Are you sure you want to delete this item?');
    if (window.confirm(confirmMessage)) {
      try {
        await deleteDoc(doc(db, "medicines", id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  // 4. الفلترة والبحث الذكي
  const filteredMedicines = useMemo(() => {
    return medicines.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterType === 'low') return matchesSearch && Number(item.stock) < 10;
      return matchesSearch;
    });
  }, [medicines, searchTerm, filterType]);

  // إحصائيات سريعة
  const totalItems = medicines.length;
  const lowStockCount = medicines.filter(m => Number(m.stock) < 10).length;

  // دالة تنسيق الوقت (مترجمة بالكامل)
  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 60000); // دقائق
    if (diff < 1) return lang === 'ar' ? 'الآن' : 'Just now';
    if (diff < 60) return lang === 'ar' ? `منذ ${diff} د` : `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return lang === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600">
               <Package size={28} />
            </div>
             {t?.pharmacy?.sidebar?.inventory || (lang === 'ar' ? 'إدارة الأدوية' : 'Inventory')}
          </h1>
          <div className="flex gap-4 mt-3">
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300">
              📦 {dashText.totalStock || (lang === 'ar' ? 'الإجمالي:' : 'Total:')} <b className="text-emerald-600 mx-1">{totalItems}</b>
            </span>
            <span className="bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-lg text-sm font-bold text-red-600 dark:text-red-400">
              ⚠️ {dashText.shortages || (lang === 'ar' ? 'نواقص:' : 'Shortages:')} <b className="mx-1">{lowStockCount}</b>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar (RTL/LTR Logical Classes applied: start-0, ps-11, pe-4) */}
          <div className="relative group flex-1 sm:w-80">
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full ps-11 pe-4 py-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl leading-5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              placeholder={uiText.searchPlaceholder || (lang === 'ar' ? 'بحث باسم الدواء أو الفئة...' : 'Search medicine...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {uiText.filterAll || (lang === 'ar' ? 'الكل' : 'All')}
            </button>
            <button 
              onClick={() => setFilterType('low')}
              className={`px-5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 ${filterType === 'low' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-500'}`}
            >
              <AlertTriangle size={14} strokeWidth={2.5}/> {uiText.filterLow || (lang === 'ar' ? 'نواقص' : 'Low Stock')}
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 Inventory Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-emerald-600 gap-4">
           <Loader2 className="animate-spin" size={48} />
           <p className="font-bold text-slate-500 animate-pulse">{t?.loading || (lang === 'ar' ? 'جاري تحميل المخزون...' : 'Loading inventory...')}</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredMedicines.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                className="group bg-white dark:bg-[#0b1121] rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all relative overflow-hidden flex flex-col"
              >
                {/* Status Indicator Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${Number(item.stock) < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

                <div className="flex justify-between items-start mb-4 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                    <Package size={24} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-slate-800 dark:text-white">{item.price} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 flex items-center gap-1">
                      <Tag size={10} /> {item.category || 'General'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 truncate" title={item.name}>{item.name}</h3>
                
                {/* Real-time Update Indicator */}
                <p className="text-[10px] text-slate-400 font-bold mb-6 flex items-center gap-1.5">
                   <RefreshCw size={10} className="text-slate-300" />
                   {formatTimeAgo(item.updatedAtDate)}
                </p>

                {/* Stock Controls (Bottom Aligned) */}
                <div className="mt-auto flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => updateStock(item.id, item.stock, -1)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-[14px] shadow-sm hover:text-red-500 active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>
                  
                  <div className="text-center flex-1">
                    <span className={`block text-xl font-black leading-none mb-1 ${Number(item.stock) < 10 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                      {item.stock}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{lang === 'ar' ? 'الوحدات' : 'Stock'}</span>
                  </div>

                  <button 
                    onClick={() => updateStock(item.id, item.stock, 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-[14px] shadow-sm hover:text-emerald-500 active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>

                {/* Delete Button (Logical property start-4 instead of left-4) */}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 start-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  title={lang === 'ar' ? 'حذف الصنف' : 'Delete Item'}
                >
                  <Trash2 size={18} />
                </button>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 🟢 Empty States */}
      {!loading && filteredMedicines.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white/40 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
             <Package size={48} className="text-slate-300 dark:text-slate-600" />
          </div>
          
          {medicines.length === 0 ? (
            <>
               <p className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                 {lang === 'ar' ? 'المخزون فارغ تماماً' : 'Inventory is Empty'}
               </p>
               <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
                 {lang === 'ar' ? 'قم برفع ملف الإكسيل الخاص بك للبدء في إدارة مخزونك.' : 'Upload your Excel sheet to start managing your stock.'}
               </p>
               <button 
                 onClick={() => window.location.href = '/pharmacy/upload'}
                 className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
               >
                 {t?.pharmacy?.sidebar?.upload || (lang === 'ar' ? 'الذهاب لرفع المخزون' : 'Go to Upload')}
               </button>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-slate-800 dark:text-white mb-2">
                 {lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching results found'}
              </p>
              <p className="text-sm text-slate-500 font-medium">
                 {lang === 'ar' ? 'حاول تغيير كلمات البحث أو إزالة الفلاتر' : 'Try adjusting your search terms or clear filters'}
              </p>
            </>
          )}
        </motion.div>
      )}

    </div>
  );
};

export default InventoryManager;