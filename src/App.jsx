import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { Loader2 } from 'lucide-react';

// 1. Layouts & Auth Wrappers
import Layout from './components/layout/Layout'; 
import PatientLayout from './components/layout/PatientLayout';
import PharmacyLayout from './components/layout/PharmacyLayout'; 
import ProtectedRoute from './components/auth/ProtectedRoute';

// 2. Lazy Load Pages (لتحسين الأداء وفصل البوابات عن بعضها)
// -- Auth --
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Register = lazy(() => import('./pages/Register'));

// -- Admin --
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const Logistics = lazy(() => import('./pages/admin/Logistics'));
const Alerts = lazy(() => import('./pages/admin/Alerts'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Predictions = lazy(() => import('./pages/admin/Predictions'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

// -- Pharmacy --
const PharmacyDashboard = lazy(() => import('./pages/pharmacy/Dashboard')); 
const UploadStock = lazy(() => import('./pages/pharmacy/UploadStock'));
const InventoryManager = lazy(() => import('./pages/pharmacy/InventoryManager'));
const PharmacyOrders = lazy(() => import('./pages/pharmacy/Orders'));
// ✅ تم تعديل الاستيراد ليكون متوافقاً مع Lazy Load للأداء العالي
const PharmacyProfile = lazy(() => import('./pages/pharmacy/Profile'));
const PharmacySettings = lazy(() => import('./pages/pharmacy/Settings'));

// -- Patient --
const PatientSearch = lazy(() => import('./pages/patient/PatientSearch'));
const PatientOrders = lazy(() => import('./pages/patient/Orders'));
const PatientProfile = lazy(() => import('./pages/patient/Profile'));

// 🌀 مكون تحميل مركزي أنيق (Loading Spinner)
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-blue-600">
    <Loader2 size={48} className="animate-spin mb-4" />
    <p className="text-sm font-bold text-slate-400 tracking-widest animate-pulse">جاري تحميل النظام...</p>
  </div>
);

const App = () => {
  return (
    <SettingsProvider>
      {/* Suspense يغلف كل الراوتر لعرض اللودر أثناء تحميل الملفات */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          
          {/* 🌍 Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 👮 Admin Portal (Blue Theme) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* 🏥 Pharmacy Portal (Emerald Theme) */}
          <Route path="/pharmacy" element={
            <ProtectedRoute allowedRoles={['pharmacy', 'admin']}>
              <PharmacyLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PharmacyDashboard />} />
            <Route path="upload" element={<UploadStock />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="orders" element={<PharmacyOrders />} />
            {/* ✅ تم نقل المسارات هنا لتعمل بشكل صحيح داخل بوابة الصيدلية */}
            <Route path="profile" element={<PharmacyProfile />} />
            <Route path="settings" element={<PharmacySettings />} />
          </Route>

          {/* 👤 Patient Portal (Mobile First) */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PatientSearch />} />
            <Route path="orders" element={<PatientOrders />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="history" element={<div className="p-10 text-center pt-32 text-slate-500">سجل العمليات (قريباً)</div>} />
          </Route>

          {/* 404 - Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </SettingsProvider>
  );
};

export default App;