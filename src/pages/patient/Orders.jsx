import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ShoppingBag, Truck, CheckCircle2, Clock, MapPin,
  Phone, Package, AlertCircle, X,
  Star, RefreshCw, Navigation, MessageSquare, Receipt,
  ChevronDown, Send, Headphones, Shield, Zap, Bell,
  ArrowRight, Filter, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_ACTIVE = [
  {
    id: '#8921',
    pharmacy: 'صيدلية العزبي',
    pharmacyBranch: 'المعادي',
    items: [
      { name: 'أنسولين لانتوس', qty: 2, price: 200 },
      { name: 'شريط قياس سكر', qty: 1, price: 50 },
    ],
    total: 450,
    date: 'اليوم، 10:30 ص',
    status: 'delivering',
    driver: { name: 'محمد أحمد', phone: '01012345678' },
    eta: '15 دقيقة',
    address: 'شارع 9، المعادي، القاهرة',
    timeline: [
      { label: 'تم تأكيد الطلب', time: '10:35 ص', done: true },
      { label: 'تجهيز الدواء', time: '10:45 ص', done: true },
      { label: 'جاري التوصيل', time: '11:00 ص', done: true, active: true },
      { label: 'تم التسليم', time: '—', done: false },
    ],
  },
  {
    id: '#8925',
    pharmacy: 'صيدلية سيف',
    pharmacyBranch: 'الدقي',
    items: [
      { name: 'بانادول إكسترا', qty: 1, price: 45 },
      { name: 'فيتامين C 1000', qty: 2, price: 37.5 },
    ],
    total: 120,
    date: 'اليوم، 11:00 ص',
    status: 'preparing',
    driver: null,
    eta: '45 دقيقة',
    address: 'شارع التحرير، الدقي، الجيزة',
    timeline: [
      { label: 'تم تأكيد الطلب', time: '11:05 ص', done: true },
      { label: 'تجهيز الدواء', time: '11:15 ص', done: true, active: true },
      { label: 'جاري التوصيل', time: '—', done: false },
      { label: 'تم التسليم', time: '—', done: false },
    ],
  },
];

const INITIAL_PAST = [
  {
    id: '#8801',
    pharmacy: 'صيدلية مصر',
    pharmacyBranch: 'وسط البلد',
    items: [{ name: 'أوجمنتين 1 جم', qty: 1, price: 85 }],
    total: 85,
    date: '10 أكتوبر 2025',
    status: 'completed',
    rating: 5,
  },
  {
    id: '#8756',
    pharmacy: 'صيدلية رامي',
    pharmacyBranch: 'مدينة نصر',
    items: [
      { name: 'كونكور 5 ملج', qty: 2, price: 62 },
      { name: 'أسبرين 100 ملج', qty: 1, price: 18 },
    ],
    total: 142,
    date: '2 أكتوبر 2025',
    status: 'completed',
    rating: 4,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  delivering: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
    label: 'جاري التوصيل',
    dot: 'bg-blue-500',
    Icon: Truck,
  },
  preparing: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    label: 'جاري التجهيز',
    dot: 'bg-amber-500',
    Icon: Package,
  },
  completed: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    label: 'تم التوصيل',
    dot: 'bg-emerald-500',
    Icon: CheckCircle2,
  },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-slate-800 text-white dark:bg-white dark:text-slate-900',
  };
  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    info: <Bell size={16} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 30, x: '-50%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`fixed bottom-28 left-1/2 z-[300] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold max-w-[85vw] ${colors[type] || colors.info}`}
    >
      {icons[type] || icons.info}
      <span>{message}</span>
    </motion.div>
  );
};

