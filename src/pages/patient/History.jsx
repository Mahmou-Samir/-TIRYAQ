import React, { useState } from 'react';
import { Clock, FileText, Pill, CheckCircle2, Upload, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HISTORY_ITEMS = [
  {
    id: 1,
    type: 'order',
    title: 'طلب #ORD-48291',
    subtitle: 'بانادول، فيتامين سي، أوميبرازول',
    date: '18 يونيو 2026',
    time: '10:30 ص',
    status: 'completed',
    amount: 190,
  },
  {
    id: 2,
    type: 'prescription',
    title: 'روشتة طبية',
    subtitle: 'د. أحمد محمود — مستشفى الدقي',
    date: '15 يونيو 2026',
    time: '3:45 م',
    status: 'reviewed',
    meds: ['أوجمنتين', 'بخاخ Ventolin'],
  },
  {
    id: 3,
    type: 'order',
    title: 'طلب #ORD-48102',
    subtitle: 'أنسولين لانتوس، شريط قياس سكر',
    date: '10 يونيو 2026',
    time: '9:15 ص',
    status: 'completed',
    amount: 450,
  },
  {
    id: 4,
    type: 'reminder',
    title: 'تذكير بدواء مزمن',
    subtitle: 'كونكور 5 ملج — يومياً بعد الفطار',
    date: '1 يونيو 2026',
    time: '8:00 ص',
    status: 'active',
  },
];

const TYPE_CONFIG = {
  order: { icon: Pill, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30', label: 'طلب' },
  prescription: { icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30', label: 'روشتة' },
  reminder: { icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', label: 'تذكير' },
};

const STATUS_LABELS = {
  completed: { text: 'مكتمل', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
  reviewed: { text: 'تمت المراجعة', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  active: { text: 'نشط', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
};

export default function History() {
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'order', label: 'طلبات' },
    { key: 'prescription', label: 'روشتات' },
    { key: 'reminder', label: 'تذكيرات' },
  ];

  const items = filter === 'all' ? HISTORY_ITEMS : HISTORY_ITEMS.filter((i) => i.type === filter);

  return (
    <div className="space-y-5 pb-4">
      <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.75rem] text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="font-black text-lg">سجل العمليات</p>
            <p className="text-xs text-slate-400">{HISTORY_ITEMS.length} عمليات مسجّلة</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type];
            const status = STATUS_LABELS[item.status];
            const Icon = cfg.icon;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex gap-3"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                    </div>
                    {item.amount && (
                      <p className="text-sm font-black text-blue-600 shrink-0">{item.amount} ج.م</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${status.color}`}>{status.text}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.date} · {item.time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-black text-sm flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-500 transition-colors">
        <Upload size={16} />
        رفع روشتة جديدة
      </button>
    </div>
  );
}
