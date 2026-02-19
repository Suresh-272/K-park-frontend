// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { LoadingPage } from './components/common/UI';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SlotsPage from './pages/SlotsPage';
import BookingsPage from './pages/BookingsPage';
import WaitlistPage from './pages/WaitlistPage';
import ProfilePage from './pages/ProfilePage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSlots from './pages/admin/AdminSlots';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import ErrorBoundary from './components/common/ErrorBoundary';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public */}
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

      {/* User routes */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/slots" element={<PrivateRoute><SlotsPage /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
      <Route path="/waitlist" element={<PrivateRoute><WaitlistPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin/slots" element={<AdminRoute><ErrorBoundary><AdminSlots /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><ErrorBoundary><AdminUsers /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><ErrorBoundary><AdminBookings /></ErrorBoundary></AdminRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f1526',
                color: '#f0f6ff',
                border: '1px solid rgba(99,179,237,0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              duration: 4000,
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}