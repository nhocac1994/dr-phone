import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from '../config/axios';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const lastFetchTime = useRef(0);
  const isFetching = useRef(false);

  const fetchNotificationCount = useCallback(async () => {
    // Tránh gọi API quá nhiều (tối thiểu 30 giây giữa các lần gọi)
    const now = Date.now();
    if (now - lastFetchTime.current < 30000 || isFetching.current) {
      return;
    }

    try {
      isFetching.current = true;
      setLoading(true);
      const response = await axios.get('/api/orders/notification-count');
      setNotificationCount(response.count || 0);
      lastFetchTime.current = now;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationCount(0);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Fetch count khi component mount - chỉ gọi một lần
  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

  // Cập nhật count khi có thay đổi
  const updateNotificationCount = useCallback((count) => {
    setNotificationCount(count);
  }, []);

  const showNotification = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notificationCount, 
        loading, 
        fetchNotificationCount,
        updateNotificationCount,
        showNotification
      }}
    >
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 