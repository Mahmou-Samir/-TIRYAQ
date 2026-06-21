import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, ShoppingBag, Wallet, Download, Receipt, Calendar,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { usePharmacy, getSaleDisplayId } from '../../context/PharmacyContext';

const StatBox = ({ icon: Icon, label, value, suffix, bg, text }) => (
  <div className="bg-white dark:bg-[#0b1121] rounded-[1.75rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${text} mb-4`}>
      <Icon size={22} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-800 dark:text-white">
      {value.toLocaleString()}
      {suffix && <span className="text-base text-slate-400 mr-1">{suffix}</span>}
    </p>
  </div>
);

export default function PharmacyReports() {
  const { t, lang } = useSettings();
  const { stats, sales, orders } = usePharmacy();
  const R = t?.pharmacy?.reports ?? {};
  const currency = t?.pharmacy?.dashboard?.currency || (lang === 'ar' ? 'ج.م' : 'EGP');
  const isRTL = lang === 'ar';

  const completedOnline = useMemo(
    () => orders.filter((o) => o.status === 'completed').length,
    [orders],
  );

  const recentSales = sales.slice(0, 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 relative z-10">
          <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-xl text-violet-600">
            <BarChart2 size={28} />
          </div>
          {R.title || 'Reports'}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-2 relative z-10">{R.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={Wallet} label={R.todaySales} value={stats.todayRevenue} suffix={currency}
          bg="bg-emerald-100 dark:bg-emerald-500/20" text="text-emerald-600" />
        <StatBox icon={TrendingUp} label={R.weekSales} value={stats.weekRevenue} suffix={currency}
          bg="bg-blue-100 dark:bg-blue-500/20" text="text-blue-600" />
        <StatBox icon={Calendar} label={R.monthSales || R.weekSales} value={stats.monthRevenue} suffix={currency}
          bg="bg-violet-100 dark:bg-violet-500/20" text="text-violet-600" />
        <StatBox icon={ShoppingBag} label={R.completedOrders} value={completedOnline + sales.length}
          bg="bg-amber-100 dark:bg-amber-500/20" text="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
            <Receipt size={20} className="text-emerald-500" />
            <h3 className="font-black text-slate-800 dark:text-white">{R.salesLog || 'Sales Log'}</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-white/5 max-h-[480px] overflow-y-auto">
            {recentSales.length === 0 ? (
              <p className="text-center text-slate-400 py-16 font-medium">{R.noSales || 'No sales yet'}</p>
            ) : recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <div>
                  <p className="font-black text-sm text-emerald-600">{getSaleDisplayId(sale)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(sale.items || []).map((i) => i.name).slice(0, 2).join(' · ')}
                    {(sale.items?.length || 0) > 2 ? '...' : ''}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white">{sale.total} {currency}</p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {sale.createdAt?.toDate?.()?.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-6 text-white">
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{R.totalRevenue || 'Total Revenue'}</p>
            <p className="text-4xl font-black mt-2">{stats.totalRevenue.toLocaleString()} <span className="text-lg opacity-80">{currency}</span></p>
            <p className="text-sm opacity-70 mt-3">{R.avgOrder}: {stats.avgSale} {currency}</p>
          </div>
          <div className="bg-white dark:bg-[#0b1121] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6">
            <h3 className="font-black text-slate-800 dark:text-white mb-2">{R.export}</h3>
            <p className="text-sm text-slate-400 mb-4">{R.comingSoon}</p>
            <button disabled className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed">
              <Download size={18} /> {R.export}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
