import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as ServiceIcon,
  Category as CategoryIcon,
  Image as BannerIcon,
  ShoppingCart as OrderIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import NotificationDrawer from './NotificationDrawer';

const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Đơn hàng', icon: <OrderIcon />, path: '/admin/orders' },
];

const allMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Dịch vụ', icon: <ServiceIcon />, path: '/admin/services' },
  { text: 'Danh mục', icon: <CategoryIcon />, path: '/admin/categories' },
  { text: 'Banner', icon: <BannerIcon />, path: '/admin/banners' },
  { text: 'Đơn hàng', icon: <OrderIcon />, path: '/admin/orders' },
  { text: 'Người dùng', icon: <UsersIcon />, path: '/admin/users' },
  { text: 'Cài đặt', icon: <SettingsIcon />, path: '/admin/settings' },
  { text: 'Hồ sơ', icon: <ProfileIcon />, path: '/admin/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notificationCount } = useNotification();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNotificationDrawerToggle = () => {
    setNotificationDrawerOpen(!notificationDrawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setDrawerOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const mainIndex = mainMenuItems.findIndex(item => 
      currentPath.includes(item.path.split('/').pop())
    );
    return mainIndex >= 0 ? mainIndex : 0;
  };

  return (
    <>
      <Box sx={{ 
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Paper elevation={0} sx={{ borderRadius: 0 }}>
          <BottomNavigation
            value={getCurrentValue()}
            onChange={(event, newValue) => {
              if (newValue < mainMenuItems.length) {
                navigate(mainMenuItems[newValue].path);
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 8px',
                '&.Mui-selected': {
                  color: 'primary.main',
                  border: '1px solid primary.main'
                },
                marginTop: '20px',
                '&:focus': {
                  outline: 'none'
                },
                '&.Mui-focusVisible': {
                  outline: 'none'
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                marginTop: '4px',
                marginBottom: '20px',
                fontWeight: 'bold'
              }
            }}
          >
            {mainMenuItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.text}
                icon={item.icon}
              />
            ))}
            
            {/* Nút thông báo */}
            <BottomNavigationAction
              label="Thông báo"
              icon={
                <Box sx={{ position: 'relative' }}>
                  <NotificationsIcon />
                  {notificationCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '2px solid white',
                      }}
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Box>
                  )}
                </Box>
              }
              onClick={handleNotificationDrawerToggle}
            />
            
            {/* Nút xem thêm */}
            <BottomNavigationAction
              label="Xem thêm"
              icon={<MoreIcon />}
              onClick={handleDrawerToggle}
            />
          </BottomNavigation>
        </Paper>
      </Box>

      {/* Drawer cho menu xem thêm - 100% màn hình */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            height: '100vh',
            backgroundColor: 'background.paper',
            boxShadow: '0px -8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }
        }}
        transitionDuration={300}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Content area */}
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: { xs: 2, sm: 3 } 
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Menu chính
              </Typography>
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{
                  backgroundColor: 'grey.100',
                  '&:hover': {
                    backgroundColor: 'grey.200'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
            
            {/* Menu items */}
            <List sx={{ p: 0, flex: 1, overflow: 'auto' }}>
              {allMenuItems.map((item, index) => (
                <ListItem
                  key={item.path}
                  button
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname.includes(item.path.split('/').pop())}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    py: { xs: 1.25, sm: 1.5 },
                    px: { xs: 1.5, sm: 2 },
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(4px)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'inherit'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname.includes(item.path.split('/').pop()) 
                      ? 'inherit' 
                      : 'text.secondary',
                    minWidth: { xs: 36, sm: 40 }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: location.pathname.includes(item.path.split('/').pop()) ? 600 : 400,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {/* Logout button */}
            <Box sx={{ mt: 'auto', pt: { xs: 1.5, sm: 2 } }}>
              <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 1.5,
                  borderColor: 'error.main',
                  color: 'error.main',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white',
                    borderColor: 'error.main'
                  }
                }}
              >
                Đăng xuất
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Notification Drawer */}
      <NotificationDrawer 
        open={notificationDrawerOpen} 
        onClose={() => setNotificationDrawerOpen(false)} 
      />
    </>
  );
} 