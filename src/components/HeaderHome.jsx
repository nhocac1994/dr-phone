import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, InputBase, Button, Slide, List, ListItem, ListItemText, Paper, Divider, ListItemButton, Badge, useMediaQuery, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import CategoryMenu from './CategoryMenu';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export default function HeaderHome({ hasTopBanner = false }) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isTablet = useMediaQuery('(min-width:600px) and (max-width:1024px)');
  const isTabletLarge = useMediaQuery('(min-width:820px) and (max-width:1024px)');
  const isTabletSmall = useMediaQuery('(min-width:600px) and (max-width:819px)');
  const isDesktop = useMediaQuery('(min-width:1025px)');
  
  // Mock cart data
  const cartItemCount = 0;
  const bookingCount = 2;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setCategoryResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/search?q=${encodeURIComponent(searchTerm)}`);
      console.log('Kết quả tìm kiếm:', response.data);
      
      const services = response.data.services || [];
      
      const processedServices = services.map(service => {
        if (service.spare_parts && typeof service.spare_parts === 'string') {
          try {
            service.spare_parts = JSON.parse(service.spare_parts);
          } catch (error) {
            console.error('Lỗi khi parse spare_parts:', error);
            service.spare_parts = [];
          }
        }
        return service;
      });
      
      const categories = [];
      const uniqueCategories = new Set();
      
      processedServices.forEach(service => {
        const name = service.name || '';
        if (name) {
          const parts = name.split(' ');
          if (parts.length >= 2) {
            const categoryName = name;
            if (!uniqueCategories.has(categoryName)) {
              uniqueCategories.add(categoryName);
              categories.push({
                id: `cat-${service.id}`,
                name: categoryName,
                type: 'category'
              });
            }
          }
        }
      });
      
      setCategoryResults(categories.slice(0, 5));
      setSearchResults(processedServices);
      setShowResults(true);
      
      if (processedServices.length === 0 && categories.length === 0) {
        console.log('Không tìm thấy kết quả nào');
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      setSearchResults([]);
      setCategoryResults([]);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setCategoryResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSearchClick = (id) => {
    navigate(`/service/${id}`);
    setShowResults(false);
    setSearchTerm('');
    setShowMobileSearch(false);
  };

  const handleCategoryClick = (categoryName) => {
    setShowCategoryMenu(true);
    setShowResults(false);
    if (showMobileSearch) {
      setShowMobileSearch(false);
    }
  };

  const handleCloseCategoryMenu = () => {
    setShowCategoryMenu(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') {
      setSearchResults([]);
      setCategoryResults([]);
      setShowResults(false);
    } else if (e.target.value.trim().length >= 2) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const getImageUrl = (result) => {
    if (!result) return null;
    
    if (result.images) {
      const firstImage = result.images.split(',')[0].trim();
      if (firstImage) {
        if (firstImage.startsWith('http') || firstImage.startsWith('/')) {
          return firstImage;
        }
        return `${BASE_URL}/img/${firstImage}`;
      }
    }
    
    if (result.image) {
      if (result.image.startsWith('http') || result.image.startsWith('/')) {
        return result.image;
      }
      return `${BASE_URL}/img/${result.image}`;
    }
    
    return '/img/hero-img.webp';
  };

  const formatPrice = (price, originalPrice, discountPercent, spare_parts) => {
    if (price === 0 && spare_parts && spare_parts.length > 0) {
      const firstPart = spare_parts[0];
      if (firstPart) {
        const partPrice = parseFloat(firstPart.original_price || 0);
        const partDiscountPercent = parseFloat(firstPart.discount_percent || 0);
        
        if (partPrice > 0) {
          const discountedPrice = partDiscountPercent > 0 
            ? partPrice - (partPrice * partDiscountPercent / 100) 
            : partPrice;
            
          return formatPriceDisplay(discountedPrice, partPrice, partDiscountPercent);
        }
      }
    }
    
    if (!price && !originalPrice) return '';
    
    let displayPrice = price;
    let originalDisplayPrice = null;
    
    if (discountPercent && discountPercent > 0) {
      originalDisplayPrice = price;
      displayPrice = price - (price * discountPercent / 100);
    } else if (originalPrice && originalPrice > price) {
      originalDisplayPrice = originalPrice;
    }
    
    return formatPriceDisplay(displayPrice, originalDisplayPrice, discountPercent);
  };
  
  const formatPriceDisplay = (displayPrice, originalDisplayPrice, discountPercent) => {
    if (!displayPrice) return '';
    
    const formattedPrice = `${Math.round(displayPrice).toLocaleString('vi-VN')}đ`;
    
    if (originalDisplayPrice && originalDisplayPrice > displayPrice) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: {xs: 10, sm: 11, md: 12} }}>
                Giá:
              </Typography>
              <Typography color="error" fontWeight={700} fontSize={{xs: 14, sm: 15, md: 16}}>
                {formattedPrice}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: {xs: 10, sm: 11, md: 12} }}>
                Giá gốc:
              </Typography>
              <Typography color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: {xs: 12, sm: 13, md: 14} }}>
                {Math.round(originalDisplayPrice).toLocaleString('vi-VN')}đ
              </Typography>
            </Box>
          </Box>
          {discountPercent && discountPercent > 0 && (
            <Typography 
              sx={{ 
                fontSize: {xs: 10, sm: 11, md: 12}, 
                bgcolor: '#ff9800', 
                color: 'white', 
                px: 0.8, 
                py: 0.2, 
                borderRadius: 0.5,
                display: 'inline-block',
                mt: 0.5,
                fontWeight: 'bold',
                width: 'fit-content'
              }}
            >
              -{discountPercent}%
            </Typography>
          )}
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: {xs: 10, sm: 11, md: 12} }}>
          Giá:
        </Typography>
        <Typography color="error" fontWeight={700} fontSize={{xs: 14, sm: 15, md: 16}}>
          {formattedPrice}
        </Typography>
      </Box>
    );
  };

  const handleCartClick = () => {
    navigate('/bookings');
  };

  const handleBookingClick = () => {
    navigate('/booking');
  };

  return (
    <Box sx={{ 
      width: '100%', 
      bgcolor: '#ff9800', 
      boxShadow: '0 2px 8px 0 rgba(255,152,0,0.08)', 
      position: 'fixed',
      top: hasTopBanner ? '50px' : 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: 'top 0.3s ease-in-out',
      height: { xs: 55, sm: 55, md: 60 },
      minHeight: { xs: 55, sm: 55, md: 60 }
    }}>
      {/* Main header */}
      <Box sx={{ 
        maxWidth: { xs: '100%', sm: '100%', md: '1280px' },
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: { xs: 1, sm: isTabletSmall ? 1.5 : 2, md: 3 }, 
        py: 0,
        gap: { xs: 0.5, sm: isTabletSmall ? 0.8 : 1, md: 1 },
        height: { xs: 55, sm: 55, md: 60 },
        minHeight: { xs: 55, sm: 55, md: 60 }
      }}>
        {/* Menu + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: isTabletSmall ? 0.8 : 1, md: 1 } }}>
          <IconButton 
            onClick={handleCategoryClick}
            sx={{ 
              p: { xs: 0.5, sm: isTabletSmall ? 0.5 : 0.6 }, 
              mr: { xs: 0.5, sm: isTabletSmall ? 0.5 : 0.6 }, 
              display: { xs: 'inline-flex', sm: isTabletLarge ? 'none' : 'inline-flex', md: 'none' } 
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: 20, sm: isTabletSmall ? 22 : 24, md: 24 } }} />
          </IconButton>
          <Link to="/" style={{ display: 'block' }}>
            <Box component="img" src="/logo/dr-phone.png" alt="Logo" sx={{ 
              height: { xs: 26, sm: isTabletSmall ? 28 : 32, md: 38 }, 
              borderRadius: 3, 
              display: 'block', 
              backgroundColor: '#fff' 
            }} />
          </Link>
          
          {/* Nút danh mục (hiển thị trên desktop và tablet lớn) */}
          <Button
            variant="contained"
            startIcon={<CategoryIcon />}
            onClick={handleCategoryClick}
            sx={{
              bgcolor: '#fff3e0',
              color: '#000',
              fontWeight: 700,
              borderRadius: 3,
              ml: { xs: 0, sm: isTabletLarge ? 1 : 0, md: 2 },
              height: { xs: 30, sm: isTabletLarge ? 32 : 30, md: 35 },
              fontSize: { xs: 12, sm: isTabletLarge ? 13 : 12, md: 16 },
              display: { xs: 'none', sm: isTabletLarge ? 'inline-flex' : 'none', md: 'inline-flex' },
              '&:hover': { bgcolor: '#ffe0b2' },
              px: { sm: isTabletLarge ? 1.5 : 1, md: 2 }
            }}
          >
            Danh mục
          </Button>
        </Box>
        {/* Spacer */}
        <Box sx={{ flex: 1 }} />
        {/* Search + Cart icons (mobile và tablet nhỏ) */}
        <Box sx={{ 
          display: { xs: 'flex', sm: isTabletLarge ? 'none' : 'flex', md: 'none' }, 
          alignItems: 'center', 
          gap: { xs: 0.5, sm: isTabletSmall ? 0.8 : 1 }
        }}>
          <IconButton sx={{ color: '#fff', p: { xs: 0.5, sm: 0.6 } }} onClick={() => setShowMobileSearch(true)}>
            <SearchIcon sx={{ fontSize: { xs: 20, sm: isTabletSmall ? 22 : 24, md: 24 } }} />
          </IconButton>
          <IconButton sx={{ color: '#fff', p: { xs: 0.5, sm: 0.6 } }} onClick={handleCartClick}>
            <Badge badgeContent={bookingCount} color="error" sx={{ 
              '& .MuiBadge-badge': { 
                bgcolor: 'error.main',
                color: 'white',
                fontWeight: 'bold',
                minWidth: 18,
                height: 18,
                fontSize: 12
              }
            }}>
              <ShoppingCartIcon sx={{ fontSize: { xs: 20, sm: isTabletSmall ? 22 : 24, md: 24 } }} />
            </Badge>
          </IconButton>
        </Box>
        {/* PC và tablet lớn: Search box + buttons */}
        <Box sx={{ 
          display: { xs: 'none', sm: isTabletLarge ? 'flex' : 'none', md: 'flex' }, 
          alignItems: 'center', 
          flex: isTabletLarge ? 2 : 1, 
          gap: { sm: isTabletLarge ? 0.8 : 0.5, md: 0.5, lg: 1 }, 
          position: 'relative',
          justifyContent: 'flex-end'
        }}>
          <Box 
            component="form"
            onSubmit={handleSearch}
            sx={{ 
              flex: isTabletLarge ? 1.5 : 1, 
              mx: { sm: isTabletLarge ? 0.8 : 0.5, md: 0.5, lg: 1 }, 
              maxWidth: { sm: isTabletLarge ? 320 : 350, md: 400, lg: 500 },
              minWidth: { sm: isTabletLarge ? 160 : 180, md: 200, lg: 300 },
              bgcolor: '#fff3e0',
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              px: 1, 
              boxShadow: '0 2px 8px 0 rgba(70, 67, 64, 0.1)',
              height: { sm: isTabletLarge ? 36 : 35, md: 40 },
              minHeight: { sm: isTabletLarge ? 36 : 35, md: 40 },
              position: 'relative',
            }}
          >
            <InputBase 
              placeholder="Tìm kiếm..." 
              sx={{ flex: 1, pl: { sm: isTabletLarge ? 0.8 : 1, md: 1 }, fontSize: { sm: isTabletLarge ? 13 : 14, md: 15 } }} 
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={() => searchTerm.trim() !== '' && setShowResults(true)}
              onBlur={handleSearchBlur}
            />
            <IconButton type="submit" sx={{ color: '#ff9800', p: { sm: isTabletLarge ? 0.8 : 1, md: 1.2 } }}>
              <SearchIcon sx={{ fontSize: { sm: isTabletLarge ? 18 : 20, md: 24 } }} />
            </IconButton>

            {/* Kết quả tìm kiếm */}
            {showResults && (categoryResults.length > 0 || searchResults.length > 0) && (
              <Paper 
                elevation={3} 
                sx={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  width: '100%', 
                  mt: 0.5, 
                  maxHeight: 500, 
                  overflow: 'auto', 
                  zIndex: 1500,
                  borderRadius: 2,
                  p: 2
                }}
              >
                {/* Danh mục gợi ý */}
                {categoryResults.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                      Danh mục gợi ý
                    </Typography>
                    <List disablePadding>
                      {categoryResults.map((category) => (
                        <ListItem 
                          key={category.id} 
                          disablePadding 
                          sx={{ py: 0.5 }}
                        >
                          <ListItemButton 
                            onClick={() => {
                              handleCategoryClick(category.name);
                              setShowResults(false);
                            }}
                            sx={{ 
                              borderRadius: 2, 
                              py: 1,
                              '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SearchIcon sx={{ color: '#9e9e9e', mr: 2, fontSize: 20 }} />
                              <Typography>{category.name}</Typography>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Sản phẩm gợi ý */}
                {searchResults.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                      Sản phẩm gợi ý
                    </Typography>
                    <List disablePadding>
                      {searchResults.slice(0, 5).map((result) => (
                        <ListItem 
                          key={result.id} 
                          disablePadding 
                          sx={{ mb: 1 }}
                        >
                          <ListItemButton 
                            onClick={() => {
                              handleSearchClick(result.id);
                              setShowResults(false);
                            }}
                            sx={{ 
                              borderRadius: 2, 
                              p: 1,
                              '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                              <Box 
                                component="img" 
                                src={getImageUrl(result)}
                                alt={result.name} 
                                sx={{ 
                                  width: 60, 
                                  height: 60, 
                                  mr: 2, 
                                  objectFit: 'contain', 
                                  borderRadius: 1,
                                  bgcolor: '#f5f5f5'
                                }} 
                              />
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography fontWeight={500} fontSize={{xs: 14, sm: 15, md: 16}} sx={{ mb: 0.5 }}>
                                  {result.name}
                                </Typography>
                                {formatPrice(result.price, result.original_price, result.discount_percent, result.spare_parts)}
                              </Box>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#fff3e0',
              color: '#000',
              fontWeight: 700,
              borderRadius: 3,
              px: { sm: isTabletLarge ? 1.2 : 1, md: 1, lg: 2 },
              minWidth: { sm: isTabletLarge ? 90 : 100, md: 120, lg: 150 },
              height: { sm: isTabletLarge ? 36 : 35, md: 35 },
              fontSize: { sm: isTabletLarge ? 10 : 11, md: 11, lg: 12 },
              boxShadow: '0 2px 8px 0 rgba(70, 67, 64, 0.1)',
              display: 'inline-flex'
            }}
            startIcon={<EventIcon fontSize="small" />}
            onClick={handleBookingClick}
          >
            Đặt lịch
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#fff3e0',
              color: '#000',
              fontWeight: 700,
              borderRadius: 3,
              px: { sm: isTabletLarge ? 1.2 : 1, md: 1, lg: 2 },
              minWidth: { sm: isTabletLarge ? 90 : 100, md: 120, lg: 150 },
              height: { sm: isTabletLarge ? 36 : 35, md: 35 },
              fontSize: { sm: isTabletLarge ? 10 : 11, md: 11, lg: 12 },
              boxShadow: '0 2px 8px 0 rgba(70, 67, 64, 0.1)',
              display: 'inline-flex'
            }}
            startIcon={
              <Badge badgeContent={bookingCount} color="error" sx={{ 
                '& .MuiBadge-badge': { 
                  bgcolor: 'error.main',
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: 18,
                  height: 18,
                  fontSize: 12
                }
              }}>
                <ShoppingCartIcon fontSize="small" />
              </Badge>
            }
            onClick={handleCartClick}
          >
            {bookingCount > 0 ? (isDesktop ? `Giỏ hàng (${bookingCount})` : 'Giỏ hàng') : 'Giỏ hàng'}
          </Button>
        </Box>
      </Box>
      
      {/* Mobile search slide-in */}
      <Slide direction="left" in={showMobileSearch} mountOnEnter unmountOnExit>
        <Box sx={{
          position: 'fixed',
          top: hasTopBanner ? 50 : 0,
          left: 0,
          width: '100%',
          height: 55,
          bgcolor: '#fff3e0',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          px: 0,
          boxShadow: '0 2px 8px 0 rgba(70, 67, 64, 0.13)'
        }}>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <InputBase 
              autoFocus 
              placeholder="Tìm kiếm..." 
              sx={{ flex: 1, pl: 1, fontSize: 15 }} 
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={() => searchTerm.trim() !== '' && setShowResults(true)}
            />
            <IconButton type="submit" sx={{ color: '#ff9800', p: 1 }}>
              <SearchIcon />
            </IconButton>
            <IconButton sx={{ color: '#ff9800', ml: 0, p: 1 }} onClick={() => {
              setShowMobileSearch(false);
              setSearchTerm('');
              setShowResults(false);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Slide>
      
      {/* Kết quả tìm kiếm mobile */}
      {showMobileSearch && showResults && (categoryResults.length > 0 || searchResults.length > 0) && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'fixed', 
            top: hasTopBanner ? 105 : 55,
            left: 0, 
            width: '100%', 
            height: 'calc(100vh - 55px)', 
            maxHeight: 'calc(100vh - 55px)', 
            overflow: 'auto', 
            zIndex: 1200,
            borderRadius: 0,
            p: 2
          }}
        >
          {/* Danh mục gợi ý mobile */}
          {categoryResults.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Danh mục gợi ý
              </Typography>
              <List disablePadding>
                {categoryResults.map((category) => (
                  <ListItem 
                    key={category.id} 
                    disablePadding 
                    sx={{ py: 0.5 }}
                  >
                    <ListItemButton 
                      onClick={() => {
                        handleCategoryClick(category.name);
                        setShowMobileSearch(false);
                        setShowResults(false);
                      }}
                      sx={{ 
                        borderRadius: 2, 
                        py: 1,
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SearchIcon sx={{ color: '#9e9e9e', mr: 2, fontSize: 20 }} />
                        <Typography>{category.name}</Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Sản phẩm gợi ý mobile */}
          {searchResults.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Sản phẩm gợi ý
              </Typography>
              <List disablePadding>
                {searchResults.slice(0, 5).map((result) => (
                  <ListItem 
                    key={result.id} 
                    disablePadding 
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton 
                      onClick={() => {
                        handleSearchClick(result.id);
                        setShowMobileSearch(false);
                        setShowResults(false);
                      }}
                      sx={{ 
                        borderRadius: 2, 
                        p: 1,
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                        <Box 
                          component="img" 
                          src={getImageUrl(result)}
                          alt={result.name} 
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mr: 2, 
                            objectFit: 'contain', 
                            borderRadius: 1,
                            bgcolor: '#f5f5f5'
                          }} 
                        />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography fontWeight={500} fontSize={{xs: 14, sm: 15, md: 16}} sx={{ mb: 0.5 }}>
                            {result.name}
                          </Typography>
                          {formatPrice(result.price, result.original_price, result.discount_percent, result.spare_parts)}
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Menu danh mục */}
      <CategoryMenu open={showCategoryMenu} onClose={handleCloseCategoryMenu} />
    </Box>
  );
} 