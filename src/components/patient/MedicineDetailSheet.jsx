import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, ShoppingCart, Info, Clock, AlertTriangle,
  Pill, Building2, Layers, Tag, ChevronLeft, Sparkles,
} from 'lucide-react';
import { CATEGORY_ICONS } from './constants';
import { getAlternativeMedicines, getCheapestOffer, getMedicineOffers } from '../../utils/medicineHelpers';

export default function MedicineDetailSheet({
  medicine,
  allMedicines = [],
  onClose,
  onAdd,
  onSelectAlternative,
  isFavorite,
  onToggleFavorite,
  labels = {},
  currency = 'ج.م',
  isRTL = true,
}) {
  if (!medicine) return null;

  const offers = getMedicineOffers(allMedicines, medicine);
  const cheapest = getCheapestOffer(offers);
  const alternatives = getAlternativeMedicines(allMedicines, medicine);
  const inStock = Number(medicine.stock) > 0;
  const L = labels;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-end lg:items-center justify-center p-0 lg:p-6">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="relative w-full lg:max-w-2xl max-h-[94vh] bg-white dark:bg-slate-900 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 lg:hidden shrink-0" />

          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 lg:p-8 text-white shrink-0">
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="relative flex justify-between items-start gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl lg:text-4xl shrink-0">
                  {CATEGORY_ICONS[medicine.category] ?? '💊'}
                </div>
                <div className="min-w-0">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-lg mb-2">
                    {medicine.category}
                  </span>
                  <h2 className="text-xl lg:text-2xl font-black leading-tight truncate">{medicine.name}</h2>
                  {medicine.activeIngredient && (
                    <p className="text-blue-100/80 text-xs font-medium mt-1 line-clamp-2">{medicine.activeIngredient}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(medicine.id)}
                  className={`p-2.5 rounded-xl ${isFavorite ? 'bg-rose-500/30 text-white' : 'bg-white/15 text-white/80'}`}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button type="button" onClick={onClose} className="p-2.5 bg-white/15 rounded-xl">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-5 lg:p-6 space-y-5">
            {/* Price & availability */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{L.price || 'السعر'}</p>
                <p className="text-2xl font-black text-blue-600">{medicine.price} <span className="text-sm text-slate-400">{currency}</span></p>
                {cheapest && cheapest.id !== medicine.id && cheapest.price < medicine.price && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <Sparkles size={10} /> {L.cheaperAt || 'أرخص'}: {cheapest.price} {currency}
                  </p>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{L.availability || 'التوفر'}</p>
                <p className={`text-sm font-black ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inStock ? `${medicine.stock} ${L.units || 'قطعة'}` : (L.outOfStock || 'غير متوفر')}
                </p>
              </div>
              {medicine.form && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{L.form || 'الشكل'}</p>
                  <p className="text-sm font-black text-slate-700 dark:text-white">{medicine.form}</p>
                </div>
              )}
              {medicine.manufacturer && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-1 flex items-center gap-1"><Building2 size={10} /> {L.manufacturer || 'الشركة'}</p>
                  <p className="text-sm font-black text-slate-700 dark:text-white truncate">{medicine.manufacturer}</p>
                </div>
              )}
            </div>

            {/* Price comparison */}
            {offers.length > 1 && (
              <section>
                <h3 className="font-black text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-blue-500" /> {L.priceCompare || 'مقارنة الأسعار'}
                </h3>
                <div className="space-y-2">
                  {offers.map((o) => (
                    <div key={o.id} className={`flex justify-between items-center p-3 rounded-xl border ${o.id === medicine.id ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40'}`}>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{o.pharmacyName || L.availableOffer || 'عرض متاح'}</span>
                      <span className="font-black text-blue-600">{o.price} {currency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* About */}
            <section className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <h4 className="font-black text-sm mb-2 flex items-center gap-2"><Info size={15} className="text-blue-500" /> {L.about || 'عن الدواء'}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{medicine.description}</p>
            </section>

            <section className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <h4 className="font-black text-sm mb-2 flex items-center gap-2"><Clock size={15} className="text-orange-500" /> {L.dosage || 'الجرعة'}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{medicine.dosage}</p>
            </section>

            {medicine.sideEffects?.length > 0 && (
              <section className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                <h4 className="font-black text-sm mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={15} /> {L.sideEffects || 'آثار جانبية محتملة'}
                </h4>
                <ul className="space-y-1">
                  {medicine.sideEffects.map((s, i) => (
                    <li key={i} className="text-sm text-amber-800/80 dark:text-amber-300/80 font-medium">• {s}</li>
                  ))}
                </ul>
              </section>
            )}

            {medicine.warnings?.length > 0 && (
              <section className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                <h4 className="font-black text-sm mb-2 text-red-600">{L.warnings || 'تحذيرات'}</h4>
                <ul className="space-y-1">
                  {medicine.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-red-700/80 dark:text-red-300/80 font-medium">• {w}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <section>
                <h3 className="font-black text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-violet-500" /> {L.alternatives || 'بدائل متاحة'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSelectAlternative?.(alt)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 hover:border-violet-300 dark:hover:border-violet-700 transition-all text-right group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-xl shrink-0">
                        {CATEGORY_ICONS[alt.category] ?? '💊'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-800 dark:text-white truncate">{alt.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{alt.price} {currency}</p>
                      </div>
                      <ChevronLeft size={16} className="text-slate-300 group-hover:text-violet-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <p className="text-[10px] text-slate-400 text-center font-medium pb-2 flex items-center justify-center gap-1">
              <Pill size={12} /> {L.disclaimer || 'المعلومات للتوعية فقط — استشر الطبيب أو الصيدلي'}
            </p>
          </div>

          {/* Footer CTA */}
          <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
            <button
              type="button"
              disabled={!inStock}
              onClick={() => { onAdd?.(medicine); onClose?.(); }}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                !inStock
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/25 active:scale-[0.98]'
              }`}
            >
              <ShoppingCart size={18} />
              {inStock ? (L.addToCart || 'أضف إلى السلة') : (L.outOfStock || 'غير متوفر')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
