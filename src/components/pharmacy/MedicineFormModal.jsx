import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pill, Loader2, Save } from 'lucide-react';

const EMPTY = {
  name: '', category: '', price: '', costPrice: '', stock: '', expiry: '', sku: '', barcode: '',
};

export default function MedicineFormModal({ isOpen, onClose, onSave, initial, labels = {}, loading = false }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(initial ? {
        name: initial.name || '',
        category: initial.category || '',
        price: String(initial.price ?? ''),
        costPrice: String(initial.costPrice ?? ''),
        stock: String(initial.stock ?? ''),
        expiry: initial.expiry || '',
        sku: initial.sku || '',
        barcode: initial.barcode || '',
      } : EMPTY);
      setErrors({});
    }
  }, [isOpen, initial]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = labels.nameRequired;
    if (!form.price || Number(form.price) <= 0) e.price = labels.priceRequired;
    if (form.stock === '' || Number(form.stock) < 0) e.stock = labels.stockRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  const Field = ({ label, error, children }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-full lg:max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Pill size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {initial ? labels.editTitle : labels.addTitle}
                </h2>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              <Field label={labels.name} error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
                  placeholder={labels.namePh}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={labels.category}>
                  <input value={form.category} onChange={(e) => set('category', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
                    placeholder={labels.categoryPh} />
                </Field>
                <Field label={labels.sku}>
                  <input value={form.sku} onChange={(e) => set('sku', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
                </Field>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label={labels.price} error={errors.price}>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
                </Field>
                <Field label={labels.costPrice}>
                  <input type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => set('costPrice', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
                </Field>
                <Field label={labels.stock} error={errors.stock}>
                  <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
                </Field>
                <Field label={labels.expiry}>
                  <input type="date" value={form.expiry} onChange={(e) => set('expiry', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
                </Field>
              </div>

              <Field label={labels.barcode}>
                <input value={form.barcode} onChange={(e) => set('barcode', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
              </Field>
            </form>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex gap-3 shrink-0">
              <button type="button" onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-black text-sm">
                {labels.cancel}
              </button>
              <button type="submit" onClick={handleSubmit} disabled={loading}
                className="flex-[2] py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {labels.save}</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
