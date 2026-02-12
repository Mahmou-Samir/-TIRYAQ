import React, { useState, useCallback } from 'react';
import { 
  ShoppingBag, Truck, CheckCircle2, Clock, MapPin, 
  Phone, ChevronRight, Package, AlertCircle, X, 
  Star, RefreshCw, Navigation, MessageSquare
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
    className="fixed bottom-24 left-1/2 z-[200] w-[90%] max-w-xs bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
  >
    {type === 'success' ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-blue-400" />}
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
      className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
        <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Navigation size={20} className="text-blue-600" /> تتبع السائق
        </h3>
        <button onClick={onClose} className="p-2 text-slate-400"><X size={20}/></button>
      </div>
      <div className="h-64 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/d/thumbnail?mid=1_7p9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z')] bg-cover"></div>
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl animate-bounce">
            <Truck size={24} />
          </div>
          <div className="mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm text-[10px] font-black">
            الكابتن {order.driver?.name}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-slate-400 font-bold">الوقت المتوقع للوصول</p>
            <p className="text-lg font-black text-blue-600">{order.eta}</p>
          </div>
          <button 
            onClick={() => { window.location.href = `tel:${order.driver?.phone || '12345'}`; }}
            className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/20"
          >
            <Phone size={20} />
          </button>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-start gap-3">
          <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {order.address}
          </p>
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
      case 'completed': return { color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'تم الاستلام', icon: CheckCircle2 };
      default: return { color: 'text-slate-600 bg-slate-50', label: 'غير معروف', icon: AlertCircle };
    }
  };

  const handleReorder = (order) => {
    showToast(`تمت إضافة أصناف ${order.pharmacy} للسلة`, 'success');
  };

  const handleCall = (phone, name) => {
    showToast(`جاري الاتصال بـ ${name}...`, 'info');
    window.location.href = `tel:${phone || '12345'}`;
  };

  const handleTrack = (order) => {
    if (order.status !== 'delivering') {
      showToast('الطلب لا يزال قيد التجهيز', 'info');
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

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <ShoppingBag size={24} />
          </div>
          طلباتي
        </h2>
        <button 
          onClick={() => showToast('جاري تحديث الطلبات...')}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 text-slate-400 shadow-sm"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[1.5rem] flex relative mb-8">
        <motion.div 
          layoutId="tab-bg"
          className={`absolute top-1.5 bottom-1.5 w-[48%] bg-white dark:bg-slate-800 rounded-2xl shadow-sm z-0`}
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

      <div className="space-y-5">
        <AnimatePresence mode="popLayout">
          {(activeTab === 'active' ? activeOrders : pastOrders).map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const isExpanded = expandedOrder === order.id;
            
            return (
              <motion.div 
                layout
                key={order.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-600/10 shadow-xl' : ''}`}
              >
                <div className="p-6 flex justify-between items-start cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${statusInfo.color} transition-transform duration-500 ${order.status === 'delivering' ? 'animate-pulse' : ''}`}>
                      <statusInfo.icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-base">{order.pharmacy}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 font-bold">{order.date}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">#{order.id.replace('#', '')}</span>
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

                {!isExpanded && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                      {order.items.map((item, i) => (
                        <span key={i} className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 whitespace-nowrap">
                          {item.qty}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 dark:border-white/5 mt-2">
                        
                        <div className="space-y-3 my-4">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">تفاصيل الأصناف</h4>
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.qty}x {item.name}</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{item.price * item.qty} ج.م</p>
                            </div>
                          ))}
                        </div>

                        {activeTab === 'active' && (
                          <div className="my-8 space-y-6 relative pr-4 border-r-2 border-slate-100 dark:border-white/5 mr-2">
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
                              {order.driver && <p className="text-[10px] text-slate-400 font-bold">مع الكابتن {order.driver.name}</p>}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mt-6">
                          {activeTab === 'active' ? (
                            <>
                              <button 
                                onClick={() => handleTrack(order)}
                                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                              >
                                <Navigation size={16} /> تتبع السائق
                              </button>
                              <button 
                                onClick={() => handleCall(order.driver?.phone, order.driver?.name || order.pharmacy)}
                                className="flex-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 py-4 rounded-2xl text-xs font-black hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                              >
                                <Phone size={16} /> اتصال
                              </button>
                            </>
                          ) : (
                            <div className="w-full space-y-3">
                              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= (order.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-300'} />)}
                                </div>
                                <button onClick={() => showToast('شكراً لتقييمك!')} className="text-[10px] font-black text-blue-600">تعديل التقييم</button>
                              </div>
                              <button 
                                onClick={() => handleReorder(order)}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                              >
                                <RefreshCw size={16} /> إعادة طلب نفس الأصناف
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-1.5 bg-slate-50 dark:bg-slate-800/50 flex justify-center items-center">
                   <motion.div 
                    animate={{ width: isExpanded ? 64 : 40, backgroundColor: isExpanded ? '#2563eb' : '#e2e8f0' }}
                    className="h-1 rounded-full"
                   ></motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {((activeTab === 'active' && activeOrders.length === 0) || (activeTab === 'history' && pastOrders.length === 0)) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">لا توجد طلبات</h3>
            <p className="text-sm text-slate-400 mt-2">ابدأ بطلب أدويتك الآن لتظهر هنا</p>
            <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20">اطلب الآن</button>
          </motion.div>
        )}
      </div>

      <button 
        onClick={() => showToast('جاري فتح المحادثة مع الدعم...')}
        className="fixed bottom-32 left-6 w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-blue-600 z-40"
      >
        <MessageSquare size={24} />
      </button>

    </div>
  );
};

export default Orders;
