import React, { useState, useEffect } from 'react';
import { 
  BellRing, CheckCircle, Clock, Trash2, ArrowRight, 
  Loader2, AlertTriangle, MapPin, Building 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

// Firebase
import { db } from '../firebase/config';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const Alerts = () => {
  const { t, lang } = useSettings(); // 👈 استدعاء اللغة والترجمة
  
  // States
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, processing, resolved

  // 1. جلب البلاغات
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // 🟢 تنسيق التاريخ والوقت حسب اللغة المختارة
        date: doc.data().createdAt?.toDate().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') || '',
        time: doc.data().createdAt?.toDate().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) || ''
      }));
      setAlerts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [lang]); // 👈 إعادة تشغيل عند تغيير اللغة لتحديث التاريخ

  // 2. تغيير الحالة
  const updateStatus = async (id, newStatus) => {
    try {
      const alertRef = doc(db, "reports", id);
      await updateDoc(alertRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  // 3. حذف البلاغ
  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await deleteDoc(doc(db, "reports", id));
    }
  };

  // الفلترة
  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' ? true : alert.status === filter
  );

  // ألوان الأولوية
  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'medium': return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
      case 'low': return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  // نصوص الأولوية المترجمة
  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return t.priorities.high;   // "حرج جداً"
      case 'medium': return t.priorities.medium; // "متوسط"
      default: return t.priorities.low;      // "منخفض"
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <BellRing className="text-red-500" /> {t.alertsTitle}
          </h1>
          <p className="text-gray-500">{t.alertsSubtitle}</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 flex gap-1 shadow-sm">
          {[
            { key: 'all', label: t.filterAll },
            { key: 'pending', label: t.filterPending },
            { key: 'processing', label: t.filterProcessing },
            { key: 'resolved', label: t.filterResolved }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === btn.key 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-gray-400'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center">
            <Loader2 className="animate-spin mb-2" size={32}/> {t.loading}
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border-l-4 shadow-sm transition-all hover:shadow-md ${
              alert.priority === 'high' ? 'border-l-red-500' : 
              alert.priority === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Details */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${alert.status === 'resolved' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {alert.status === 'resolved' ? <CheckCircle size={24}/> : <AlertTriangle size={24}/>}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-1">
                        <MapPin size={16} className="text-gray-400"/> {alert.governorate}
                      </h3>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                         <Building size={14}/> {alert.hospital}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${getPriorityStyle(alert.priority)}`}>
                        {getPriorityLabel(alert.priority)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-base">
                      {t.itemShortage}: <span className="font-bold text-blue-600 dark:text-blue-400">{alert.drug}</span>
                    </p>
                    <p className="text-gray-400 text-xs mt-2 flex items-center gap-1 font-mono">
                      <Clock size={12}/> {alert.date} • {alert.time}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-700">
                  
                  {alert.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(alert.id, 'processing')}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      {lang === 'ar' ? <ArrowRight size={16} className="rotate-180"/> : <ArrowRight size={16}/>} 
                      {t.startAction}
                    </button>
                  )}

                  {alert.status === 'processing' && (
                    <button 
                      onClick={() => updateStatus(alert.id, 'resolved')}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle size={16}/> {t.closeAlert}
                    </button>
                  )}

                  {alert.status === 'resolved' && (
                    <span className="text-green-500 font-bold text-sm px-4 border border-green-200 dark:border-green-800 rounded-lg py-1.5 bg-green-50 dark:bg-green-900/10">
                      {t.solved} ✅
                    </span>
                  )}

                  <button 
                    onClick={() => handleDelete(alert.id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    title={t.deleteItem}
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-50 text-green-500"/>
            <p className="font-bold">{t.noAlerts}</p>
            <p className="text-sm">{t.statusStable}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Alerts;