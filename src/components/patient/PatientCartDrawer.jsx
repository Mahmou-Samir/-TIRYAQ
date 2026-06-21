import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, X, Trash2, Minus, Plus, ArrowRight,
  CheckCircle2, Loader2, MapPin, CreditCard, Activity, Navigation, Check
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { CATEGORY_ICONS, DELIVERY_FEE } from './constants';

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
      {icon}
    </div>
    <p className="font-black text-slate-600 dark:text-slate-300 mb-1">{title}</p>
    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
  </div>
);

export default function PatientCartDrawer() {
  const {
    cart, cartTotal, cartCount,
    isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen,
    isTrackingOpen, setIsTrackingOpen,
    currentOrder, paymentMethod, setPaymentMethod,
    checkoutLoading, removeFromCart, clearCart, updateQuantity, handleCheckout,
  } = usePatient();

  return (
    <>
      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[160] flex justify-start lg:justify-end" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm lg:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col lg:rounded-l-3xl lg:overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={22} className="text-blue-600" /> سلتك ({cartCount})
                </h2>
                <div className="flex gap-2">
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="text-xs text-rose-500 font-bold px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center gap-1">
                      <Trash2 size={12} /> إفراغ
                    </button>
                  )}
                  <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length > 0 ? cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {CATEGORY_ICONS[item.category] ?? '💊'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-blue-600 font-black">{(item.price * item.quantity).toFixed(2)} ج.م</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-2 py-1 border border-slate-200 dark:border-white/5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-blue-600"><Minus size={13} /></button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-blue-600"><Plus size={13} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-400 font-bold">حذف</button>
                    </div>
                  </div>
                )) : (
                  <EmptyState icon={<ShoppingCart size={28} />} title="السلة فارغة" subtitle="ابحث عن دواء وأضفه للسلة" />
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-100 dark:border-white/5">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span className="font-bold">المجموع الفرعي</span>
                      <span className="font-black">{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span className="font-bold">التوصيل</span>
                      <span className="font-black text-emerald-600">{DELIVERY_FEE} ج.م</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                      <span className="font-black text-slate-900 dark:text-white">الإجمالي</span>
                      <span className="text-xl font-black text-blue-600">{(cartTotal + DELIVERY_FEE).toFixed(2)} ج.م</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    متابعة الدفع <ArrowRight size={18} className="rtl:rotate-180" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">إتمام الطلب</h2>
              <div className="space-y-3 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><MapPin size={18} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">التوصيل إلى</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">المنزل — شارع التحرير، الدقي</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><CreditCard size={18} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">طريقة الدفع</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{paymentMethod}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentMethod((p) => p.includes('كاش') ? 'بطاقة ائتمانية (Visa)' : 'كاش عند الاستلام')}
                    className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl font-black"
                  >
                    تغيير
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white">الإجمالي</span>
                  <span className="text-xl font-black text-blue-600">{(cartTotal + DELIVERY_FEE).toFixed(2)} ج.م</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm">إلغاء</button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {checkoutLoading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tracking */}
      <AnimatePresence>
        {isTrackingOpen && currentOrder && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTrackingOpen(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" /> تتبع الطلب
                </h2>
                <button onClick={() => setIsTrackingOpen(false)} className="p-2 text-slate-400"><X size={18} /></button>
              </div>
              <div className="flex flex-col items-center mb-7 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-5">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white mb-3 shadow-xl shadow-blue-600/30"
                >
                  <Navigation size={28} />
                </motion.div>
                <h3 className="font-black text-slate-800 dark:text-white">بانتظار تأكيد الصيدلية</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentOrder.orderId || currentOrder.id} • {currentOrder.date}</p>
              </div>
              <div className="space-y-5 relative before:absolute before:right-[11px] before:top-2 before:bottom-8 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5 mb-7">
                {[
                  { label: 'تم استلام الطلب', time: currentOrder.date, done: true },
                  { label: 'بانتظار تأكيد الصيدلية', time: 'الآن', done: true },
                  { label: 'جاري تجهيز الأدوية', time: 'قريباً', done: false },
                  { label: 'في الطريق إليك', time: '', done: false },
                ].map((step, i) => (
                  <div key={i} className={`relative pr-8 ${!step.done ? 'opacity-35' : ''}`}>
                    <div className={`absolute right-0 top-1 w-6 h-6 rounded-full border-[3px] z-10 flex items-center justify-center ${step.done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                      {step.done && <Check size={12} strokeWidth={3} />}
                    </div>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{step.label}</p>
                    {step.time && <p className="text-xs text-slate-400">{step.time}</p>}
                  </div>
                ))}
              </div>
              <button onClick={() => setIsTrackingOpen(false)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm">
                حسناً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
