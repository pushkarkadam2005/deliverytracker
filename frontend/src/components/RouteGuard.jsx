import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

// Guard for authenticated users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying authentication credentials..." />;
  }

  if (!isAuthenticated) {
    // Save the location the user tried to access so they can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Guard for specific roles (e.g. ADMIN, CUSTOMER, AGENT)
export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying user clearance level..." />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
