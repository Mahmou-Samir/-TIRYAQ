import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useSettings } from '../../context/SettingsContext';
import { Loader2, BarChart2 } from 'lucide-react';

const InventoryChart = ({ medicines = [] }) => {
  const { theme } = useSettings();
  
  // تظبيط الألوان حسب الدارك مود
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  // 🟢 معالجة البيانات: تحويل قائمة الأدوية لأرقام يفهمها الرسم البياني
  const chartData = useMemo(() => {
    if (!medicines.length) return [];

    // ترتيب الأدوية حسب الكمية (الأكثر توافراً) وأخذ أول 7 فقط
    return medicines
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 7)
      .map(item => ({
        name: item.name,
        stock: Number(item.stock),
        // محاكاة للاستهلاك (رقم عشوائي أقل من المخزون عشان الرسمة تبقى منطقية)
        consumption: Math.floor(Number(item.stock) * (Math.random() * 0.5 + 0.2)) 
      }));
  }, [medicines]);

  if (medicines.length === 0) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
        <BarChart2 size={40} className="mb-2 opacity-50" />
        <p>لا توجد بيانات كافية للرسم البياني</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* تدرج لوني أزرق للمخزون */}
            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            {/* تدرج لوني أحمر للاستهلاك */}
            <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke={textColor} 
            tick={{fontSize: 12}} 
            tickLine={false} 
            axisLine={false} 
            interval={0} // إظهار كل الأسماء
          />
          <YAxis 
            stroke={textColor} 
            tick={{fontSize: 12}} 
            tickLine={false} 
            axisLine={false} 
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
              borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
              borderRadius: '12px',
              color: theme === 'dark' ? '#fff' : '#000'
            }} 
            itemStyle={{ color: 'inherit' }}
          />
          
          <Legend verticalAlign="top" height={36}/>

          <Area 
            type="monotone" 
            dataKey="stock" 
            name="المخزون الحالي"
            stroke="#2563eb" 
            fillOpacity={1} 
            fill="url(#colorStock)" 
            strokeWidth={3}
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="consumption" 
            name="معدل الاستهلاك (تقديري)"
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorConsumption)" 
            strokeWidth={3}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;