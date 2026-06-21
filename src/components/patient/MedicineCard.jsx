import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Heart, Plus, ShoppingCart } from 'lucide-react';
import { CATEGORY_ICONS } from './constants';

const StatusPill = ({ inStock }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black w-fit flex items-center gap-1.5 ${inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
    {inStock ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
    {inStock ? 'متوفر' : 'غير متوفر'}
  </span>
);

const MedicineCard = React.memo(({ item, onSelect, onAdd, isFavorite, onToggleFavorite }) => {
  const inStock = Number(item.stock) > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900/30 transition-all relative overflow-hidden h-full flex flex-col"
    >
      {/* Mobile: horizontal row */}
      <div
        onClick={() => onSelect(item)}
        className="flex lg:hidden items-center justify-between p-4 cursor-pointer active:scale-[0.99] relative"
      >
        <span className={`absolute top-0 right-0 h-full w-1 ${inStock ? 'bg-gradient-to-b from-blue-500 to-indigo-600' : 'bg-slate-200'}`} />
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${inStock ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            {CATEGORY_ICONS[item.category] ?? '💊'}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-800 dark:text-white text-sm truncate">{item.name}</h3>
            <p className="text-[11px] text-slate-400 mb-1">{item.category}</p>
            <StatusPill inStock={inStock} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 mr-2">
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }} className={`p-2 rounded-xl ${isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-300'}`}>
            <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <p className="text-sm font-black text-slate-800 dark:text-white">{item.price} <span className="text-[10px] text-slate-400">ج.م</span></p>
          <button
            disabled={!inStock}
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${!inStock ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'}`}
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Desktop: vertical card */}
      <div className="hidden lg:flex flex-col h-full cursor-pointer" onClick={() => onSelect(item)}>
        <div className={`relative p-6 flex items-center justify-center text-5xl ${inStock ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
          {CATEGORY_ICONS[item.category] ?? '💊'}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
            className={`absolute top-4 left-4 p-2.5 rounded-xl transition-colors ${isFavorite ? 'text-rose-500 bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-400 bg-white/80 dark:bg-slate-900/80 hover:text-rose-500'}`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {!inStock && (
            <span className="absolute top-4 right-4 text-[10px] font-black bg-red-100 text-red-600 px-2 py-1 rounded-lg">نفد</span>
          )}
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <p className="text-[11px] font-bold text-blue-600 mb-1">{item.category}</p>
          <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2">{item.name}</h3>
          <StatusPill inStock={inStock} />

          <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
            <div>
              <p className="text-[10px] text-slate-400 font-bold">السعر</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {item.price} <span className="text-sm text-slate-400 font-bold">ج.م</span>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!inStock}
              onClick={(e) => { e.stopPropagation(); onAdd(item); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                !inStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700'
              }`}
            >
              <ShoppingCart size={16} />
              أضف
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MedicineCard.displayName = 'MedicineCard';
export default MedicineCard;
