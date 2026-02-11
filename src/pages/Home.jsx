import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Search, Building2, ShieldCheck, ArrowRight, 
  Brain, Truck, Sun, Moon, Globe, CheckCircle2, 
  Smartphone, UploadCloud, Map, Star, Quote, User
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// --- Custom Hooks & Styles ---
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [ref, options]);
  return [ref, visible];
};

// 🟢 تمت إضافة الأنماط المفقودة (fade-in, gradient-x)
const customStyles = `
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-shimmer { 
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%); 
    background-size: 200% 100%; 
    animation: shimmer 2s infinite; 
  }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }
  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
  
  .reveal { opacity: 0; transform: translateY(30px); transition: all 1s cubic-bezier(0.5, 0, 0, 1); }
  .reveal.active { opacity: 1; transform: translateY(0); }
`;

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, lang, toggleLang, t } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  // التحقق من حالة المستخدم
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else setCurrentUser(null);
    });
    return () => unsubscribe();
  }, [auth]);

  // تأثير التمرير للناف بار
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboardClick = () => {
    navigate('/patient'); 
  };

  return (
    <div 
      className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500
      ${theme === 'dark' ? 'bg-[#0B1120] text-white selection:bg-blue-500 selection:text-white' : 'bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <style>{customStyles}</style>

      {/* 🟢 Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-2 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Activity className="text-white" size={24} />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter">
              {lang === 'ar' ? 'ترياق' : 'Tiryaq'}<span className="text-blue-600 dark:text-blue-500">.</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-500 dark:text-gray-400">
            {['features', 'about', 'app'].map((item) => (
              <a key={item} href={`#${item}`} className="relative hover:text-blue-600 dark:hover:text-white transition-colors group">
                {t.home.nav[item] || item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeButton onClick={toggleTheme} icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} />
            <ThemeButton onClick={toggleLang} icon={<Globe size={18} />} />
            
            {/* أزرار تسجيل الدخول / لوحة التحكم */}
            {currentUser ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <button 
                  onClick={handleDashboardClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
                >
                  <User size={18} />
                  <span>لوحة التحكم</span>
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white px-4 transition-colors">
                  {t.home.nav.login}
                </button>
                <button onClick={() => navigate('/register')} className="relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-[#0B1120] px-6 py-2.5 rounded-full text-sm font-black hover:shadow-lg hover:scale-105 transition-all active:scale-95 group">
                  <span className="absolute inset-0 animate-shimmer"></span>
                  <span className="relative z-10">{t.home.nav.start}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 🟢 Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="text-center lg:text-start space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/30 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {t.home.hero.badge}
              </div>
            </Reveal>
            
            <Reveal delay={0.1}>
              <h1 className="text-6xl lg:text-8xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                {t.home.hero.titleStart} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient-x">
                  {t.home.hero.titleHighlight}
                </span>
              </h1>
            </Reveal>
            
            <Reveal delay={0.2}>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.home.hero.desc}
              </p>
            </Reveal>
            
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {currentUser ? (
                   <HeroButton 
                     primary 
                     icon={<Smartphone size={20} />} 
                     text="الذهاب للوحة التحكم" 
                     onClick={handleDashboardClick} 
                   />
                ) : (
                  <>
                    <HeroButton 
                      primary 
                      icon={<Search size={20} />} 
                      text={t.home.hero.btnPatient} 
                      onClick={() => navigate('/patient')} 
                    />
                    <HeroButton 
                      icon={<Building2 size={20} />} 
                      text={t.home.hero.btnPharmacy} 
                      onClick={() => navigate('/login')} 
                    />
                  </>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-gray-200 dark:border-gray-800/50">
                <Stat number="24/7" label={t.home.hero.stats.coverage} />
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-800"></div>
                <Stat number="5K+" label={t.home.hero.stats.pharmacies} />
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-800"></div>
                <Stat number="99%" label={t.home.hero.stats.accuracy} />
              </div>
            </Reveal>
          </div>

          {/* 3D Card */}
          <div className="relative perspective-1000 hidden lg:block">
             <div className="relative z-10 bg-white/80 dark:bg-[#131c31]/80 backdrop-blur-2xl border border-white/20 dark:border-gray-700 p-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-float transform rotate-y-12 rotate-x-12 hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <Search className="text-gray-400" size={24} />
                    <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="mr-auto bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30"><ArrowRight size={16} /></div>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-500/20 rounded-3xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-blue-600 rounded-2xl flex items-center justify-center text-blue-600 dark:text-white shadow-md"><ShieldCheck size={24} /></div>
                      <div>
                        <div className="h-3 w-24 bg-slate-300 dark:bg-slate-500 rounded-full mb-2"></div>
                        <div className="h-2 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                      </div>
                    </div>
                    <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30">Available</span>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 flex items-center gap-4 animate-[bounce_3s_infinite]">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400"><CheckCircle2 size={24} /></div>
                  <div><p className="font-bold text-sm">تم الحجز بنجاح!</p><p className="text-xs text-gray-500">كود الطلب: #8291</p></div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 🟢 3. Features Section */}
      <section id="features" className="py-32 bg-white dark:bg-[#0B1120] relative">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title={t.home.features.title} subtitle={t.home.features.subtitle} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search size={32} />} 
              title={t.home.features.patientTitle} 
              desc={t.home.features.patientDesc} 
              color="blue" 
              delay={0.1}
              onClick={() => navigate('/patient')} 
              btnText={t.home.features.actionBtn}
            />
            <FeatureCard 
              icon={<Brain size={32} />} 
              title={t.home.features.adminTitle} 
              desc={t.home.features.adminDesc} 
              color="purple" 
              delay={0.2}
              onClick={() => navigate('/login')} 
              btnText={t.home.features.actionBtn}
            />
            <FeatureCard 
              icon={<Truck size={32} />} 
              title={t.home.features.pharmacyTitle} 
              desc={t.home.features.pharmacyDesc} 
              color="green" 
              delay={0.3}
              onClick={() => navigate('/register')} 
              btnText={t.home.features.actionBtn}
            />
          </div>
        </div>
      </section>

      {/* 🟢 4. How It Works */}
      <section id="about" className="py-32 bg-slate-50 dark:bg-[#0f172a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start gap-20">
            
            <div className="flex-1 sticky top-32">
              <Reveal>
                <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-xs uppercase mb-4 block bg-blue-100 dark:bg-blue-900/30 w-fit px-3 py-1 rounded-lg">
                  {t.home.about.subtitle}
                </span>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                  {t.home.about.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-10">
                  {t.home.about.desc}
                </p>
                <ul className="space-y-6">
                  {[t.home.about.point1, t.home.about.point2, t.home.about.point3].map((point, i) => (
                    <li key={i} className="flex items-center gap-4 font-bold text-slate-800 dark:text-slate-200">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <CheckCircle2 size={16} />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            
            <div className="flex-1 space-y-8 relative">
              <div className="absolute right-8 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
              
              <StepCard number="01" icon={<UploadCloud/>} title={t.home.steps.step1} desc={t.home.steps.step1Desc} delay={0.1} />
              <StepCard number="02" icon={<Brain/>} title={t.home.steps.step2} desc={t.home.steps.step2Desc} delay={0.2} color="purple"/>
              <StepCard number="03" icon={<Map/>} title={t.home.steps.step3} desc={t.home.steps.step3Desc} delay={0.3} />
            </div>

          </div>
        </div>
      </section>

      {/* 🟢 5. App Showcase */}
      <section id="app" className="py-32 bg-white dark:bg-[#0B1120] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-24 relative shadow-2xl shadow-blue-900/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-900/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-start text-white">
                <Reveal>
                  <h2 className="text-4xl lg:text-6xl font-black mb-6">{t.home.app.title}</h2>
                  <p className="text-blue-100 text-xl mb-10 leading-relaxed max-w-xl">
                    {t.home.app.desc}
                  </p>
                  <button className="bg-white text-blue-700 px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-50 hover:scale-105 transition-all mx-auto lg:mx-0 shadow-xl">
                    <Smartphone size={24}/> <span>{t.home.app.btn}</span>
                  </button>
                </Reveal>
              </div>
              
              <div className="flex-1 flex justify-center lg:justify-end">
                <div className="relative w-80 h-[600px] bg-slate-900 border-[10px] border-slate-800 rounded-[3.5rem] shadow-2xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 w-full h-full bg-white flex flex-col overflow-hidden rounded-[2.5rem]">
                    <div className="bg-blue-600 h-32 w-full p-6 flex flex-col justify-end">
                      <div className="w-10 h-10 bg-white/20 rounded-full mb-4"></div>
                      <div className="h-4 w-32 bg-white/40 rounded-full"></div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
                      <div className="h-32 w-full bg-blue-50 rounded-2xl border border-blue-100"></div>
                      <div className="h-20 w-full bg-gray-50 rounded-2xl"></div>
                      <div className="h-20 w-full bg-gray-50 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟢 6. Testimonials */}
      <section className="py-32 bg-slate-50 dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title={t.home.testimonials.title} subtitle="ماذا يقول المستخدمون؟" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ReviewCard text={t.home.testimonials.review1} author={t.home.testimonials.author1} delay={0.1} />
            <ReviewCard text={t.home.testimonials.review2} author={t.home.testimonials.author2} highlighted delay={0.2} />
            <ReviewCard text={t.home.testimonials.review3} author={t.home.testimonials.author3} delay={0.3} />
          </div>
        </div>
      </section>

      {/* 🟢 7. CTA & Footer */}
      <footer className="bg-[#0B1120] pt-32 pb-10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
        
        <div className="max-w-4xl mx-auto text-center px-6 mb-24 relative z-10">
          <Reveal>
            <h2 className="text-5xl font-black text-white mb-8">{t.home.cta.title}</h2>
            <p className="text-gray-400 text-xl mb-10">{t.home.cta.desc}</p>
            <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-12 py-5 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_rgba(37,99,235,0.7)] transition-all active:scale-95 transform hover:-translate-y-1">
              {t.home.cta.btn}
            </button>
          </Reveal>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Activity size={18}/></div>
            <span className="font-bold text-white text-lg">Tiryaq.</span>
          </div>
          <p>{t.home.footer.copyright}</p>
        </div>
      </footer>

    </div>
  );
};

// --- Helper Components ---

const Reveal = ({ children, delay = 0 }) => {
  const [ref, visible] = useOnScreen({ threshold: 0.1 });
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}s` }} className={`reveal ${visible ? 'active' : ''}`}>
      {children}
    </div>
  );
};

const ThemeButton = ({ onClick, icon }) => (
  <button onClick={onClick} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10">
    {icon}
  </button>
);

const HeroButton = ({ icon, text, onClick, primary }) => (
  <button 
    onClick={onClick} 
    className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 ${
      primary 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 relative overflow-hidden group' 
      : 'bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-gray-200 shadow-sm'
    }`}
  >
    {primary && <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -ml-4 w-[150%]"></div>}
    <span className="relative flex items-center gap-2">{icon} {text}</span>
  </button>
);

const Stat = ({ number, label }) => (
  <div>
    <p className="text-3xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
      {number}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider">{label}</p>
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <Reveal>
    <div className="text-center mb-20">
      {subtitle && <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-xs uppercase mb-3 block">{subtitle}</span>}
      <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">{title}</h2>
      <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
    </div>
  </Reveal>
);

const FeatureCard = ({ icon, title, desc, color, onClick, btnText, delay }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    green: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
  };
  
  return (
    <Reveal delay={delay}>
      <div className="bg-white dark:bg-[#1e293b]/50 border border-gray-100 dark:border-gray-700/50 p-10 rounded-[2.5rem] hover:shadow-2xl dark:hover:bg-[#1e293b] transition-all duration-300 group hover:-translate-y-2 cursor-default">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 ${colors[color]}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">{desc}</p>
        <button onClick={onClick} className={`text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all ${colors[color].split(' ')[1]}`}>
          {btnText} <ArrowRight size={16} />
        </button>
      </div>
    </Reveal>
  );
};

const StepCard = ({ number, icon, title, desc, delay, color }) => (
  <Reveal delay={delay}>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all flex gap-6 items-start relative z-10">
      <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-600'} dark:bg-slate-700 dark:text-white`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono opacity-50">0{number}</span> {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  </Reveal>
);

const ReviewCard = ({ text, author, highlighted, delay }) => (
  <Reveal delay={delay}>
    <div className={`p-10 rounded-[2.5rem] text-left relative h-full flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 ${highlighted ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 scale-105 z-10' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700'}`}>
      <div>
        <div className="flex gap-1 mb-6">
          {[1,2,3,4,5].map(i => <Star key={i} size={16} className={`fill-current ${highlighted ? 'text-yellow-300' : 'text-yellow-400'}`} />)}
        </div>
        <Quote className={`absolute top-10 right-10 opacity-20 ${highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`} size={60} />
        <p className={`text-base font-medium leading-loose mb-8 ${highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'}`}>"{text}"</p>
      </div>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${highlighted ? 'bg-white text-blue-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
          {author.charAt(0)}
        </div>
        <p className={`text-sm font-bold ${highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{author}</p>
      </div>
    </div>
  </Reveal>
);

export default Home;