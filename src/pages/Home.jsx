import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Chip, Button } from '@mui/material';
import HeaderHome from '../components/HeaderHome';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import axios from '../config/axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Rating } from '@mui/material';
import QuickContactButton from '../components/QuickContactButton';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// BannerSlider lấy ảnh đúng chuẩn như ContentBanners.jsx, hỗ trợ slider cho mainBanners
function BannerSlider({ images, height = 60, slider = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!images || images.length === 0) return null;

  if (slider) {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3500,
      arrows: true,
      pauseOnHover: true,
      adaptiveHeight: false,
    };
    return (
      <Box sx={{ 
        width: {xs: 'auto', sm: 'auto', md: 'auto', lg: '100%'}, 
        maxWidth: '1280px', 
        height, 
        my: 2, 
        borderRadius: 2,
        overflow: 'hidden',
        mx: {xs: 1, sm: 1, md: 1, lg: 'auto'}
      }}>
        <Slider {...settings}>
          {images.map((banner, idx) => {
            // Sử dụng trường 'image' từ database thay vì 'image_url'
            let imageUrl = banner.image;
            // Thêm BASE_URL nếu URL không bắt đầu bằng http
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `${BASE_URL}/img/${imageUrl}`;
            }
            console.log('Banner image URL:', imageUrl);
            return (
              <Box 
                key={banner.id || idx} 
                sx={{ 
                  width: '100%', 
                  height: isMobile ? 'auto' : 400,
                  maxWidth: '1280px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: '#fff', 
                  transition: 'transform 0.3s ease-in-out',
                  cursor: banner.link ? 'pointer' : 'default',
                  '&:hover': {
                    transform: banner.link ? 'scale(1.01)' : 'none',
                    transition: 'transform 0.3s ease-in-out',
                  },
                }}
                onClick={() => {
                  if (banner.link) {
                    window.open(banner.link, '_blank');
                  }
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt={banner.title || `banner-${idx}`}
                  sx={{
                    width: '100%',
                    height: isMobile ? 'auto' : 400,
                    objectFit: 'cover',
                    borderRadius: 0,
                  }}
                />
              </Box>
            );
          })}
        </Slider>
      </Box>
    );
  }

  // Banner top (không slider)
  return (
    <Box sx={{ width: '100%', overflow: 'hidden', bgcolor: '#fff3e0', display: {xs: 'none', sm: 'none', md: 'flex', lg: 'flex'}, justifyContent: 'center', alignItems: 'center', minHeight: height }}>
      {images.map((banner, idx) => {
        let imageUrl = banner.image;
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${BASE_URL}/img/${imageUrl}`;
        }
        console.log('Top banner image URL:', imageUrl);
        return (
          <Box key={banner.id || idx} component="img" src={imageUrl} alt={banner.title || "banner"} sx={{ maxHeight: height, maxWidth: '100%', objectFit: 'contain', display: {xs: 'none', sm: 'none', md: 'flex', lg: 'flex'} }} />
        );
      })}
    </Box>
  );
}

const brands = [
  { name: 'iPhone', logo: './brands/iphone-1.webp', bg: '#fff', color: '#222', slug: 'iphone' },
  { name: 'Samsung', logo: './brands/samsung.webp', bg: '#fff', color: '#1976d2', slug: 'samsung' },
  { name: 'Oppo', logo: './brands/oppo.webp', bg: '#fff', color: '#222', slug: 'oppo' },
  { name: 'Xiaomi', logo: './brands/xiaomi.webp', bg: '#fff', color: '#222', slug: 'xiaomi' },
  { name: 'Vivo', logo: './brands/vivo.webp', bg: '#fff', color: '#1976d2', slug: 'vivo' },
  { name: 'Huawei', logo: './brands/huawei.webp', bg: '#fff', color: '#d32f2f', slug: 'huawei' },
  { name: 'Realme', logo: './brands/realme.webp', bg: '#fff', color: '#222', slug: 'realme' },
  { name: 'Macbook', logo: './brands/macbook-1.webp', bg: '#fff', color: '#222', slug: 'macbook' },
  { name: 'iPad', logo: './brands/ipad-1.webp', bg: '#fff', color: '#222', slug: 'ipad' },
  { name: 'AirPods', logo: './brands/airpod-1.webp', bg: '#fff', color: '#222', slug: 'airpods' },
];

// Brand colors and styles
const brandStyles = {
  'iPhone': {
    color: '#000000',
    bg: '#f5f5f7',
    borderColor: '#86868b'
  },
  'Samsung': {
    color: '#1428A0',
    bg: '#f2f7ff',
    borderColor: '#1428A0'
  },
  'Xiaomi': {
    color: '#ff6900',
    bg: '#fff5eb',
    borderColor: '#ff6900'
  },
  'Oppo': {
    color: '#175E31',
    bg: '#f0f7f2',
    borderColor: '#175E31'
  },
  'Vivo': {
    color: '#415fff',
    bg: '#f0f2ff',
    borderColor: '#415fff'
  },
  'Realme': {
    color: '#ffd100',
    bg: '#fffbe6',
    borderColor: '#ffd100'
  },
  'Macbook': {
    color: '#000000',
    bg: '#f5f5f7',
    borderColor: '#86868b'
  },
  'iPad': {
    color: '#000000',
    bg: '#f5f5f7',
    borderColor: '#86868b'
  },
  'AirPods': {
    color: '#000000',
    bg: '#f5f5f7',
    borderColor: '#86868b'
  },
  'Huawei': {
    color: '#cf0a2c',
    bg: '#fff0f2',
    borderColor: '#cf0a2c'
  },
  'default': {
    color: '#ff9800',
    bg: '#fff3e0',
    borderColor: '#ff9800'
  }
};

// Animated gradient keyframes
const animatedGradient = {
  background: {
    background: 'linear-gradient(270deg, #ff9800, #ffb347, #ff9800)',
    backgroundSize: '400% 400%',
    animation: 'gradientMove 8s ease infinite',
  },
  '@keyframes gradientMove': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

function getBrandGradient(brand) {
  switch (brand) {
    case 'iPhone':
      return 'linear-gradient(270deg, #232526, #414345, #232526)';
    case 'Samsung':
      return 'linear-gradient(270deg, #1428A0, #3a7bd5, #1428A0)';
    case 'Xiaomi':
      return 'linear-gradient(270deg, #ff6900, #ff9800, #ff6900)';
    case 'Oppo':
      return 'linear-gradient(270deg, #175E31, #43cea2, #175E31)';
    case 'Vivo':
      return 'linear-gradient(270deg, #415fff, #0099f7, #415fff)';
    case 'Realme':
      return 'linear-gradient(270deg, #ffd100, #ffb347, #ffd100)';
    case 'Macbook':
    case 'iPad':
    case 'AirPods':
      return 'linear-gradient(270deg, #232526, #86868b, #232526)';
    case 'Huawei':
      return 'linear-gradient(270deg, #cf0a2c, #ff416c, #cf0a2c)';
    default:
      return 'linear-gradient(270deg, #ff9800, #ffb347, #ff9800)';
  }
}

function getBrandWave(brand) {
  switch (brand) {
    case 'iPhone':
      return '#414345';
    case 'Samsung':
      return '#3a7bd5';
    case 'Xiaomi':
      return '#ffb347';
    case 'Oppo':
      return '#43cea2';
    case 'Vivo':
      return '#0099f7';
    case 'Realme':
      return '#ffb347';
    case 'Macbook':
    case 'iPad':
    case 'AirPods':
      return '#86868b';
    case 'Huawei':
      return '#ff416c';
    default:
      return '#ffb347';
  }
} 

export default function Home() {
  const [topBanners, setTopBanners] = useState([]);
  const [mainBanners, setMainBanners] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});
  const [serviceTypeFilters, setServiceTypeFilters] = useState({});
  const [flashSale, setFlashSale] = useState(null);
  const [flashSaleServices, setFlashSaleServices] = useState([]);
  const [countdown, setCountdown] = useState('');
  const [selectedFlashSaleType, setSelectedFlashSaleType] = useState('all');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter flash sale services by type
  const filteredFlashSaleServices = useMemo(() => {
    if (!flashSaleServices || !flashSaleServices.length) return [];
    if (selectedFlashSaleType === 'all') return flashSaleServices;
    return flashSaleServices.filter(service => service.service_type === selectedFlashSaleType);
  }, [flashSaleServices, selectedFlashSaleType]);

  // Get unique service types from flash sale services
  const flashSaleTypes = useMemo(() => {
    if (!flashSaleServices || !flashSaleServices.length) return [];
    const types = new Set(flashSaleServices.map(service => service.service_type || 'Khác'));
    return ['all', ...Array.from(types)];
  }, [flashSaleServices]);

  useEffect(() => {
    // Lấy banner từ API
    const fetchBanners = async () => {
      try {
        // Lấy banner đầu trang (home_header)
        const topBannersResponse = await axios.get('/api/banners/type/home_header');
        console.log('Top banners response:', topBannersResponse);
        setTopBanners(Array.isArray(topBannersResponse) ? topBannersResponse : []);
        
        // Lấy banner chính (home_main)
        const mainBannersResponse = await axios.get('/api/banners/type/home_main');
        console.log('Main banners response:', mainBannersResponse);
        setMainBanners(Array.isArray(mainBannersResponse) ? mainBannersResponse : []);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setTopBanners([]);
        setMainBanners([]);
      }
    };

    fetchBanners();

    // Fetch services và categories bằng axios
    axios.get('/api/services')
      .then(res => setServices(Array.isArray(res) ? res : []))
      .catch(err => {
        console.error('Error fetching services:', err);
        setServices([]);
      });
    
    axios.get('/api/categories')
      .then(res => setCategories(Array.isArray(res) ? res : []))
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      });

    // Fetch flash sale
    axios.get('/api/flashsale/current')
      .then(res => {
        if (res && typeof res === 'object') {
          setFlashSale(res.flashsale);
          setFlashSaleServices(Array.isArray(res.services) ? res.services : []);
        } else {
          setFlashSale(null);
          setFlashSaleServices([]);
        }
      })
      .catch(err => {
        setFlashSale(null);
        setFlashSaleServices([]);
        console.error('Error fetching flash sale:', err);
      });
  }, []);

  // Fetch ratings khi services thay đổi
  useEffect(() => {
    const fetchRatings = async () => {
      if (!services || services.length === 0) return;
      
      const ratingsObj = {};
      await Promise.all(services.map(async (service) => {
        try {
          const res = await axios.get(`/api/services/${service.id}/reviews`);
          const reviews = Array.isArray(res) ? res : [];
          if (reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
            ratingsObj[service.id] = {
              avg: Math.round(avg * 10) / 10,
              count: reviews.length
            };
          } else {
            ratingsObj[service.id] = { avg: 0, count: 0 };
          }
        } catch (error) {
          console.error(`Error fetching reviews for service ${service.id}:`, error);
          ratingsObj[service.id] = { avg: 0, count: 0 };
        }
      }));
      setServiceRatings(ratingsObj);
    };
    
    fetchRatings();
  }, [services]);

  // Countdown logic
  useEffect(() => {
    if (!flashSale || !flashSale.end) return;
    const interval = setInterval(() => {
      const end = new Date(flashSale.end);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) {
        setCountdown('Đã kết thúc');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${days} Ngày ${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [flashSale]);

  console.log('mainBanners', mainBanners);
  console.log('topBanners', topBanners);

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Banner Top */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            width: '100%'
          }}
        >
          <BannerSlider images={topBanners} />
        </motion.div>

        {/* Main content, maxWidth 1280, căn giữa */}
        <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              marginTop: !isMobile && topBanners.length > 0 ? '40px' : 0
            }}
          >
            <HeaderHome hasTopBanner={!isMobile && topBanners.length > 0} />
          </motion.div>

          {/* Banner Main dưới header */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ 
              marginTop: topBanners.length > 0 ? isMobile ? '50px' : '70px' : '50px',
            }}
          >
            <BannerSlider images={mainBanners} height={isMobile ? 'auto' : 'auto'} slider xs={12} md={12}  />
          </motion.div>

          {/* Flash Sale Section */}
          {flashSale && flashSaleServices && flashSaleServices.length > 0 && (
            <Box maxWidth="sm" sx={{ 
              maxWidth: {xs: '100%', sm: '100%', md: '100%', lg: '1280px'}, 
              width: '100%', 
              flex: 1, 
              mx: 'auto', 
              boxSizing: 'border-box',
              borderRadius: {xs: 0, sm: 0, md: 0, lg: 3}, 
              overflow: 'hidden', 
              boxShadow: '0 2px 12px 0 rgba(255,152,0,0.08)', 
              border: '2px solid #ff9800', 
              position: 'relative', 
              background: 'linear-gradient(180deg, #ff9800 0%, #ffb74d 100%)'
            }}>
            
              {/* SVG background sóng */}
              <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" viewBox="0 0 600 120" preserveAspectRatio="none" style={{ display: 'block' }}>
                  <path d="M0,40 C150,120 350,0 600,80 L600,120 L0,120 Z" fill="#ffb74d" opacity="0.5"/>
                  <path d="M0,60 C200,100 400,20 600,60 L600,120 L0,120 Z" fill="#fffde7" opacity="0.3"/>
                  <path d="M0,80 C300,140 400,0 600,100 L600,120 L0,120 Z" fill="#ff9800" opacity="0.2"/>
                </svg>
              </Box>

              {/* Nội dung Flash Sale */}
              {/* Header */}
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: {xs: 'column', sm: 'row'}, 
                alignItems: {xs: 'flex-start', sm: 'center'}, 
                justifyContent: 'space-between',
                gap: 2
              }}>
                {/* Title and Timer */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlashOnIcon sx={{ color: '#fff', fontSize: {xs: 16, sm: 20, md: 22, lg: 25}, mr: 1 }} />
                    <Typography variant="h5" fontWeight={700} color="#fff" mr={2} sx={{ fontSize: {xs: 16, sm: 20, md: 22, lg: 25} }}>
                      FLASH SALE
                    </Typography>
                  </Box>
                  <Box sx={{ fontWeight: 700, color: '#fff', fontSize: {xs: 16, sm: 20, md: 22, lg: 25},fontFamily: 'arial' }}>
                    {countdown}
                  </Box>
                </Box>

                {/* Service Type Filters */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  {flashSaleTypes && flashSaleTypes.map((type) => (
                    <Box
                      key={type}
                      onClick={() => setSelectedFlashSaleType(type)}
                      sx={{
                        px: {xs: 1, sm: 2, md: 2, lg: 2},
                        py: {xs: 0.5, sm: 1, md: 1, lg: 1},
                        borderRadius: {xs: 2, sm: 2, md: 2, lg: 2},
                        bgcolor: type === selectedFlashSaleType ? '#fff' : 'transparent',
                        border: '2px solid #fff',
                        color: type === selectedFlashSaleType ? '#ff9800' : '#fff',
                        cursor: 'pointer',
                        fontFamily: 'arial',
                        fontWeight: 700,
                        fontSize: {xs: 12, sm: 13, md: 13, lg: 16},
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: type === selectedFlashSaleType ? '#fff' : 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      {type === 'all' ? 'Tất cả' : type}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Grid */}
              <Box sx={{ bgcolor: '#fff', p: {xs: 1, sm: 2, md: 2, lg: 2} }}>
                <Grid container spacing={2}>
                  {filteredFlashSaleServices && filteredFlashSaleServices.map((service, idx) => {
                    const firstImage = service.images ? service.images.split(',')[0] : service.image;
                    let spareParts = Array.isArray(service.spare_parts) ? service.spare_parts : [];
                    try {
                      if (typeof service.spare_parts === 'string') {
                        spareParts = JSON.parse(service.spare_parts);
                      }
                    } catch (e) {
                      console.error('Error parsing spare_parts in flash sale:', e);
                      spareParts = [];
                    }

                    const maxDiscountPart = spareParts.length > 0 ? spareParts.reduce((max, p) => (Number(p.discount_percent) > Number(max.discount_percent || 0) ? p : max), {}) : null;

                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 + idx * 0.07 }}
                      >
                      <Box sx={{
                        display: 'grid',
                        gap: { xs: 1, sm: 2 },
                        gridTemplateColumns: {
                          xs: 'repeat(2, 1fr)',
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                        },
                      }}>
                        <Box
                          onClick={() => navigate(`/services/${service.id}`)}
                          sx={{
                            width: 'auto',
                            bgcolor: '#fff',
                            borderRadius: {xs: 2, sm: 3, md: 3, lg: 3},
                            boxShadow: '0 1px 8px 0 rgba(0,0,0,0.099)',
                            border: '2px solid #eee',
                            p: {xs: 1, sm: 2, md: 2, lg: 2},
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            minHeight: {xs: 120, sm: 200, md: 250, lg: 250},
                            maxWidth: {xs: '100%', sm: '100%', md: '100%', lg: '100%'},                          
                            transition: 'transform 0.3s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: '0 4px 24px 0 rgba(255,152,0,0.13)',
                              transform: 'scale(1.01)',
                            }
                          }}
                        >
                          {/* Flash Sale Badge Top Right */}
                          {maxDiscountPart && maxDiscountPart.discount_percent && maxDiscountPart.discount_percent > 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: {xs: 5, sm: 10, md: 10, lg: 10},
                                right: {xs: 5, sm: 10, md: 10, lg: 10},
                                bgcolor: '#ff9800',
                                color: '#fff',
                                px: {xs: 1, sm: 2, md: 2, lg: 2},
                                py: {xs: 0.5, sm: 1, md: 1, lg: 1},
                                borderRadius: 2,
                                fontSize: {xs: 10, sm: 11, md: 11, lg: 12},
                                fontWeight: 700,
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <FlashOnIcon sx={{ fontSize: {xs: 10, sm: 11, md: 11, lg: 12} }} />
                              {maxDiscountPart && maxDiscountPart.discount_percent ? maxDiscountPart.discount_percent : 0}% OFF
                            </Box>
                          )}

                          {/* Image */}
                          <Box sx={{ 
                            width: {xs: 150, sm: 200, md: 200, lg: 200},
                            height: {xs: 150, sm: 200, md: 200, lg: 200},
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: {xs: 1, sm: 2, md: 2, lg: 2}
                          }}>
                            <Box 
                              component="img" 
                              src={firstImage ? `${BASE_URL}/img/${firstImage}` : '/no-image.png'} 
                              alt={service.name} 
                              sx={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: 2
                              }} 
                            />
                          </Box>

                          {/* Badges in one row */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1, 
                            width: '100%', 
                            mb: {xs: 1, sm: 2, md: 2, lg: 2}
                          }}>
                            {service.warranty && (
                              <Box sx={{ 
                                bgcolor: '#e8f5e9', 
                                color: '#2e7d32',
                                px: {xs: 1, sm: 2, md: 2, lg: 2},
                                py: {xs: 0.5, sm: 1, md: 1, lg: 1},
                                borderRadius: 2,
                                fontSize: {xs: 8, sm: 11, md: 11, lg: 12},
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <span role="img" aria-label="shield">🛡️</span>
                                BH: {service.warranty}
                              </Box>
                            )}
                            {service.repair_time && (
                              <Box sx={{ 
                                bgcolor: '#fff3e0',
                                color: '#e65100',
                                px: {xs: 1, sm: 2, md: 2, lg: 2},
                                py: {xs: 0.5, sm: 1, md: 1, lg: 1},
                                borderRadius: 2,
                                fontSize: {xs: 10, sm: 11, md: 11, lg: 12},
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <span role="img" aria-label="flash">⚡</span>
                                Sửa: {service.repair_time}
                              </Box>
                            )}
                          </Box>

                          {/* Title */}
                          <Typography 
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: {xs: 14, sm: 16, md: 16, lg: 18},
                              textAlign: 'left',
                              width: '100%',
                              mb: {xs: 1, sm: 2, md: 2, lg: 2},
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              color: '#000'
                            }}
                          >
                            {service.name}
                          </Typography>

                          {/* Price */}
                          {maxDiscountPart && maxDiscountPart.original_price && maxDiscountPart.discount_percent && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              mb: {xs: 1, sm: 2, md: 2, lg: 2},
                              width: '100%'
                            }}>
                              <Typography sx={{ 
                                color: '#f44336',
                                fontWeight: 700,
                                fontSize: {xs: 14, sm: 18, md: 20, lg: 22},
                                lineHeight: 1
                              }}>
                                {maxDiscountPart && maxDiscountPart.original_price && maxDiscountPart.discount_percent ? 
                                  Math.round(maxDiscountPart.original_price * (1 - maxDiscountPart.discount_percent / 100)).toLocaleString('vi-VN') : 
                                  0
                                }đ
                              </Typography>
                              <Typography sx={{ 
                                color: '#999',
                                textDecoration: 'line-through',
                                fontSize: {xs: 12, sm: 13, md: 13, lg: 14},
                                lineHeight: 1
                              }}>
                                {maxDiscountPart && maxDiscountPart.original_price ? Number(maxDiscountPart.original_price).toLocaleString('vi-VN') : 0}đ
                              </Typography>
                            </Box>
                          )}

                          {/* Rating and Review Count */}
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'left',
                            justifyContent: 'left',
                            width: '100%',
                            gap: 1,
                            mt: {xs: 1, sm: 2, md: 2, lg: 2},
                            mb: {xs: 1, sm: 2, md: 2, lg: 2}
                          }}>
                            <Rating 
                              value={serviceRatings[service.id]?.avg || 0} 
                              readOnly 
                              size="small"
                              precision={0.1}
                              sx={{ color: '#ffa726' }}
                            />
                            <Typography sx={{ 
                              color: '#666',
                              fontSize: {xs: 10, sm: 11, md: 11, lg: 12}
                            }}>
                              {serviceRatings[service.id]?.count || 0} đánh giá
                            </Typography>
                          </Box>

                          {/* Bottom Flash Sale Section */}
                          <Box sx={{
                            px: {xs: 1, sm: 2, md: 2, lg: 2},
                            py: {xs: 1, sm: 1, md: 1, lg: 1},
                            gap: {xs: 0, sm: 2, md: 2, lg: 2},
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #eee',
                            bgcolor: '#fff',
                            width: '100%'
                          }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: '#ff9800',
                              color: '#fff',
                              px: {xs: 1, sm: 2, md: 2, lg: 2},
                              py: {xs: 0.5, sm: 1, md: 1, lg: 1},
                              borderRadius: 2,  
                              fontSize: {xs: 8, sm: 11, md: 11, lg: 12},
                              fontWeight: 700,
                              gap: 0.5
                            }}>
                              <FlashOnIcon sx={{ fontSize: {xs: 8, sm: 11, md: 11, lg: 12} }} />
                              FLASH SALE {maxDiscountPart && maxDiscountPart.discount_percent ? maxDiscountPart.discount_percent : 0}%
                            </Box>
                            <Typography sx={{
                              color: '#666',
                              fontSize: {xs: 8, sm: 11, md: 11, lg: 12},
                              fontWeight: 500
                            }}>
                              Còn {maxDiscountPart && maxDiscountPart.stock ? maxDiscountPart.stock : 0} sản phẩm
                            </Typography>
                          </Box>
                        </Box>
                        </Box>
                      </motion.div>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          )}

          {/* Content */}
          <Box maxWidth="sm" sx={{ maxWidth: {xs: '100%', sm: '100%', md: '100%', lg: '1280px'}, width: '100%', flex: 1, mx: 'auto', boxSizing: 'border-box' }}>
            {/* Dịch vụ trỏ nhanh */}
            {(() => {
              // Lọc các thương hiệu có dịch vụ
              const filteredBrands = (Array.isArray(brands) && Array.isArray(categories)) ? brands.filter(brand => {
                // Tìm danh mục tương ứng với thương hiệu
                const category = categories.find(cat => 
                  cat.name.toLowerCase() === brand.name.toLowerCase() || 
                  cat.name.toLowerCase().includes(brand.name.toLowerCase()) ||
                  brand.name.toLowerCase().includes(cat.name.toLowerCase())
                );
                
                // Nếu không tìm thấy danh mục, loại bỏ thương hiệu
                if (!category) return false;
                
                // Kiểm tra xem danh mục có dịch vụ không
                const hasServices = services.some(s => s.category_id === category.id);
                return hasServices;
              }) : [];
              
              // Nếu không có thương hiệu nào, không hiển thị phần này
              if (!filteredBrands || filteredBrands.length === 0) return null;
              
              return (
                <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                  <Box
                    sx={{ 
                      maxWidth: {xs: '100%', sm: '100%', md: '100%', lg: '1280px'}, 
                      width: '100%', 
                      flex: 1, 
                      mt: {xs: 1, sm: 2, md: 2, lg: 4},
                      mb: {xs: 1, sm: 2, md: 2, lg: 4},
                      mx: 'auto', 
                      boxSizing: 'border-box',
                      borderRadius: {xs: 0, sm: 0, md: 0, lg: 3}, 
                      overflow: 'hidden', 
                      boxShadow: '0 2px 12px 0 rgba(255,152,0,0.08)', 
                      border: '2px solid #ff9800', 
                      position: 'relative', 
                      background: 'linear-gradient(180deg, #ff9800 0%, #ffb74d 100%)'
                    }}
                  >
                    <Typography 
                      fontWeight={700} 
                      fontSize={{
                      xs: 18, sm: 20, md: 20, lg: 20}} 
                      mb={2}
                      sx={{ px: {xs: 1, sm: 2, md: 2, lg: 2},
                      mb: {xs: 1, sm: 2, md: 2, lg: 2},
                      mt: {xs: 1, sm: 2, md: 2, lg: 2},
                      textAlign: 'left',
                      color: '#fff'
                      }}
                    >
                      Sửa chữa theo dòng máy
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: {xs: 1, sm: 2, md: 2, lg: 2.5}, 
                      overflowX: 'auto', 
                      pb: 2, 
                      pl:{xs: 0, sm: 0, md: 0, lg: 4},
                      justifyContent: 'flex-start',
                      width: '100%',
                      }}>
                      {filteredBrands.map((brand) => (
                        <Box
                          key={brand.slug || brand.name}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (brand && brand.slug) {
                              console.log(`Chuyển hướng từ Home đến brand: ${brand.name} với slug: ${brand.slug}`);
                              navigate(`/services/brand/${brand.slug}`, { replace: true });
                            } else {
                              console.error('Brand slug không xác định');
                              // Không chuyển hướng nếu slug không xác định
                            }
                          }}
                          sx={{
                            minWidth: {xs: 80, sm: 100, md: 100, lg: 100}, 
                            maxWidth: {xs: 80, sm: 100, md: 100, lg: 100}, 
                            height: {xs: 80, sm: 100, md: 100, lg: 100}, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: brand.bg, 
                            borderRadius: '20%', 
                            border: '2px solid #eee', 
                            cursor: 'pointer', 
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                            '&:hover': { borderColor: '#1976d2', boxShadow: '0 4px 16px 0 rgba(25,118,210,0.13)' },
                          }}
                        >
                          <img src={brand.logo} alt={brand.name} style={{ width: 45, height: 45, objectFit: 'contain', marginBottom: 8, borderRadius: '50%', border: '2px solid #eee' }} onError={(e) => {
                            console.error('Error loading brand image:', brand.logo);
                            e.target.style.display = 'none';
                          }} />
                          <Typography fontWeight={700} fontSize={13} color={brand.color} sx={{ textAlign: 'center' }}>{brand.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </motion.div>
              );
            })()}
            
            {/* Dịch vụ group theo loại */}
            {categories && categories.map(cat => {
              // Lấy dịch vụ theo danh mục
              const filteredServices = services ? services.filter(s => s.category_id === cat.id) : [];
              
              // Nếu không có dịch vụ nào, ẩn danh mục này
              if (!filteredServices || filteredServices.length === 0) return null;
              
              // Tìm thương hiệu tương ứng với danh mục
              const matchingBrand = brands.find(brand => 
                cat.name.toLowerCase() === brand.name.toLowerCase() || 
                cat.name.toLowerCase().includes(brand.name.toLowerCase()) ||
                brand.name.toLowerCase().includes(cat.name.toLowerCase())
              );
              
              // Sử dụng style của thương hiệu nếu tìm thấy, ngược lại sử dụng style mặc định
              const brandStyle = matchingBrand 
                ? brandStyles[matchingBrand.name] || brandStyles.default
                : brandStyles.default;
                
              const gradient = getBrandGradient(matchingBrand?.name || 'default');
              const waveColor = getBrandWave(matchingBrand?.name || 'default');
              const serviceTypes = Array.from(new Set(filteredServices.map(s => s.service_type || 'Khác')));
              const selectedType = serviceTypeFilters[cat.id] || 'Tất cả';
              
              // Lọc dịch vụ theo loại đã chọn
              const showServices = selectedType === 'Tất cả' 
                ? filteredServices.slice(0, 8)
                : filteredServices.filter(s => s.service_type === selectedType).slice(0, 8);

              return (
                <Box key={cat.id} sx={{ 
                  mb: 4,
                  bgcolor: brandStyle.bg,
                  borderRadius: { xs: 0, sm: 0, md: 0, lg: 3 },
                  border: `1px solid ${brandStyle.borderColor}`,
                  overflow: 'hidden',
                  boxShadow: '0 1px 8px 0 rgba(0,0,0,0.1)',
                }}>
                  <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
                    {/* Animated Gradient Header with SVG Wave */}
                    <Box sx={{
                      p: { xs: 2, sm: 3 },
                      borderBottom: `1px solid ${brandStyle.borderColor}20`,
                      background: gradient,
                      backgroundSize: '400% 400%',
                      animation: 'gradientMove 8s ease infinite',
                      borderTopLeftRadius: { xs: 0, sm: 0, md: 0, lg: 12 },
                      borderTopRightRadius: { xs: 0, sm: 0, md: 0, lg: 12 },
                      position: 'relative',
                      overflow: 'hidden',
                      '@keyframes gradientMove': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                        '100%': { backgroundPosition: '0% 50%' },
                      },
                    }}>
                      {/* SVG Wave */}
                      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 40, zIndex: 1, pointerEvents: 'none' }}>
                        <svg width="100%" height="40" viewBox="0 0 600 40" preserveAspectRatio="none" style={{ display: 'block' }}>
                          <path d="M0,20 C150,60 350,0 600,30 L600,40 L0,40 Z" fill={waveColor} opacity="0.18"/>
                          <path d="M0,30 C200,40 400,10 600,20 L600,40 L0,40 Z" fill="#fff" opacity="0.12"/>
                        </svg>
                      </Box>
                      {/* Category title and filter */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: { xs: 2, sm: 2 },
                        position: 'relative',
                        zIndex: 2,
                      }}>
                        <Box sx={{
                          width: 5,
                          height: 28,
                          bgcolor: '#fff',
                          borderRadius: 2,
                          mr: 1
                        }} />
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color="#fff"
                          sx={{ fontSize: { xs: 18, sm: 25 } }}
                        >
                          {cat.name}
                        </Typography>
                      </Box>
                      
                      {/* Filter buttons - chỉ hiển thị khi có dịch vụ */}
                      {filteredServices.length > 0 && (
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          position: 'relative',
                          zIndex: 2,
                        }}>
                          <Button
                            onClick={() => setServiceTypeFilters(prev => ({ ...prev, [cat.id]: 'Tất cả' }))}
                            sx={{
                              px: { xs: 1, sm: 1, md: 1, lg: 2 },
                              py: { xs: 0.5, sm: 0.5, md: 0.5, lg: 1 },
                              borderRadius: 2,
                              fontWeight: 600,
                              bgcolor: selectedType === 'Tất cả' ? '#fff' : 'transparent',
                              color: selectedType === 'Tất cả' ? brandStyle.color : '#fff',
                              border: `1px solid #fff`,
                              textTransform: 'none',
                              boxShadow: selectedType === 'Tất cả' ? '0 2px 8px 0 #fff3' : 'none',
                              '&:hover': {
                                bgcolor: '#fff',
                                color: brandStyle.color,
                              },
                              minWidth: 'auto',
                              fontSize: { xs: 12, sm: 13 },
                            }}
                          >
                            Tất cả
                          </Button>
                          {serviceTypes.map(type => (
                            <Button
                              key={type}
                              onClick={() => setServiceTypeFilters(prev => ({ ...prev, [cat.id]: type }))}
                              sx={{
                                px: { xs: 1, sm: 1, md: 1, lg: 2 },
                                py: { xs: 0.5, sm: 0.5, md: 0.5, lg: 1 },
                                borderRadius: 2,
                                fontWeight: 600,
                                bgcolor: selectedType === type ? '#fff' : 'transparent',
                                color: selectedType === type ? brandStyle.color : '#fff',
                                border: `1px solid #fff`,
                                textTransform: 'none',
                                boxShadow: selectedType === type ? '0 2px 8px 0 #fff3' : 'none',
                                '&:hover': {
                                  bgcolor: '#fff',
                                  color: brandStyle.color,
                                },
                                minWidth: 'auto',
                                fontSize: { xs: 12, sm: 13 },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {type}
                            </Button>
                          ))}
                        </Box>
                      )}
                      
                      {/* Thông báo khi không có dịch vụ */}
                      {filteredServices.length === 0 && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 2,
                          mb: 2
                        }}>
                          <Typography color="white" fontWeight={500} sx={{ fontSize: { xs: 14, sm: 16 } }}>
                            Đang cập nhật dịch vụ...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </motion.div>

                  {/* Services grid - chỉ hiển thị khi có dịch vụ */}
                  {filteredServices.length > 0 ? (
                    <Box sx={{
                      display: 'grid',
                      gap: { xs: 1, sm: 2 },
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                      },
                      p: { xs: 2, sm: 3 },
                    }}>
                      {showServices.map((service, idx) => {
                        // Lấy hình đầu tiên duy nhất
                        const firstImage = service.images ? service.images.split(',')[0] : service.image;
                        // Lấy linh kiện đầu tiên nếu có
                        let spareParts = [];
                        if (Array.isArray(service.spare_parts)) {
                          spareParts = service.spare_parts;
                        } else if (typeof service.spare_parts === 'string' && service.spare_parts) {
                          try { 
                            spareParts = JSON.parse(service.spare_parts); 
                          } catch (e) {
                            console.error('Error parsing spare_parts:', e);
                            spareParts = [];
                          }
                        }
                        const firstSpare = spareParts[0];
                        // Giá và giảm giá lấy từ linh kiện đầu tiên nếu có
                        const oldPrice = firstSpare ? Number(firstSpare.original_price) : Number(service.price) || 0;
                        const discount = firstSpare ? Number(firstSpare.discount_percent) : Number(service.discount_percent) || 0;
                        const newPrice = discount ? Math.round(oldPrice * (1 - discount / 100)) : oldPrice;
                        // Thời gian sửa chữa
                        const duration = service.repair_time || '30 phút';
                        // Đánh giá (giả lập nếu chưa có)
                        const rating = service.rating || 5;
                        const reviewCount = service.review_count || 0;
                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.45 + idx * 0.07 }}
                          >
                            <Box
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/services/${service.id}`, { replace: true });
                              }}
                              sx={{
                                width: 'auto',
                                bgcolor: '#fff',
                                borderRadius: {xs: 2, sm: 3, md: 3, lg: 3},
                                boxShadow: '0 1px 8px 0 rgba(0,0,0,0.099)',
                                border: '2px solid #eee',
                                p: {xs: 1, sm: 2, md: 2, lg: 2},
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                minHeight: {xs: 200, sm: 350, md: 350, lg: 350},
                                maxWidth: {xs: '100%', sm: '100%', md: '100%', lg: '100%'},                          
                                transition: 'transform 0.3s ease-in-out',
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: '0 4px 24px 0 rgba(255,152,0,0.13)',
                                  transform: 'scale(1.01)',
                                }
                              }}
                            >
                              {/* Badge giảm giá */}
                              {discount > 0 && (
                                <Box sx={{ position: 'absolute', top: {xs: 5, sm: 10, md: 10, lg: 10}, right: {xs: 5, sm: 10, md: 10, lg: 10}, bgcolor: '#e53935', color: '#fff', px: {xs: 1, sm: 1.2, md: 1.2, lg: 1.2}, py: {xs: 0.3, sm: 0.3, md: 0.3, lg: 0.3}, borderRadius: '8px', fontWeight: 700, fontSize: {xs: 12, sm: 15, md: 15, lg: 15}, zIndex: 2, transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.3s ease-in-out' } }}>
                                    -{discount}%
                                  </Box>
                              )}
                              {/* Ảnh sản phẩm duy nhất, căn giữa */}
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, width: '100%', height: 200 }}>
                                <Box component="img" src={firstImage ? `${BASE_URL}/img/${firstImage}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI0NSIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='} 
                                alt={service.name} 
                                sx={{ 
                                  width: {xs: 150, sm: 200, md: 200, lg: 200},
                                  height: {xs: 150, sm: 200, md: 200, lg: 200},
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  bgcolor: '#f5f5f5',
                                  transition: 'transform 0.3s ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.3s ease-in-out',
                                  },
                                  }} 
                                  />
                              </Box>
                              {/* Badge bảo hành & thời gian sửa */}
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, width: '100%', mb: 1 }}>
                                {service.warranty && (
                                  <Box sx={{ bgcolor: '#e0f2f1', color: '#009688', px: 1.2, py: 0.3, borderRadius: 2, fontWeight: 600, fontSize: {xs: 10, sm: 12, md: 12, lg: 12}, display: 'flex', alignItems: 'center', gap: 0.5, transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.3s ease-in-out',
                                    },
                                  }}>
                                    <span role="img" aria-label="shield">🛡️</span> {service.warranty}
                                  </Box>
                                )}
                                {duration && (
                                  <Box sx={{ bgcolor: '#fff3e0', color: '#e65100', px: 1.2, py: 0.3, borderRadius: 2, fontWeight: 600, fontSize: {xs: 10, sm: 12, md: 12, lg: 12}, display: 'flex', alignItems: 'center', gap: 0.5, transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.3s ease-in-out',
                                    },
                                  }}>
                                    <span role="img" aria-label="flash">⚡</span> {duration}
                                  </Box>
                                )}
                              </Box>
                              {/* Tên dịch vụ căn trái */}
                              <Typography fontWeight={700} fontSize={{xs: 14, sm: 16, md: 16, lg: 16}} sx={{ mb: 1, textAlign: 'left', width: '100%', minHeight: 40, transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.3s ease-in-out',
                                    },
                                  }}>{service.name}</Typography>
                              {/* Giá gốc và giá sau giảm */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1, transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.3s ease-in-out',
                                    },
                                  }}>
                                <Typography color="error" fontWeight={700} fontSize={{xs: 14, sm: 16, md: 16, lg: 16}}>{newPrice?.toLocaleString('vi-VN')}₫</Typography>
                                {discount > 0 && (
                                  <Typography sx={{ textDecoration: 'line-through', color: '#888', fontSize: {xs: 14, sm: 16, md: 16, lg: 16}, transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.3s ease-in-out',
                                    },
                                  }}>{oldPrice?.toLocaleString('vi-VN')}₫</Typography>
                                )}
                              </Box>
                              {/* Đánh giá */}
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                                {serviceRatings[service.id]?.count > 0 ? (
                                  <>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <StarIcon key={i} sx={{ color: i < Math.round(serviceRatings[service.id].avg) ? '#FFD600' : '#eee', fontSize: {xs: 10, sm: 12, md: 12, lg: 12} }} />
                                    ))}
                                    <Typography sx={{ ml: 0.5, fontSize: {xs: 10, sm: 12, md: 12, lg: 12}, color: '#666' }}>{serviceRatings[service.id].count} đánh giá</Typography>
                                  </>
                                ) : (
                                  <Typography sx={{ fontSize: {xs: 10, sm: 12, md: 12, lg: 12}, color: '#aaa' }}>Chưa có đánh giá</Typography>
                                )}
                              </Box>
                            </Box>
                          </motion.div>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 4,
                      bgcolor: '#fff'
                    }}>
                      <Button
                        onClick={() => navigate(`/category/${cat.id}`)}
                        sx={{
                          bgcolor: brandStyle.color,
                          color: '#fff',
                          px: { xs: 3, sm: 4 },
                          py: { xs: 1, sm: 1.5 },
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: brandStyle.color,
                            opacity: 0.9,
                            transform: 'translateY(-2px)',
                          },
                          fontSize: { xs: 12, sm: 14 },
                        }}
                      >
                        Xem dịch vụ {cat.name}
                      </Button>
                    </Box>
                  )}
                  
                  {/* View more button - chỉ hiển thị khi có nhiều hơn 8 dịch vụ */}
                  {filteredServices.length > 8 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      py: 2,
                      borderTop: `1px solid ${brandStyle.borderColor}20`
                    }}>
                      <Button
                        onClick={() => navigate(`/category/${cat.id}`)}
                        sx={{
                          bgcolor: brandStyle.color,
                          color: '#fff',
                          px: { xs: 3, sm: 4 },
                          py: { xs: 1, sm: 1.5 },
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: brandStyle.color,
                            opacity: 0.9,
                            transform: 'translateY(-2px)',
                          },
                          fontSize: { xs: 12, sm: 14 },
                        }}
                      >
                        Xem thêm dịch vụ {cat.name}
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Footer */}
          <Footer />
          <QuickContactButton />
        </Box>
      </Box>
    </PageTransition>
  );
} 