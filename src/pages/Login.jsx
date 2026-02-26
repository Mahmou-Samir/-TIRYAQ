import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
      // 1. تسجيل الدخول
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. جلب بيانات المستخدم من Firestore لتحديد الدور
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const role = data.role;

        // 3. التوجيه حسب الصلاحية
        if (role === 'admin') navigate('/admin');
        else if (role === 'pharmacy') navigate('/pharmacy');
        else navigate('/patient'); // التوجيه الافتراضي
      } else {
        // حالة نادرة: الحساب موجود في Auth لكن ليس له بيانات في Firestore
        setError("بيانات الحساب غير مكتملة. يرجى التواصل مع الدعم الفني.");
        // يمكن هنا إنشاء مستند جديد تلقائياً كإجراء تصحيحي (اختياري)
      }

    } catch (err) {
      console.error("Login Error:", err.code);
      
      // 🟢 ترجمة الأخطاء للمستخدم
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          break;
        case 'auth/too-many-requests':
          setError('تم حظر الدخول مؤقتاً بسبب كثرة المحاولات الفاشلة. حاول لاحقاً.');
          break;
        case 'auth/user-disabled':
          setError('تم تعطيل هذا الحساب من قبل الإدارة.');
          break;
        case 'auth/network-request-failed':
          setError('فشل الاتصال بالإنترنت.');
          break;
        default:
          setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      
      {/* 🟢 الخلفية الديكورية (مطابقة لصفحة التسجيل) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      {/* Container */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-in">
        
        {/* اللوجو */}
        <div className="text-center mb-8">
          <div onClick={() => navigate('/')} className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/10 group cursor-pointer hover:scale-105 transition-transform">
            <Activity className="text-white group-hover:scale-110 transition-transform duration-300" size={40} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">مرحباً بعودتك</h1>
          <p className="text-slate-400 text-sm font-medium">سجل دخولك للمتابعة إلى نظام ترياق</p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm animate-pulse">
            <AlertCircle size={20} className="shrink-0" /> {error}
          </div>
        )}

        {/* الفورم */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-slate-300 text-xs font-bold mr-1">البريد الإلكتروني</label>
            <div className="relative group">
              <Mail className="absolute right-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3.5 pr-12 pl-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <label className="text-slate-300 text-xs font-bold mr-1">كلمة المرور</label>
               <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold">نسيت كلمة المرور؟</button>
            </div>
            <div className="relative group">
              <Lock className="absolute right-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3.5 pr-12 pl-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>تسجيل الدخول <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /></>}
          </button>
        </form>

        {/* الفوتر: رابط التسجيل */}
        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-slate-400 text-sm mb-4">ليس لديك حساب؟</p>
          <Link to="/register" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600">
            <UserPlus size={18} /> إنشاء حساب جديد
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;