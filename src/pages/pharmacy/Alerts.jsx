import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, ClipboardList, Package, ChevronLeft } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useSettings } from '../../context/SettingsContext';
import { usePharmacy, getOrderDisplayId } from '../../context/PharmacyContext';

export default function PharmacyAlerts() {
  const { t, lang } = useSettings();
  const { orders, pendingCount } = usePharmacy();
  const navigate = useNavigate();
  const A = t?.pharmacy?.alerts ?? {};
  const isRTL = lang === 'ar';

  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return undefined;

    const q = query(collection(db, 'medicines'), where('pharmacyId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((m) => Number(m.stock) < 10)
        .sort((a, b) => Number(a.stock) - Number(b.stock));
      setLowStock(items);
    });
    return () => unsub();
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const hasAlerts = lowStock.length > 0 || pendingOrders.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 relative z-10">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600">
            <Bell size={28} />
          </div>
          {A.title || 'Alerts'}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2 relative z-10">{A.subtitle}</p>
      </div>

      {!hasAlerts && (
        <div className="text-center py-16 bg-white/40 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700">
          <Bell size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="font-bold text-slate-500">{A.noAlerts}</p>
        </div>
      )}

      {pendingOrders.length > 0 && (
        <section className="bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-emerald-500" />
              {A.pendingOrders}
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{pendingCount}</span>
            </h2>
            <button onClick={() => navigate('/pharmacy/orders')} className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1">
              {A.viewOrders}
              <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} />
            </button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {pendingOrders.slice(0, 5).map((o) => (
              <button
                key={o.id}
                onClick={() => navigate('/pharmacy/orders')}
                className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-right"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <ClipboardList size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white">{getOrderDisplayId(o)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{o.patientName || '—'}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {lowStock.length > 0 && (
        <section className="bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
            <h2 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              {A.lowStock}
              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">{lowStock.length}</span>
            </h2>
            <button onClick={() => navigate('/pharmacy/inventory?filter=low')} className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1">
              {A.viewInventory}
              <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} />
            </button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {lowStock.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600">
                  <Package size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{A.threshold}</p>
                </div>
                <span className="text-sm font-black text-red-500">{m.stock}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
