export const CATEGORIES = ['الكل', 'أدوية مزمنة', 'عناية', 'أطفال', 'فيتامينات'];
export const DELIVERY_FEE = 15;

export const CATEGORY_ICONS = {
  'أدوية مزمنة': '💊',
  'عناية': '🧴',
  'أطفال': '🍼',
  'فيتامينات': '🌿',
  'الكل': '✨',
};

export const MOCK_MEDICINES = [
  {
    id: '1', name: 'باندول اكسترا', category: 'أدوية مزمنة', stock: 10, price: 45,
    activeIngredient: 'Paracetamol 500mg + Caffeine',
    manufacturer: 'GSK', form: 'أقراص',
    description: 'مسكن للألم وخافض للحرارة فعّال — يُستخدم لعلاج الصداع، آلام الأسنان، وآلام العضلات.',
    dosage: 'قرص كل 6 ساعات — لا تتجاوز 4 أقراص يومياً',
    sideEffects: ['غثيان خفيف', 'دوخة نادرة'],
    warnings: ['لا تُستخدم مع أدوية الكبد', 'استشر الطبيب في الحمل'],
    alternatives: ['2', '6'],
  },
  {
    id: '2', name: 'باندول أدفانس', category: 'أدوية مزمنة', stock: 8, price: 38,
    activeIngredient: 'Paracetamol 500mg',
    manufacturer: 'GSK', form: 'أقراص',
    description: 'بديل اقتصادي لباندول اكسترا — نفس المادة الفعالة بدون كaffeine.',
    dosage: 'قرص كل 6–8 ساعات حسب الحاجة',
    sideEffects: ['نادراً: طفح جلدي'],
    warnings: ['لا تتجاوز الجرعة اليومية الموصى بها'],
    alternatives: ['1'],
  },
  {
    id: '3', name: 'كونجستال', category: 'أطفال', stock: 5, price: 30,
    activeIngredient: 'Chlorpheniramine + Phenylephrine',
    manufacturer: 'EIPICO', form: 'شراب',
    description: 'لعلاج أعراض البرد والأنفلونزا — سيلان الأنف، العطس، واحتقان الأنف.',
    dosage: '5 مل 3 مرات يومياً (6–12 سنة) — استشر الطبيب للأصغر',
    sideEffects: ['نعاس', 'جفاف الفم'],
    warnings: ['لا يُستخدم مع مضادات الاكتئاب MAOI'],
    alternatives: [],
  },
  {
    id: '4', name: 'فيتامين سي 1000', category: 'فيتامينات', stock: 0, price: 85,
    activeIngredient: 'Ascorbic Acid 1000mg',
    manufacturer: 'Pharco', form: 'أقراص فوارة',
    description: 'مكمل غذائي لتعزيز المناعة ومضاد للأكسدة — يدعم امتصاص الحديد.',
    dosage: 'قرص فوار واحد يومياً بعد الأكل',
    sideEffects: ['إسهال عند الجرعات العالية'],
    warnings: ['مرضى الكلى — استشر الطبيب'],
    alternatives: ['5'],
  },
  {
    id: '5', name: 'فيتامين سي 500', category: 'فيتامينات', stock: 12, price: 55,
    activeIngredient: 'Ascorbic Acid 500mg',
    manufacturer: 'Sigma', form: 'أقراص',
    description: 'جرعة متوسطة من فيتامين سي — مناسبة للاستخدام اليومي.',
    dosage: 'قرص واحد يومياً',
    sideEffects: ['نادر'],
    warnings: [],
    alternatives: ['4'],
  },
  {
    id: '6', name: 'أوميبرازول 20', category: 'أدوية مزمنة', stock: 15, price: 60,
    activeIngredient: 'Omeprazole 20mg',
    manufacturer: 'SEDICO', form: 'كapsules',
    description: 'مثبط لمضخة البروتون — لعلاج حموضة المعدة، GERD، وقرحة الاثني عشر.',
    dosage: 'كapsule واحدة قبل الإفطار بـ 30 دقيقة',
    sideEffects: ['صداع', 'انتفاخ', 'إمساك'],
    warnings: ['الاستخدام الطويل يتطلب متابعة طبية'],
    alternatives: [],
  },
  {
    id: '7', name: 'فيتامين د3 5000', category: 'فيتامينات', stock: 8, price: 120,
    activeIngredient: 'Cholecalciferol 5000 IU',
    manufacturer: 'EVA Pharma', form: 'أقراص',
    description: 'ضروري لامتصاص الكالسيوم وصحة العظام والمناعة.',
    dosage: 'قرص واحد أسبوعياً أو يومياً حسب توصية الطبيب',
    sideEffects: ['نادر عند الجرعات العالية'],
    warnings: ['راقب مستوى فيتamin D في الدم'],
    alternatives: [],
  },
  {
    id: '8', name: 'ديتول 250 مل', category: 'عناية', stock: 20, price: 55,
    activeIngredient: 'Chloroxylenol',
    manufacturer: 'Reckitt', form: 'محلول',
    description: 'معقّم متعدد الاستخدامات للبشرة والأسطح.',
    dosage: 'للاستخدام الخارجي — خفّف 1:40 مع الماء',
    sideEffects: ['تهيج الجلد عند الاستخدام المركز'],
    warnings: ['لا يُبلع — للاستخدام الخارجي فقط'],
    alternatives: [],
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'طلبك في الطريق!', body: 'ORD-48291 سيصل خلال 20 دقيقة.', time: 'الآن', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  { id: 2, title: 'تخفيض 20% على الفيتامينات', body: 'عرض لأوقات محدودة هذا الأسبوع.', time: '2 ساعة', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  { id: 3, title: 'تذكير بالدواء', body: 'حان وقت جرعة الأوميبرازول الصباحية.', time: 'أمس', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
];

export const ORDER_STATUS_LABELS = {
  pending: 'بانتظار التأكيد',
  accepted: 'تم القبول',
  preparing: 'جاري التجهيز',
  ready: 'جاهز للاستلام',
  delivering: 'في الطريق',
  completed: 'تم التوصيل',
  cancelled: 'ملغى',
};
