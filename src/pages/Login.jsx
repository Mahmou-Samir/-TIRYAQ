import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 👇 Firebase
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } catch (err) {
      console.error(err.code);
      // 🟢 ترجمة أخطاء Firebase للمستخدم
      switch (err.code) {
        case 'auth/invalid-email':
          setError('صيغة البريد الإلكتروني غير صحيحة');
          break;
        case 'auth/user-not-found':
          setError('هذا الحساب غير مسجل في النظام');
          break;
        case 'auth/wrong-password':
          setError('كلمة المرور غير صحيحة');
          break;
        case 'auth/too-many-requests':
          setError('تم تعليق الحساب مؤقتاً لمحاولات دخول كثيرة');
          break;
        default:
          setError('حدث خطأ غير متوقع، حاول مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans" dir="rtl">
      
      {/* 🟢 الخلفية الديكورية (Animated Background Blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-800/50 rounded-full opacity-30"></div>
      
      {/* Container */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in mx-4">
        
        {/* اللوجو */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/10 group">
            <Activity className="text-blue-500 group-hover:scale-110 transition-transform duration-300" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ترياق</h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase font-medium">Medical Command System</p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0" /> {error}
          </div>
        )}

        {/* الفورم */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-bold mr-1">البريد الحكومي</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pr-12 pl-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="admin@health.gov.eg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <label className="text-slate-300 text-sm font-bold mr-1">كلمة المرور</label>
               <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">نسيت كلمة المرور؟</a>
            </div>
            <div className="relative group">
              <Lock className="absolute right-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pr-12 pl-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>تسجيل الدخول <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-slate-500 text-xs">
            نظام ترياق للأمن الدوائي - جميع الحقوق محفوظة © 2026
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;