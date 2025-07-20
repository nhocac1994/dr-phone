import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Badge,
  Divider,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import axios from '../config/axios';

const ORDER_STATUS = {
  pending: { label: 'Chờ xử lý', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'info' },
  processing: { label: 'Đang xử lý', color: 'primary' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' }
};

export default function NotificationDrawer({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      const orders = Array.isArray(response) ? response : [];
      // Lấy các đơn hàng pending và confirmed để hiển thị
      const pendingOrders = orders.filter(
        order => order.status === 'pending' || order.status === 'confirmed'
      );
      setNotifications(pendingOrders);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleNotificationClick = (order) => {
    // Có thể thêm logic để chuyển đến trang chi tiết đơn hàng
    console.log('Clicked notification:', order);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          maxWidth: '100vw'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Thông báo
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {notifications.length} thông báo mới
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {loading ? (
          <ListItem>
            <ListItemText 
              primary="Đang tải thông báo..."
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        ) : notifications.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="Không có thông báo mới"
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem 
                button 
                onClick={() => handleNotificationClick(notification)}
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  py: 2
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" component="span">
                      {notification.customer_name}
                    </Typography>
                  </Box>
                  <Chip 
                    label={ORDER_STATUS[notification.status]?.label}
                    color={ORDER_STATUS[notification.status]?.color}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  {notification.service_name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {notification.customer_phone}
                  </Typography>
                </Box>

                {notification.scheduled_time && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Hẹn: {formatDate(notification.scheduled_time)}
                    </Typography>
                  </Box>
                )}

                {notification.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontStyle: 'italic',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    "{notification.notes}"
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {formatDate(notification.created_at)}
                </Typography>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
    </Drawer>
  );
} 