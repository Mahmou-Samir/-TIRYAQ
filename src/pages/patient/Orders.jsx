import React, { useState, useCallback } from 'react';
import { 
  ShoppingBag, Truck, CheckCircle2, Clock, MapPin, 
  Phone, ChevronRight, Package, AlertCircle, X, 
  Star, RefreshCw, Navigation, MessageSquare, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data ---
const initialActiveOrders = [
  { 
    id: '#8921', 
    pharmacy: 'صيدلية العزبي - المعادي', 
    items: [{ name: 'أنسولين لانتوس', qty: 2, price: 200 }, { name: 'شريط قياس سكر', qty: 1, price: 50 }], 
    total: 450, 
    date: 'اليوم، 10:30 ص',
    status: 'delivering', 
    driver: { name: 'محمد أحمد', phone: '01012345678', lat: 30.0444, lng: 31.2357 },
    eta: '15 دقيقة',
    address: 'شارع 9، المعادي، القاهرة'
  },
  { 
    id: '#8925', 
    pharmacy: 'صيدلية سيف - الدقي', 
    items: [{ name: 'بانادول إكسترا', qty: 1, price: 45 }, { name: 'فيتامين C', qty: 2, price: 37.5 }], 
    total: 120, 
    date: 'اليوم، 11:00 ص',
    status: 'preparing',
    driver: null,
    eta: '45 دقيقة',
    address: 'شارع التحرير، الدقي، الجيزة'
  }
];

const initialPastOrders = [
  { 
    id: '#8801', 
    pharmacy: 'صيدلية مصر', 
    items: [{ name: 'مضاد حيوي أوجمنتين', qty: 1, price: 85 }], 
    total: 85, 
    date: '10 أكتوبر 2025',
    status: 'completed',
    rating: 5
  }
];

// --- Sub-Components ---

const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-28 left-1/2 z-[200] w-[90%] max-w-xs px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
      type === 'success' ? 'bg-green-600/90 border-green-500/50 text-white' : 
      type === 'error' ? 'bg-red-600/90 border-red-500/50 text-white' : 
      'bg-slate-900/95 dark:bg-white/95 border-slate-800 dark:border-white/20 text-white dark:text-slate-900'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={20} className="text-green-300" /> : 
     type === 'error' ? <AlertCircle size={20} className="text-red-300" /> : 
     <AlertCircle size={20} className="text-blue-400 dark:text-blue-600" />}
    <span className="text-xs font-black">{message}</span>
  </motion.div>
);

