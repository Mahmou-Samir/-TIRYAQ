import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSettings } from '../../context/SettingsContext';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const DistributionChart = ({ medicines = [] }) => {
  const { theme } = useSettings();

  // 🟢 معالجة البيانات: تجميع الكميات حسب الفئة
  const data = useMemo(() => {
    if (!medicines.length) return [];

    // 1. تجميع الداتا (Aggregation)
    const categoryGroups = medicines.reduce((acc, item) => {
      const category = item.category || 'غير مصنف';
      const stock = Number(item.stock) || 0;

      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += stock;
      return acc;
    }, {});

    // 2. تحويلها لشكل يفهمه Recharts
    return Object.keys(categoryGroups).map((key) => ({
      name: key,
      value: categoryGroups[key],
    })).filter(item => item.value > 0); // إخفاء الفئات الصفرية
  }, [medicines]);

  // حالة عدم وجود بيانات
  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
        <PieIcon size={40} className="mb-2 opacity-50" />
        <p>لا توجد أصناف لتوزيعها</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Donut Chart
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke={theme === 'dark' ? '#1e293b' : '#fff'} // حدود القطع حسب الثيم
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', 
              borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
              borderRadius: '12px',
              color: theme === 'dark' ? '#fff' : '#000'
            }} 
            itemStyle={{ color: 'inherit' }}
            formatter={(value) => [`${value} عبوة`, 'الكمية']}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;