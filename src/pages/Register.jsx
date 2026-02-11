import React, { useState } from 'react';
import { 
  User, Building2, Mail, Lock, Phone, FileText, MapPin, 
  ArrowRight, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient'); // 'patient' or 'pharmacy'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // بيانات الفورم
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    licenseNumber: '', address: '', governorate: 'Cairo'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. إنشاء الحساب في Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. تحديث البروفايل
      await updateProfile(user, { displayName: formData.name });

      // 3. حفظ البيانات الإضافية في Firestore حسب نوع المستخدم
      const userData = {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: userType, // 🟢 هنا بنحدد الدور (مريض/صيدلية)
        createdAt: serverTimestamp(),
        // بيانات خاصة بالصيدلية فقط
        ...(userType === 'pharmacy' && {
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          governorate: formData.governorate,
          verified: false // الصيدلية تحتاج تفعيل من الأدمن
        })
      };

      await setDoc(doc(db, "users", user.uid), userData);

      // 4. التوجيه
      localStorage.setItem('userRole', userType); // حفظ الدور مؤقتاً
      if (userType === 'patient') navigate('/patient/home');
      else navigate('/pharmacy/dashboard');

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('هذا البريد مسجل بالفعل');
      else if (err.code === 'auth/weak-password') setError('كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)');
      else setError('حدث خطأ أثناء التسجيل، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      
      {/* خلفية جمالية */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row">
        
        {/* الجانب الأيمن: القائمة */}
        <div className="w-full md:w-1/3 bg-slate-800/50 p-6 flex flex-col justify-center border-l border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">انضم إلينا</h2>
          <div className="space-y-4">
            <button 
              onClick={() => setUserType('patient')}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                userType === 'patient' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <User size={24} />
              <div className="text-right">
                <p className="font-bold text-sm">حساب مريض</p>
                <p className="text-[10px] opacity-70">للبحث عن الأدوية</p>
              </div>
            </button>

            <button 
              onClick={() => setUserType('pharmacy')}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                userType === 'pharmacy' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Building2 size={24} />
              <div className="text-right">
                <p className="font-bold text-sm">حساب صيدلية</p>
                <p className="text-[10px] opacity-70">لإدارة المخزون</p>
              </div>
            </button>
          </div>
        </div>

        {/* الجانب الأيسر: الفورم */}
        <div className="flex-1 p-8">
          <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            {userType === 'patient' ? <span className="text-blue-500">تسجيل مريض جديد</span> : <span className="text-purple-500">تسجيل منشأة طبية</span>}
          </h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* الحقول المشتركة */}
            <div className="relative">
              <User className="absolute right-3 top-3.5 text-slate-500" size={18} />
              <input required name="name" onChange={handleChange} type="text" placeholder={userType === 'patient' ? "الاسم الثلاثي" : "اسم الصيدلية"} 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="relative">
              <Mail className="absolute right-3 top-3.5 text-slate-500" size={18} />
              <input required name="email" onChange={handleChange} type="email" placeholder="البريد الإلكتروني" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 text-slate-500" size={18} />
                <input required name="password" onChange={handleChange} type="password" placeholder="كلمة المرور" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="relative">
                <Phone className="absolute right-3 top-3.5 text-slate-500" size={18} />
                <input required name="phone" onChange={handleChange} type="tel" placeholder="رقم الهاتف" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            {/* حقول خاصة بالصيدلية فقط */}
            {userType === 'pharmacy' && (
              <div className="space-y-4 animate-fade-in pt-2 border-t border-slate-800 mt-2">
                <div className="relative">
                  <FileText className="absolute right-3 top-3.5 text-slate-500" size={18} />
                  <input required name="licenseNumber" onChange={handleChange} type="text" placeholder="رقم الترخيص / السجل التجاري" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-purple-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="relative">
                      <MapPin className="absolute right-3 top-3.5 text-slate-500" size={18} />
                      <select name="governorate" onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-white focus:border-purple-500 outline-none appearance-none">
                        <option value="Cairo">القاهرة</option>
                        <option value="Giza">الجيزة</option>
                        <option value="Alex">الإسكندرية</option>
                        {/* باقي المحافظات */}
                      </select>
                   </div>
                   <input required name="address" onChange={handleChange} type="text" placeholder="العنوان بالتفصيل" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none transition-all" />
                </div>
              </div>
            )}

            <button disabled={loading} type="submit" 
              className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-6 shadow-lg 
              ${userType === 'patient' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20' 
                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/20'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>إنشاء الحساب <ArrowRight size={18} /></>}
            </button>

            <p className="text-center text-slate-400 text-sm mt-4">
              لديك حساب بالفعل؟ <span onClick={() => navigate('/login')} className="text-white cursor-pointer hover:underline font-bold">تسجيل الدخول</span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;