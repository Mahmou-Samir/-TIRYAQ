import React, { useState, useEffect } from 'react';
import { Activity, Lock, Mail, ArrowRight, Loader2, AlertCircle, UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(null);

  // تأثير 3D للبطاقة عند حركة الماوس
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // زاوية الميل (أقصى يمين/يسار)
    const y = (clientY / innerHeight - 0.5) * -20; // زاوية الميل (أعلى/أسفل)
    setMousePosition({ x, y });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'pharmacy') navigate('/pharmacy');
        else if (role === 'doctor') navigate('/doctor');
        else navigate('/patient');
      } else {
        setError("بيانات الحساب غير مكتملة. يرجى التواصل مع الدعم الفني.");
      }
    } catch (err) {
      console.error("Login Error:", err.code);
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          break;
        case 'auth/too-many-requests':
          setError('تم حظر الدخول مؤقتاً. حاول لاحقاً.');
          break;
        default:
          setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- إعدادات الأنيميشن ---
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 24 } } };
  const shake = { shake: { x: [0, -10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } } };

  return (
    <div
      className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans perspective-1000"
      dir="rtl"
      onMouseMove={handleMouseMove}
    >

      {/* 🌌 Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      {/* Floating Animated Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], x: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-600/30 to-purple-600/30 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-emerald-600/20 to-teal-600/20 blur-[120px] rounded-full pointer-events-none"
      />

      {/* 🛸 Main 3D Card Container */}
      <motion.div
        animate={{ rotateX: mousePosition.y, rotateY: mousePosition.x }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full max-w-[460px] relative z-10"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2.8rem] blur-xl opacity-20"></div>

        <motion.div
          variants={containerVariants} initial="hidden" animate="show"
          className="bg-[#0b1121]/80 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          style={{ transform: "translateZ(30px)" }} // Pop-out effect
        >

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">
              <Sparkles size={12} /> نظام آمن
            </div>
            <div onClick={() => navigate('/')} className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[1.2rem] flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-pointer group hover:scale-105 transition-transform">
              <Activity className="text-white group-hover:scale-110 transition-transform duration-300" size={36} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">مرحباً بعودتك</h1>
            <p className="text-slate-400 font-medium text-sm">أدخل بياناتك للوصول لمنصة ترياق.</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                variants={shake} initial="hidden" animate="shake" exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-8 flex items-start gap-3 text-sm font-bold shadow-inner overflow-hidden"
              >
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-2 relative">
              <label className="text-slate-300 text-xs font-black tracking-widest uppercase ml-1">البريد الإلكتروني</label>
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-2xl transition-all duration-500 ${isFocused === 'email' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 blur opacity-50' : 'opacity-0'}`}></div>
                <div className="relative flex items-center bg-[#020617] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                  <div className="pl-3 pr-4 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email" required autoComplete="email"
                    onFocus={() => setIsFocused('email')} onBlur={() => setIsFocused(null)}
                    className="w-full bg-transparent py-4 pl-4 text-white placeholder:text-slate-600 outline-none font-bold"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 text-xs font-black tracking-widest uppercase ml-1">كلمة المرور</label>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold outline-none">
                  نسيت الباسورد؟
                </Link>
              </div>
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-2xl transition-all duration-500 ${isFocused === 'password' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 blur opacity-50' : 'opacity-0'}`}></div>
                <div className="relative flex items-center bg-[#020617] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                  <div className="pl-3 pr-4 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"} required autoComplete="current-password"
                    onFocus={() => setIsFocused('password')} onBlur={() => setIsFocused(null)}
                    className="w-full bg-transparent py-4 pl-12 text-white placeholder:text-slate-600 outline-none font-bold tracking-widest"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 p-1.5 text-slate-500 hover:text-white transition-colors outline-none rounded-lg hover:bg-white/5"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <button
                disabled={isLoading}
                className="relative w-full overflow-hidden rounded-2xl font-black text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group border border-white/10"
              >
                {/* Fluid Gradient Background */}
                <div className="absolute inset-0 bg-[linear-gradient(110deg,#2563eb,#4f46e5,#2563eb)] bg-[length:200%_auto] animate-gradient transition-all duration-500 group-hover:bg-[position:right_center]"></div>

                <div className="relative py-4 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <ArrowRight size={20} className="group-hover:-translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-slate-400 text-sm font-medium mb-4">ليس لديك حساب على النظام؟</p>
            <Link to="/register" className="group relative w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all active:scale-[0.98]">
              <UserPlus size={18} className="text-slate-400 group-hover:text-white transition-colors" /> إنشاء حساب جديد
            </Link>
          </motion.div>

        </motion.div>
      </motion.div>

    </div>
  );
};

export default Login;