// ─── Live Map Modal ───────────────────────────────────────────────────────────
const MapModal = ({ order, onClose }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const progressRef = useRef(0.3);

  // Animated driver dot on canvas "map"
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Route points (fake path)
    const route = [
      { x: W * 0.15, y: H * 0.8 },
      { x: W * 0.3, y: H * 0.6 },
      { x: W * 0.45, y: H * 0.55 },
      { x: W * 0.6, y: H * 0.4 },
      { x: W * 0.75, y: H * 0.35 },
      { x: W * 0.85, y: H * 0.25 },
    ];

    const getPoint = (t) => {
      const seg = (route.length - 1) * t;
      const i = Math.min(Math.floor(seg), route.length - 2);
      const f = seg - i;
      return {
        x: route[i].x + (route[i + 1].x - route[i].x) * f,
        y: route[i].y + (route[i + 1].y - route[i].y) * f,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(100,116,139,0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Road lines
      const roads = [
        [{ x: 0, y: H * 0.5 }, { x: W, y: H * 0.5 }],
        [{ x: W * 0.5, y: 0 }, { x: W * 0.5, y: H }],
        [{ x: 0, y: H * 0.25 }, { x: W, y: H * 0.75 }],
      ];
      roads.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(148,163,184,0.25)';
        ctx.lineWidth = 6;
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });

      // Dashed route
      ctx.beginPath();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 2.5;
      route.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);

      // Destination pin
      const dest = route[route.length - 1];
      ctx.beginPath();
      ctx.arc(dest.x, dest.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239,68,68,0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dest.x, dest.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Driver dot
      const p = getPoint(progressRef.current);
      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 24);
      grad.addColorStop(0, 'rgba(59,130,246,0.5)');
      grad.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Advance
      progressRef.current += 0.0008;
      if (progressRef.current > 0.95) progressRef.current = 0.3;

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Map Canvas */}
        <div className="relative bg-slate-100 dark:bg-slate-800">
          <canvas
            ref={canvasRef}
            width={448}
            height={220}
            className="w-full"
            style={{ display: 'block' }}
          />
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow"
          >
            <X size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          {/* Driver badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold text-slate-800 dark:text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            الكابتن {order.driver?.name}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">وقت الوصول المتوقع</p>
              <p className="text-2xl font-black text-blue-600 flex items-center gap-2">
                {order.eta}
                <Clock size={18} className="text-blue-400" />
              </p>
            </div>
            <a
              href={`tel:${order.driver?.phone || '#'}`}
              className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 active:scale-90 transition-transform"
            >
              <Phone size={20} />
            </a>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
            <MapPin size={18} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">وجهة التوصيل</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{order.address}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Support Chat Modal ───────────────────────────────────────────────────────
const SupportModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'agent', text: 'أهلاً! أنا مساعدك في صيدلتي. كيف يمكنني مساعدتك؟' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const REPLIES = [
    'سيتم التحقق من طلبك فوراً، شكراً لصبرك.',
    'هل يمكنك مشاركة رقم الطلب لمزيد من التفاصيل؟',
    'نعتذر عن أي تأخير، نعمل على حل المشكلة.',
    'تم رفع طلبك للقسم المختص وسيتواصلون معك قريباً.',
  ];
  const replyIdx = useRef(0);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { from: 'agent', text: REPLIES[replyIdx.current % REPLIES.length] },
      ]);
      replyIdx.current++;
    }, 1400);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-[70vh] bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <Headphones size={18} />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">دعم العملاء</p>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                متصل الآن
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-tr-sm'
                    : 'bg-blue-600 text-white rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
              <div className="bg-blue-600/20 px-4 py-3 rounded-2xl flex gap-1.5 items-center">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-2 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          <button
            onClick={send}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl active:scale-90 transition-transform shadow-lg shadow-blue-600/25"
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Rating Stars ─────────────────────────────────────────────────────────────
const RatingStars = ({ value, onChange, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <motion.button
        key={s}
        whileTap={!readOnly ? { scale: 1.3 } : {}}
        onClick={() => !readOnly && onChange?.(s)}
        disabled={readOnly}
        className="transition-transform"
      >
        <Star
          size={20}
          className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
          strokeWidth={1.5}
        />
      </motion.button>
    ))}
  </div>
);

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, isActive, onTrack, onReorder, onRate, showToast, onSupport }) => {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_MAP[order.status] || STATUS_MAP.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28 }}
      className={`bg-white dark:bg-slate-900 rounded-[2rem] border overflow-hidden shadow-sm transition-shadow duration-300 ${
        expanded ? 'border-blue-500/20 shadow-lg shadow-blue-500/5' : 'border-slate-100 dark:border-white/5'
      }`}
    >
      {/* Card Header */}
      <button
        className="w-full text-right p-5 flex gap-4 items-start"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Icon */}
        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${s.bg} ${
          order.status === 'delivering' ? 'animate-pulse' : ''
        }`}>
          <s.Icon size={22} className={s.text} strokeWidth={1.5} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-black text-slate-900 dark:text-white text-[15px] leading-tight">{order.pharmacy}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{order.pharmacyBranch} · {order.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-slate-900 dark:text-white">{order.total} <span className="text-xs font-bold text-slate-400">ج.م</span></p>
              {order.status === 'delivering' && (
                <p className="text-[10px] text-emerald-500 font-black flex items-center gap-1 justify-end mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  يصل خلال {order.eta}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${s.bg} ${s.text} ${s.border}`}>
              {s.label}
            </span>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {order.id}
            </span>
          </div>

          {/* Collapsed items */}
          {!expanded && (
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto">
              {order.items.map((item, i) => (
                <span key={i} className="shrink-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {item.qty}× {item.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} className="shrink-0 mt-1">
          <ChevronDown size={18} className="text-slate-400" />
        </motion.div>
      </button>

      {/* Expanded Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-50 dark:border-white/5 space-y-4">

              {/* Invoice */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Receipt size={12} /> تفاصيل الفاتورة
                </p>
                <div className="space-y-2.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-1.5 py-0.5 rounded">
                          {item.qty}×
                        </span>
                        {item.name}
                      </p>
                      <p className="font-black text-slate-900 dark:text-white">{item.price * item.qty} ج.م</p>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <span className="text-xs font-black text-slate-500">الإجمالي</span>
                    <span className="text-sm font-black text-blue-600">{order.total} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Timeline (active only) */}
              {isActive && (
                <div className="pr-4 border-r-2 border-slate-100 dark:border-slate-800 mr-1 space-y-4">
                  {order.timeline.map((step, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -right-[21px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 transition-colors ${
                        step.done ? (step.active ? 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                      <p className={`text-xs font-black ${step.active ? 'text-blue-600' : step.done ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{step.time}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating (past only) */}
              {!isActive && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-2">تقييمك للطلب</p>
                    <RatingStars value={order.rating || 0} onChange={(r) => onRate(order.id, r)} />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">{order.rating || 0}</span>
                    <span className="text-slate-400 text-sm font-bold">/5</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {isActive ? (
                  <>
                    <button
                      onClick={() => onTrack(order)}
                      className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                    >
                      <Navigation size={16} />
                      تتبع السائق
                    </button>
                    <button
                      onClick={() => onSupport(order)}
                      className="w-14 h-14 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl active:scale-95 transition-transform"
                    >
                      <MessageSquare size={20} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onReorder(order)}
                    className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-600/20"
                  >
                    <RefreshCw size={16} />
                    إعادة الطلب
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom pill */}
      <motion.div
        animate={{ backgroundColor: expanded ? '#3b82f6' : '#e2e8f0' }}
        className="mx-auto mb-2 mt-1 rounded-full"
        style={{ width: expanded ? 40 : 24, height: 4 }}
      />
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Orders() {
  const [tab, setTab] = useState('active');
  const [activeOrders, setActiveOrders] = useState(INITIAL_ACTIVE);
  const [pastOrders, setPastOrders] = useState(INITIAL_PAST);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [supportOrder, setSupportOrder] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToastQueue((q) => [...q, { id, message, type }]);
    setTimeout(() => setToastQueue((q) => q.filter((t) => t.id !== id)), 3400);
  }, []);

  const handleTrack = (order) => {
    if (order.status !== 'delivering') {
      showToast('الطلب لا يزال قيد التجهيز بالصيدلية', 'info');
      return;
    }
    setTrackingOrder(order);
  };

  const handleReorder = (order) => {
    setCartCount((c) => c + order.items.length);
    showToast(`✓ تمت إضافة ${order.items.length} أصناف من ${order.pharmacy} للسلة`, 'success');
  };

  const handleRate = (orderId, rating) => {
    setPastOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating } : o))
    );
    showToast(`تم حفظ تقييمك: ${'⭐'.repeat(rating)}`, 'success');
  };

  // Filter / search
  const filterOrders = (orders) => {
    let list = orders;
    if (filter !== 'all') list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.pharmacy.includes(q) ||
          o.id.includes(q) ||
          o.items.some((i) => i.name.includes(q))
      );
    }
    return list;
  };

  const currentOrders = filterOrders(tab === 'active' ? activeOrders : pastOrders);

  const FILTERS = tab === 'active'
    ? [{ key: 'all', label: 'الكل' }, { key: 'delivering', label: 'يوصّل' }, { key: 'preparing', label: 'يتجهز' }]
    : [{ key: 'all', label: 'الكل' }, { key: 'completed', label: 'منتهي' }];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-32 pt-6" dir="rtl">

      {/* Toasts */}
      <div className="fixed bottom-28 left-1/2 z-[300] flex flex-col gap-2" style={{ transform: 'translateX(-50%)' }}>
        <AnimatePresence>
          {toastQueue.slice(-1).map((t) => (
            <Toast key={t.id} {...t} onDone={() => {}} />
          ))}
        </AnimatePresence>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {trackingOrder && <MapModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {supportOrder && <SupportModal onClose={() => setSupportOrder(null)} />}
      </AnimatePresence>

      <div className="px-5 max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">طلباتي</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {activeOrders.length} طلب نشط
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cart Badge */}
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => showToast(`السلة: ${cartCount} أصناف`, 'info')}
                  className="relative w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm text-blue-600"
                >
                  <ShoppingBag size={18} />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch((v) => !v)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border shadow-sm transition-colors ${
                showSearch
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-400'
              }`}
            >
              <Search size={18} />
            </button>

            {/* Refresh */}
            <motion.button
              whileTap={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              onClick={() => showToast('تم تحديث الطلبات', 'success')}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm text-slate-400"
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="relative">
                <Search size={16} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في طلباتك..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl pr-10 pl-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="relative bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex">
          <motion.div
            className="absolute top-1.5 bottom-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-0"
            animate={{ right: tab === 'active' ? '6px' : '50%', left: tab === 'active' ? '50%' : '6px' }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
          {[
            { key: 'active', label: 'الطلبات الحالية', count: activeOrders.length },
            { key: 'history', label: 'السجل', count: pastOrders.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFilter('all'); }}
              className={`flex-1 py-3 text-sm font-black text-center relative z-10 flex items-center justify-center gap-2 transition-colors ${
                tab === t.key ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md transition-colors ${
                tab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats Bar (active tab) */}
        {tab === 'active' && activeOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { icon: Truck, label: 'يوصّل', count: activeOrders.filter(o=>o.status==='delivering').length, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
              { icon: Package, label: 'يتجهز', count: activeOrders.filter(o=>o.status==='preparing').length, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
              { icon: Zap, label: 'إجمالي', count: activeOrders.reduce((s,o)=>s+o.total, 0) + ' ج.م', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} p-3.5 rounded-2xl`}>
                <stat.icon size={16} className={stat.color.split(' ')[0]} strokeWidth={2} />
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.count}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Orders List */}
        <AnimatePresence mode="popLayout">
          {currentOrders.length > 0 ? (
            <div className="space-y-4">
              {currentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isActive={tab === 'active'}
                  onTrack={handleTrack}
                  onReorder={handleReorder}
                  onRate={handleRate}
                  showToast={showToast}
                  onSupport={setSupportOrder}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5">
                <ShoppingBag size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">لا توجد طلبات</h3>
              <p className="text-sm text-slate-400 mt-1.5 font-medium">
                {search ? 'جرّب كلمة بحث مختلفة' : 'ابدأ بطلب أدويتك الآن'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pb-2">
          <Shield size={12} />
          جميع طلباتك محمية ومشفرة بالكامل
        </div>
      </div>

      {/* Floating Support Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSupportOrder(true)}
        className="fixed bottom-32 left-5 w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-blue-600 z-40"
      >
        <MessageSquare size={22} strokeWidth={2} />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
      </motion.button>
    </div>
  );
}