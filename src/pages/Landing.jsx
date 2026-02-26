import React from 'react';
import { useSettings } from '../context/SettingsContext';

// Components
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import AppShowcase from '../components/home/AppShowcase'; 
import Testimonials from '../components/home/Testimonials';
import Footer from '../components/home/Footer';

// 🟢 UI Enhancements
import ScrollProgress from '../components/ui/ScrollProgress';

// Styles
const customStyles = `
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%); background-size: 200% 100%; animation: shimmer 2s infinite; }
  .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
  .reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.5, 0, 0, 1); }
  .reveal.active { opacity: 1; transform: translateY(0); }
  
  /* 🟢 إخفاء السكرول بار الافتراضي واستبداله بواحد مودرن */
  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 5px; border: 2px solid #0f172a; }
  ::-webkit-scrollbar-thumb:hover { background: #475569; }
`;

const Landing = () => {
  const { theme, lang } = useSettings();

  return (
    <div 
      className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0B1120] text-white' : 'bg-slate-50 text-slate-900'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <style>{customStyles}</style>
      
      {/* 🟢 الإضافات الاحترافية (بدون الماوس المخصص) */}
      <ScrollProgress />
      
      <Navbar />
      
      <main className="relative">
        <Hero />
        <Features />
        <HowItWorks />
        <AppShowcase />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;