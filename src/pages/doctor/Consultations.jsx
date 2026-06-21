import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, Send, X, Clock, User } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useDoctor, getConsultDisplayId } from '../../context/DoctorContext';
import { updateConsultationStatus } from '../../utils/doctorService';

export default function DoctorConsultations() {
  const { lang, t } = useSettings();
  const { consultations, loadingConsultations, showToast } = useDoctor();
  const C = t?.doctor?.consultations ?? {};
  const isRTL = lang === 'ar';

  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = consultations.filter((c) => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'replied') return c.status === 'replied';
    return true;
  });

  const openConsult = (c) => {
    setSelected(c);
    setReply(c.reply || '');
  };

  const handleReply = async () => {
    if (!reply.trim() || reply.trim().length < 5) {
      showToast(C.replyMin || 'اكتب رداً أوضح (5 أحرف على الأقل)', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await updateConsultationStatus(selected.id, 'replied', reply.trim());
      showToast(C.replySent || 'تم إرسال الرد للمريض ✓', 'success');
      setSelected(null);
      setReply('');
    } catch {
      showToast(C.replyError || 'فشل إرسال الرد', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = (type) => {
    const map = { chat: C.chat || 'محادثة', video: C.video || 'فيديو', phone: C.phone || 'مكالمة' };
    return map[type] || type;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: C.all || 'الكل' },
          { id: 'pending', label: C.pending || 'معلق' },
          { id: 'replied', label: C.replied || 'تم الرد' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
              filter === f.id ? 'bg-teal-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loadingConsultations ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" size={40} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="font-black text-slate-500">{C.empty || 'لا توجد استشارات'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => openConsult(c)}
              className="text-start bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 p-5 hover:border-teal-200 dark:hover:border-teal-900/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{c.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{getConsultDisplayId(c)} · {typeLabel(c.consultType)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                  c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.status === 'pending' ? (C.statusPending || 'معلق') : (C.statusReplied || 'تم الرد')}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{c.symptoms}</p>
              {c.fee > 0 && (
                <p className="text-xs text-teal-600 font-black mt-2">{c.fee} {C.currency || 'ج.م'}</p>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-0 lg:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="relative w-full lg:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl max-h-[92vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 shrink-0 flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-teal-600 mb-1">{C.consultFrom || 'استشارة من'}</p>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{selected.patientName}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock size={12} /> {typeLabel(selected.consultType)}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{C.symptoms || 'الأعراض'}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">{selected.symptoms}</p>
                </div>
                {selected.reply && selected.status === 'replied' && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 border border-teal-100 dark:border-teal-800">
                    <p className="text-[10px] font-black text-teal-600 uppercase mb-2">{C.yourReply || 'ردك السابق'}</p>
                    <p className="text-sm font-medium">{selected.reply}</p>
                  </div>
                )}
                {selected.status === 'pending' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{C.replyLabel || 'ردك الطبي'}</label>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={5}
                      placeholder={C.replyPh || 'اكتب تشخيصك الأولي ونصائحك...'}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-medium outline-none border-2 border-transparent focus:border-teal-500 resize-none"
                    />
                  </div>
                )}
              </div>
              {selected.status === 'pending' && (
                <div className="p-6 border-t border-slate-100 dark:border-white/5 shrink-0">
                  <button
                    type="button"
                    onClick={handleReply}
                    disabled={submitting}
                    className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> {C.sendReply || 'إرسال الرد'}</>}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
