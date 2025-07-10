import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';

// Định nghĩa các loại banner
const bannerTypes = [
  { id: 'home_header', name: 'Banner Đầu Trang', ratio: '1280x60px', maxCount: 1 },
  { id: 'home_main', name: 'Banner Chính', ratio: '1280x400px', maxCount: 5 },
];

// Danh sách các trang sản phẩm
const productPages = [
  { id: 'iphone', name: 'iPhone' },
  { id: 'ipad', name: 'iPad' },
  { id: 'macbook', name: 'MacBook' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'oppo', name: 'OPPO' },
  { id: 'xiaomi', name: 'Xiaomi' },
];

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/banners');
        console.log('Fetched banners:', response);
        
        if (Array.isArray(response)) {
          setBanners(response);
        } else {
          setBanners([]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, []);

  // Delete banner
  const handleDelete = async (bannerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await axios.delete(`/api/banners/${bannerId}`);
        enqueueSnackbar('Xóa banner thành công', { variant: 'success' });
        
        // Cập nhật state để xóa banner khỏi UI
        setBanners(prevBanners => prevBanners.filter(banner => banner.id !== bannerId));
      } catch (error) {
        console.error('Delete error:', error);
        enqueueSnackbar('Không thể xóa banner', { variant: 'error' });
      }
    }
  };

  // Upload new banner
  const handleUpload = async (type, file, categoryId = null) => {
    try {
      // Kiểm tra số lượng banner hiện có của loại này
      const currentBanners = banners.filter(banner => 
        banner.type === type && 
        (categoryId ? String(banner.category_id) === String(categoryId) : !banner.category_id)
      );
      
      const bannerTypeInfo = bannerTypes.find(t => t.id === type) || { maxCount: 999 };
      
      if (currentBanners.length >= bannerTypeInfo.maxCount) {
        enqueueSnackbar(`Đã đạt giới hạn ${bannerTypeInfo.maxCount} banner cho loại này. Vui lòng xóa bớt banner cũ.`, { 
          variant: 'warning' 
        });
        return;
      }
      
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      
      let title = `Banner ${type}`;
      if (categoryId) {
        title += ` - ${productPages.find(p => p.id === categoryId)?.name || categoryId}`;
        formData.append('category_id', categoryId);
      }
      
      formData.append('title', `${title} - ${new Date().toLocaleDateString()}`);
      
      console.log('Uploading banner for type:', type, 'category:', categoryId);
      const newBanner = await axios.post('/api/banners', formData);
      
      enqueueSnackbar('Tải lên banner thành công', { variant: 'success' });
      
      // Cập nhật state để thêm banner mới vào UI
      if (newBanner) {
        setBanners(prevBanners => [...prevBanners, newBanner]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar('Không thể tải lên banner', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Group banners by type
  const bannersByType = {};
  bannerTypes.forEach(type => {
    bannersByType[type.id] = banners.filter(banner => 
      banner.type === type.id && !banner.category_id
    );
  });

  // Group banners by category
  const bannersByCategory = {};
  productPages.forEach(page => {
    bannersByCategory[page.id] = {};
    bannerTypes.forEach(type => {
      bannersByCategory[page.id][type.id] = banners.filter(banner => 
        banner.type === type.id && String(banner.category_id) === String(page.id)
      );
    });
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render banner upload section based on type
  const renderBannerUploadSection = useCallback((type, categoryId = null) => {
    const typeInfo = bannerTypes.find(t => t.id === type.id) || {};
    
    let currentBanners;
    if (categoryId) {
      currentBanners = bannersByCategory[categoryId]?.[type.id] || [];
    } else {
      currentBanners = bannersByType[type.id] || [];
    }
    
    const currentCount = currentBanners.length;
    const isMaxReached = currentCount >= typeInfo.maxCount;
    
    return (
      <Box 
        key={`${type.id}-${categoryId || 'home'}`} 
        sx={{ 
          width: isMobile ? '100%' : isTablet ? 180 : 220, 
          height: isMobile ? 100 : 120, 
          border: '2px dashed #ccc',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 0,
          position: 'relative',
          bgcolor: isMaxReached ? '#f5f5f5' : 'transparent'
        }}
      >
        <Typography 
          variant={isMobile ? "caption" : "body2"} 
          align="center" 
          gutterBottom
        >
          {type.name} ({currentCount}/{typeInfo.maxCount})
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center"
          sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
        >
          {type.ratio}
        </Typography>
        <Tooltip title={isMaxReached ? `Đã đạt giới hạn ${typeInfo.maxCount} banner` : "Tải lên banner mới"}>
          <span>
            <Button
              component="label"
              startIcon={<AddPhotoAlternateIcon fontSize={isMobile ? "small" : "medium"} />}
              size="small"
              disabled={uploading || isMaxReached}
              sx={{ 
                mt: 1,
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                py: isMobile ? 0.5 : 1
              }}
              color={isMaxReached ? "inherit" : "primary"}
            >
              {isMaxReached ? "Đã đạt giới hạn" : "Tải lên"}
              {!isMaxReached && (
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleUpload(type.id, e.target.files[0], categoryId);
                      e.target.value = null;
                    }
                  }}
                />
              )}
            </Button>
          </span>
        </Tooltip>
      </Box>
    );
  }, [bannersByCategory, bannersByType, handleUpload, isMobile, isTablet, uploading]);

  // Render banner list
  const renderBannerList = useCallback((bannerList) => {
    if (!bannerList || bannerList.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Chưa có banner nào. Hãy thêm banner mới.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: isMobile ? 1 : 2, 
        mt: 2,
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        {bannerList.map(banner => (
          <Box 
            key={banner.id} 
            sx={{ 
              width: isMobile ? '100%' : isTablet ? 250 : 300, 
              p: isMobile ? 0.5 : 1, 
              border: '1px solid #eee', 
              borderRadius: 3,
              mb: isMobile ? 1 : 0
            }}
          >
            <Typography 
              variant={isMobile ? "body2" : "subtitle2"} 
              sx={{ 
                fontSize: isMobile ? '0.8rem' : 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {banner.title}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
            >
              Loại: {banner.type}
              {banner.category_id && ` | Danh mục: ${banner.category_id}`}
            </Typography>
            <Box sx={{ 
              mt: 1, 
              height: isMobile ? 120 : 150, 
              bgcolor: '#f5f5f5', 
              position: 'relative' 
            }}>
              <img 
                src={`http://localhost:8080/img/${banner.image}`}
                alt={banner.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Error loading image:', banner.image);
                  e.target.src = 'https://via.placeholder.com/300x150?text=Error';
                }}
              />
              <IconButton
                size={isMobile ? "small" : "medium"}
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  padding: isMobile ? '4px' : '8px'
                }}
                onClick={() => handleDelete(banner.id)}
              >
                <DeleteIcon fontSize={isMobile ? "small" : "medium"} color="error" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }, [handleDelete, isMobile, isTablet]);

  // Render category banner section
  const renderCategoryBannerSection = useCallback(() => {
    return (
      <>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
            <InputLabel sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>
              Chọn trang sản phẩm
            </InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Chọn trang sản phẩm"
              sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}
            >
              <MenuItem value="" sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                <em>Chọn trang sản phẩm</em>
              </MenuItem>
              {productPages.map(page => (
                <MenuItem 
                  key={page.id} 
                  value={page.id}
                  sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}
                >
                  {page.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedCategory && (
          <>
            {bannerTypes.map(type => (
              <Paper key={type.id} sx={{ p: isMobile ? 1 : 2, mb: 3 }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  gutterBottom
                  sx={{ fontSize: isMobile ? '1rem' : 'inherit' }}
                >
                  {type.name} cho {productPages.find(p => p.id === selectedCategory)?.name} 
                  ({bannersByCategory[selectedCategory]?.[type.id]?.length || 0}/{type.maxCount})
                </Typography>
                
                {renderBannerList(bannersByCategory[selectedCategory]?.[type.id] || [])}
                
                <Divider sx={{ my: isMobile ? 1 : 2 }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: isMobile ? 1 : 2,
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  {renderBannerUploadSection(type, selectedCategory)}
                </Box>
              </Paper>
            ))}
          </>
        )}
      </>
    );
  }, [isMobile, renderBannerList, renderBannerUploadSection, selectedCategory]);

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        p: isMobile ? 0 : 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isMobile ? 1 : 2 
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          fontWeight={700}
          sx={{ fontSize: isMobile ? '1.3rem' : 'inherit', p: isMobile ? 1 : 2 }}
        >
          Quản lý Banner ({banners.length})
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ mb: isMobile ? 2 : 3, borderRadius: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                borderRadius: 3,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 3,
                },
                '& .MuiTab-root': {
                  minHeight: isMobile ? 40 : 48,
                  textTransform: 'none',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  padding: isMobile ? '6px 12px' : '12px 16px',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  },
                  '&:focus': {
                    outline: 'none'
                  },
                  '&.Mui-focusVisible': {
                    outline: 'none'
                  }
                }
              }}
            >
              <Tab label="Banner Trang Chủ" />
              <Tab label="Banner Trang Sản Phẩm" />
            </Tabs>
            
            <Box sx={{ p: isMobile ? 1 : 3 }}>
              {activeTab === 0 && (
                <>
                  {/* Banner trang chủ */}
                  {bannerTypes.map(type => (
                    <Paper key={type.id} sx={{ p: isMobile ? 1 : 2, mb: isMobile ? 2 : 3 }}>
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        gutterBottom
                        sx={{ fontSize: isMobile ? '1rem' : 'inherit' }}
                      >
                        {type.name} ({bannersByType[type.id]?.length || 0}/{type.maxCount})
                      </Typography>
                      
                      {renderBannerList(bannersByType[type.id])}
                      
                      <Divider sx={{ my: isMobile ? 1 : 2 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: isMobile ? 1 : 2,
                        justifyContent: isMobile ? 'center' : 'flex-start'
                      }}>
                        {renderBannerUploadSection(type)}
                      </Box>
                    </Paper>
                  ))}
                </>
              )}
              
              {activeTab === 1 && (
                <>
                  {/* Banner trang sản phẩm */}
                  {renderCategoryBannerSection()}
                </>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
} 