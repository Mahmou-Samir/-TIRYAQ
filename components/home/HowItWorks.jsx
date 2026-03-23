import React from 'react';
import { UploadCloud, Brain, Map, CheckCircle2, Zap, ArrowDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Reveal } from './Shared';

const StepCard = ({ number, icon, title, desc, delay, color, isLast }) => {
  // تحديد الألوان بناءً على نوع الخطوة
  const colorStyles = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "group-hover:border-blue-200 dark:group-hover:border-blue-500/30"
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "group-hover:border-purple-200 dark:group-hover:border-purple-500/30"
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "group-hover:border-orange-200 dark:group-hover:border-orange-500/30"
    }
  };

  const theme = colorStyles[color] || colorStyles.blue;

  return (
    <Reveal delay={delay}>
      <div className={`relative flex gap-6 group ${!isLast ? 'pb-12' : ''}`}>
        
        {/* 🟢 الخط الزمني (Timeline Line) */}
        {!isLast && (
          <div className="absolute top-12 right-[1.65rem] rtl:right-[1.65rem] ltr:left-[1.65rem] bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-blue-200 to-transparent dark:from-slate-700 dark:via-blue-900/50"></div>
        )}

        {/* 🟢 الأيقونة مع تأثير النبض */}
        <div className="relative shrink-0 z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${theme.bg} ${theme.text}`}>
            {icon}
          </div>
          {/* دائرة الترقيم الصغيرة */}
          <div className="absolute -bottom-2 -right-2 rtl:-right-2 ltr:-left-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm z-20">
            {number}
          </div>
        </div>

        {/* 🟢 محتوى البطاقة */}
        <div className={`flex-1 bg-white dark:bg-[#1e293b]/60 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 ${theme.border}`}>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </Reveal>
  );
};

const HowItWorks = () => {
  const { t } = useSettings();

  return (
    <section id="about" className="py-32 bg-slate-50/50 dark:bg-[#0f172a] relative overflow-hidden">
      
      {/* 🟢 خلفية ديكورية */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-20">
          
          {/* الجانب الأيمن (النصوص) - Sticky */}
          <div className="flex-1 lg:sticky lg:top-32">
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full shadow-sm w-fit">
                <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  {t.home.about.subtitle}
                </span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                {t.home.about.title}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10 border-r-4 border-blue-500 pr-6 rtl:border-r-4 rtl:pr-6 ltr:border-l-4 ltr:border-r-0 ltr:pl-6 bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/10 py-2 rounded-r-xl">
                {t.home.about.desc}
              </p>

              <ul className="space-y-5">
                {[t.home.about.point1, t.home.about.point2, t.home.about.point3].map((point, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          
          {/* الجانب الأيسر (الخطوات) */}
          <div className="flex-1 w-full pt-8 lg:pt-0">
            <div className="relative">
               {/* خطوات العمل */}
              <StepCard 
                number="1" 
                icon={<UploadCloud size={28}/>} 
                title={t.home.steps.step1} 
                desc={t.home.steps.step1Desc} 
                delay={0.1} 
                color="blue"
              />
              <StepCard 
                number="2" 
                icon={<Brain size={28}/>} 
                title={t.home.steps.step2} 
                desc={t.home.steps.step2Desc} 
                delay={0.2} 
                color="purple"
              />
              <StepCard 
                number="3" 
                icon={<Map size={28}/>} 
                title={t.home.steps.step3} 
                desc={t.home.steps.step3Desc} 
                delay={0.3} 
                color="orange" 
                isLast
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;