import React, { useState, useEffect, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { usePatient } from '../../context/PatientContext';
import MedicineCard from '../../components/patient/MedicineCard';
import { MOCK_MEDICINES } from '../../components/patient/constants';

export default function Favorites() {
  const { favorites, addToCart, toggleFavorite, setIsCartOpen } = usePatient();
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'medicines'));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          price: 50,
          description: 'هذا الدواء يستخدم لعلاج الحالات المرضية المختلفة تحت إشراف طبي.',
          dosage: 'قرص واحد مرتين يومياً',
          ...doc.data(),
        }));
        setAllMedicines(data.length ? data : MOCK_MEDICINES);
      } catch {
        setAllMedicines(MOCK_MEDICINES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const favMeds = useMemo(
    () => allMedicines.filter((m) => favorites.includes(m.id)),
    [allMedicines, favorites]
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-[1.75rem] animate-pulse border border-slate-100 dark:border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
          <Heart size={22} fill="currentColor" />
        </div>
        <div>
          <p className="font-black text-slate-900 dark:text-white">{favMeds.length} دواء محفوظ</p>
          <p className="text-xs text-slate-500">اضغط ❤️ لإضافة أو إزالة من المفضلة</p>
        </div>
      </div>

      {favMeds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {favMeds.map((item) => (
            <MedicineCard
              key={item.id}
              item={item}
              onSelect={setSelectedDrug}
              onAdd={(med) => { addToCart(med); setIsCartOpen(true); }}
              isFavorite
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-rose-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">المفضلة فارغة</h3>
          <p className="text-sm text-slate-400 mt-1.5">ابحث عن أدويتك واحفظها للوصول السريع</p>
        </motion.div>
      )}

      {selectedDrug && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDrug(null)} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 shadow-2xl"
          >
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{selectedDrug.name}</h2>
            <p className="text-blue-600 font-black text-lg mb-4">{selectedDrug.price} ج.م</p>
            <button
              onClick={() => { addToCart(selectedDrug); setSelectedDrug(null); setIsCartOpen(true); }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black"
            >
              أضف إلى السلة
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
