import React, { useEffect, useRef } from 'react';

const ScrollProgress = () => {
  // استخدام Ref بدلاً من State لتجنب إعادة الريندر مع كل حركة ماوس
  const barRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // معادلة حساب النسبة المئوية
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      // تحديث العرض مباشرة في الـ DOM لأقصى سرعة
      barRef.current.style.width = `${scrollPercent}%`;
    };

    // { passive: true } تحسن أداء السكرول في المتصفحات الحديثة
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[99999] bg-transparent pointer-events-none">
      <div 
        ref={barRef}
        className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 shadow-[0_2px_10px_rgba(37,99,235,0.5)] transition-all duration-75 ease-out will-change-[width]"
        style={{ width: '0%' }}
      ></div>
    </div>
  );
};

export default ScrollProgress;