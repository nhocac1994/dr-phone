import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Alert,
  Paper,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import PageTransition from '../components/PageTransition';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/categories')
        ]);
        
        setServices(servicesRes);
        setCategories(categoriesRes);
        setTotalPages(Math.ceil(servicesRes.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || service.category_id == selectedCategory;
    
    const matchesPrice = !priceRange || (() => {
      switch (priceRange) {
        case '0-100k':
          return service.price <= 100000;
        case '100k-500k':
          return service.price > 100000 && service.price <= 500000;
        case '500k-1m':
          return service.price > 500000 && service.price <= 1000000;
        case '1m+':
          return service.price > 1000000;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Pagination
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateSearchParams({ search: value });
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    updateSearchParams({ category: value });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    setCurrentPage(1);
    updateSearchParams({ price: value });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const updateSearchParams = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Dịch vụ';
  };

  return (
    <PageTransition>
      <Box>
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 6,
            mb: 4,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              component="h1"
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Dịch vụ sửa chữa
            </Typography>
            <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
              Chuyên nghiệp - Uy tín - Chất lượng
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg">
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tìm kiếm & Lọc
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Danh mục"
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Khoảng giá</InputLabel>
                  <Select
                    value={priceRange}
                    label="Khoảng giá"
                    onChange={(e) => handlePriceChange(e.target.value)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="0-100k">Dưới 100k</MenuItem>
                    <MenuItem value="100k-500k">100k - 500k</MenuItem>
                    <MenuItem value="500k-1m">500k - 1 triệu</MenuItem>
                    <MenuItem value="1m+">Trên 1 triệu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{ height: 56 }}
                >
                  Xóa lọc
                </Button>
              </Grid>
            </Grid>
            
            {(searchTerm || selectedCategory || priceRange) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kết quả: {filteredServices.length} dịch vụ
                  {searchTerm && ` cho "${searchTerm}"`}
                  {selectedCategory && ` trong "${getCategoryName(selectedCategory)}"`}
                  {priceRange && ` với giá ${priceRange}`}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Services Grid */}
          {loading ? (
            <Grid container spacing={4}>
              {[...Array(9)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={200} />
                  <Skeleton variant="text" sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="60%" />
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
          ) : filteredServices.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Không tìm thấy dịch vụ nào
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Typography>
              <Button
                variant="contained"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Xóa bộ lọc
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={4}>
                {paginatedServices.map((service) => (
                  <Grid item key={service.id} xs={12} sm={6} md={4}>
                    <Card
                      component={Link}
                      to={`/services/${service.id}`}
                      sx={{
                        height: '100%',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{ height: 200 }}
                        image={service.image || '/images/service-placeholder.jpg'}
                        alt={service.name}
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                          {service.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2, lineHeight: 1.6 }}
                        >
                          {service.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                            {service.price ? `${service.price.toLocaleString()}đ` : 'Liên hệ'}
                          </Typography>
                          <Chip 
                            label={getCategoryName(service.category_id)} 
                            size="small" 
                            color="secondary"
                          />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Thời gian: {service.duration || '30-60 phút'}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            component={Link}
                            to={`/booking?service=${service.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Đặt lịch
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination
                    count={Math.ceil(filteredServices.length / itemsPerPage)}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </PageTransition>
  );
} 