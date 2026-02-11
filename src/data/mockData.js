// بيانات وهمية تحاكي الداتا اللي جاية من الوزارة
export const dashboardStats = {
  totalMedicines: 12500,  // إجمالي الأصناف
  criticalShortages: 42,  // النواقص الحرجة (رقم يخوف)
  activeShipments: 18,    // شحنات في الطريق
  hospitalsServed: 320,   // المستشفيات المغطاة
};

// بيانات الرسم البياني (استهلاك الأنسولين خلال 6 شهور)
export const inventoryTrends = [
  { name: 'يناير', stock: 4000, consumption: 2400 },
  { name: 'فبراير', stock: 3000, consumption: 1398 },
  { name: 'مارس', stock: 2000, consumption: 3800 }, // هنا حصل عجز
  { name: 'أبريل', stock: 2780, consumption: 3908 },
  { name: 'مايو', stock: 1890, consumption: 4800 },
  { name: 'يونيو', stock: 2390, consumption: 3800 },
];

// تنبيهات عاجلة (شريط الأخبار)
export const urgentAlerts = [
  { id: 1, text: "انخفاض مخزون الأنسولين في محافظة سوهاج (أقل من 10%)", type: "critical" },
  { id: 2, text: "تأخر وصول شحنة المحاليل الطبية لميناء الإسكندرية", type: "warning" },
  { id: 3, text: "تم تغطية احتياجات مستشفى الدمرداش بنجاح", type: "success" },
];