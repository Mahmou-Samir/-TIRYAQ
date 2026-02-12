import React, { useState } from 'react';
import { 
  User, Building2, Mail, Lock, Phone, FileText, MapPin, 
  ArrowRight, Loader2, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config'; // تأكد من المسار
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// 🟢 نفس القائمة المستخدمة في الداشبورد لضمان توحيد البيانات
const GOVERNORATES = [
  "القاهرة", "الإسكندرية", "الجيزة", "القليوبية", "الدقهلية", "الشرقية", "الغربية", "المنوفية", "البحيرة", "كفر الشيخ", 
  "دمياط", "بورسعيد", "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم", "المنيا", "أسيوط", 
  "الوادي الجديد", "البحر الأحمر", "سوهاج", "قنا", "الأقصر", "أسوان", "مطروح"
];

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient'); // 'patient' or 'pharmacy'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    licenseNumber: '', address: '', governorate: 'القاهرة'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setLoading(false);
      return;
    }

    try {
      // 2. إنشاء الحساب
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. تحديث اسم المستخدم
      await updateProfile(user, { displayName: formData.name });

      // 4. تجهيز بيانات Firestore
      const userData = {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: userType, // 🟢 هذا الحقل هو مفتاح الأمان في ProtectedRoute
        createdAt: serverTimestamp(),
        
        // بيانات خاصة بالصيدلية
        ...(userType === 'pharmacy' && {
          licenseNumber: formData.licenseNumber,
          address: formData.address,
          governorate: formData.governorate,
          verified: false, // تحتاج تفعيل
          stockCount: 0 // قيمة افتراضية
        }),

        // بيانات خاصة بالمريض
        ...(userType === 'patient' && {
          city: formData.governorate // يمكن إضافة المدينة للمريض أيضاً
        })
      };

      // 5. الحفظ في قاعدة البيانات
      await setDoc(doc(db, "users", user.uid), userData);

      // 6. التوجيه
      if (userType === 'patient') navigate('/patient');
      else navigate('/pharmacy'); 

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('البريد الإلكتروني مستخدم بالفعل');
      else if (err.code === 'auth/weak-password') setError('كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)');
      else if (err.code === 'auth/invalid-email') setError('البريد الإلكتروني غير صالح');
      else setError('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      
      {/* 🟢 الخلفية */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-fade-in">
        
        {/* 🟢 القائمة الجانبية (اختيار الدور) */}
        <div className="w-full md:w-1/3 bg-slate-800/50 p-8 flex flex-col justify-center border-l border-slate-700/50 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <h2 className="text-2xl font-black text-white mb-2 text-center">انضم لعائلة ترياق</h2>
          <p className="text-slate-400 text-xs text-center mb-8">اختر نوع الحساب للمتابعة</p>
          
          <div className="space-y-4">
            <RoleButton 
              active={userType === 'patient'} 
              onClick={() => setUserType('patient')}
              icon={User}
              title="حساب مريض"
              desc="للبحث عن الأدوية وحجزها"
              color="blue"
            />
            <RoleButton 
              active={userType === 'pharmacy'} 
              onClick={() => setUserType('pharmacy')}
              icon={Building2}
              title="حساب صيدلية"
              desc="لإدارة المخزون والمبيعات"
              color="purple"
            />
          </div>
        </div>

        {/* 🟢 نموذج التسجيل */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            {userType === 'patient' ? <span className="text-blue-500">مريض جديد</span> : <span className="text-purple-500">منشأة طبية</span>}
            <span className="text-slate-600 text-lg font-normal">| بيانات الحساب</span>
          </h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm animate-pulse">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* الحقول الأساسية */}
            <div className="space-y-4">
              <InputField icon={User} name="name" type="text" placeholder={userType === 'patient' ? "الاسم الثلاثي" : "اسم الصيدلية / المستشفى"} onChange={handleChange} color={userType === 'patient' ? 'blue' : 'purple'} />
              <InputField icon={Mail} name="email" type="email" placeholder="البريد الإلكتروني" onChange={handleChange} color={userType === 'patient' ? 'blue' : 'purple'} />
              <InputField icon={Phone} name="phone" type="tel" placeholder="رقم الهاتف (01xxxxxxxxx)" onChange={handleChange} color={userType === 'patient' ? 'blue' : 'purple'} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={Lock} name="password" type="password" placeholder="كلمة المرور" onChange={handleChange} color={userType === 'patient' ? 'blue' : 'purple'} />
                <InputField icon={CheckCircle} name="confirmPassword" type="password" placeholder="تأكيد كلمة المرور" onChange={handleChange} color={userType === 'patient' ? 'blue' : 'purple'} />
              </div>
            </div>

            {/* حقول إضافية للصيدلية */}
            {userType === 'pharmacy' && (
              <div className="space-y-4 animate-fade-in pt-4 border-t border-slate-800 mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">بيانات الترخيص والموقع</p>
                <InputField icon={FileText} name="licenseNumber" type="text" placeholder="رقم الترخيص / السجل التجاري" onChange={handleChange} color="purple" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <MapPin className="absolute right-4 top-3.5 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={20} />
                      <select 
                        name="governorate" 
                        onChange={handleChange} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 pr-12 pl-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none appearance-none transition-all font-medium cursor-pointer"
                      >
                        {GOVERNORATES.map(gov => (
                          <option key={gov} value={gov} className="bg-slate-900 text-white">{gov}</option>
                        ))}
                      </select>
                    </div>
                    <InputField icon={MapPin} name="address" type="text" placeholder="العنوان بالتفصيل" onChange={handleChange} color="purple" />
                </div>
              </div>
            )}

            <button disabled={loading} type="submit" 
              className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-6 shadow-xl active:scale-[0.98] 
              ${userType === 'patient' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-600/20' 
                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-600/20'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>إنشاء الحساب <ArrowRight size={20} /></>}
            </button>

            <p className="text-center text-slate-400 text-sm mt-6 pb-2">
              لديك حساب بالفعل؟ <span onClick={() => navigate('/login')} className="text-white cursor-pointer hover:underline font-bold transition-colors hover:text-blue-400">تسجيل الدخول</span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const RoleButton = ({ active, onClick, icon: Icon, title, desc, color }) => (
  <button 
    type="button" // مهم جداً لمنع الـ Submit بالخطأ
    onClick={onClick}
    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group ${
      active 
      ? `${color === 'blue' ? 'bg-blue-600 shadow-blue-600/30 ring-blue-500' : 'bg-purple-600 shadow-purple-600/30 ring-purple-500'} text-white shadow-lg ring-2 ring-offset-2 ring-offset-slate-900 scale-[1.02]` 
      : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
    }`}
  >
    <div className={`p-3 rounded-xl ${active ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
      <Icon size={24} />
    </div>
    <div className="text-right flex-1">
      <p className="font-bold text-sm mb-0.5">{title}</p>
      <p className={`text-[10px] ${active ? 'text-white/80' : 'text-slate-500'}`}>{desc}</p>
    </div>
    {active && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
  </button>
);

const InputField = ({ icon: Icon, name, type, placeholder, onChange, color }) => (
  <div className="relative group">
    <Icon className={`absolute right-4 top-3.5 text-slate-500 transition-colors ${color === 'blue' ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-purple-500'}`} size={20} />
    <input 
      required 
      name={name} 
      type={type} 
      placeholder={placeholder} 
      onChange={onChange}
      className={`w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 pr-12 pl-4 text-white outline-none transition-all font-medium placeholder:text-slate-600
        ${color === 'blue' 
          ? 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500' 
          : 'focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500'
        }`} 
    />
  </div>
);

export default Register;