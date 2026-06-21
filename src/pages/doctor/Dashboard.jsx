import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, MessageSquare, Star, Users, Clock,
  ChevronRight, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useDoctor } from '../../context/DoctorContext';
import { getConsultDisplayId } from '../../context/DoctorContext';

export default function DoctorDashboard() {
  const { t, lang } = useSettings();
  const navigate = useNavigate();
  const { stats, profile, profileComplete, consultations, loadingConsultations } = useDoctor();
  const D = t?.doctor?.dashboard ?? {};
  const isRTL = lang === 'ar';

  const recent = consultations.slice(0, 5);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {!profileComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <AlertCircle className="text-amber-600 shrink-0" size={28} />
          <div className="flex-1">
            <p className="font-black text-amber-900 dark:text-amber-200">{D.completeProfile || 'أكمل ملفك الطبي'}</p>
            <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-1">
              {D.completeProfileDesc || 'بعد نشر ملفك سيظهر للمرضى — الأطباء الأكثر تقييماً يظهرون أولاً'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/doctor/profile')}
            className="shrink-0 px-5 py-2.5 bg-amber-600 text-white rounded-xl font-black text-sm hover:bg-amber-700 transition-all"
          >
            {D.goProfile || 'إنشاء الملف'}
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-600 via-emerald-700 to-cyan-800 p-6 lg:p-10 text-white shadow-xl"
      >
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 lg:flex lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Stethoscope size={14} /> {D.badge || 'بوابة الطبيب'}
            </p>
            <h1 className="text-2xl lg:text-3xl font-black leading-tight mb-2">
              {profile?.name || D.welcome || 'مرحباً دكتور'}
            </h1>
            <p className="text-emerald-100/90 text-sm font-medium max-w-lg">
              {profileComplete
                ? (D.profileLive || 'ملفك منشور — المرضى يمكنهم رؤيتك والاستشارة')
                : (D.setupHint || 'أكمل ملفك لتظهر في قائمة الأطباء للمرضى')}
            </p>
            {profile?.verified && (
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-black bg-white/20 px-3 py-1 rounded-full">
                <ShieldCheck size={14} /> {D.verified || 'طبيب معتمد'}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: MessageSquare, label: D.pending || 'استشارات معلقة', val: stats.pending, color: 'teal' },
          { icon: Users, label: D.totalConsults || 'إجمالي الاستشارات', val: stats.total, color: 'cyan' },
          { icon: Star, label: D.rating || 'التقييم', val: stats.rating.toFixed(1), color: 'amber' },
          { icon: Clock, label: D.reviews || 'عدد التقييمات', val: stats.reviews, color: 'emerald' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm">
            <s.icon size={22} className={`text-${s.color}-500 mb-3`} />
            <p className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="font-black text-slate-900 dark:text-white">{D.recentConsults || 'آخر الاستشارات'}</h2>
          <button
            type="button"
            onClick={() => navigate('/doctor/consultations')}
            className="text-teal-600 text-sm font-black flex items-center gap-1 hover:underline"
          >
            {D.viewAll || 'عرض الكل'} <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
          </button>
        </div>
        {loadingConsultations ? (
          <p className="p-8 text-center text-slate-400 font-bold">{D.loading || 'جاري التحميل...'}</p>
        ) : recent.length === 0 ? (
          <p className="p-8 text-center text-slate-400 font-bold">{D.noConsults || 'لا توجد استشارات بعد'}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {recent.map((c) => (
              <li key={c.id} className="p-5 lg:px-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-black text-sm shrink-0">
                  {(c.patientName || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-slate-900 dark:text-white truncate">{c.patientName}</p>
                  <p className="text-xs text-slate-400 truncate">{c.symptoms}</p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                  c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.status === 'pending' ? (D.statusPending || 'معلق') : (D.statusReplied || 'تم الرد')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold hidden sm:block">{getConsultDisplayId(c)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
