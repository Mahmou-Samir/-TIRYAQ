import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Reveal, SectionHeader } from './Shared';

const FeatureCard = ({ icon, title, desc, variant, onClick, btnText, delay }) => {
  // تعريف الأنماط بناءً على "المتغير" (blue, purple, green)
  const styles = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      borderHover: "hover:border-blue-200 dark:hover:border-blue-500/30",
      shadow: "hover:shadow-blue-500/10",
      btn: "text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-500/20",
      borderHover: "hover:border-purple-200 dark:hover:border-purple-500/30",
      shadow: "hover:shadow-purple-500/10",
      btn: "text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-500"
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      borderHover: "hover:border-emerald-200 dark:hover:border-emerald-500/30",
      shadow: "hover:shadow-emerald-500/10",
      btn: "text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500"
    }
  };

  const currentStyle = styles[variant];

  return (
    <Reveal delay={delay}>
      <div 
        onClick={onClick}
        className={`relative group bg-white dark:bg-[#1e293b]/60 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] transition-all duration-500 cursor-pointer ${currentStyle.borderHover} hover:shadow-2xl ${currentStyle.shadow} hover:-translate-y-2 overflow-hidden`}
      >
        {/* خلفية جمالية تظهر عند الهوفر */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${variant === 'green' ? 'emerald' : variant}-500/5`}></div>

        <div className="relative z-10">
          {/* الأيقونة */}
          <div className="mb-8 relative inline-block">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${currentStyle.iconBg} ${currentStyle.iconColor}`}>
              {icon}
            </div>
            {/* تأثير الوهج خلف الأيقونة */}
            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-40 ${currentStyle.bg}`}></div>
          </div>

          {/* العناوين */}
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
            {desc}
          </p>

          {/* الزرار التفاعلي */}
          <div className="flex items-center justify-between mt-auto">
            <span className={`text-sm font-bold flex items-center gap-2 transition-all duration-300 px-4 py-2 rounded-full ${currentStyle.btn}`}>
              {btnText} 
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

const Features = () => {
  const navigate = useNavigate();
  const { t } = useSettings();

  return (
    <section id="features" className="py-32 bg-slate-50/50 dark:bg-[#0B1120] relative overflow-hidden">
      
      {/* 🟢 خلفية منقطة (Dot Pattern) لإعطاء عمق */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionHeader 
          title={t.home.features.title} 
          subtitle={t.home.features.subtitle} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* كارت المريض */}
          <FeatureCard 
            icon={<Search size={32} />} 
            title={t.home.features.patientTitle} 
            desc={t.home.features.patientDesc} 
            variant="blue" 
            delay={0.1} 
            onClick={() => navigate('/patient')} 
            btnText={t.home.features.actionBtn} 
          />

          {/* كارت الأدمن (مميز بالذكاء الاصطناعي) */}
          <FeatureCard 
            icon={<Brain size={32} />} 
            title={
              <span className="flex items-center gap-2">
                {t.home.features.adminTitle}
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <Sparkles size={10} /> AI
                </span>
              </span>
            }
            desc={t.home.features.adminDesc} 
            variant="purple" 
            delay={0.2} 
            onClick={() => navigate('/login')} 
            btnText={t.home.features.actionBtn} 
          />

          {/* كارت الصيدلية */}
          <FeatureCard 
            icon={<Truck size={32} />} 
            title={t.home.features.pharmacyTitle} 
            desc={t.home.features.pharmacyDesc} 
            variant="green" 
            delay={0.3} 
            onClick={() => navigate('/register')} 
            btnText={t.home.features.actionBtn} 
          />
        </div>
      </div>
    </section>
  );
};

export default Features;