export const translations = {
  ar: {
    // =================================================================
    // 1. القوائم والاتجاهات العامة (Global & Navigation)
    // =================================================================
    appTitle: "ترياق",
    appSubtitle: "نظام القيادة الطبي",
    
    // Sidebar Links
    dashboard: "غرفة القيادة",
    inventory: "المخزون المركزي",
    logistics: "الإمداد واللوجستيات",
    predictions: "الذكاء الاصطناعي (AI)",
    reports: "التقارير والتحليلات",
    alerts: "إدارة الاستغاثات",
    settings: "الإعدادات",
    support: "مركز الدعم",
    profile: "الملف الشخصي",

    // Navbar Actions
    searchPlaceholder: "بحث عن دواء، مستشفى، أو محافظة...",
    notifications: "الإشعارات",
    markRead: "تحديد كمقروء",
    noNotifications: "لا توجد إشعارات جديدة",
    theme: "المظهر",
    language: "اللغة",
    logout: "تسجيل الخروج",
    roleAdmin: "مدير النظام",
    rolePharmacy: "صيدلية",

    // =================================================================
    // 2. الصفحة الرئيسية (Landing Page)
    // =================================================================
    home: {
      nav: {
        features: "المميزات",
        about: "عن النظام",
        services: "الخدمات",
        app: "التطبيق",
        login: "دخول النظام",
        start: "انضم إلينا"
      },
      hero: {
        badge: "المنصة الوطنية للأمن الدوائي",
        titleStart: "لا مزيد من",
        titleHighlight: "نقص الدواء",
        desc: "شبكة موحدة تربط الصيدليات والمخازن بغرفة عمليات مركزية لضمان توفر الدواء لكل مريض باستخدام الذكاء الاصطناعي.",
        btnPatient: "بحث عن دواء",
        btnPharmacy: "دخول المنشآت",
        stats: { coverage: "تغطية شاملة", pharmacies: "نقطة توزيع", accuracy: "دقة بيانات" }
      },
      features: {
        title: "نظام بيئي متكامل",
        subtitle: "حلول تقنية لجميع الأطراف",
        patientTitle: "للمرضى",
        patientDesc: "محرك بحث لحظي يخبرك بمكان الدواء وسعره وحجزه فوراً.",
        adminTitle: "لصناع القرار",
        adminDesc: "لوحة تحكم (Dashboard) تكشف أماكن العجز والفائض لحظياً.",
        pharmacyTitle: "للصيدليات",
        pharmacyDesc: "نظام إدارة مخزون ذكي يقلل الهالك ويزيد المبيعات.",
        actionBtn: "اقرأ المزيد"
      },
      about: {
        title: "لماذا ترياق؟",
        subtitle: "رؤية مصرية بمعايير عالمية",
        desc: "نحن نبني البنية التحتية الرقمية لقطاع الدواء، لضمان أن الحق في الدواء مكفول للجميع في الوقت المناسب.",
        point1: "ربط 27 محافظة",
        point2: "تشفير تام للبيانات",
        point3: "تحديث لحظي للمخزون"
      },
      steps: {
        title: "كيف يعمل النظام؟",
        step1: "الربط",
        step1Desc: "ربط نظام الصيدلية بقاعدة البيانات المركزية.",
        step2: "التحليل",
        step2Desc: "الذكاء الاصطناعي يحلل الاستهلاك ويتوقع النواقص.",
        step3: "التوجيه",
        step3Desc: "توجيه المخزون من أماكن الفائض لأماكن العجز."
      },
      app: {
        title: "صيدليتك في جيبك",
        desc: "حمل تطبيق ترياق وتابع مخزونك أو ابحث عن أدويتك بسهولة.",
        btn: "تحميل التطبيق"
      },
      testimonials: {
        title: "شركاء النجاح",
        review1: "النظام ساعدنا في تقليل الهالك بنسبة 40%.",
        author1: "د. خالد - صيدليات مصر",
        review2: "أفضل تجربة مستخدم رأيتها في نظام حكومي.",
        author2: "م. سارة - مطورة نظم",
        review3: "وجدت دواء والدي في 5 دقائق بعد بحث أيام.",
        author3: "أستاذ محمد"
      },
      cta: {
        title: "كن جزءاً من الحل",
        desc: "انضم لأكبر شبكة دوائية في الشرق الأوسط.",
        btn: "سجل صيدليتك الآن"
      },
      footer: { copyright: "© 2026 جميع الحقوق محفوظة لنظام ترياق." }
    },

    // =================================================================
    // 3. لوحة التحكم (Dashboard)
    // =================================================================
    greetingMorning: "صباح الخير",
    greetingEvening: "مساء الخير",
    welcomeMessage: "إليك ملخص الوضع الدوائي اليوم.",
    
    stats: {
      totalItems: "إجمالي الأصناف",
      criticalShortage: "نواقص حرجة",
      totalStock: "إجمالي الوحدات",
      incomingShipments: "شحنات قادمة",
      activeAlerts: "بلاغات مفتوحة",
      expiringSoon: "تنتهي قريباً"
    },

    mapTitle: "الخريطة الحرارية للمخزون",
    mapSubtitle: "توزيع الأدوية ومناطق العجز",
    
    charts: {
      inventoryAnalysis: "تحليل حركة المخزون",
      categoryDistribution: "توزيع الفئات العلاجية",
      salesTrend: "مؤشر المبيعات"
    },

    liveAlerts: "شريط التنبيهات الحية",
    activityLog: "سجل العمليات الحديثة",
    
    // =================================================================
    // 4. المخزون (Inventory Page)
    // =================================================================
    inventoryTitle: "إدارة المخزون",
    inventorySubtitle: "قاعدة بيانات الأدوية والمستلزمات",
    addItem: "إضافة صنف جديد",
    importExcel: "استيراد Excel",
    exportData: "تصدير تقرير",
    
    table: {
      name: "اسم الصنف",
      category: "الفئة",
      sku: "كود الصنف (SKU)",
      stock: "الكمية الحالية",
      price: "سعر الجمهور",
      expiry: "تاريخ الصلاحية",
      status: "الحالة",
      actions: "إجراءات"
    },
    
    statusCodes: {
      good: "متوفر",
      low: "منخفض",
      out: "نفذت الكمية",
      expired: "منتهية الصلاحية"
    },

    // =================================================================
    // 5. البلاغات والمودال (Alerts & Modal)
    // =================================================================
    alertsTitle: "إدارة البلاغات",
    reportEmergency: "إبلاغ عن نقص حاد",
    
    // Modal Form
    reportTitle: "تسجيل بلاغ نقص",
    alertNote: "تنبيه: دقة البيانات تساعدنا في توجيه الدعم بسرعة.",
    governorate: "المحافظة",
    hospitalName: "اسم المنشأة الصحية",
    drugName: "اسم الدواء الناقص",
    priority: "درجة الأهمية",
    priorities: {
      high: "عالي الخطورة (توقف خدمة)",
      medium: "متوسط (يوجد بديل)",
      low: "منخفض (مخزون احتياطي)"
    },
    
    // Actions
    sendReport: "إرسال البلاغ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    loading: "جاري المعالجة...",
    successMsg: "تمت العملية بنجاح",
    errorMsg: "حدث خطأ غير متوقع",

    // =================================================================
    // 6. الإعدادات (Settings)
    // =================================================================
    settingsTitle: "إعدادات النظام",
    generalSettings: "عام",
    securitySettings: "الأمان",
    
    themeToggle: "الوضع الليلي",
    langToggle: "تغيير اللغة",
    notificationsToggle: "تفعيل الإشعارات",
    changePassword: "تغيير كلمة المرور",
    saveChanges: "حفظ التغييرات",

    // =================================================================
    // 7. صفحة الدخول (Auth)
    // =================================================================
    loginTitle: "تسجيل الدخول",
    loginSubtitle: "أدخل بيانات حسابك للمتابعة",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    loginBtn: "دخول",
    noAccount: "ليس لديك حساب؟",
    registerNow: "سجل منشأتك الآن"
  },

  en: {
    // =================================================================
    // 1. Global & Navigation
    // =================================================================
    appTitle: "Tiryaq",
    appSubtitle: "Medical Command System",
    
    // Sidebar Links
    dashboard: "Dashboard",
    inventory: "Central Inventory",
    logistics: "Logistics & Supply",
    predictions: "AI Predictions",
    reports: "Reports & Analytics",
    alerts: "Alerts Management",
    settings: "Settings",
    support: "Support Center",
    profile: "Profile",

    // Navbar Actions
    searchPlaceholder: "Search drug, hospital, region...",
    notifications: "Notifications",
    markRead: "Mark as Read",
    noNotifications: "No new notifications",
    theme: "Theme",
    language: "Language",
    logout: "Logout",
    roleAdmin: "System Admin",
    rolePharmacy: "Pharmacy",

    // =================================================================
    // 2. Landing Page
    // =================================================================
    home: {
      nav: {
        features: "Features",
        about: "About",
        services: "Services",
        app: "App",
        login: "Login",
        start: "Get Started"
      },
      hero: {
        badge: "National Drug Security Platform",
        titleStart: "No More",
        titleHighlight: "Drug Shortages",
        desc: "A unified network connecting pharmacies and warehouses to a central command room ensuring drug availability for every patient via AI.",
        btnPatient: "Find Medicine",
        btnPharmacy: "Facility Login",
        stats: { coverage: "Full Coverage", pharmacies: "Distribution Points", accuracy: "Data Accuracy" }
      },
      features: {
        title: "Integrated Ecosystem",
        subtitle: "Tech Solutions for Everyone",
        patientTitle: "For Patients",
        patientDesc: "Real-time search engine to locate, price, and reserve medicine instantly.",
        adminTitle: "For Decision Makers",
        adminDesc: "Dashboard revealing surplus and deficit locations in real-time.",
        pharmacyTitle: "For Pharmacies",
        pharmacyDesc: "Smart inventory management reducing waste and increasing sales.",
        actionBtn: "Read More"
      },
      about: {
        title: "Why Tiryaq?",
        subtitle: "Egyptian Vision, Global Standards",
        desc: "We are building the digital infrastructure for the pharmaceutical sector to ensure the right to medicine for everyone on time.",
        point1: "Connecting 27 Governorates",
        point2: "End-to-End Encryption",
        point3: "Real-time Stock Updates"
      },
      steps: {
        title: "How It Works?",
        step1: "Connect",
        step1Desc: "Linking pharmacy system to central DB.",
        step2: "Analyze",
        step2Desc: "AI analyzes consumption and predicts shortages.",
        step3: "Direct",
        step3Desc: "Routing stock from surplus to deficit areas."
      },
      app: {
        title: "Pharmacy in Your Pocket",
        desc: "Download Tiryaq app to track your stock or find medicines easily.",
        btn: "Download App"
      },
      testimonials: {
        title: "Success Partners",
        review1: "System helped us reduce waste by 40%.",
        author1: "Dr. Khaled - Misr Pharmacies",
        review2: "Best user experience I've seen in a government system.",
        author2: "Eng. Sarah - Systems Dev",
        review3: "Found my father's medicine in 5 mins after days of searching.",
        author3: "Mr. Mohamed"
      },
      cta: {
        title: "Be Part of the Solution",
        desc: "Join the largest pharmaceutical network in the Middle East.",
        btn: "Register Now"
      },
      footer: { copyright: "© 2026 All rights reserved to Tiryaq System." }
    },

    // =================================================================
    // 3. Dashboard
    // =================================================================
    greetingMorning: "Good Morning",
    greetingEvening: "Good Evening",
    welcomeMessage: "Here is today's pharmaceutical status summary.",
    
    stats: {
      totalItems: "Total Items",
      criticalShortage: "Critical Shortages",
      totalStock: "Total Units",
      incomingShipments: "Incoming Shipments",
      activeAlerts: "Open Alerts",
      expiringSoon: "Expiring Soon"
    },

    mapTitle: "Stock Heatmap",
    mapSubtitle: "Drug Distribution & Deficit Areas",
    
    charts: {
      inventoryAnalysis: "Stock Movement Analysis",
      categoryDistribution: "Therapeutic Class Dist.",
      salesTrend: "Sales Trend"
    },

    liveAlerts: "Live Alerts Feed",
    activityLog: "Recent Activity Log",
    
    // =================================================================
    // 4. Inventory Page
    // =================================================================
    inventoryTitle: "Inventory Management",
    inventorySubtitle: "Medicines & Supplies Database",
    addItem: "Add New Item",
    importExcel: "Import Excel",
    exportData: "Export Report",
    
    table: {
      name: "Item Name",
      category: "Category",
      sku: "SKU",
      stock: "Current Stock",
      price: "Public Price",
      expiry: "Expiry Date",
      status: "Status",
      actions: "Actions"
    },
    
    statusCodes: {
      good: "Available",
      low: "Low Stock",
      out: "Out of Stock",
      expired: "Expired"
    },

    // =================================================================
    // 5. Alerts & Modal
    // =================================================================
    alertsTitle: "Alerts Management",
    reportEmergency: "Report Critical Shortage",
    
    // Modal Form
    reportTitle: "Register Shortage Report",
    alertNote: "Note: Accurate data helps us direct support faster.",
    governorate: "Governorate",
    hospitalName: "Health Facility Name",
    drugName: "Missing Drug Name",
    priority: "Priority Level",
    priorities: {
      high: "High Risk (Service Stop)",
      medium: "Medium (Alternative Available)",
      low: "Low (Buffer Stock)"
    },
    
    // Actions
    sendReport: "Submit Report",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Processing...",
    successMsg: "Operation Successful",
    errorMsg: "Unexpected Error Occurred",

    // =================================================================
    // 6. Settings
    // =================================================================
    settingsTitle: "System Settings",
    generalSettings: "General",
    securitySettings: "Security",
    
    themeToggle: "Dark Mode",
    langToggle: "Change Language",
    notificationsToggle: "Enable Notifications",
    changePassword: "Change Password",
    saveChanges: "Save Changes",

    // =================================================================
    // 7. Auth Page
    // =================================================================
    loginTitle: "Login",
    loginSubtitle: "Enter your credentials to continue",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot Password?",
    loginBtn: "Login",
    noAccount: "Don't have an account?",
    registerNow: "Register Facility Now"
  }
};