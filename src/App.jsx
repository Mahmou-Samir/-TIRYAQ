import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';

// 1. Pages (General & Auth)
import Landing from './pages/Landing'; // ✅ تم التعديل: Landing بدلاً من Home
import Login from './pages/Login';
import Register from './pages/Register';

// 2. Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Logistics from './pages/admin/Logistics';
import Alerts from './pages/admin/Alerts';
import Reports from './pages/admin/Reports';
import Predictions from './pages/admin/Predictions';
import Settings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile'; 

// 3. Patient Pages
import PatientLayout from './components/layout/PatientLayout';
import PatientSearch from './pages/patient/PatientSearch'; // ✅ تم التعديل: اسم واضح جداً
import PatientOrders from './pages/patient/Orders';
import PatientProfile from './pages/patient/Profile'; 

// 4. Pharmacy Pages
import UploadStock from './pages/pharmacy/UploadStock';

// 5. Layouts
import Layout from './components/layout/Layout'; 
import PharmacyLayout from './components/layout/PharmacyLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pharmacy Dashboard Component
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
        
        {/* الصفحة الرئيسية العامة */}
        <Route path="/" element={<Landing />} /> {/* ✅ استخدام Landing */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* مسارات الأدمن */}
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
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* مسارات الصيدلية */}
        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={['pharmacy']}>
            <PharmacyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PharmacyDashboard />} />
          <Route path="stock" element={<div className="p-10">صفحة مخزوني</div>} />
          <Route path="upload" element={<UploadStock />} />
          <Route path="orders" element={<div className="p-10">صفحة الطلبات</div>} />
        </Route>

        {/* مسارات المريض */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<PatientSearch />} /> {/* ✅ استخدام PatientSearch */}         
          <Route path="orders" element={<PatientOrders />} /> 
          <Route path="profile" element={<PatientProfile />} />
          <Route path="history" element={<div className="p-10 text-center pt-32">سجل العمليات</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </SettingsProvider>
  );
};

export default App;