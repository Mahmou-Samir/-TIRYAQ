import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Clock, FileText, Heart, X, AlertCircle, Phone,
  ShoppingCart, Camera, Upload, Bell, Zap, TrendingUp,
  Sparkles, ChevronLeft, Stethoscope, BookOpen, Bot,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/config';
import { useSettings } from '../../context/SettingsContext';
import { usePatient } from '../../context/PatientContext';
import MedicineCard from '../../components/patient/MedicineCard';
import MedicineDetailSheet from '../../components/patient/MedicineDetailSheet';
import { enrichMedicine } from '../../utils/medicineHelpers';
import {
  CATEGORIES, CATEGORY_ICONS, MOCK_MEDICINES, MOCK_NOTIFICATIONS,
} from '../../components/patient/constants';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl lg:rounded-3xl border border-slate-100 dark:border-white/5 animate-pulse h-48 lg:h-72 flex flex-col gap-4">
    <div className="h-24 lg:h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
    <div className="flex-1 space-y-2.5 px-1">
      <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-lg" />
    </div>
  </div>
);

const QuickAction = ({ icon, label, color, action }) => (
  <motion.button
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.96 }}
    onClick={action}
    className="flex flex-col items-center gap-2 group"
  >
    <div className={`w-[4.5rem] h-[4.5rem] ${color} rounded-2xl flex items-center justify-center shadow-sm border border-white/10 group-hover:shadow-md transition-shadow`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: 1.8 })}
    </div>
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
  </motion.button>
);

