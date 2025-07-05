import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';

// Auth Pages
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Services from './pages/admin/Services';
import ServiceForm from './pages/admin/ServiceForm';
import ServiceDetail from './pages/admin/ServiceDetail';
import Orders from './pages/admin/Orders';
import Categories from './pages/admin/Categories';
import Banners from './pages/admin/Banners';

// Wrapper component để sử dụng useLocation
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="services/new" element={<ServiceForm />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/edit/:id" element={<ServiceForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
