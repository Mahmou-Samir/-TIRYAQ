import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertCircle, Plus, Trash2, Loader2, Navigation } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import Modal from '../../components/common/Modal';

// Firebase
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const Logistics = () => {
  const { t, lang } = useSettings();
  
  // States
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({
    driver: '', from: '', to: '', eta: '', status: 'transit', progress: 0
  });

  // 1. جلب البيانات
  useEffect(() => {
    const q = query(collection(db, "shipments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShipments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. إضافة شحنة
  const handleAddShipment = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "shipments"), {
        ...newShipment,
        progress: newShipment.status === 'delivered' ? 100 : Number(newShipment.progress),
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewShipment({ driver: '', from: '', to: '', eta: '', status: 'transit', progress: 0 });
    } catch (error) {
      console.error("Error adding shipment:", error);
    }
  };

  // 3. حذف شحنة
  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? "هل تريد حذف السجل؟" : "Delete this record?")) {
      await deleteDoc(doc(db, "shipments", id));
    }
  };

  const activeCount = shipments.filter(s => s.status === 'transit').length;
  const delayedCount = shipments.filter(s => s.status === 'delayed').length;

  // 🟢 ترجمة الحالات
  const getStatusStyle = (status) => {
    if (status === 'delivered') return { 
      bg: 'bg-green-100 dark:bg-green-900/20', 
      text: 'text-green-600 dark:text-green-400', 
      icon: <CheckCircle size={14}/>, 
      label: lang === 'ar' ? 'تم التسليم' : 'Delivered' 
    };
    if (status === 'delayed') return { 
      bg: 'bg-red-100 dark:bg-red-900/20', 
      text: 'text-red-600 dark:text-red-400', 
      icon: <AlertCircle size={14}/>, 
      label: lang === 'ar' ? 'متأخرة' : 'Delayed' 
    };
    return { 
      bg: 'bg-blue-100 dark:bg-blue-900/20', 
      text: 'text-blue-600 dark:text-blue-400', 
      icon: <Truck size={14}/>, 
      label: lang === 'ar' ? 'في الطريق' : 'In Transit' 
    };
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            {t.logistics} <span className="text-2xl">🚚</span>
          </h1>
          <p className="text-gray-500">
            {lang === 'ar' ? 'تتبع حركة أسطول النقل لحظياً' : 'Real-time fleet tracking'}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-white dark:bg-slate-800 px-5 py-2 rounded-xl border border-gray-100 dark:border-slate-700 text-center flex-1 md:flex-none">
            <span className="block text-xs text-gray-500 font-bold uppercase">{lang === 'ar' ? 'نشطة' : 'Active'}</span>
            <span className="font-bold text-blue-600 text-xl">{activeCount}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-5 py-2 rounded-xl border border-gray-100 dark:border-slate-700 text-center flex-1 md:flex-none">
            <span className="block text-xs text-gray-500 font-bold uppercase">{lang === 'ar' ? 'متأخرة' : 'Delayed'}</span>
            <span className="font-bold text-red-500 text-xl">{delayedCount}</span>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 flex-1 md:flex-none transition-all"
          >
            <Plus size={20} /> {lang === 'ar' ? 'شحنة جديدة' : 'New Shipment'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shipments.length > 0 ? (
          shipments.map((shipment) => {
            const statusStyle = getStatusStyle(shipment.status);
            return (
              <div key={shipment.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm group hover:-translate-y-1 transition-all relative">
                
                <button onClick={() => handleDelete(shipment.id)} className="absolute top-4 left-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                  <Trash2 size={16} />
                </button>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      <Truck size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">#{shipment.id.slice(0,6)}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                        <Navigation size={10}/> {shipment.driver}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.icon} {statusStyle.label}
                  </span>
                </div>

                {/* Timeline */}
                <div className="relative border-r-2 border-dashed border-gray-200 dark:border-slate-600 mr-3 pr-6 py-1 space-y-6">
                  <div className="relative">
                    <span className="absolute -right-[31px] top-1.5 w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-500 border-2 border-white dark:border-slate-800"></span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'من' : 'From'}</p>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{shipment.from}</p>
                  </div>
                  <div className="relative">
                    <span className={`absolute -right-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                      shipment.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                    }`}></span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'إلى' : 'To'}</p>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{shipment.to}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">{lang === 'ar' ? 'المسافة المقطوعة' : 'Progress'}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{shipment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        shipment.status === 'delayed' ? 'bg-red-500' : shipment.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                      }`} 
                      style={{ width: `${shipment.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-slate-700/30 p-2 rounded-lg">
                    <Clock size={14} />
                    {lang === 'ar' ? 'الوقت المتوقع:' : 'ETA:'} <span className="text-gray-800 dark:text-white">{shipment.eta}</span>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
             <Truck size={48} className="mb-4 opacity-20"/>
             <p>{t.noData}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={lang === 'ar' ? "تسجيل شحنة جديدة" : "New Shipment"}>
        <form onSubmit={handleAddShipment} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{lang === 'ar' ? 'اسم السائق' : 'Driver Name'}</label>
            <input required type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={newShipment.driver} onChange={e => setNewShipment({...newShipment, driver: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{lang === 'ar' ? 'من (المصدر)' : 'From'}</label>
               <input required type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                 value={newShipment.from} onChange={e => setNewShipment({...newShipment, from: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{lang === 'ar' ? 'إلى (الوجهة)' : 'To'}</label>
               <input required type="text" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                 value={newShipment.to} onChange={e => setNewShipment({...newShipment, to: e.target.value})} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">ETA</label>
               <input type="text" placeholder="e.g. 2 hours" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                 value={newShipment.eta} onChange={e => setNewShipment({...newShipment, eta: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">{lang === 'ar' ? 'الحالة' : 'Status'}</label>
               <select className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                 value={newShipment.status} onChange={e => setNewShipment({...newShipment, status: e.target.value})}>
                 <option value="transit">{lang === 'ar' ? 'في الطريق' : 'In Transit'}</option>
                 <option value="delayed">{lang === 'ar' ? 'متأخرة' : 'Delayed'}</option>
                 <option value="delivered">{lang === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
               </select>
             </div>
          </div>
          
          {newShipment.status !== 'delivered' && (
             <div>
               <label className="block text-sm font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                 {lang === 'ar' ? `نسبة التقدم (${newShipment.progress}%)` : `Progress (${newShipment.progress}%)`}
               </label>
               <input type="range" min="0" max="99" className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 value={newShipment.progress} onChange={e => setNewShipment({...newShipment, progress: e.target.value})} />
             </div>
          )}
          
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all mt-4 shadow-lg shadow-blue-500/20">
            {lang === 'ar' ? 'تأكيد وإضافة' : 'Confirm & Add'}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default Logistics;