export default function PatientSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, t } = useSettings();
  const M = t?.patient?.medicine ?? {};
  const L = t?.patient?.layout ?? {};
  const {
    favorites, addToCart, toggleFavorite,
    setIsCartOpen, showToast, recentOrders,
  } = usePatient();

  const searchRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(MOCK_NOTIFICATIONS.length);

  const debouncedSearch = useDebounce(searchTerm, 280);
  const isFiltering = debouncedSearch.length > 0 || activeCategory !== 'الكل';

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'medicines'));
        const data = snap.docs.map((docSnap) => enrichMedicine({ id: docSnap.id, ...docSnap.data() }));
        setAllMedicines(data.length ? data : MOCK_MEDICINES.map(enrichMedicine));
      } catch {
        setAllMedicines(MOCK_MEDICINES.map(enrichMedicine));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredResults = useMemo(() => {
    let list = allMedicines;
    if (activeCategory !== 'الكل') list = list.filter((m) => m.category === activeCategory);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((m) =>
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [debouncedSearch, activeCategory, allMedicines]);

  const activeOrdersCount = recentOrders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length;

  return (
    <div className="space-y-6 lg:space-y-8 pb-4">
      {/* Hero Banner */}
      {!isFiltering && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] lg:rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 lg:p-10 text-white shadow-xl shadow-blue-600/20"
        >
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-center">
            <div>
              <p className="text-blue-200 text-xs lg:text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles size={14} /> ترياق — صيدليتك الذكية
              </p>
              <h1 className="text-2xl lg:text-4xl xl:text-5xl font-black leading-tight mb-3">
                ابحث عن دوائك<br className="hidden lg:block" /> واطلبه في دقائق
              </h1>
              <p className="text-blue-100/80 text-sm lg:text-base font-medium max-w-md hidden lg:block">
                آلاف الأدوية والمستلزمات الطبية متاحة للتوصيل لباب بيتك من أقرب الصيدليات.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <button
                onClick={() => { setIsNotifOpen(true); setUnreadNotifs(0); }}
                className="relative self-start lg:self-end w-10 h-10 lg:w-12 lg:h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Bell size={18} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-400 rounded-full border-2 border-blue-700" />
                )}
              </button>
              {activeOrdersCount > 0 && (
                <button
                  onClick={() => navigate('/patient/orders')}
                  className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 text-sm font-bold hover:bg-white/25 transition-colors w-full lg:w-auto"
                >
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {activeOrdersCount} طلب نشط — تتبع الآن
                  <ChevronLeft size={16} className="opacity-70" />
                </button>
              )}
              <div className="hidden lg:grid grid-cols-3 gap-3 w-full mt-2">
                {[
                  { label: 'أدوية', val: allMedicines.length || '500+' },
                  { label: 'توصيل', val: '30 د' },
                  { label: 'صيدليات', val: '50+' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                    <p className="text-2xl font-black">{s.val}</p>
                    <p className="text-[11px] text-blue-200 font-bold">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search + Quick Actions row on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-6 lg:items-start">
        <div className="relative">
          <Search className="absolute right-4 lg:right-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={20} />
          <input
            ref={searchRef}
            type="text"
            placeholder="ابحث عن دواء، فيتامين، أو قسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3.5 lg:py-4 pr-12 lg:pr-14 pl-10 bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm focus:ring-2 focus:ring-blue-500/25 dark:text-white font-bold text-sm lg:text-base outline-none transition-all"
          />
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"
            >
              <X size={13} />
            </motion.button>
          )}
        </AnimatePresence>
        </div>

        {/* Quick Actions — desktop sidebar of search */}
        {!isFiltering && (
          <div className="hidden lg:grid grid-cols-2 gap-3 w-72 shrink-0">
            {[
              { icon: <FileText />, label: L.healthGuide || 'دليل الأمراض', color: 'bg-violet-50 dark:bg-violet-900/25 text-violet-600', action: () => navigate('/patient/health') },
              { icon: <Stethoscope />, label: 'اسأل طبيب', color: 'bg-teal-50 dark:bg-teal-900/25 text-teal-600', action: () => navigate('/patient/doctors') },
              { icon: <Bot />, label: t?.patient?.chatbot?.title || 'مساعد AI', color: 'bg-indigo-50 dark:bg-indigo-900/25 text-indigo-600', action: () => window.dispatchEvent(new CustomEvent('teryaq-open-chat')) },
              { icon: <Phone />, label: 'خط الطوارئ', color: 'bg-rose-50 dark:bg-rose-900/25 text-rose-600', action: () => window.open('tel:123') },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm ${a.color} hover:shadow-md transition-shadow text-right`}
              >
                {React.cloneElement(a.icon, { size: 20 })}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions — mobile */}
      {!isFiltering && (
        <div className="grid grid-cols-4 gap-1 lg:hidden">
          <QuickAction icon={<BookOpen />} label={L.health || 'دليل'} color="bg-violet-50 dark:bg-violet-900/25 text-violet-600" action={() => navigate('/patient/health')} />
          <QuickAction icon={<Stethoscope />} label="طبيب" color="bg-teal-50 dark:bg-teal-900/25 text-teal-600" action={() => navigate('/patient/doctors')} />
          <QuickAction icon={<FileText />} label="روشتة" color="bg-blue-50 dark:bg-blue-900/25 text-blue-600" action={() => setIsPrescriptionOpen(true)} />
          <QuickAction icon={<Phone />} label="طوارئ" color="bg-rose-50 dark:bg-rose-900/25 text-rose-600" action={() => window.open('tel:123')} />
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2 lg:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-black transition-all flex items-center gap-1.5 shrink-0 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h2 className="text-base lg:text-xl font-black text-slate-900 dark:text-white">
            {isFiltering ? (
              <>نتائج البحث <span className="text-blue-600">({filteredResults.length})</span></>
            ) : (
              'أدوية شائعة'
            )}
          </h2>
          {isFiltering && (
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('الكل'); }}
              className="text-xs text-blue-600 font-black flex items-center gap-1"
            >
              <X size={12} /> إلغاء
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredResults.slice(0, isFiltering ? undefined : 12).map((item) => (
              <MedicineCard
                key={item.id}
                item={item}
                onSelect={setSelectedDrug}
                onAdd={addToCart}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 lg:py-24 bg-white dark:bg-slate-900 rounded-[1.75rem] lg:rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 col-span-full">
            <Search size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="font-black text-slate-600 dark:text-slate-300">لا توجد نتائج</p>
            <p className="text-sm text-slate-400 mt-1">جرّب كلمة أخرى أو تصفّح الأقسام</p>
          </div>
        )}
      </div>

      {/* Drug Detail */}
      {selectedDrug && (
        <MedicineDetailSheet
          medicine={selectedDrug}
          allMedicines={allMedicines}
          onClose={() => setSelectedDrug(null)}
          onAdd={(item) => { addToCart(item); setIsCartOpen(true); }}
          onSelectAlternative={setSelectedDrug}
          isFavorite={favorites.includes(selectedDrug.id)}
          onToggleFavorite={toggleFavorite}
          labels={M}
          currency={t?.patient?.profile?.currency || (lang === 'ar' ? 'ج.م' : 'EGP')}
          isRTL={lang === 'ar'}
        />
      )}

      {/* Prescription Modal */}
      <AnimatePresence>
        {isPrescriptionOpen && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPrescriptionOpen(false)} />
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">طلب بالروشتة</h2>
                <button onClick={() => setIsPrescriptionOpen(false)} className="p-2 text-slate-400"><X size={18} /></button>
              </div>
              <p className="text-slate-400 text-sm mb-6">صوّر الروشتة وسنوفر الأدوية لك فوراً</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={() => showToast('جاري فتح الكاميرا...', 'info')} className="flex flex-col items-center gap-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-blue-600">
                  <Camera size={28} /><span className="text-xs font-black">الكاميرا</span>
                </button>
                <button onClick={() => showToast('اختر ملف الروشتة', 'info')} className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-500">
                  <Upload size={28} /><span className="text-xs font-black">رفع ملف</span>
                </button>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl mb-6 flex gap-3 items-start">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-bold">سيراجع صيدلي متخصص روشتتك قبل تأكيد الطلب.</p>
              </div>
              <button onClick={() => { setIsPrescriptionOpen(false); showToast('تم استلام الروشتة — جاري المراجعة', 'success'); }} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black">
                إرسال الروشتة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {isNotifOpen && (
          <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsNotifOpen(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-5 sm:hidden" />
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Bell size={20} className="text-blue-600" /> الإشعارات</h2>
                <button onClick={() => setIsNotifOpen(false)} className="p-2 text-slate-400"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className={`p-2.5 rounded-xl shrink-0 ${n.color}`}><Zap size={16} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
