import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import useBrowserNotifications from './hooks/useBrowserNotifications';

// Layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import NotificationPermissionDialog from './components/NotificationPermissionDialog';
import NotificationBanner from './components/NotificationBanner';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';

// Auth Pages
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import ServiceForm from './pages/admin/ServiceForm';
import ServiceDetail from './pages/admin/ServiceDetail';
import Orders from './pages/admin/Orders';
import Categories from './pages/admin/Categories';
import Banners from './pages/admin/Banners';
import SiteSettings from './pages/admin/SiteSettings';
import Users from './pages/admin/Users';
import Profile from './pages/Profile';

// Wrapper component để sử dụng useLocation
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking" element={<Layout><Booking /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="services/new" element={<ServiceForm />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/edit/:id" element={<ServiceForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="settings" element={<SiteSettings />} />
          <Route path="users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { initializeNotifications } = useBrowserNotifications();

  useEffect(() => {
    // Khởi tạo browser notifications khi app load
    initializeNotifications();
    
    // Thêm functions test vào window để dễ debug
    if (process.env.NODE_ENV === 'development') {
      import('./utils/notificationUtils').then(({ 
        resetNotificationState, 
        getNotificationStatus, 
        showTestNotification,
        logNotificationStatus 
      }) => {
        window.notificationUtils = {
          reset: resetNotificationState,
          status: getNotificationStatus,
          test: showTestNotification,
          log: logNotificationStatus
        };
        console.log('🔧 Notification utils đã sẵn sàng. Sử dụng:');
        console.log('- window.notificationUtils.reset() - Reset trạng thái');
        console.log('- window.notificationUtils.status() - Xem trạng thái');
        console.log('- window.notificationUtils.test() - Gửi thông báo test');
        console.log('- window.notificationUtils.log() - Log trạng thái');
      });
    }
  }, [initializeNotifications]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <NotificationPermissionDialog />
            <NotificationBanner />
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
