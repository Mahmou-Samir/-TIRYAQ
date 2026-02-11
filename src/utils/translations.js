export const translations = {
  ar: {
    // 🏠 نصوص الصفحة الرئيسية
    home: {
      nav: { features: "المميزات", services: "الخدمات", about: "عن المشروع", login: "تسجيل الدخول", start: "ابدأ الآن" },
      hero: {
        badge: "المنصة الوطنية للأمن الدوائي",
        titleStart: "لا مزيد من",
        titleHighlight: "نقص الدواء.",
        desc: "نظام مركزي ذكي يربط المرضى بالصيدليات وغرفة العمليات المركزية لضمان توفر الدواء في كل مكان باستخدام الذكاء الاصطناعي.",
        btnPatient: "أنا مريض (بحث)",
        btnPharmacy: "دخول المنشآت",
        stats: { coverage: "تغطية شاملة", pharmacies: "صيدلية مسجلة", accuracy: "دقة البيانات" }
      },
      features: {
        title: "نظام متكامل للجميع",
        subtitle: "ترياق لا يخدم المرضى فقط، بل يقدم حلولاً ذكية للصيادلة وصناع القرار.",
        patientTitle: "للمرضى",
        patientDesc: "محرك بحث لحظي يمكنك من العثور على الأدوية الناقصة في أقرب صيدلية وحجزها فوراً.",
        adminTitle: "للمسؤولين",
        adminDesc: "لوحة تحكم مدعومة بالذكاء الاصطناعي للتنبؤ بالنواقص وتوجيه الإمدادات قبل حدوث الأزمات.",
        pharmacyTitle: "للصيدليات",
        pharmacyDesc: "إدارة ذكية للمخزون، طلب طلبيات آلية، والإبلاغ الفوري عن النواقص لوزارة الصحة.",
        actionBtn: "المزيد"
      },
      about: {
        title: "لماذا ترياق؟",
        subtitle: "حلول تقنية لمشاكل واقعية",
        desc: "نحن لا نقدم مجرد برنامج، بل نبني بنية تحتية رقمية تربط كافة أطراف المنظومة الصحية في شبكة واحدة مشفرة وآمنة لضمان وصول الدواء لمستحقيه.",
        point1: "ربط 27 محافظة لحظياً",
        point2: "تشفير البيانات (End-to-End)",
        point3: "دعم فني 24/7"
      },
      steps: {
        title: "كيف يعمل النظام؟",
        step1: "تسجيل الصيدلية",
        step1Desc: "تقوم الصيدلية برفع مخزونها عبر ملف Excel.",
        step2: "التحليل الذكي",
        step2Desc: "يقوم الذكاء الاصطناعي برصد النواقص وتوجيهها.",
        step3: "بحث المريض",
        step3Desc: "يجد المريض الدواء ويحجزه من التطبيق."
      },
      app: {
        title: "صيدليتك في جيبك",
        desc: "حمل تطبيق ترياق الآن واستمتع بتجربة بحث عن الدواء لم يسبق لها مثيل. متوفر للأندرويد والآيفون.",
        btn: "حمل التطبيق"
      },
      testimonials: {
        title: "شركاء النجاح",
        review1: "نظام ترياق وفر علينا ساعات من البحث عن النواقص. تجربة ممتازة.",
        author1: "د. أحمد - صيدليات مصر",
        review2: "الداشبورد ساعدتنا في التنبؤ باحتياجات السوق قبل حدوث الأزمة.",
        author2: "د. سارة - وزارة الصحة",
        review3: "كمريض، التطبيق أنقذ حياتي حرفياً في إيجاد الأنسولين.",
        author3: "أستاذ محمد - مستخدم"
      },
      cta: {
        title: "هل أنت جاهز للانضمام؟",
        desc: "انضم لأكثر من 5000 صيدلية ومستشفى يثقون في ترياق.",
        btn: "سجل مجاناً"
      },
      footer: { copyright: "© 2026 جميع الحقوق محفوظة لنظام ترياق." }
    },

    // 1. القائمة الجانبية (Sidebar)
    appTitle: "ترياق",
    appSubtitle: "نظام القيادة الطبي",
    dashboard: "غرفة القيادة",
    predictions: "العراف (AI)",
    inventory: "المخزون المركزي",
    logistics: "الإمداد واللوجستيات",
    reports: "التقارير",
    alerts: "إدارة الاستغاثات",
    settings: "الإعدادات",
    support: "مركز الدعم",
    profile: "الملف الشخصي",

    // 2. الهيدر (Header)
    search: "بحث عن دواء، مستشفى، أو محافظة...",
    notifications: "الإشعارات",
    markAllRead: "تحديد الكل كمقروء",
    noNotifications: "لا توجد إشعارات جديدة",
    role: "مدير النظام",
    logout: "تسجيل خروج",
    theme: "المظهر",
    language: "اللغة",

    // 3. لوحة التحكم (Dashboard)
    welcome: "أهلاً بك،",
    greetingMorning: "صباح الخير",
    greetingEvening: "مساء الخير",
    overview: "نظرة عامة",
    stats: {
      totalItems: "إجمالي الأصناف",
      criticalShortage: "نواقص حرجة",
      totalStock: "إجمالي المخزون",
      incomingShipments: "شحنات قادمة",
      activeAlerts: "بلاغات نشطة"
    },
    mapTitle: "خريطة التوزيع الجغرافي",
    mapSubtitle: "تغطية المستشفيات والمخازن",
    charts: {
      inventoryAnalysis: "تحليل المخزون",
      categoryDistribution: "توزيع الفئات"
    },
    liveAlerts: "مركز التنبيهات",
    activityLog: "سجل النشاطات",
    urgent: "عاجل",
    stable: "مستقر",

    // 4. المخزون (Inventory)
    inventoryTitle: "إدارة المخزون",
    inventorySubtitle: "إدارة وتتبع الأدوية في كافة المحافظات",
    addItem: "إضافة صنف",
    editItem: "تعديل صنف",
    deleteItem: "حذف",
    table: {
      name: "اسم الدواء",
      category: "الفئة",
      stock: "الكمية",
      status: "الحالة",
      actions: "الإجراءات"
    },
    status: {
      good: "متوفر",
      low: "وشك النفاذ",
      out: "نفذت الكمية"
    },

    // 5. البلاغات (Alerts)
    alertsTitle: "إدارة الاستغاثات",
    alertsSubtitle: "غرفة العمليات المركزية لمتابعة النواقص",
    filterAll: "الكل",
    filterPending: "انتظار",
    filterProcessing: "جاري العمل",
    filterResolved: "تم الحل",
    itemShortage: "نقص في صنف",
    startAction: "بدء التعامل",
    closeAlert: "إغلاق البلاغ",
    solved: "تم الحل",
    confirmDelete: "هل أنت متأكد من حذف هذا البلاغ؟",
    noAlerts: "لا توجد بلاغات حالياً",
    statusStable: "الوضع مستقر",
    reportEmergency: "إبلاغ طارئ",
    reportTitle: "إنشاء بلاغ جديد",
    hospitalName: "المستشفى / المركز",
    governorate: "المحافظة",
    drugName: "اسم الصنف",
    priority: "الأولوية",
    priorities: {
      high: "حرج جداً",
      medium: "متوسط",
      low: "منخفض"
    },
    sendReport: "إرسال البلاغ",
    cancel: "إلغاء",
    confirm: "تأكيد",

    // التنبؤات (Predictions)
    predictionsTitle: "تحليل الذكاء الاصطناعي",
    predictionsSubtitle: "التنبؤ بالاحتياجات المستقبلية بناءً على البيانات التاريخية",
    simulationPanel: "لوحة المحاكاة",
    demandRate: "معدل الطلب المتوقع",
    supplyEfficiency: "كفاءة سلسلة الإمداد",
    aiAnalysis: "تحليل النظام",
    chartTitle: "مسار المخزون المستقبلي",
    actualData: "بيانات فعلية",
    predictedData: "تنبؤ AI",
    today: "اليوم",
    recommendations: "توصيات ذكية",
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر"],
    rec1: { title: "إعادة توزيع", desc: "يوجد فائض في مخازن الدلتا بنسبة 20%.", action: "نقل المخزون" },
    rec2: { title: "شحنة عاجلة", desc: "توقع بنفاد المخزون خلال 60 يوم.", action: "طلب توريد" },
    rec3: { title: "تحسين التكلفة", desc: "فرصة لتوفير 15% عبر مورد بديل.", action: "عرض البدائل" },

    // 6. الإعدادات والبروفايل
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    personalInfo: "المعلومات الشخصية",
    workInfo: "معلومات العمل",
    security: "الأمان",
    settingsTitle: "الإعدادات",
    settingsSubtitle: "التحكم في تفضيلات النظام والأمان",
    securityTitle: "الأمان والحماية",
    twoFactor: "المصادقة الثنائية (2FA)",
    twoFactorDesc: "زيادة أمان الحساب عن طريق رمز SMS",
    autoPass: "تغيير كلمة المرور تلقائياً",
    autoPassDesc: "تذكير بتغيير كلمة المرور كل 90 يوم",
    changePass: "تغيير كلمة المرور الحالية",
    notificationsTitle: "التنبيهات",
    criticalAlerts: "تنبيهات النواقص الحرجة",
    criticalAlertsDesc: "إشعار فوري عند وصول المخزون للصفر",
    emailReports: "رسائل البريد الإلكتروني",
    emailReportsDesc: "استلام التقارير اليومية عبر الإيميل",
    appearanceTitle: "واجهة النظام",
    themeToggle: "الوضع المظلم / الفاتح",
    themeDesc: "التبديل بين الثيمات",
    langToggle: "اللغة / Language",
    langDesc: "العربية - English",

    // رسائل عامة
    loading: "جاري التحميل...",
    success: "تمت العملية بنجاح",
    error: "حدث خطأ ما",
    noData: "لا توجد بيانات للعرض"
  },

  en: {
    // 🏠 Home Page Texts
    home: {
      nav: { features: "Features", services: "Services", about: "About", login: "Login", start: "Get Started" },
      hero: {
        badge: "National Drug Security Platform",
        titleStart: "No More",
        titleHighlight: "Drug Shortages.",
        desc: "A smart central system connecting patients, pharmacies, and the central command room to ensure drug availability everywhere using AI.",
        btnPatient: "I'm a Patient (Search)",
        btnPharmacy: "Facility Login",
        stats: { coverage: "Full Coverage", pharmacies: "Pharmacies", accuracy: "Data Accuracy" }
      },
      features: {
        title: "An Integrated Ecosystem",
        subtitle: "Tiryaq serves not only patients but provides smart solutions for pharmacists and decision-makers.",
        patientTitle: "For Patients",
        patientDesc: "Real-time search engine to find scarce medicines in the nearest pharmacy and reserve them instantly.",
        adminTitle: "For Admins",
        adminDesc: "AI-powered dashboard to predict shortages and direct supplies before crises occur.",
        pharmacyTitle: "For Pharmacies",
        pharmacyDesc: "Smart inventory management, automated ordering, and immediate shortage reporting.",
        actionBtn: "More"
      },
      about: {
        title: "Why Tiryaq?",
        subtitle: "Tech Solutions for Real Problems",
        desc: "We don't just offer software; we build a digital infrastructure connecting all health ecosystem parties in a secure network.",
        point1: "Real-time connection across 27 governorates",
        point2: "End-to-End Encryption",
        point3: "24/7 Technical Support"
      },
      steps: {
        title: "How It Works",
        step1: "Pharmacy Registration",
        step1Desc: "Pharmacy uploads stock via Excel.",
        step2: "Smart Analysis",
        step2Desc: "AI monitors shortages and directs supply.",
        step3: "Patient Search",
        step3Desc: "Patient finds and reserves medicine via app."
      },
      app: {
        title: "Your Pharmacy in Your Pocket",
        desc: "Download Tiryaq app now and experience medicine search like never before. Available for Android & iOS.",
        btn: "Download App"
      },
      testimonials: {
        title: "Success Partners",
        review1: "Tiryaq saved us hours searching for shortages. Excellent experience.",
        author1: "Dr. Ahmed - Misr Pharmacies",
        review2: "The dashboard helped us predict market needs before crises occur.",
        author2: "Dr. Sarah - Ministry of Health",
        review3: "As a patient, this app literally saved my life finding Insulin.",
        author3: "Mr. Mohamed - User"
      },
      cta: {
        title: "Ready to Join?",
        desc: "Join over 5000 pharmacies and hospitals trusting Tiryaq.",
        btn: "Register for Free"
      },
      footer: { copyright: "© 2026 All rights reserved to Tiryaq System." }
    },

    // 1. Sidebar
    appTitle: "Tiryaq",
    appSubtitle: "Medical Command System",
    dashboard: "Command Center",
    predictions: "AI Oracle",
    inventory: "Central Inventory",
    logistics: "Logistics",
    reports: "Reports",
    alerts: "Alerts Management",
    settings: "Settings",
    support: "Support Center",
    profile: "Profile",

    // 2. Header
    search: "Search for drug, hospital, or region...",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No new notifications",
    role: "System Admin",
    logout: "Logout",
    theme: "Theme",
    language: "Language",

    // 3. Dashboard
    welcome: "Welcome,",
    greetingMorning: "Good Morning",
    greetingEvening: "Good Evening",
    overview: "Overview",
    stats: {
      totalItems: "Total Items",
      criticalShortage: "Critical Shortage",
      totalStock: "Total Stock",
      incomingShipments: "Incoming Shipments",
      activeAlerts: "Active Alerts"
    },
    mapTitle: "Geographical Distribution",
    mapSubtitle: "Hospitals & Warehouses Coverage",
    charts: {
      inventoryAnalysis: "Inventory Analysis",
      categoryDistribution: "Category Distribution"
    },
    liveAlerts: "Live Alerts Center",
    activityLog: "Activity Log",
    urgent: "Urgent",
    stable: "Stable",

    // 4. Inventory
    inventoryTitle: "Inventory Management",
    inventorySubtitle: "Track and manage stock across governorates",
    addItem: "Add Item",
    editItem: "Edit Item",
    deleteItem: "Delete",
    table: {
      name: "Drug Name",
      category: "Category",
      stock: "Quantity",
      status: "Status",
      actions: "Actions"
    },
    status: {
      good: "Available",
      low: "Running Low",
      out: "Out of Stock"
    },

    // 5. Alerts
    alertsTitle: "Alerts Management",
    alertsSubtitle: "Central Operations Room for Shortages",
    filterAll: "All",
    filterPending: "Pending",
    filterProcessing: "Processing",
    filterResolved: "Resolved",
    itemShortage: "Item Shortage",
    startAction: "Start Action",
    closeAlert: "Close Alert",
    solved: "Resolved",
    confirmDelete: "Are you sure you want to delete this alert?",
    noAlerts: "No alerts found",
    statusStable: "Status is stable",
    reportEmergency: "Emergency Report",
    reportTitle: "Create New Report",
    hospitalName: "Hospital / Center",
    governorate: "Governorate",
    drugName: "Drug Name",
    priority: "Priority",
    priorities: {
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    sendReport: "Submit Report",
    cancel: "Cancel",
    confirm: "Confirm",

    // Predictions
    predictionsTitle: "AI Predictions",
    predictionsSubtitle: "Forecasting future needs based on historical data",
    simulationPanel: "Simulation Panel",
    demandRate: "Expected Demand Rate",
    supplyEfficiency: "Supply Chain Efficiency",
    aiAnalysis: "System Analysis",
    chartTitle: "Future Inventory Trajectory",
    actualData: "Actual Data",
    predictedData: "AI Forecast",
    today: "Today",
    recommendations: "Smart Recommendations",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    rec1: { title: "Redistribution", desc: "20% surplus detected in Delta region.", action: "Transfer Stock" },
    rec2: { title: "Urgent Shipment", desc: "Stockout predicted within 60 days.", action: "Order Supply" },
    rec3: { title: "Cost Optimization", desc: "Save 15% by switching suppliers.", action: "View Options" },

    // 6. Settings & Profile
    saveChanges: "Save Changes",
    saving: "Saving...",
    personalInfo: "Personal Info",
    workInfo: "Work Info",
    security: "Security",
    settingsTitle: "Settings",
    settingsSubtitle: "Manage system preferences and security",
    securityTitle: "Security & Protection",
    twoFactor: "Two-Factor Auth (2FA)",
    twoFactorDesc: "Enhance security via SMS verification",
    autoPass: "Auto Password Change",
    autoPassDesc: "Reminder to change password every 90 days",
    changePass: "Change Current Password",
    notificationsTitle: "Notifications",
    criticalAlerts: "Critical Shortage Alerts",
    criticalAlertsDesc: "Instant notification when stock hits zero",
    emailReports: "Email Reports",
    emailReportsDesc: "Receive daily reports via email",
    appearanceTitle: "System Interface",
    themeToggle: "Dark / Light Mode",
    themeDesc: "Toggle system theme",
    langToggle: "Language / اللغة",
    langDesc: "English - Arabic",

    // General Messages
    loading: "Loading...",
    success: "Operation Successful",
    error: "Something went wrong",
    noData: "No data to display"
  }
};