import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useBrowserNotifications from '../hooks/useBrowserNotifications';

export default function NotificationBanner() {
  const [show, setShow] = useState(false);
  const { isSupported, permission, requestPermission, isLoading } = useBrowserNotifications();

  useEffect(() => {
    // Kiểm tra xem đã hiển thị banner chưa
    const hasShownBanner = localStorage.getItem('notification-banner-shown');
    
    if (!hasShownBanner && isSupported && permission === 'default') {
      // Hiển thị banner sau 3 giây
      const timer = setTimeout(() => {
        setShow(true);
        localStorage.setItem('notification-banner-shown', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleAllow = async () => {
    try {
      await requestPermission();
      setShow(false);
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  // Không hiển thị nếu không hỗ trợ hoặc đã có quyền
  if (!isSupported || permission !== 'default' || !show) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
        width: '100%'
      }}
    >
      <Collapse in={show}>
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={handleAllow}
                disabled={isLoading}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {isLoading ? '...' : 'Cho phép'}
              </Button>
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{ color: 'inherit' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-message': {
              pr: 0
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
            Cho phép thông báo
          </AlertTitle>
          Nhận thông báo về đơn hàng mới và cập nhật từ Dr.Phone
        </Alert>
      </Collapse>
    </Box>
  );
} 