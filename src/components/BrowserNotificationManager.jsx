import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  NotificationsActive as NotificationsActiveIcon,
  Settings as SettingsIcon,
  Science as TestIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import useBrowserNotifications from '../hooks/useBrowserNotifications';

export default function BrowserNotificationManager() {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    initializeNotifications
  } = useBrowserNotifications();

  const [isEnabled, setIsEnabled] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Khởi tạo notifications khi component mount
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  // Cập nhật trạng thái enabled
  useEffect(() => {
    setIsEnabled(permission === 'granted' && !!subscription);
  }, [permission, subscription]);

  // Xử lý bật/tắt notifications
  const handleToggleNotifications = async () => {
    try {
      if (isEnabled) {
        await unsubscribeFromPush();
        enqueueSnackbar('Đã tắt thông báo trình duyệt', { variant: 'info' });
      } else {
        const result = await requestPermission();
        if (result === 'granted') {
          enqueueSnackbar('Đã bật thông báo trình duyệt', { variant: 'success' });
        } else if (result === 'denied') {
          enqueueSnackbar('Quyền thông báo bị từ chối', { variant: 'warning' });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      enqueueSnackbar('Có lỗi xảy ra khi thay đổi cài đặt thông báo', { variant: 'error' });
    }
  };

  // Gửi thông báo test
  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      enqueueSnackbar('Đã gửi thông báo test', { variant: 'success' });
    } catch (error) {
      console.error('Error sending test notification:', error);
      enqueueSnackbar('Không thể gửi thông báo test', { variant: 'error' });
    }
  };

  // Hiển thị trạng thái permission
  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { label: 'Đã cho phép', color: 'success' };
      case 'denied':
        return { label: 'Đã từ chối', color: 'error' };
      case 'default':
        return { label: 'Chưa xác định', color: 'warning' };
      default:
        return { label: 'Không xác định', color: 'default' };
    }
  };

  const permissionStatus = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <NotificationsOffIcon color="disabled" />
            <Typography variant="h6">Thông báo trình duyệt</Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Trình duyệt của bạn không hỗ trợ Push Notifications.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Để sử dụng tính năng này, vui lòng sử dụng trình duyệt hiện đại như Chrome, Firefox, Safari, hoặc Edge.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Thông báo trình duyệt</Typography>
          </Box>
          <Chip 
            label={permissionStatus.label}
            color={permissionStatus.color}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nhận thông báo ngay cả khi không mở trang web. Bạn sẽ được thông báo khi có đơn hàng mới.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled}
                  onChange={handleToggleNotifications}
                  disabled={isLoading}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {isEnabled ? 'Bật thông báo' : 'Tắt thông báo'}
                  </Typography>
                  {isLoading && <CircularProgress size={16} />}
                </Box>
              }
            />
          </Box>

          {permission === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Quyền thông báo đã bị từ chối. Vui lòng vào cài đặt trình duyệt để bật lại.
              </Typography>
            </Alert>
          )}

          {permission === 'default' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Nhấn nút "Bật thông báo" để cho phép Dr.Phone gửi thông báo.
              </Typography>
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Thông tin chi tiết */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon fontSize="small" />
            Thông tin chi tiết
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Trạng thái:
              </Typography>
              <Chip 
                label={isEnabled ? 'Hoạt động' : 'Không hoạt động'}
                color={isEnabled ? 'success' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Quyền:
              </Typography>
              <Chip 
                label={permissionStatus.label}
                color={permissionStatus.color}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Đăng ký:
              </Typography>
              <Chip 
                label={subscription ? 'Đã đăng ký' : 'Chưa đăng ký'}
                color={subscription ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Nút test */}
        {isEnabled && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<TestIcon />}
              onClick={handleTestNotification}
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
            >
              Gửi thông báo test
            </Button>
            
            <Tooltip title="Cài đặt thông báo trình duyệt">
              <IconButton
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(registration => {
                      registration.showNotification('Cài đặt thông báo', {
                        body: 'Vui lòng vào cài đặt trình duyệt để quản lý thông báo',
                        icon: '/vite.svg',
                        requireInteraction: true
                      });
                    });
                  }
                }}
                size="small"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Hướng dẫn */}
        {permission === 'denied' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Hướng dẫn bật lại thông báo:</strong>
              <br />
              1. Nhấn vào biểu tượng khóa/thông báo trên thanh địa chỉ
              <br />
              2. Chọn "Cho phép" trong phần thông báo
              <br />
              3. Tải lại trang và thử lại
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 