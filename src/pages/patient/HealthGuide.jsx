import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Pill, Shield, X, ChevronLeft,
  Stethoscope, AlertTriangle, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import {
  HEALTH_DISEASES, DISEASE_CATEGORIES, searchDiseases,
} from '../../utils/healthKnowledge';

export default function HealthGuide() {
  const { lang, t } = useSettings();
  const navigate = useNavigate();
  const H = t?.patient?.health ?? {};
  const isRTL = lang === 'ar';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = search ? searchDiseases(search, lang) : HEALTH_DISEASES;
    if (category !== 'all') list = list.filter((d) => d.category === category);
    return list;
  }, [search, category, lang]);

  const getName = (d) => (isRTL ? d.name : d.nameEn);
  const getSymptoms = (d) => (isRTL ? d.symptoms : d.symptomsEn);
  const getSolutions = (d) => (isRTL ? d.solutions : d.solutionsEn);
  const getCauses = (d) => (isRTL ? d.causes : d.causesEn);
  const getPrevention = (d) => (isRTL ? d.prevention : d.preventionEn);
  const getCatLabel = (c) => (isRTL ? c.ar : c.en);

  const orderMedicine = (name) => {
    setSelected(null);
    navigate(`/patient?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="space-y-6 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] lg:rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 p-6 lg:p-10 text-white shadow-xl"
      >
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 lg:flex lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-violet-200 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <BookOpen size={14} /> {H.badge || 'موسوعة صحية'}
            </p>
            <h1 className="text-2xl lg:text-4xl font-black leading-tight mb-2">{H.title || 'دليل الأمراض والعلاج'}</h1>
            <p className="text-violet-100/90 text-sm lg:text-base font-medium max-w-lg">
              {H.subtitle || 'أمراض شائعة، أعراضها، حلول منزلية، وأدوية مقترحة — للتوعية فقط.'}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10 min-w-[100px]">
              <p className="text-2xl font-black">{HEALTH_DISEASES.length}</p>
              <p className="text-[11px] text-violet-200 font-bold">{H.diseaseCount || 'مرض'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10 min-w-[100px]">
              <p className="text-2xl font-black">{DISEASE_CATEGORIES.length - 1}</p>
              <p className="text-[11px] text-violet-200 font-bold">{H.categories || 'تصنيف'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Emergency banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
        <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
        <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
          {H.emergency || 'في الطوارئ (ألم صدر، ضيق تنفس، إغماء) — اتصل 123 فوراً. هذا الدليل للتوعية وليس تشخيصاً.'}
        </p>
      </div>

      {/* Search + categories */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={H.searchPh || 'ابحث عن مرض أو عرض...'}
            className="w-full ps-11 pe-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 font-bold text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {DISEASE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              category === c.key
                ? 'bg-violet-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
            }`}
          >
            <span>{c.icon}</span> {getCatLabel(c)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((d, i) => (
          <motion.button
            key={d.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(d)}
            className="text-start bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-100 dark:border-white/5 p-5 lg:p-6 shadow-sm hover:shadow-xl hover:border-violet-200 dark:hover:border-violet-900/30 transition-all flex flex-col"
          >
            <div className="flex items-start gap-4 mb-3">
              <span className="text-3xl">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white text-base">{getName(d)}</h3>
                <p className="text-[10px] text-violet-600 font-black mt-1 uppercase">
                  {getCatLabel(DISEASE_CATEGORIES.find((c) => c.key === d.category) || DISEASE_CATEGORIES[0])}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
              {getSymptoms(d).slice(0, 3).join(' • ')}
            </p>
            {d.medicines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {d.medicines.slice(0, 2).map((m) => (
                  <span key={m} className="text-[10px] font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-600 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Pill size={10} /> {m}
                  </span>
                ))}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-black text-slate-500">{H.noResults || 'لا توجد نتائج'}</p>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="relative w-full lg:max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{selected.icon}</span>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{getName(selected)}</h2>
                      <p className="text-sm text-slate-400 font-medium mt-1">{getCauses(selected)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <Section icon={Stethoscope} title={H.symptoms || 'الأعراض'} items={getSymptoms(selected)} color="rose" />
                <Section icon={Sparkles} title={H.solutions || 'الحلول والنصائح'} items={getSolutions(selected)} color="emerald" numbered />
                <Section icon={Shield} title={H.prevention || 'الوقاية'} items={[getPrevention(selected)]} color="blue" />

                {selected.medicines.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <Pill size={12} /> {H.medicines || 'أدوية مقترحة (استشر الصيدلي)'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selected.medicines.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => orderMedicine(m)}
                          className="flex items-center justify-between gap-2 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors text-start"
                        >
                          <span className="font-black text-sm text-violet-800 dark:text-violet-200">{m}</span>
                          <ChevronLeft size={16} className={`text-violet-500 shrink-0 ${isRTL ? '' : 'rotate-180'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelected(null); navigate('/patient/doctors'); }}
                    className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-teal-600 text-white flex items-center justify-center gap-2"
                  >
                    <Stethoscope size={18} /> {H.askDoctor || 'اسأل طبيباً'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {H.close || 'إغلاق'}
                  </button>
                </div>

                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                  {H.disclaimer || '⚠️ للتوعية فقط — لا يغني عن الكشف الطبي. الجرعات والعلاج يحدده الطبيب أو الصيدلي.'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ icon: Icon, title, items, color, numbered }) {
  const colors = {
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  };
  return (
    <div>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${colors[color]?.split(' ')[0]}`}>
        <Icon size={12} /> {title}
      </p>
      <ul className={`rounded-2xl p-4 space-y-2 ${colors[color]?.split(' ').slice(1).join(' ')}`}>
        {items.map((item, i) => (
          <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed flex gap-2">
            {numbered && <span className="font-black text-emerald-600 shrink-0">{i + 1}.</span>}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
