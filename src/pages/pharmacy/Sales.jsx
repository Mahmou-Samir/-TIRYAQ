import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, Wallet,
  CreditCard, Banknote, Receipt, TrendingUp, Package, Loader2,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { usePharmacy, getSaleDisplayId } from '../../context/PharmacyContext';

const PAYMENT_ICONS = { cash: Banknote, card: CreditCard, wallet: Wallet };

export default function PharmacySales() {
  const { t, lang } = useSettings();
  const location = useLocation();
  const {
    medicines, todaySales, stats, recordSale, showToast, loadingMedicines, loadingSales,
  } = usePharmacy();

  const S = t?.pharmacy?.sales ?? {};
  const currency = t?.pharmacy?.dashboard?.currency || (lang === 'ar' ? 'ج.م' : 'EGP');
  const isRTL = lang === 'ar';

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState('cash');
  const [note, setNote] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const available = useMemo(() => {
    return medicines.filter((m) =>
      Number(m.stock) > 0 && (
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase()) ||
        m.sku?.toLowerCase().includes(search.toLowerCase())
      ),
    );
  }, [medicines, search]);

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [cart],
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === med.id);
      if (existing) {
        if (existing.quantity >= Number(med.stock)) return prev;
        return prev.map((i) =>
          i.medicineId === med.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, {
        medicineId: med.id,
        name: med.name,
        unitPrice: Number(med.price) || 0,
        quantity: 1,
        currentStock: Number(med.stock) || 0,
      }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => {
      if (i.medicineId !== id) return i;
      const next = Math.max(1, Math.min(i.currentStock, i.quantity + delta));
      return { ...i, quantity: next };
    }));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.medicineId !== id));

  useEffect(() => {
    const sellId = location.state?.sellId;
    if (!sellId || !medicines.length) return;
    const med = medicines.find((m) => m.id === sellId);
    if (med && Number(med.stock) > 0) {
      setCart([{
        medicineId: med.id,
        name: med.name,
        unitPrice: Number(med.price) || 0,
        quantity: 1,
        currentStock: Number(med.stock) || 0,
      }]);
    }
    window.history.replaceState({}, '');
  }, [location.state?.sellId, medicines]);

  const handleCheckout = async () => {
    if (!cart.length || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      await recordSale({ items: cart, paymentMethod: payment, type: 'walk_in', note });
      showToast(S.saleRecorded || 'Sale recorded', 'success');
      setCart([]);
      setNote('');
    } catch (err) {
      console.error(err);
      showToast(S.saleError || 'Error recording sale', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const statCards = [
    { label: S.todayRevenue, value: stats.todayRevenue, suffix: currency, icon: TrendingUp, bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600' },
    { label: S.todayTransactions, value: stats.todayCount, icon: Receipt, bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600' },
    { label: S.todayItems, value: stats.todayItems, icon: Package, bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-600' },
    { label: S.avgSale, value: stats.avgSale, suffix: currency, icon: Wallet, bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#0b1121] rounded-[1.75rem] p-5 border border-slate-100 dark:border-white/5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text} mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {c.value.toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                {c.suffix && <span className="text-sm text-slate-400 mr-1">{c.suffix}</span>}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* POS */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <ShoppingCart size={22} className="text-emerald-500" />
              {S.posTitle || 'Point of Sale'}
            </h2>
            <div className="relative mb-4">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={S.searchMedicine}
                className="w-full ps-11 pe-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none"
              />
            </div>
            {loadingMedicines ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {available.slice(0, 20).map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => addToCart(med)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all text-right"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 shrink-0">
                      <Plus size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-slate-800 dark:text-white truncate">{med.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{med.price} {currency} · {med.stock} {S.inStock}</p>
                    </div>
                  </button>
                ))}
                {!available.length && (
                  <p className="col-span-full text-center text-slate-400 py-8 font-medium">{S.noMedicines}</p>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 dark:text-white">{S.cart} ({cartCount})</h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs font-bold text-red-500">{S.clearCart}</button>
              )}
            </div>
            {!cart.length ? (
              <p className="text-center text-slate-400 py-8 text-sm font-medium">{S.emptyCart}</p>
            ) : (
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={item.medicineId} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-emerald-600 font-black">{item.unitPrice * item.quantity} {currency}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-white/5">
                      <button type="button" onClick={() => updateQty(item.medicineId, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><Minus size={14} /></button>
                      <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.medicineId, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><Plus size={14} /></button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.medicineId)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {['cash', 'card', 'wallet'].map((p) => {
                const Icon = PAYMENT_ICONS[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPayment(p)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                      payment === p
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon size={14} /> {S[p] || p}
                  </button>
                );
              })}
            </div>

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={S.notePh}
              className="w-full mb-4 py-3 px-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-emerald-500"
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
              <div>
                <p className="text-xs text-slate-400 font-bold">{S.total}</p>
                <p className="text-3xl font-black text-emerald-600">{cartTotal.toLocaleString()} <span className="text-base">{currency}</span></p>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!cart.length || checkoutLoading}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
              >
                {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : <><Receipt size={18} /> {S.completeSale}</>}
              </button>
            </div>
          </div>
        </div>

        {/* Today's sales log */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm sticky top-28">
            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Receipt size={20} className="text-emerald-500" />
              {S.todayLog}
            </h3>
            {loadingSales ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>
            ) : todaySales.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-sm font-medium">{S.noSalesToday}</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {todaySales.map((sale) => (
                  <div key={sale.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-emerald-600">{getSaleDisplayId(sale)}</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{sale.total} {currency}</span>
                    </div>
                    <ul className="space-y-1 mb-2">
                      {(sale.items || []).map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-500 font-medium flex justify-between">
                          <span className="truncate">{item.name}</span>
                          <span>x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{S[sale.paymentMethod] || sale.paymentMethod}</span>
                      <span>{sale.createdAt?.toDate?.()?.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
