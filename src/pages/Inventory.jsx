import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext'; // 👈 1. استيراد الكونتكست
import Modal from '../components/common/Modal';
import { logActivity } from '../utils/logger';

// Firebase
import { db } from '../firebase/config';
import { 
  collection, addDoc, deleteDoc, updateDoc, doc, 
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const Inventory = () => {
  const { t, lang } = useSettings(); // 👈 2. استخراج t و lang للترجمة
  
  // States
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // بيانات الفورم
  const [newItem, setNewItem] = useState({ name: '', category: '', stock: '', status: 'good' });

  // 1. قراءة البيانات
  useEffect(() => {
    const q = query(collection(db, "medicines"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(medicines);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. دالة حفظ البيانات
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentId) {
        // تعديل
        const docRef = doc(db, "medicines", currentId);
        await updateDoc(docRef, {
          ...newItem,
          stock: Number(newItem.stock),
        });
        
        // تسجيل النشاط
        await logActivity('Admin', `Updated item: ${newItem.name}`, 'info');

      } else {
        // إضافة
        await addDoc(collection(db, "medicines"), {
          ...newItem,
          stock: Number(newItem.stock),
          createdAt: serverTimestamp()
        });

        // تسجيل النشاط
        await logActivity('Admin', `Added new item: ${newItem.name}`, 'success');
      }
      
      closeModal();
    } catch (error) {
      console.error("Error: ", error);
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. دالة الحذف
  const handleDelete = async (id) => {
    // رسالة التأكيد حسب اللغة
    const confirmMsg = lang === 'ar' ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?";
    
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
    setNewItem({ 
      name: item.name, 
      category: item.category, 
      stock: item.stock, 
      status: item.status || 'good' 
    });
    setCurrentId(item.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewItem({ name: '', category: '', stock: '', status: 'good' });
    setCurrentId(null);
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🟢 دالة ألوان الحالة (مترجمة)
  const getStatusBadge = (stock) => {
    if (stock === 0) return <span className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-500/10 px-2 py-1 rounded-lg text-xs font-bold"><XCircle size={14}/> {t.status.out}</span>;
    if (stock < 50) return <span className="flex items-center gap-1 text-orange-600 bg-orange-100 dark:bg-orange-500/10 px-2 py-1 rounded-lg text-xs font-bold"><AlertCircle size={14}/> {t.status.low}</span>;
    return <span className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded-lg text-xs font-bold"><CheckCircle size={14}/> {t.status.good}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.inventoryTitle}</h1>
          <p className="text-gray-500">
            {loading ? t.loading : (lang === 'ar' ? `إدارة ${data.length} صنف مسجل` : `Managing ${data.length} registered items`)}
          </p>
        </div>
        <button 
          onClick={() => { setCurrentId(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus size={20} /> {t.addItem}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
        <input 
          type="text" 
          placeholder={t.search} 
          className={`w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 h-12 rounded-xl px-10 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center flex justify-center items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" /> {t.loading}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 text-sm uppercase">
                <tr>
                  {/* 🟢 استخدام مفاتيح الترجمة لرؤوس الجدول */}
                  <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table.name}</th>
                  <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table.category}</th>
                  <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table.stock}</th>
                  <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table.status}</th>
                  <th className={`px-6 py-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 group transition-colors">
                      <td className={`px-6 py-4 font-bold text-gray-800 dark:text-white ${lang === 'en' && 'text-left'}`}>{item.name}</td>
                      <td className={`px-6 py-4 ${lang === 'en' && 'text-left'}`}><span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">{item.category}</span></td>
                      <td className={`px-6 py-4 font-bold text-blue-600 ${lang === 'en' && 'text-left'}`}>{item.stock}</td>
                      <td className={`px-6 py-4 ${lang === 'en' && 'text-left'}`}>{getStatusBadge(item.stock)}</td>
                      <td className={`px-6 py-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${lang === 'en' && 'justify-start'}`}>
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">{t.noData}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={currentId ? t.editItem : t.addItem}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{t.table.name}</label>
            <input required type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{t.table.category}</label>
              <select className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
                <option value="مسكنات">مسكنات (Painkillers)</option>
                <option value="مضاد حيوي">مضاد حيوي (Antibiotics)</option>
                <option value="قلب وضغط">قلب وضغط (Cardio)</option>
                <option value="سكر">أدوية سكر (Diabetes)</option>
                <option value="تنفس">جهاز تنفسي (Respiratory)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{t.table.stock}</label>
              <input required type="number" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-bold">
              {t.cancel}
            </button>
            <button disabled={isSubmitting} type="submit" className="flex-[2] py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 transition-all">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? t.saving : (currentId ? t.saveChanges : t.addItem)}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Inventory;