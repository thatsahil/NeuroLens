import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import MRIAnalysis from './pages/MRIAnalysis';

import AdminOverview from './pages/admin/AdminOverview';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminModels from './pages/admin/AdminModels';
import AdminExperiments from './pages/admin/AdminExperiments';
import AdminAudit from './pages/admin/AdminAudit';

import HospitalOverview from './pages/hospital/HospitalOverview';
import HospitalMetrics from './pages/hospital/HospitalMetrics';

function RootRedirect() {
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

          {/* Root redirect based on authenticated role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Shared Authenticated Routes (Accessible to both Admin & Hospital Roles) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/analyze" element={<MRIAnalysis />} />
            </Route>
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
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
