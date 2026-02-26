import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle2, XCircle, Clock, 
  User, MapPin, FileText, Package, Loader2, Check
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

const PharmacyOrders = () => {
  const { t, lang } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, processing, completed
  const [updatingId, setUpdatingId] = useState(null); // لمنع الضغط المزدوج أثناء التحديث

  // 🛡️ حماية الترجمة (Safe UI Texts)
  const uiText = t?.pharmacy?.orders || {};

  // 1. الاستماع للطلبات (Real-time)
  useEffect(() => {
    const pharmacyId = auth.currentUser?.uid || 'GUEST_PHARMACY';
    
    const q = query(
      collection(db, "orders"), 
      where("pharmacyId", "==", pharmacyId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. تحديث حالة الطلب
  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      // يمكن إضافة Custom Toast للإشعار بالنجاح هنا
    } catch (error) {
      console.error("Error updating order:", error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. فلترة الطلبات بناءً على التبويب النشط
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'processing') return ['accepted', 'preparing'].includes(order.status);
    if (activeTab === 'completed') return ['ready', 'completed', 'cancelled'].includes(order.status);
    return true;
  });

  // مترجم حالات الطلبات الديناميكي
  const translateStatus = (status) => {
    const statusMap = {
      pending: lang === 'ar' ? 'جديد' : 'New',
      accepted: lang === 'ar' ? 'تم القبول' : 'Accepted',
      preparing: lang === 'ar' ? 'جاري التجهيز' : 'Preparing',
      ready: lang === 'ar' ? 'جاهز للاستلام' : 'Ready',
      completed: lang === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: lang === 'ar' ? 'ملغى' : 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-emerald-600 flex-col gap-4">
        <Loader2 size={48} className="animate-spin" />
        <span className="font-bold text-slate-500 animate-pulse">{t?.loading || (lang === 'ar' ? 'جاري جلب الطلبات...' : 'Loading orders...')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 🟢 Header & Controls */}
      <div className="relative flex flex-col md:flex-row justify-between items-end gap-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl overflow-hidden group">
        
        {/* الخلفية الجمالية */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600">
               <ClipboardList size={28} />
            </div>
            {uiText.title || (lang === 'ar' ? 'طلبات المرضى' : 'Patient Orders')}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {lang === 'ar' ? 'لديك' : 'You have'} 
            <span className="text-emerald-600 font-black text-lg mx-1.5">{orders.filter(o => o.status === 'pending').length}</span> 
            {lang === 'ar' ? 'طلبات جديدة تحتاج لاتخاذ إجراء.' : 'new orders requiring action.'}
          </p>
        </div>

        {/* Tabs Control */}
        <div className="relative z-10 flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {[
            { id: 'pending', label: uiText.pending || (lang === 'ar' ? 'جديدة' : 'Pending'), icon: Clock },
            { id: 'processing', label: uiText.processing || (lang === 'ar' ? 'جاري التجهيز' : 'Processing'), icon: Package },
            { id: 'completed', label: uiText.completed || (lang === 'ar' ? 'مكتملة' : 'Completed'), icon: CheckCircle2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap outline-none ${
                activeTab === tab.id 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm scale-100' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 scale-95 opacity-70 hover:opacity-100'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 Orders Grid */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <motion.div
                layout
                variants={cardVariants}
                initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}
                key={order.id}
                className={`bg-white dark:bg-[#0b1121] rounded-[2rem] p-6 border shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col ${updatingId === order.id ? 'opacity-50 pointer-events-none' : 'border-slate-100 dark:border-white/5'}`}
              >
                {/* Status Badge Line */}
                <div className={`absolute top-0 right-0 left-0 h-1.5 ${
                  order.status === 'pending' ? 'bg-amber-500' : 
                  order.status === 'accepted' || order.status === 'preparing' ? 'bg-blue-500' : 
                  order.status === 'ready' ? 'bg-emerald-500' : 
                  order.status === 'completed' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-red-500'
                }`}></div>

                {/* Patient Info Header */}
                <div className="flex justify-between items-start mb-4 pt-2">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight">
                          {order.patientName || (lang === 'ar' ? 'مريض زائر' : 'Guest Patient')}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
                           <MapPin size={10} /> {order.address || (lang === 'ar' ? 'استلام من الفرع' : 'Pickup')}
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' :
                        order.status === 'completed' ? 'bg-slate-100 text-slate-500' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-500' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {translateStatus(order.status)}
                      </span>
                   </div>
                </div>

                {/* Order Details Content */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12}/> {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">#{order.id.slice(0,5)}</span>
                  </div>
                  
                  <div className="h-[1px] bg-slate-200 dark:bg-slate-700 w-full"></div>

                  {order.type === 'prescription' ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl">
                      <FileText size={16} /> {uiText.prescription || (lang === 'ar' ? 'صورة روشتة مرفقة' : 'Prescription Image')}
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span>{item.name}</span>
                          <span className="text-slate-400 bg-white dark:bg-slate-800 px-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs">x{item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {order.totalPrice && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-500 text-xs">{uiText.total || (lang === 'ar' ? 'الإجمالي المتوقع' : 'Expected Total')}</span>
                      <span className="font-black text-emerald-600 text-lg">{order.totalPrice} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  )}
                </div>

                {/* 🔴 Action Buttons (Smart Logic) */}
                <div className="mt-auto">
                  {activeTab === 'pending' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all flex justify-center items-center gap-2 text-sm"
                      >
                        {updatingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} /> {uiText.reject || (lang === 'ar' ? 'رفض' : 'Reject')}</>}
                      </button>
                      <button 
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 text-sm active:scale-95"
                      >
                        {updatingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> {uiText.accept || (lang === 'ar' ? 'قبول وتجهيز' : 'Accept')}</>}
                      </button>
                    </div>
                  )}

                  {activeTab === 'processing' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'ready')}
                      className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 active:scale-95"
                    >
                      {updatingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <><Package size={18} /> {uiText.ready || (lang === 'ar' ? 'تم التجهيز للإرسال' : 'Mark as Ready')}</>}
                    </button>
                  )}

                  {activeTab === 'completed' && order.status === 'ready' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'completed')}
                      className="w-full py-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold shadow-lg hover:bg-slate-900 transition-all flex justify-center items-center gap-2 active:scale-95"
                    >
                      {updatingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> {lang === 'ar' ? 'تم التسليم للمريض' : 'Mark as Delivered'}</>}
                    </button>
                  )}
                  
                  {activeTab === 'completed' && order.status === 'completed' && (
                     <div className="w-full py-3 text-center text-green-600 font-bold text-sm bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center gap-2">
                       <CheckCircle2 size={16} /> {lang === 'ar' ? 'طلب ناجح' : 'Completed Order'}
                     </div>
                  )}
                  
                  {activeTab === 'completed' && order.status === 'cancelled' && (
                     <div className="w-full py-3 text-center text-red-500 font-bold text-sm bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center gap-2">
                       <XCircle size={16} /> {lang === 'ar' ? 'طلب ملغى' : 'Cancelled'}
                     </div>
                  )}
                </div>

              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center text-slate-400 bg-white/40 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                 <ClipboardList size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
                {lang === 'ar' ? 'لا توجد طلبات في هذه القائمة' : 'No orders in this list'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {lang === 'ar' ? 'سنقوم بإعلامك فور وصول طلب جديد' : 'We will notify you when a new order arrives'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default PharmacyOrders;