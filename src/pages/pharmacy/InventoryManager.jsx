import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Package, AlertTriangle, Plus, Minus, Trash2, Tag,
  RefreshCw, Loader2, Edit3, ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { usePharmacy } from '../../context/PharmacyContext';
import MedicineFormModal from '../../components/pharmacy/MedicineFormModal';

const InventoryManager = () => {
  const { t, lang } = useSettings();
  const {
    medicines, loadingMedicines, upsertMedicine, removeMedicine, showToast, lowStockCount,
  } = usePharmacy();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uiText = t?.pharmacy?.inventory ?? {};
  const formLabels = t?.pharmacy?.medicineForm ?? {};
  const dashText = t?.pharmacy?.dashboard ?? {};
  const currency = dashText.currency || (lang === 'ar' ? 'ج.م' : 'EGP');

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) setSearchTerm(qParam);
    if (searchParams.get('filter') === 'low') setFilterType('low');
  }, [searchParams]);

  const filteredMedicines = useMemo(() => medicines.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matches = item.name?.toLowerCase().includes(q)
      || item.category?.toLowerCase().includes(q)
      || item.sku?.toLowerCase().includes(q);
    if (filterType === 'low') return matches && Number(item.stock) < 10;
    return matches;
  }), [medicines, searchTerm, filterType]);

  const updateStock = useCallback(async (med, change) => {
    const newStock = Math.max(0, Number(med.stock) + change);
    try {
      await upsertMedicine({
        name: med.name,
        category: med.category,
        price: med.price,
        costPrice: med.costPrice,
        stock: newStock,
        expiry: med.expiry,
        sku: med.sku,
        barcode: med.barcode,
      }, med.id);
    } catch (err) {
      console.error(err);
      showToast(uiText.updateError || 'Error', 'error');
    }
  }, [upsertMedicine, showToast, uiText.updateError]);

  const handleDelete = async (id) => {
    if (!window.confirm(uiText.deleteConfirm)) return;
    try {
      await removeMedicine(id);
      showToast(uiText.deleted || 'Deleted', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (med) => { setEditing(med); setModalOpen(true); };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      await upsertMedicine(form, editing?.id);
      showToast(editing ? formLabels.updated : formLabels.added, 'success');
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      showToast(formLabels.saveError || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const d = date?.toDate?.() || date;
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 1) return lang === 'ar' ? 'الآن' : 'Now';
    if (diff < 60) return lang === 'ar' ? `منذ ${diff} د` : `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return lang === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 lg:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600">
              <Package size={28} />
            </div>
            {uiText.title || 'Inventory'}
          </h1>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">
              📦 {dashText.totalStock}: <b className="text-emerald-600 mx-1">{medicines.length}</b>
            </span>
            <span className="bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl text-sm font-bold text-red-600">
              ⚠️ {dashText.shortages}: <b className="mx-1">{lowStockCount}</b>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={uiText.search}
              className="w-full ps-11 pe-4 py-3.5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              {['all', 'low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    filterType === f
                      ? f === 'low' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {f === 'all' ? uiText.all : uiText.lowStock}
                </button>
              ))}
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-colors shrink-0"
            >
              <Plus size={18} /> {uiText.addMedicine}
            </button>
          </div>
        </div>
      </div>

      {loadingMedicines ? (
        <div className="flex flex-col items-center justify-center py-32 text-emerald-600 gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-bold text-slate-500">{t?.loading}</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredMedicines.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="group bg-white dark:bg-[#0b1121] rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all relative overflow-hidden flex flex-col"
              >
                <div className={`absolute top-0 inset-x-0 h-1.5 ${Number(item.stock) < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} />

                <div className="flex justify-between items-start mb-3 pt-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <Package size={22} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-black text-slate-800 dark:text-white">{item.price} {currency}</span>
                    <span className="block text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1 justify-end">
                      <Tag size={10} /> {item.category || 'General'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-800 dark:text-white truncate mb-1" title={item.name}>{item.name}</h3>
                {item.expiry && (
                  <p className="text-[10px] text-amber-600 font-bold mb-1">{uiText.expiry}: {item.expiry}</p>
                )}
                <p className="text-[10px] text-slate-400 font-bold mb-4 flex items-center gap-1">
                  <RefreshCw size={10} /> {formatTimeAgo(item.updatedAt)}
                </p>

                <div className="mt-auto flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3">
                  <button type="button" onClick={() => updateStock(item, -1)}
                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl hover:text-red-500 active:scale-90 border border-slate-100 dark:border-slate-700">
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <div className="text-center">
                    <span className={`block text-xl font-black ${Number(item.stock) < 10 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{item.stock}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black">{uiText.stock}</span>
                  </div>
                  <button type="button" onClick={() => updateStock(item, 1)}
                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl hover:text-emerald-500 active:scale-90 border border-slate-100 dark:border-slate-700">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(item)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                    <Edit3 size={14} /> {uiText.edit}
                  </button>
                  <button type="button" onClick={() => navigate('/pharmacy/sales', { state: { sellId: item.id } })}
                    disabled={Number(item.stock) < 1}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40 hover:bg-emerald-700 transition-colors">
                    <ShoppingBag size={14} /> {uiText.sell}
                  </button>
                </div>

                <button type="button" onClick={() => handleDelete(item.id)}
                  className="absolute top-4 start-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loadingMedicines && filteredMedicines.length === 0 && (
        <div className="text-center py-20 bg-white/40 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl font-black text-slate-700 dark:text-white mb-4">
            {medicines.length === 0 ? uiText.empty : uiText.noResults}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={openAdd} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">{uiText.addMedicine}</button>
            <button onClick={() => navigate('/pharmacy/upload')} className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold">{uiText.emptyCta}</button>
          </div>
        </div>
      )}

      <MedicineFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
        labels={formLabels}
        loading={saving}
      />
    </div>
  );
};

export default InventoryManager;
