import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Authenticating federated research session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to respective authorized root
    return <Navigate to={user?.role === 'admin' ? '/admin/overview' : '/hospital/overview'} replace />;
  }

  return <Outlet />;
}
