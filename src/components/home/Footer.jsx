import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Github, Twitter, Linkedin, Facebook, Instagram, Youtube,
  ArrowUpRight, Mail, MapPin, Globe, Phone, Send, ArrowRight // 👈 تمت إضافته هنا
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

// 🎨 1. مكون زر السوشيال ميديا المغناطيسي (The Magnetic Social Pill)
const SocialPill = ({ icon: Icon, name, color, href }) => (
  <a 
    href={href}
    className="group relative flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:w-full"
  >
    {/* الخلفية الملونة التي تظهر عند الهوفر */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${color}`}></div>
    
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
        <Icon size={20} />
      </div>
      <span className="font-bold text-white text-lg tracking-wide opacity-70 group-hover:opacity-100 transition-opacity">
        {name}
      </span>
    </div>

    <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-75">
      <ArrowUpRight size={16} />
    </div>
  </a>
);

// 🎨 2. مكون الرابط مع تأثير الإضاءة
const FooterLink = ({ href, children }) => (
  <li>
    <a href={href} className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300">
      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-500 group-hover:scale-150 transition-all duration-300"></span>
      <span className="group-hover:translate-x-2 transition-transform duration-300">{children}</span>
    </a>
  </li>
);

const Footer = () => {
  const navigate = useNavigate();
  const { t, lang } = useSettings();

  return (
    <footer className="bg-[#030303] pt-24 pb-12 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* 🟢 الخلفية الشبكية المتحركة (Perspective Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* 🟢 إضاءة محيطة (Ambient Glow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* 🏗️ الهيكل الرئيسي: شبكة بينتو (Bento Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-24">
          
          {/* 🟦 الكتلة 1: العلامة التجارية والاشتراك (كبير) */}
          <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <Activity size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{lang === 'ar' ? 'ترياق' : 'TIRYAQ'}</h2>
                <span className="text-xs font-bold text-blue-500 tracking-[0.2em] uppercase">System v2.0</span>
              </div>
            </div>

            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
              {t.home.cta.desc}
            </p>

            <div className="relative group/input">
              <input 
                type="email" 
                placeholder={lang === 'ar' ? "أدخل بريدك الإلكتروني للانضمام..." : "Enter your email to join..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
              <button className="absolute top-2 right-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all group-hover/input:scale-95 shadow-lg shadow-blue-900/20">
                {/* 🟢 تم إصلاح الخطأ هنا */}
                <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>

          {/* 🟦 الكتلة 2: روابط التنقل (وسط) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-colors">
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> {lang === 'ar' ? 'الشركة' : 'Company'}
              </h4>
              <ul className="space-y-4">
                <FooterLink href="#">{lang === 'ar' ? 'من نحن' : 'About'}</FooterLink>
                <FooterLink href="#">{lang === 'ar' ? 'الوظائف' : 'Careers'}</FooterLink>
                <FooterLink href="#">{lang === 'ar' ? 'الصحافة' : 'Press'}</FooterLink>
                <FooterLink href="#">{lang === 'ar' ? 'المدونة' : 'Blog'}</FooterLink>
              </ul>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-colors">
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-purple-500" /> {lang === 'ar' ? 'الموقع' : 'Location'}
              </h4>
              <div className="space-y-4 text-slate-400 text-sm">
                <p>Downtown Cairo,<br/>Building 42, Floor 8</p>
                <p>Egypt, EG 11511</p>
                <a href="mailto:hello@tiryaq.com" className="block text-white hover:text-blue-400 transition-colors mt-4">hello@tiryaq.com</a>
              </div>
            </div>
          </div>

          {/* 🟦 الكتلة 3: السوشيال ميديا (أنيميشن قوي) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-6 h-full flex flex-col justify-center gap-3">
              <h4 className="text-white font-bold text-center mb-2 text-sm uppercase tracking-widest opacity-50">Connect With Us</h4>
              
              <SocialPill 
                icon={Facebook} name="Facebook" href="#" 
                color="from-blue-600 to-blue-500" 
              />
              <SocialPill 
                icon={Twitter} name="Twitter" href="#" 
                color="from-sky-500 to-cyan-500" 
              />
              <SocialPill 
                icon={Instagram} name="Instagram" href="#" 
                color="from-purple-500 via-pink-500 to-orange-500" 
              />
              <SocialPill 
                icon={Linkedin} name="LinkedIn" href="#" 
                color="from-blue-700 to-indigo-600" 
              />
            </div>
          </div>

        </div>

        {/* 🟢 الفوتر السفلي العملاق (Big Typography) */}
        <div className="relative border-t border-white/5 pt-12 pb-6 flex flex-col md:flex-row items-end justify-between gap-8">
          
          <div>
            <h1 className="text-[12vw] md:text-[10vw] leading-[0.8] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/0 select-none tracking-tighter">
              TIRYAQ.
            </h1>
          </div>

          <div className="flex flex-col md:items-end gap-6 text-sm font-medium text-slate-500 mb-4 md:mb-10">
            <div className="flex gap-8">
               <a href="#" className="hover:text-white transition-colors">{lang === 'ar' ? 'الخصوصية' : 'Privacy Policy'}</a>
               <a href="#" className="hover:text-white transition-colors">{lang === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}</a>
            </div>
            <p className="max-w-xs text-right opacity-60">
              © 2026 Tiryaq System. Designed with passion for the future of healthcare.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;