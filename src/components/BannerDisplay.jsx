import React, { useState, useEffect } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import axios from '../config/axios';

/**
 * Component hiển thị banner
 * @param {Object} props
 * @param {string} props.type - Loại banner: 'home_header', 'home_main', 'category'
 * @param {number} props.categoryId - ID danh mục (chỉ cần cho banner danh mục)
 * @param {Object} props.sx - Style bổ sung cho container
 */
const BannerDisplay = ({ type, categoryId, sx = {} }) => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  
  console.log('BannerDisplay mounted with type:', type);

  useEffect(() => {
    fetchBanner();
  }, [type, categoryId]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      setError(null);
      setImgError(false);
      let response;
      
      if (type === 'category' && categoryId) {
        response = await axios.get(`/api/banners/category/${categoryId}`);
      } else {
        response = await axios.get(`/api/banners/type/${type}`);
      }
      
      const banners = response.data || [];
      console.log(`Fetched banners for type ${type}:`, banners);
      
      if (banners.length > 0) {
        setBanner(banners[0]); // Lấy banner đầu tiên
        console.log('Selected banner:', banners[0]);
      } else {
        setBanner(null);
        console.log('No banners found for this type');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      setError('Không thể tải banner');
      setBanner(null);
    } finally {
      setLoading(false);
    }
  };

  // Xác định kích thước banner dựa vào loại
  const getBannerDimensions = () => {
    switch (type) {
      case 'home_header':
        return { width: '100%', height: '60px' };
      case 'home_main':
        return { width: '100%', maxWidth: '1280px', height: { xs: '200px', sm: '300px', md: '400px' } };
      case 'category':
        return { width: '100%', maxWidth: '1280px', height: { xs: '80px', sm: '100px', md: '119px' } };
      default:
        return { width: '100%', height: 'auto' };
    }
  };

  // Tạo placeholder phù hợp với loại banner
  const getPlaceholderUrl = () => {
    switch (type) {
      case 'home_header':
        return 'https://via.placeholder.com/1280x60?text=Banner+Header';
      case 'home_main':
        return 'https://via.placeholder.com/1280x400?text=Banner+Main';
      case 'category':
        return 'https://via.placeholder.com/1280x119?text=Banner+Category';
      default:
        return 'https://via.placeholder.com/1280x200?text=Banner';
    }
  };

  if (loading) {
    return (
      <Skeleton 
        variant="rectangular" 
        sx={{
          ...getBannerDimensions(),
          ...sx
        }} 
      />
    );
  }

  if (error) {
    return (
      <Box 
        sx={{
          ...getBannerDimensions(),
          ...sx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 1
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!banner || !banner.image) {
    return null; // Không hiển thị gì nếu không có banner
  }

  // Tạo URL hình ảnh với đường dẫn tuyệt đối
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const timestamp = new Date().getTime();
  const imageUrl = `${API_URL}/img/${banner.image}?t=${timestamp}`;
  
  console.log('Banner image URL:', imageUrl);
  
  // Tạo URL trực tiếp để kiểm tra
  const directImageUrl = `http://localhost:8080/img/${banner.image}`;

  return (
    <Box 
      component={banner.link ? 'a' : 'div'}
      href={banner.link || undefined}
      target={banner.link ? '_blank' : undefined}
      rel={banner.link ? 'noopener noreferrer' : undefined}
      sx={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        ...sx
      }}
    >
      <img
        src={imageUrl}
        alt={banner.title || 'Banner'}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={(e) => {
          console.error('Error loading banner image:', imageUrl);
          setImgError(true);
          e.target.src = getPlaceholderUrl();
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          borderRadius: '4px',
          backgroundColor: '#f0f0f0'
        }}
      />
      {imgError && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(255,255,255,0.7)',
          p: 1,
          borderRadius: 1
        }}>
          <Typography variant="caption" color="error" gutterBottom display="block">
            Không thể tải hình ảnh
          </Typography>
          <Box>
            <a href={directImageUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '10px'}}>
              Xem ảnh trực tiếp
            </a>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BannerDisplay; 