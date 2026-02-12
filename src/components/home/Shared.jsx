import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- 1. Hook: useOnScreen (احترافي للأداء العالي) ---
export const useOnScreen = (options) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.unobserve(node); 
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, visible];
};

// --- 2. Component: Reveal (محرك الحركة الانسيابي) ---
export const Reveal = ({ children, delay = 0, y = 40, x = 0, duration = 1 }) => {
  const [ref, visible] = useOnScreen({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className="will-change-[transform,opacity]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : `translate(${x}px, ${y}px)`,
        transition: `all ${duration}s cubic-bezier(0.2, 0.6, 0.2, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// --- 3. Component: SectionHeader (The Global Standard Style) ---
export const SectionHeader = ({ title, subtitle, center = false }) => {
  const [ref, visible] = useOnScreen({ threshold: 0.2 });
  const words = useMemo(() => title?.split(' ') || [], [title]);

  return (
    <div 
      ref={ref} 
      className={`relative mb-20 md:mb-32 flex flex-col ${center ? 'items-center text-center' : 'items-start text-right'}`}
      dir="rtl"
    >
      {/* 🟢 الـ Subtitle: تصميم كبسولة احترافية */}
      {subtitle && (
        <div className={`flex items-center gap-3 mb-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-black tracking-widest text-[10px] md:text-xs uppercase">
            {subtitle}
          </span>
          <span className={`h-[1px] bg-gradient-to-l from-blue-600 to-transparent transition-all duration-1000 delay-300 ${visible ? 'w-16' : 'w-0'}`}></span>
        </div>
      )}

      {/* 🟢 العنوان: حل مشكلة اختفاء الحروف مع أنيميشن الطبقات */}
      <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter mb-10">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-visible py-2 ml-4 last:ml-0">
            <span
              className="inline-block transition-all duration-[1.2s]"
              style={{
                transform: visible ? 'none' : 'translateY(100%) skewY(10deg)',
                opacity: visible ? 1 : 0,
                transitionDelay: `${i * 0.1}s`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </h2>

      {/* 🟢 Progress Bar: تصميم "النيون" المتمدد */}
      <div className="relative w-40 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-transform duration-[2s] ease-out delay-700"
          style={{ 
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: center ? 'center' : 'right' 
          }}
        ></div>
      </div>

      {/* 🟢 لمسة فنية: العنوان الباهت خلف النص (Backdrop Typography) */}
      <div className={`absolute -top-16 ${center ? 'left-1/2 -translate-x-1/2' : '-right-8'} -z-10 opacity-[0.04] dark:opacity-[0.07] select-none pointer-events-none hidden lg:block whitespace-nowrap`}>
        <span className="text-[15rem] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          {words[0]}
        </span>
      </div>
    </div>
  );
};

// --- 4. Component: Magnetic (Interactive Physics) ---
export const Magnetic = ({ children, strength = 0.3 }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * strength;
    const y = (clientY - (top + height / 2)) * strength;
    setPos({ x, y });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: pos.x === 0 ? 'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
        willChange: 'transform'
      }}
      className="inline-block"
    >
      {children}
    </div>
  );
};