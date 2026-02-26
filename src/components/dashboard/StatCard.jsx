import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon, trend, trendValue, subtitle, color = 'primary' }) => {
  
  // 🎨 خريطة الألوان عشان الكارت يبقى شكله شيك في كل الحالات
  const colorStyles = {
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
  };

  const activeColorClass = colorStyles[color] || colorStyles.primary;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md duration-300">
      
      <div className="flex justify-between items-start mb-4">
        {/* النص والقيمة */}
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
        
        {/* خلفية الأيقونة متغيرة حسب اللون */}
        <div className={`p-3 rounded-2xl ${activeColorClass}`}>
          {icon}
        </div>
      </div>

      {/* مؤشر الصعود والهبوط */}
      <div className="flex items-center gap-2 text-sm">
        {trend === 'up' && (
          <span className="text-green-600 dark:text-green-400 flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg font-bold text-xs">
            <ArrowUpRight size={14} className="mr-1" /> {trendValue}
          </span>
        )}
        
        {trend === 'down' && (
          <span className="text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg font-bold text-xs">
            <ArrowDownRight size={14} className="mr-1" /> {trendValue}
          </span>
        )}

        {trend === 'neutral' && (
          <span className="text-gray-500 flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg font-bold text-xs">
            <Minus size={14} className="mr-1" /> {trendValue}
          </span>
        )}

        {subtitle && (
          <span className="text-gray-400 text-xs truncate max-w-[120px]" title={subtitle}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;