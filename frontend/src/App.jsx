import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LandingPage from './pages/LandingPage';
import ArchitecturePage from './pages/ArchitecturePage';
import Login from './pages/Login';
import MRIAnalysis from './pages/MRIAnalysis';

import AdminOverview from './pages/admin/AdminOverview';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminModels from './pages/admin/AdminModels';
import AdminExperiments from './pages/admin/AdminExperiments';
import AdminAudit from './pages/admin/AdminAudit';

import HospitalOverview from './pages/hospital/HospitalOverview';
import HospitalMetrics from './pages/hospital/HospitalMetrics';

function DashboardRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'admin' ? (
    <Navigate to="/admin/overview" replace />
  ) : (
    <Navigate to="/hospital/overview" replace />
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Public Discovery and Architecture Pages with AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            {/* Universal MRI Analysis with HiResCAM */}
            <Route path="/analyze" element={<MRIAnalysis />} />
          </Route>

          {/* Admin Protected Workspaces */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/hospitals" element={<AdminHospitals />} />
              <Route path="/admin/models" element={<AdminModels />} />
              <Route path="/admin/experiments" element={<AdminExperiments />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
            </Route>
          </Route>

          {/* Hospital Client Protected Workspaces */}
          <Route element={<ProtectedRoute requiredRole="hospital" />}>
            <Route element={<AppLayout />}>
              <Route path="/hospital/overview" element={<HospitalOverview />} />
              <Route path="/hospital/metrics" element={<HospitalMetrics />} />
            </Route>
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
