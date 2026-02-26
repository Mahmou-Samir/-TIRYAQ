import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, Pill, Activity } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Reveal } from './Shared';

// --- Helper Components (Moved Outside for Performance) ---

const HeroButton = ({ icon, text, onClick, primary }) => (
  <button 
    onClick={onClick} 
    className={`group relative px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden ${
      primary 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50' 
      : 'bg-white dark:bg-[#1e293b]/50 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-gray-200 shadow-sm backdrop-blur-sm'
    }`}
  >
    {/* Shine Effect */}
    {primary && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>}
    
    <span className="relative z-20 flex items-center gap-2">{icon} {text}</span>
    {primary && <ArrowRight size={18} className="relative z-20 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />}
  </button>
);

const Stat = ({ number, label }) => (
  <div className="text-center lg:text-start">
    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 drop-shadow-sm">
      {number}
    </p>
    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
      {label}
    </p>
  </div>
);

// --- Main Component ---

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative pt-44 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
      
      {/* 🟢 1. Background Effects (Improved) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
         <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 dark:brightness-50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* 🟢 2. Text Content */}
        <div className="text-center lg:text-start space-y-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/50 dark:bg-slate-800/50 border border-blue-100 dark:border-white/10 backdrop-blur-md shadow-sm mb-4 group cursor-default hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t.home.hero.badge}
              </span>
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white">
              {t.home.hero.titleStart} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient-x drop-shadow-sm">
                {t.home.hero.titleHighlight}
              </span>
            </h1>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              {t.home.hero.desc}
            </p>
          </Reveal>
          
          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              {currentUser ? (
                 <HeroButton primary icon={<Smartphone size={20} />} text="الذهاب للوحة التحكم" onClick={() => navigate('/patient')} />
              ) : (
                <>
                  <HeroButton primary icon={<Search size={20} />} text={t.home.hero.btnPatient} onClick={() => navigate('/patient')} />
                  <HeroButton icon={<Building2 size={20} />} text={t.home.hero.btnPharmacy} onClick={() => navigate('/login')} />
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-200 dark:border-white/5 mt-8">
              <Stat number="24/7" label={t.home.hero.stats.coverage} />
              <div className="w-px h-12 bg-slate-200 dark:bg-white/10"></div>
              <Stat number="+5K" label={t.home.hero.stats.pharmacies} />
              <div className="w-px h-12 bg-slate-200 dark:bg-white/10"></div>
              <Stat number="99.9%" label={t.home.hero.stats.accuracy} />
            </div>
          </Reveal>
        </div>

        {/* 🟢 3. The 3D Card Visual */}
        <div className="relative perspective-1000 hidden lg:block h-[500px] flex items-center justify-center">
           {/* Card Container */}
           <div className="relative z-10 w-[420px] bg-white/70 dark:bg-[#131c31]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-black/50 animate-float transform transition-transform duration-500 hover:rotate-0 hover:scale-[1.02] group">
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-8">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                 </div>
                 <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Live Search</span>
                 </div>
              </div>

              {/* Card Body */}
              <div className="space-y-4">
                 {/* Search Bar Simulation */}
                 <div className="flex items-center gap-4 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    <Search className="text-blue-500" size={24} />
                    <div className="flex-1">
                        <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
                        <div className="h-2 w-40 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/20">
                        <ArrowRight size={18} />
                    </div>
                 </div>

                 {/* Result Item */}
                 <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="w-14 h-14 bg-white dark:bg-blue-600 rounded-2xl flex items-center justify-center text-blue-600 dark:text-white shadow-md border border-blue-50 dark:border-transparent">
                          <Pill size={28} />
                       </div>
                       <div>
                          <div className="h-3 w-28 bg-slate-800 dark:bg-white/80 rounded-full mb-2"></div>
                          <div className="h-2 w-20 bg-slate-400 dark:bg-white/30 rounded-full"></div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-green-500/20 flex items-center gap-1">
                             <CheckCircle2 size={10}/> متوفر
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">1.2 كم</span>
                    </div>
                 </div>
              </div>

              {/* Floating Success Notification */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-black/50 border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-[bounce_4s_infinite] max-w-[200px]">
                 <div className="w-10 h-10 shrink-0 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    <Activity size={20} />
                 </div>
                 <div>
                    <p className="font-bold text-xs text-slate-800 dark:text-white">تم الحجز</p>
                    <p className="text-[10px] text-slate-400">كود: #T-8291</p>
                 </div>
              </div>
           </div>
           
           {/* Decorative Blur behind Card */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[80px] -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;