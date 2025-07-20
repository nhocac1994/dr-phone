import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Chip,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Build as ServiceIcon,
  Category as CategoryIcon,
  Image as BannerIcon,
  ShoppingCart as OrderIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  People as UsersIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import BottomNav from './BottomNav';
import NotificationButton from './NotificationButton';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin/dashboard',
    description: 'Tổng quan hệ thống'
  },
  { 
    text: 'Dịch vụ', 
    icon: <ServiceIcon />, 
    path: '/admin/services',
    description: 'Quản lý dịch vụ sửa chữa'
  },
  { 
    text: 'Danh mục', 
    icon: <CategoryIcon />, 
    path: '/admin/categories',
    description: 'Phân loại dịch vụ'
  },
  { 
    text: 'Banner', 
    icon: <BannerIcon />, 
    path: '/admin/banners',
    description: 'Quản lý banner quảng cáo'
  },
  { 
    text: 'Đơn hàng', 
    icon: <OrderIcon />, 
    path: '/admin/orders',
    description: 'Theo dõi đơn hàng'
  },
  { 
    text: 'Người dùng', 
    icon: <UsersIcon />, 
    path: '/admin/users',
    description: 'Quản lý tài khoản'
  },
  { 
    text: 'Cài đặt', 
    icon: <SettingsIcon />, 
    path: '/admin/settings',
    description: 'Cấu hình hệ thống'
  },
  { 
    text: 'Hồ sơ', 
    icon: <ProfileIcon />, 
    path: '/admin/profile',
    description: 'Thông tin cá nhân'
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentDrawerWidth = sidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Info Section - Nền trắng */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        {!sidebarCollapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.name || user?.username || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              {user?.role === 'admin' ? 'Admin' : 'User'}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Menu items */}
      <List sx={{ flex: 1, p: sidebarCollapsed ? 1 : 2 }}>
        {menuItems.map((item) => {
          // Ẩn menu "Người dùng" nếu không phải admin
          if (item.text === 'Người dùng' && user?.role !== 'admin') {
            return null;
          }
          
          const isSelected = location.pathname.includes(item.path.split('/').pop());
          return (
            <Tooltip 
              key={item.path}
              title={sidebarCollapsed ? item.text : ''} 
              placement="right"
              disableHoverListener={!sidebarCollapsed}
            >
              <ListItem
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  p: sidebarCollapsed ? 1.5 : 2,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: sidebarCollapsed ? 'scale(1.05)' : 'translateX(4px)'
                  },
                  ...(isSelected && {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'inherit'
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255,255,255,0.7)'
                    }
                  })
                }}
              >
                <ListItemIcon sx={{ 
                  color: isSelected ? 'inherit' : 'text.secondary',
                  minWidth: sidebarCollapsed ? 'auto' : 40
                }}>
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText 
                    primary={item.text}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 400
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer của sidebar */}
      <Box sx={{ p: sidebarCollapsed ? 1 : 2, borderTop: 1, borderColor: 'divider' }}>
        <Tooltip 
          title={sidebarCollapsed ? 'Đăng xuất' : ''} 
          placement="right"
          disableHoverListener={!sidebarCollapsed}
        >
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={!sidebarCollapsed && <LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: sidebarCollapsed ? 1 : 1.5,
              px: sidebarCollapsed ? 1 : 2,
              minWidth: sidebarCollapsed ? 'auto' : '100%',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
                borderColor: 'error.main'
              }
            }}
          >
            {sidebarCollapsed ? <LogoutIcon /> : 'Đăng xuất'}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <NotificationProvider>
      <Box sx={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${currentDrawerWidth}px)` },
            ml: { md: `${currentDrawerWidth}px` },
            display: { xs: 'none', md: 'block' },
            background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar sx={{ px: 3, minHeight: 64 }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              {/* Toggle button - Đặt bên trái chữ Quản trị */}
              <IconButton
                onClick={handleSidebarToggle}
                color="inherit"
                sx={{
                  borderRadius: 2,
                  mr: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                Quản trị
              </Typography>
              
              <Chip 
                label="Hệ thống quản lý" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontSize: '0.75rem'
                }} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NotificationButton />
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              
              {/* Chỉ hiển thị icon đăng xuất */}
              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Drawer cho desktop */}
        <Box
          component="nav"
          sx={{ 
            width: { md: currentDrawerWidth }, 
            flexShrink: { md: 0 }, 
            display: { xs: 'none', md: 'block' },
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: currentDrawerWidth,
                border: 'none',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 0, sm: 3 },
            width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
            mt: { xs: 0, md: 8 },
            mb: { xs: 7, md: 0 },
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Outlet />
        </Box>

        {/* Bottom Navigation cho mobile */}
        <BottomNav />
      </Box>
    </NotificationProvider>
  );
} 