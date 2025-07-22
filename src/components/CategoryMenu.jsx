import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  PhoneAndroid,
  Build,
  Security,
  Speed,
  Support,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export default function CategoryMenu({ open, onClose }) {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      // Fallback data
      setCategories([
        {
          id: 1,
          name: 'Sửa chữa điện thoại',
          icon: 'PhoneAndroid',
          services: [
            { id: 1, name: 'Thay màn hình' },
            { id: 2, name: 'Thay pin' },
            { id: 3, name: 'Sửa chữa bo mạch' }
          ]
        },
        {
          id: 2,
          name: 'Phụ kiện',
          icon: 'Build',
          services: [
            { id: 4, name: 'Cáp sạc' },
            { id: 5, name: 'Tai nghe' },
            { id: 6, name: 'Ốp lưng' }
          ]
        },
        {
          id: 3,
          name: 'Bảo hành',
          icon: 'Security',
          services: [
            { id: 7, name: 'Bảo hành chính hãng' },
            { id: 8, name: 'Bảo hành mở rộng' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
    onClose();
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      PhoneAndroid: PhoneAndroid,
      Build: Build,
      Security: Security,
      Speed: Speed,
      Support: Support,
      Category: CategoryIcon
    };
    return iconMap[iconName] || CategoryIcon;
  };

  const drawerWidth = isMobile ? '100%' : 320;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          bgcolor: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h6" fontWeight={600} color="#1976d2">
          Danh mục dịch vụ
        </Typography>
      </Box>

      <List sx={{ pt: 0 }}>
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          const isExpanded = expandedCategories[category.id];
          const hasServices = category.services && category.services.length > 0;

          return (
            <Box key={category.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => hasServices ? handleCategoryClick(category.id) : navigate(`/category/${category.id}`)}
                  sx={{
                    py: 1.5,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ListItemIcon>
                    <IconComponent sx={{ color: '#1976d2' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: 15
                    }}
                  />
                  {hasServices && (
                    isExpanded ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {hasServices && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {category.services.map((service) => (
                      <ListItemButton
                        key={service.id}
                        sx={{
                          pl: 4,
                          py: 1,
                          '&:hover': { bgcolor: '#f8f9fa' }
                        }}
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <ListItemText 
                          primary={service.name}
                          primaryTypographyProps={{
                            fontSize: 14,
                            color: 'text.secondary'
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
              <Divider />
            </Box>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ 
        mt: 'auto', 
        p: 2, 
        borderTop: '1px solid #eee',
        bgcolor: '#f8f9fa'
      }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Dr.Phone - Dịch vụ sửa chữa chuyên nghiệp
        </Typography>
      </Box>
    </Drawer>
  );
} 