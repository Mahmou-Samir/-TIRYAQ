import React, { useRef, useState } from 'react';
import { Star, Quote, BadgeCheck, ChevronRight, ChevronLeft, ArrowRight, User } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SectionHeader } from './Shared';

// 🟢 البيانات
const reviewsData = {
  ar: [
    { id: 1, name: "د. أحمد خالد", role: "مدير صيدليات مصر", text: "النظام وفر علينا 70% من وقت جرد المخزون. الدعم الفني استثنائي وسريع جداً.", rating: 5, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80" },
    { id: 2, name: "سارة محمد", role: "مريض مزمن", text: "تطبيق رائع! بطلب أدويتي الشهرية بضغطة زر وتوصلي لحد البيت، أنقذني في أوقات حرجة.", rating: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
    { id: 3, name: "مستشفى الشفاء", role: "قسم المشتريات", text: "ترياق ساعدنا نربط المخازن ببعض ونتوقع النواقص قبل حدوثها بفضل الذكاء الاصطناعي.", rating: 5, img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&q=80" },
    { id: 4, name: "م. كريم عبد العزيز", role: "مطور نظم", text: "أفضل تجربة مستخدم (UX) رأيتها في تطبيق حكومي. السلاسة في الأداء مبهرة.", rating: 4, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
    { id: 5, name: "صيدلية النور", role: "شريك نجاح", text: "زيادة في المبيعات بنسبة 30% وتوسعنا في مناطق جديدة بفضل بيانات ترياق.", rating: 5, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
  ],
  en: [
    { id: 1, name: "Dr. Ahmed Khaled", role: "Misr Pharmacies Mgr.", text: "The system saved us 70% of inventory time. Technical support is exceptional.", rating: 5, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80" },
    { id: 2, name: "Sarah Mohamed", role: "Chronic Patient", text: "Great app! I order my monthly meds with one click. It saved me in critical times.", rating: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
    { id: 3, name: "Al-Shifa Hospital", role: "Procurement Dept.", text: "Tiryaq helped us link warehouses and predict shortages using AI before they happen.", rating: 5, img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&q=80" },
    { id: 4, name: "Eng. Karim", role: "Systems Dev", text: "Best UX/UI design I've seen in a government app. Performance is impressive.", rating: 4, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
    { id: 5, name: "Al-Noor Pharmacy", role: "Success Partner", text: "30% sales increase and expansion into new areas thanks to Tiryaq data.", rating: 5, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
  ]
};

const ReviewCard = ({ review }) => (
  <div className="min-w-[360px] md:min-w-[480px] snap-center py-4 px-2 h-full">
    <div className="group relative h-full bg-white dark:bg-[#1e293b]/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-1 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/30">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={`${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
              />
            ))}
          </div>
          <Quote className="text-slate-200 dark:text-slate-700 group-hover:text-blue-100 dark:group-hover:text-blue-900 transition-colors transform scale-x-[-1]" size={48} />
        </div>
        
        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 leading-relaxed mb-8 line-clamp-3 italic">
          "{review.text}"
        </p>
      </div>

      <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-white/5 mt-auto">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-md">
            <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white rounded-lg p-1 border-2 border-white dark:border-[#1e293b] shadow-sm">
            <BadgeCheck size={12} strokeWidth={3} />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {review.name}
          </h4>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            {review.role}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const { t, lang } = useSettings();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentReviews = reviewsData[lang] || reviewsData.ar;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const cardWidth = el.scrollWidth / (currentReviews.length + 1);
      const index = Math.round(Math.abs(el.scrollLeft) / cardWidth);
      setActiveIndex(index);
    }
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      current.scrollBy({ left: lang === 'ar' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    // 🟢 إضافة id="testimonials" للربط مع الـ Navbar
    <section id="testimonials" className="py-24 bg-slate-50/50 dark:bg-[#0B1120] relative overflow-hidden scroll-mt-20">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
              <User size={14} /> {lang === 'ar' ? 'مجتمع ترياق' : 'Tiryaq Community'}
            </div>
            <SectionHeader 
              title={t.home.testimonials.title} 
              subtitle={lang === 'ar' ? "قصص نجاح من قلب الميدان" : "Real Stories from the Field"} 
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => scroll('left')} 
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              {lang === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              {lang === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-50 dark:from-[#0B1120] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-50 dark:from-[#0B1120] to-transparent z-20 pointer-events-none"></div>

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-16 pt-4 px-4 hide-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {currentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            
            <div className="min-w-[360px] md:min-w-[480px] snap-center py-4 px-2 h-full">
               <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-600 dark:to-indigo-700 p-10 rounded-[2.5rem] flex flex-col justify-center items-center text-center text-white relative overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                     {lang === 'ar' ? <ArrowRight size={32} className="text-white transform rotate-180" /> : <ArrowRight size={32} className="text-white" />}
                  </div>
                  <h3 className="text-3xl font-black mb-4 leading-tight">
                    {t.home.cta.title}
                  </h3>
                  <p className="text-slate-300 dark:text-blue-100 mb-8 max-w-xs mx-auto text-lg">
                    {t.home.cta.desc}
                  </p>
                  <button className="bg-white text-slate-900 dark:text-blue-600 px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                     {t.home.cta.btn} {lang === 'ar' ? <ChevronLeft size={18}/> : <ChevronRight size={18}/>}
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-2">
          {[...Array(currentReviews.length + 1)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}
            ></div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;