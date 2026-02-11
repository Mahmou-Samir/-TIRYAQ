import React, { useState, useEffect } from 'react';
import { User, CheckCircle, AlertCircle, Clock, Loader2, FileText } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const ActivityLog = ({ limit: maxLimit = 5 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 🟢 جلب النشاطات من Firebase
  useEffect(() => {
    // بنجيب آخر النشاطات مرتبة من الأحدث للأقدم
    const q = query(
      collection(db, "activities"), 
      orderBy("createdAt", "desc"), 
      limit(maxLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [maxLimit]);

  // 2. 🟢 دالة حساب "منذ متى" (Time Ago)
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return date.toLocaleDateString('ar-EG');
  };

  // 3. 🟢 تحديد الأيقونة واللون حسب نوع النشاط
  const getActivityStyle = (type) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', icon: <CheckCircle size={16} /> };
      case 'warning': return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: <AlertCircle size={16} /> };
      case 'info': return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: <FileText size={16} /> };
      default: return { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-gray-400', icon: <User size={16} /> };
    }
  };

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" size={20} /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      {activities.length > 0 ? (
        activities.map((log) => {
          const style = getActivityStyle(log.type);
          return (
            <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
              
              {/* الأيقونة */}
              <div className={`p-2 rounded-full shrink-0 ${style.bg} ${style.text}`}>
                {style.icon}
              </div>

              {/* المحتوى */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                  {log.user || 'النظام'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {log.action}
                </p>
              </div>

              {/* الوقت */}
              <div className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                <Clock size={12} />
                {formatTimeAgo(log.createdAt)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          لا توجد نشاطات حديثة
        </div>
      )}
    </div>
  );
};

export default ActivityLog;