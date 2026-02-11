/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // تفعيل خط كايرو كخط أساسي
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        // اللون الأساسي: أزرق ملكي احترافي
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
          light: '#60a5fa',   // blue-400 (للدارك مود)
        },
        // ألوان الخلفيات والنصوص (احترافية جداً)
        dark: {
          bg: colors.slate[950],     // خلفية الصفحة (تقريباً أسود بس فيه زرقة)
          card: colors.slate[900],   // خلفية الكروت والقوائم
          border: colors.slate[800], // لون الحدود والفواصل
          text: colors.slate[100],   // النص الأساسي (أبيض ناصع)
          muted: colors.slate[400]   // النص الفرعي (رمادي فاتح)
        },
        light: {
          bg: colors.slate[50],      // خلفية الصفحة (أبيض مائل للرمادي الفاتح جداً)
          card: '#ffffff',           // خلفية الكروت (أبيض صريح)
          border: colors.slate[200], // الحدود
          text: colors.slate[900],   // النص الأساسي (أسود مزرق)
          muted: colors.slate[500]   // النص الفرعي
        }
      },
      // إضافة ظلال ناعمة لإعطاء عمق
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}