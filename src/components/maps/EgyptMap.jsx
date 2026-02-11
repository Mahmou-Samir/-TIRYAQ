import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { useSettings } from '../../context/SettingsContext';
import 'leaflet/dist/leaflet.css';

// Firebase
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

// 1. 🟢 قائمة الـ 27 محافظة بإحداثيات دقيقة
const GOVERNORATES = [
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
  { name: 'الجيزة', lat: 30.0131, lng: 31.2089 },
  { name: 'القليوبية', lat: 30.3292, lng: 31.2168 },
  { name: 'الدقهلية', lat: 31.0409, lng: 31.3785 }, // المنصورة
  { name: 'الشرقية', lat: 30.5765, lng: 31.5041 }, // الزقازيق
  { name: 'الغربية', lat: 30.7865, lng: 31.0004 }, // طنطا
  { name: 'المنوفية', lat: 30.5503, lng: 31.0106 }, // شبين
  { name: 'البحيرة', lat: 31.0499, lng: 30.4670 }, // دمنهور
  { name: 'كفر الشيخ', lat: 31.1082, lng: 30.9295 },
  { name: 'دمياط', lat: 31.4175, lng: 31.8144 },
  { name: 'بورسعيد', lat: 31.2653, lng: 32.3019 },
  { name: 'الإسماعيلية', lat: 30.5965, lng: 32.2715 },
  { name: 'السويس', lat: 29.9668, lng: 32.5498 },
  { name: 'شمال سيناء', lat: 31.1321, lng: 33.8033 }, // العريش
  { name: 'جنوب سيناء', lat: 27.9158, lng: 34.3299 }, // شرم الشيخ
  { name: 'بني سويف', lat: 29.0661, lng: 31.0994 },
  { name: 'الفيوم', lat: 29.3084, lng: 30.8428 },
  { name: 'المنيا', lat: 28.1013, lng: 30.7569 },
  { name: 'أسيوط', lat: 27.1783, lng: 31.1859 },
  { name: 'الوادي الجديد', lat: 25.4390, lng: 30.5586 }, // الخارجة
  { name: 'البحر الأحمر', lat: 27.2579, lng: 33.8116 }, // الغردقة
  { name: 'سوهاج', lat: 26.5590, lng: 31.6957 },
  { name: 'قنا', lat: 26.1582, lng: 32.7183 },
  { name: 'الأقصر', lat: 25.6872, lng: 32.6396 },
  { name: 'أسوان', lat: 24.0889, lng: 32.8998 },
  { name: 'مطروح', lat: 31.3543, lng: 27.2373 }
];

const EgyptMap = () => {
  const { theme } = useSettings();
  const [activeReports, setActiveReports] = useState([]);

  // 2. جلب البلاغات النشطة
  useEffect(() => {
    const q = query(collection(db, "reports"), where("status", "!=", "resolved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        governorate: doc.data().governorate, // 👈 التعديل هنا: بنقرأ اسم المحافظة
        hospital: doc.data().hospital,      // واسم المستشفى
        drug: doc.data().drug,
        priority: doc.data().priority
      }));
      setActiveReports(data);
    });
    return () => unsubscribe();
  }, []);

  // 3. ربط البيانات
  const mapData = useMemo(() => {
    return GOVERNORATES.map(gov => {
      // 🟢 المطابقة الدقيقة: اسم المحافظة في البلاغ == اسم المحافظة في الخريطة
      const govReports = activeReports.filter(r => r.governorate === gov.name);
      
      const isCritical = govReports.some(r => r.priority === 'high');
      const count = govReports.length;

      return {
        ...gov,
        count,
        status: count > 0 ? (isCritical ? 'critical' : 'warning') : 'safe',
        details: govReports
      };
    });
  }, [activeReports]);

  // إعدادات الألوان
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const getColor = (status) => {
    switch(status) {
      case 'critical': return '#ef4444'; 
      case 'warning': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-light-border dark:border-dark-border shadow-soft relative z-0 animate-fade-in">
      <MapContainer center={[26.8, 30.8]} zoom={6} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap' url={tileUrl} />
        {mapData.map((city, index) => (
          <CircleMarker
            key={index}
            center={[city.lat, city.lng]}
            pathOptions={{ 
              color: getColor(city.status), 
              fillColor: getColor(city.status), 
              fillOpacity: 0.6,
              weight: city.status === 'safe' ? 1 : 2
            }}
            radius={city.count > 0 ? 10 + (city.count * 2) : 5} // تكبير الدائرة لو فيه بلاغ
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="font-bold text-sm text-center font-cairo">
                {city.name}
                {city.count > 0 && <span className="block text-red-500">{city.count} بلاغات</span>}
              </div>
            </Tooltip>
            
            {/* تفاصيل البلاغ عند الضغط */}
            {city.count > 0 && (
              <Popup>
                <div className="p-1 text-right min-w-[160px]">
                  <h4 className="font-bold border-b pb-1 mb-2 text-center">{city.name}</h4>
                  <ul className="text-xs space-y-2">
                    {city.details.map((r, i) => (
                      <li key={i} className="bg-red-50 p-1 rounded border border-red-100">
                        <span className="block font-bold text-red-600">{r.drug}</span>
                        <span className="text-gray-500">{r.hospital}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            )}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EgyptMap;