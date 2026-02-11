import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';

// 1. Pages (General & Auth)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// 2. Pages (Admin Dashboard)
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Logistics from './pages/Logistics';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Predictions from './pages/Predictions';
import Settings from './pages/Settings';
import Profile from './pages/Profile'; // 👈 ده بروفايل الأدمن (Admin Profile)

// 3. Pages (Patient)
import PatientLayout from './components/layout/PatientLayout';
import PatientHome from './pages/patient/Home';
import PatientOrders from './pages/patient/Orders';
import PatientProfile from './pages/patient/Profile'; // 🟢 هام: استيراد بروفايل المريض الجديد

// 4. Pages (Pharmacy)
import UploadStock from './pages/pharmacy/UploadStock';

// 5. Layouts & Components
import Layout from './components/layout/Layout'; // Admin Layout
import PharmacyLayout from './components/layout/PharmacyLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// مكون بسيط للوحة تحكم الصيدلية (مؤقت)
const PharmacyDashboard = () => (
  <div className="p-10 text-center">
    <h2 className="text-2xl font-bold text-slate-700">مرحباً بك في بوابة الصيدليات 👋</h2>
    <p className="text-slate-500 mt-2">اختر "رفع شيت إكسيل" من القائمة الجانبية لتحديث مخزونك.</p>
  </div>
);

const App = () => {
  return (
    <SettingsProvider>
      <Routes>
        
        {/* ------------------- المسارات العامة ------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ------------------- مسارات المسؤول (Admin) ------------------- */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} /> {/* بروفايل الأدمن */}
        </Route>

        {/* ------------------- مسارات الصيدلية (Pharmacy) ------------------- */}
        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={['pharmacy']}>
            <PharmacyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PharmacyDashboard />} />
          <Route path="stock" element={<div className="p-10">صفحة مخزوني (قريباً)</div>} />
          <Route path="upload" element={<UploadStock />} />
          <Route path="orders" element={<div className="p-10">صفحة الطلبات (قريباً)</div>} />
        </Route>

        {/* ------------------- مسارات المريض (Patient) ------------------- */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PatientHome />} />          
          <Route path="orders" element={<PatientOrders />} /> 
          
          {/* 🟢 هنا التعديل: ربطنا صفحة البروفايل الحقيقية */}
          <Route path="profile" element={<PatientProfile />} />
          
          <Route path="history" element={<div className="p-10 text-center pt-32">سجل العمليات (قريباً)</div>} />
        </Route>

        {/* ------------------- Fallback (أي رابط خطأ) ------------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </SettingsProvider>
  );
};

export default App;