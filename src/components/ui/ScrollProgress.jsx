import React, { useEffect, useRef } from 'react';

const ScrollProgress = () => {
  const barRef = useRef(null);
  const glowRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let requestAnimationFrameId;

    const updateProgress = () => {
      if (!barRef.current || !glowRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      // تحديث العناصر باستخدام الـ Styles المباشرة لأداء سلس جداً (Zero Jitter)
      barRef.current.style.width = `${scrollPercent}%`;
      glowRef.current.style.left = `${scrollPercent}%`;
      
      // إضافة تأثير تعتيم عند الوصول للنهاية أو البداية
      glowRef.current.style.opacity = scrollPercent < 0.5 || scrollPercent > 99.5 ? '0' : '1';

      requestAnimationFrameId = requestAnimationFrame(updateProgress);
    };

    // استخدام requestAnimationFrame بدلاً من scroll event مباشرة لضمان المزامنة مع معدل تحديث الشاشة
    window.addEventListener('scroll', () => {
      if (!requestAnimationFrameId) {
        requestAnimationFrameId = requestAnimationFrame(updateProgress);
      }
    }, { passive: true });

    return () => {
      cancelAnimationFrame(requestAnimationFrameId);
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-[4px] z-[99999] pointer-events-none overflow-visible"
    >
      {/* 🟢 الوعاء الخلفي للشريط (Glass Track) */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/20 backdrop-blur-[2px]"></div>

      {/* 🟢 الشريط الملون المتقدم */}
      <div 
        ref={barRef}
        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[width] relative"
        style={{ width: '0%' }}
      >
        {/* تأثير الوميض الداخلي (Inner Shine) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50"></div>
        
        {/* توهج سفلي يمتد على طول الشاشة (Ambient Bottom Glow) */}
        <div className="absolute bottom-0 left-0 right-0 h-[20px] bg-blue-500/10 blur-xl"></div>
      </div>

      {/* 🟢 رأس التوهج "الذكاء الاصطناعي" (The Intelligent Tip) */}
      <div 
        ref={glowRef}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 transition-all duration-500 ease-out pointer-events-none"
        style={{ left: '0%', opacity: 0 }}
      >
        {/* طبقة التوهج الخارجي المنتشر (Diffused Glow) */}
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
        
        {/* القلب المضيء (Core Shine) */}
        <div className="absolute inset-[12px] bg-white rounded-full shadow-[0_0_15px_2px_#3b82f6,0_0_30px_5px_rgba(59,130,246,0.4)] border border-blue-200"></div>
        
        {/* شرارة ضوئية رأسية (Vertical Flare) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-8 bg-gradient-to-t from-transparent via-blue-200 to-transparent opacity-40"></div>
      </div>
    </div>
  );
};

export default ScrollProgress;