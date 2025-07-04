import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as ServiceIcon,
  Category as CategoryIcon,
  Image as BannerIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Dịch vụ', icon: <ServiceIcon />, path: '/admin/services' },
  { text: 'Danh mục', icon: <CategoryIcon />, path: '/admin/categories' },
  { text: 'Banner', icon: <BannerIcon />, path: '/admin/banners' },
  { text: 'Đơn hàng', icon: <OrderIcon />, path: '/admin/orders' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ 
      display: { xs: 'block', md: 'none' },
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <Paper elevation={3}>
        <BottomNavigation
          value={menuItems.findIndex(item => location.pathname.includes(item.path.split('/').pop()))}
          onChange={(event, newValue) => {
            navigate(menuItems[newValue].path);
          }}
          showLabels
        >
          {menuItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.text}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
} 