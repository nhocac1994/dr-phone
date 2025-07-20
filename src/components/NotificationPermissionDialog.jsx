import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import useBrowserNotifications from '../hooks/useBrowserNotifications';

export default function NotificationPermissionDialog() {
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { isSupported, permission, requestPermission, isLoading } = useBrowserNotifications();

  useEffect(() => {
    // Kiểm tra xem đã hiển thị dialog chưa
    const hasShownBefore = localStorage.getItem('notification-dialog-shown');
    
    if (!hasShownBefore && isSupported && permission === 'default') {
      // Hiển thị dialog sau 2 giây
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
        localStorage.setItem('notification-dialog-shown', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleAllow = async () => {
    try {
      await requestPermission();
      setOpen(false);
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const handleDeny = () => {
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Không hiển thị nếu không hỗ trợ hoặc đã có quyền
  if (!isSupported || permission !== 'default') {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 1
      }}>
        <NotificationsIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="h6" component="div">
          Cho phép thông báo
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Dr.Phone muốn gửi thông báo để:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Thông báo khi có đơn hàng mới
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Cập nhật trạng thái đơn hàng
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Thông báo khuyến mãi và tin tức
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Bạn có thể thay đổi cài đặt này bất cứ lúc nào trong phần Cài đặt → Thông báo trình duyệt
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleDeny}
          variant="outlined"
          startIcon={<NotificationsOffIcon />}
          disabled={isLoading}
        >
          Không cho phép
        </Button>
        
        <Button
          onClick={handleAllow}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={16} /> : <NotificationsIcon />}
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? 'Đang xử lý...' : 'Cho phép'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 