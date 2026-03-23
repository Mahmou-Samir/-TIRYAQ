import React from 'react';
import { Star, CheckCircle2, Bell, Search, Home, ShoppingBag, User, Zap, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Reveal } from './Shared';

// --- زر المتجر (Apple & Google) بتصميم زجاجي ---
const StoreButton = ({ type }) => {
  const isApple = type === 'apple';
  return (
    <button className="group relative flex items-center gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] w-full sm:w-auto justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      {isApple ? (
        <svg viewBox="0 0 384 512" fill="currentColor" className="w-8 h-8 text-white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 126.7 89.8 126.7 24.2 0 32.9-17.7 77-17.7s52.8 17.7 79 17.7c37.9 0 66.8-76.7 89.2-126.3-43.2-22.1-74.7-65.6-74.7-126.4zm-71.7-118.8c18.5-24 35.8-53.1 32.6-83.6-26.6 2.3-60.8 19.3-79.6 42.9-16.7 22.1-34.1 55.6-29.3 84.4 30.6 2.5 59.9-19.9 76.3-43.7z"/></svg>
      ) : (
        <svg viewBox="0 0 512 512" fill="currentColor" className="w-8 h-8 text-white"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
      )}
      <div className="text-start rtl:text-right">
        <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">{isApple ? 'Download on the' : 'GET IT ON'}</p>
        <p className="text-xl font-bold leading-none text-white tracking-wide">{isApple ? 'App Store' : 'Google Play'}</p>
      </div>
    </button>
  );
};

// --- الويدجت الطافية (Floating Widget) ---
const FloatingWidget = ({ icon, title, desc, className }) => (
  <div className={`absolute p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-4 border border-white/50 z-30 animate-float ${className}`}>
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-800">{title}</p>
      <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
    </div>
  </div>
);

// --- شاشة التطبيق الداخلية (Internal UI) ---
const AppScreen = () => (
  <div className="bg-slate-50 h-full w-full flex flex-col relative overflow-hidden font-sans">
    
    {/* Header */}
    <div className="pt-8 px-6 pb-6 bg-white sticky top-0 z-20 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Mahmoud+Samir&background=2563eb&color=fff" alt="User" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">مرحباً بك 👋</p>
            <p className="text-sm font-black text-slate-800">محمود سمير</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 border border-slate-100 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>
      </div>
      
      {/* Search */}
      <div className="bg-slate-100 p-3 rounded-2xl flex items-center gap-3 text-slate-400">
        <Search size={18} />
        <span className="text-xs font-bold">ابحث عن دواء، صيدلية...</span>
      </div>
    </div>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
        <div className="relative z-10">
          <p className="text-[10px] font-bold bg-white/20 w-fit px-2 py-0.5 rounded-lg mb-2 backdrop-blur-sm">خصم خاص</p>
          <h3 className="font-bold text-lg mb-1">خصم 20%</h3>
          <p className="text-xs text-blue-100 mb-3">على جميع الفيتامينات</p>
          <button className="bg-white text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full">اطلب الآن</button>
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-3"><Zap size={20}/></div>
          <p className="text-xs font-bold text-slate-800">أدوية سريعة</p>
          <p className="text-[10px] text-slate-400">توصيل فوري</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-3"><ShieldCheck size={20}/></div>
          <p className="text-xs font-bold text-slate-800">روشتة تأمين</p>
          <p className="text-[10px] text-slate-400">تغطية كاملة</p>
        </div>
      </div>

       {/* List Item */}
       <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 text-xs font-bold">P</div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-800">بنادول اكسترا</p>
          <p className="text-[10px] text-slate-400">12 قرص • 45 ج.م</p>
        </div>
        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">+</div>
      </div>
    </div>

    {/* Floating Tab Bar */}
    <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/50 flex justify-between items-center text-slate-400">
      <div className="text-blue-600"><Home size={22} fill="currentColor" className="opacity-20"/> <Home size={22} className="absolute inset-0 m-auto"/></div>
      <ShoppingBag size={22} />
      <User size={22} />
    </div>
  </div>
);

const AppShowcase = () => {
  const { t } = useSettings();

  return (
    <section id="app" className="py-20 lg:py-32 bg-white dark:bg-[#0B1120] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0f172a] rounded-[3rem] p-8 lg:p-24 relative shadow-2xl shadow-blue-900/20 overflow-hidden isolate">
          
          {/* 🟢 الخلفية المتقدمة (Atmosphere) */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-600/30 to-purple-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>
          
          {/* الشبكة الخلفية */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>

          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            
            {/* 1. المحتوى النصي */}
            <div className="flex-1 text-center lg:text-start text-white relative z-10">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-md text-sm font-bold text-blue-300 mb-8 hover:bg-blue-500/20 transition-colors cursor-default">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                   </span>
                   متاح الآن للتحميل مجاناً
                </div>
                
                <h2 className="text-4xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
                  {t.home.app.title} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">على هاتفك.</span>
                </h2>
                
                <p className="text-slate-400 text-lg lg:text-xl mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t.home.app.desc}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <StoreButton type="apple" />
                  <StoreButton type="google" />
                </div>

                <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 border-t border-white/10 pt-8">
                   <div>
                     <div className="flex text-yellow-400 mb-1 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                     </div>
                     <p className="text-xs text-slate-400 font-bold">بناءً على 10,000+ تقييم</p>
                   </div>
                   <div className="w-px h-10 bg-white/10"></div>
                   <div>
                      <p className="text-xl font-black text-white">5M+</p>
                      <p className="text-xs text-slate-400 font-bold">عملية تحميل</p>
                   </div>
                </div>
              </Reveal>
            </div>
            
            {/* 2. الهاتف ثلاثي الأبعاد (The 3D Phone) */}
            <div className="flex-1 flex justify-center lg:justify-end relative perspective-[2000px] z-20">
              
              {/* الهاتف */}
              <div className="relative w-[320px] h-[650px] bg-slate-900 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-slate-800 ring-1 ring-white/10 transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out group">
                
                {/* انعكاس الضوء (Glossy Reflection) */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none z-40"></div>
                
                {/* الشاشة */}
                <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden relative">
                   <AppScreen />
                </div>
                
                {/* Dynamic Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-50"></div>
              </div>

              {/* عناصر عائمة خلف الهاتف (Depth) */}
              <div className="absolute top-20 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>

              {/* ويدجت عائم 1 */}
              <FloatingWidget 
                icon={<CheckCircle2 size={20}/>} 
                title="تم التوصيل" 
                desc="تم توصيل الطلب بنجاح" 
                className="top-[15%] -left-[10%] animate-[bounce_4s_infinite]" 
              />
              
              {/* ويدجت عائم 2 */}
              <FloatingWidget 
                icon={<Star size={20} fill="currentColor" className="text-yellow-400"/>} 
                title="خدمة ممتازة" 
                desc="تقييم 5 نجوم من أحمد" 
                className="bottom-[20%] -right-[5%] animate-[bounce_5s_infinite] delay-700" 
              />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;