const MapModal = ({ order, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl"
    >
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-700 dark:text-slate-300 shadow-sm"><X size={20}/></button>
      </div>

      <div className="h-64 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
        {/* Fake Map Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
        {/* Pulsing Location Radar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="w-48 h-48 border border-blue-500/30 rounded-full absolute -top-24 -left-24 animate-ping" style={{animationDuration: '3s'}}></div>
           <div className="w-32 h-32 border border-blue-500/50 rounded-full absolute -top-16 -left-16 animate-ping" style={{animationDuration: '2s'}}></div>
        </div>
        
        <div className="relative flex flex-col items-center z-10 mt-8">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-bounce border-4 border-white dark:border-slate-900">
            <Truck size={24} />
          </div>
          <div className="mt-3 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            الكابتن {order.driver?.name}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">وقت الوصول المتوقع</p>
            <p className="text-2xl font-black text-blue-600 flex items-center gap-2">
              {order.eta} <Clock size={20} className="text-blue-400"/>
            </p>
          </div>
          <button 
            onClick={() => { window.location.href = `tel:${order.driver?.phone || '12345'}`; }}
            className="w-14 h-14 flex items-center justify-center bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/30 active:scale-90 transition-transform"
          >
            <Phone size={24} />
          </button>
        </div>
        
        <div className="flex items-start gap-3 pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-4">
          <div className="relative">
             <div className="absolute -left-[23px] top-1 w-4 h-4 bg-blue-600 border-4 border-white dark:border-slate-900 rounded-full"></div>
             <MapPin size={20} className="text-slate-400" />
          </div>
          <div className="-mt-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">وجهة التوصيل</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              {order.address}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// --- Main Component ---

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeOrders] = useState(initialActiveOrders);
  const [pastOrders] = useState(initialPastOrders);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getStatusInfo = (status) => {
    switch(status) {
      case 'delivering': return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'جاري التوصيل', icon: Truck };
      case 'preparing': return { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', label: 'جاري التجهيز', icon: Package };
      case 'completed': return { color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'تم التوصيل', icon: CheckCircle2 };
      default: return { color: 'text-slate-600 bg-slate-50', label: 'غير معروف', icon: AlertCircle };
    }
  };

  const handleReorder = (order) => {
    showToast(`تمت إضافة أصناف ${order.pharmacy} للسلة`, 'success');
  };

  const handleTrack = (order) => {
    if (order.status !== 'delivering') {
      showToast('الطلب لا يزال قيد التجهيز في الصيدلية', 'info');
      return;
    }
    setTrackingOrder(order);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] font-sans pb-32 pt-6 px-6" dir="rtl">
      
      <AnimatePresence>
        {toast && <Toast {...toast} />}
      </AnimatePresence>

      <AnimatePresence>
        {trackingOrder && <MapModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <ShoppingBag size={24} />
          </div>
          طلباتي
        </h2>
        <motion.button 
          whileTap={{ rotate: 180 }}
          onClick={() => showToast('الطلبات محدثة', 'success')}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 text-slate-400 shadow-sm"
        >
          <RefreshCw size={20} />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[1.5rem] flex relative mb-8">
        <motion.div 
          layoutId="orders-tab-bg"
          className="absolute top-1.5 bottom-1.5 w-[48%] bg-white dark:bg-slate-800 rounded-2xl shadow-sm z-0"
          animate={{ x: activeTab === 'active' ? 0 : '-104%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        ></motion.div>
        <button 
          onClick={() => setActiveTab('active')} 
          className={`flex-1 py-3.5 text-sm font-black text-center relative z-10 transition-colors ${activeTab === 'active' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
        >
          الطلبات الحالية
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex-1 py-3.5 text-sm font-black text-center relative z-10 transition-colors ${activeTab === 'history' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
        >
          السجل السابق
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        <AnimatePresence mode="popLayout">
          {(activeTab === 'active' ? activeOrders : pastOrders).map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const isExpanded = expandedOrder === order.id;
            
            return (
              <motion.div 
                layout
                key={order.id} 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-4 ring-blue-600/10 shadow-2xl' : ''}`}
              >
                {/* Card Header (Clickable) */}
                <div className="p-6 flex justify-between items-start cursor-pointer group" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${statusInfo.color} transition-transform duration-500 group-hover:scale-105 ${order.status === 'delivering' ? 'animate-pulse' : ''}`}>
                      <statusInfo.icon size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-base">{order.pharmacy}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 font-bold">{order.date}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">{order.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{order.total} ج.م</p>
                    {order.status === 'delivering' && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                        <p className="text-[10px] text-green-600 font-black">يصل {order.eta}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsed Items Preview */}
                {!isExpanded && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mask-image-right">
                      {order.items.map((item, i) => (
                        <span key={i} className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 whitespace-nowrap">
                          {item.qty}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 dark:border-white/5 mt-2">
                        
                        {/* Receipt Details */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl mb-6 mt-4">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Receipt size={14}/> تفاصيل الفاتورة</h4>
                          <div className="space-y-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                  <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded mr-2 text-xs">{item.qty}x</span>
                                  {item.name}
                                </p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{item.price * item.qty} ج.م</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Timeline (Active Orders Only) */}
                        {activeTab === 'active' && (
                          <div className="mb-8 space-y-6 relative pr-4 border-r-2 border-blue-100 dark:border-blue-900/30 mr-2">
                            <div className="relative">
                              <div className="absolute -right-[21px] top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"></div>
                              <p className="text-xs font-black text-slate-800 dark:text-white">تم تأكيد الطلب</p>
                              <p className="text-[10px] text-slate-400 font-bold">10:35 ص</p>
                            </div>
                            <div className="relative">
                              <div className={`absolute -right-[21px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${order.status === 'preparing' || order.status === 'delivering' ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
                              <p className={`text-xs font-black ${order.status === 'preparing' || order.status === 'delivering' ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>تجهيز الدواء</p>
                              <p className="text-[10px] text-slate-400 font-bold">10:45 ص</p>
                            </div>
                            <div className="relative">
                              <div className={`absolute -right-[21px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${order.status === 'delivering' ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'}`}></div>
                              <p className={`text-xs font-black ${order.status === 'delivering' ? 'text-blue-600' : 'text-slate-400'}`}>جاري التوصيل</p>
                              {order.driver && <p className="text-[10px] text-slate-400 font-bold mt-1">مع الكابتن {order.driver.name}</p>}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                          {activeTab === 'active' ? (
                            <>
                              <button 
                                onClick={() => handleTrack(order)}
                                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-[1.5rem] text-xs font-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl"
                              >
                                <Navigation size={18} /> تتبع السائق
                              </button>
                              <button 
                                onClick={() => showToast('الدعم الفني متاح للمساعدة')}
                                className="w-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 py-4 rounded-[1.5rem] flex items-center justify-center active:scale-95 transition-all"
                              >
                                <MessageSquare size={20} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full space-y-3">
                              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 mb-1">تقييمك للطلب</p>
                                  <div className="flex gap-1">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={18} className={s <= (order.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-300'} />)}
                                  </div>
                                </div>
                                <button onClick={() => showToast('تعديل التقييم غير متاح حالياً', 'info')} className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl">تعديل</button>
                              </div>
                              <button 
                                onClick={() => handleReorder(order)}
                                className="w-full bg-blue-600 text-white py-4 rounded-[1.5rem] text-sm font-black active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                              >
                                <RefreshCw size={18} /> إعادة طلب نفس الأصناف
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expansion Indicator */}
                <div className="h-1.5 bg-slate-50 dark:bg-slate-800/50 flex justify-center items-center">
                   <motion.div 
                    animate={{ width: isExpanded ? 64 : 32, backgroundColor: isExpanded ? '#2563eb' : (document.documentElement.classList.contains('dark') ? '#334155' : '#cbd5e1') }}
                    className="h-1 rounded-full"
                   ></motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {((activeTab === 'active' && activeOrders.length === 0) || (activeTab === 'history' && pastOrders.length === 0)) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">لا توجد طلبات هنا</h3>
            <p className="text-sm text-slate-400 mt-2">ابدأ بطلب أدويتك الآن لتظهر في هذا السجل</p>
          </motion.div>
        )}
      </div>

      {/* Floating Support Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => showToast('خدمة العملاء متصلة الآن', 'success')}
        className="fixed bottom-32 left-6 w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/5 flex items-center justify-center text-blue-600 z-40"
      >
        <MessageSquare size={24} strokeWidth={2} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
      </motion.button>

    </div>
  );
};

export default Orders;