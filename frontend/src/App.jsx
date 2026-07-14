import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Guard components
import { ProtectedRoute, RoleRoute } from './components/RouteGuard';
import ErrorPage from './components/ErrorPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateShipment from './pages/customer/CreateShipment';
import CustomerShipments from './pages/customer/CustomerShipments';
import CustomerTrack from './pages/customer/CustomerTrack';
import ShipmentDetails from './pages/customer/ShipmentDetails';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import DeliveryDetails from './pages/agent/DeliveryDetails';
import AgentHistory from './pages/agent/AgentHistory';
import AgentProfile from './pages/agent/AgentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipments from './pages/admin/AdminShipments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRateCards from './pages/admin/AdminRateCards';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';

import { useAuth } from './hooks/useAuth';
import { ROLES } from './utils/roles';

// Root Route Redirect Handler
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.CUSTOMER:
      return <Navigate to="/customer/dashboard" replace />;
    case ROLES.AGENT:
      return <Navigate to="/agent/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Root redirect handles role sorting */}
              <Route index element={<RootRedirect />} />

              {/* Customer Routes */}
              <Route
                path="customer/dashboard"
                element={
                  <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                    <CustomerDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="customer/create-shipment"
                element={
                  <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                    <CreateShipment />
                  </RoleRoute>
                }
              />
              <Route
                path="customer/shipments"
                element={
                  <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                    <CustomerShipments />
                  </RoleRoute>
                }
              />
              <Route
                path="customer/shipments/:trackingNumber"
                element={
                  <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                    <ShipmentDetails />
                  </RoleRoute>
                }
              />
              <Route
                path="customer/track"
                element={
                  <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                    <CustomerTrack />
                  </RoleRoute>
                }
              />

              {/* Agent Routes */}
              <Route
                path="agent/dashboard"
                element={
                  <RoleRoute allowedRoles={[ROLES.AGENT]}>
                    <AgentDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="agent/shipments/:trackingNumber"
                element={
                  <RoleRoute allowedRoles={[ROLES.AGENT]}>
                    <DeliveryDetails />
                  </RoleRoute>
                }
              />
              <Route
                path="agent/history"
                element={
                  <RoleRoute allowedRoles={[ROLES.AGENT]}>
                    <AgentHistory />
                  </RoleRoute>
                }
              />
              <Route
                path="agent/profile"
                element={
                  <RoleRoute allowedRoles={[ROLES.AGENT]}>
                    <AgentProfile />
                  </RoleRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin/dashboard"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/shipments"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminShipments />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminUsers />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/rate-cards"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminRateCards />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/profile"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminProfile />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/settings"
                element={
                  <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminSettings />
                  </RoleRoute>
                }
              />
            </Route>

            {/* Error Pages */}
            <Route path="/unauthorized" element={<ErrorPage status={403} />} />
            <Route path="/server-error" element={<ErrorPage status={500} />} />
            <Route path="*" element={<ErrorPage status={404} />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
