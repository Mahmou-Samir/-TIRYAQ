import React, { useState } from 'react';
import { 
  ShoppingBag, Truck, CheckCircle2, Clock, MapPin, 
  Phone, ChevronRight, Package, AlertCircle 
} from 'lucide-react';

// --- Mock Data (بيانات وهمية للتجربة) ---
const activeOrdersData = [
  { 
    id: '#8921', 
    pharmacy: 'صيدلية العزبي - المعادي', 
    items: ['أنسولين لانتوس (2)', 'شريط قياس سكر'], 
    price: 450, 
    date: 'اليوم، 10:30 ص',
    status: 'delivering', // delivering, preparing, confirmed
    driver: 'محمد أحمد',
    eta: '15 دقيقة'
  },
  { 
    id: '#8925', 
    pharmacy: 'صيدلية سيف - الدقي', 
    items: ['بانادول إكسترا', 'فيتامين C'], 
    price: 120, 
    date: 'اليوم، 11:00 ص',
    status: 'preparing',
    driver: null,
    eta: '45 دقيقة'
  }
];

const pastOrdersData = [
  { 
    id: '#8801', 
    pharmacy: 'صيدلية مصر', 
    items: ['مضاد حيوي أوجمنتين'], 
    price: 85, 
    date: '10 أكتوبر 2025',
    status: 'completed'
  }
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active'); // active | history
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Helper to get status color and label
  const getStatusInfo = (status) => {
    switch(status) {
      case 'delivering': return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'جاري التوصيل', icon: Truck };
      case 'preparing': return { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', label: 'جاري التجهيز', icon: Package };
      case 'completed': return { color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'تم الاستلام', icon: CheckCircle2 };
      default: return { color: 'text-slate-600 bg-slate-50', label: 'غير معروف', icon: AlertCircle };
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="animate-fade-in space-y-6 pt-2 pb-24">
      
      {/* 🟢 Header & Tabs */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> طلباتي
        </h2>
      </div>

      {/* Custom Tabs */}
      <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex relative">
        <div 
          className={`absolute top-1 bottom-1 w-[48%] bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === 'active' ? 'right-1' : 'right-[51%]'}`}
        ></div>
        <button 
          onClick={() => setActiveTab('active')} 
          className={`flex-1 py-2.5 text-xs font-bold text-center relative z-10 transition-colors ${activeTab === 'active' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
        >
          الطلبات الحالية
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex-1 py-2.5 text-xs font-bold text-center relative z-10 transition-colors ${activeTab === 'history' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
        >
          السجل السابق
        </button>
      </div>

      {/* 🟢 Orders List */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activeOrdersData : pastOrdersData).map((order, index) => {
          const statusInfo = getStatusInfo(order.status);
          
          return (
            <div 
              key={order.id} 
              onClick={() => toggleExpand(order.id)}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md active:scale-[0.99]"
            >
              {/* Order Header */}
              <div className="p-5 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusInfo.color}`}>
                    <statusInfo.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{order.pharmacy}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{order.date}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[10px] text-slate-400">• {order.id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white">{order.price} ج.م</p>
                  {order.status === 'delivering' && (
                    <p className="text-[10px] text-green-600 font-bold mt-1 animate-pulse">يصل خلال {order.eta}</p>
                  )}
                </div>
              </div>

              {/* Items Preview */}
              <div className="px-5 pb-4">
                <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-1">
                  {order.items.join('، ')}
                </p>
              </div>

              {/* 🟢 Expanded View (Timeline & Actions) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedOrder === order.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  
                  {/* Timeline */}
                  {activeTab === 'active' && (
                    <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-2 my-4">
                      <div className="relative">
                        <span className="absolute -left-[21px] top-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow"></span>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">تم تأكيد الطلب</p>
                      </div>
                      <div className="relative">
                        <span className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow ${order.status === 'preparing' || order.status === 'delivering' ? 'bg-orange-500' : 'bg-slate-200'}`}></span>
                        <p className={`text-xs font-bold ${order.status === 'preparing' || order.status === 'delivering' ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>تجهيز الدواء</p>
                      </div>
                      <div className="relative">
                        <span className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow ${order.status === 'delivering' ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'}`}></span>
                        <p className={`text-xs font-bold ${order.status === 'delivering' ? 'text-blue-600' : 'text-slate-400'}`}>جاري التوصيل {order.driver && `مع الكابتن ${order.driver}`}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {activeTab === 'active' ? (
                      <>
                        <button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                          <MapPin size={14} /> تتبع السائق
                        </button>
                        <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                          <Phone size={14} /> اتصال
                        </button>
                      </>
                    ) : (
                      <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingBag size={14} /> إعادة الطلب
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Expand Indicator */}
              <div className="h-1 bg-slate-50 dark:bg-slate-800 flex justify-center">
                 <div className={`w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 transition-all ${expandedOrder === order.id ? 'bg-blue-500 w-16' : ''}`}></div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {((activeTab === 'active' && activeOrdersData.length === 0) || (activeTab === 'history' && pastOrdersData.length === 0)) && (
          <div className="text-center py-20 opacity-50">
            <ShoppingBag size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-bold text-slate-500">لا توجد طلبات هنا</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;