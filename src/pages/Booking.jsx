import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import PageTransition from '../components/PageTransition';

const ORDER_STATUS = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

export default function Booking() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    scheduled_time: '',
    notes: ''
  });
  
  // Lấy service từ URL params
  const [searchParams] = useSearchParams();
  const serviceIdFromUrl = searchParams.get('service');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  // Tự động chọn service nếu có trong URL
  useEffect(() => {
    if (serviceIdFromUrl && services.length > 0) {
      const service = services.find(s => s.id == serviceIdFromUrl);
      if (service) {
        setSelectedService(service);
        setSelectedCategory(service.category_id);
      }
    }
  }, [serviceIdFromUrl, services]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Lỗi khi tải danh mục', { variant: 'error' });
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/services');
      setServices(response || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      enqueueSnackbar('Lỗi khi tải danh sách dịch vụ', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedService(null);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      enqueueSnackbar('Vui lòng chọn dịch vụ sửa chữa', { variant: 'warning' });
      return;
    }

    if (!formData.customer_name || !formData.customer_phone) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin bắt buộc', { variant: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        service_id: selectedService.id,
        ...formData
      };

      const response = await axios.post('/api/orders', orderData);
      
      enqueueSnackbar('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất', { variant: 'success' });
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        scheduled_time: '',
        notes: ''
      });
      setSelectedService(null);
      setSelectedCategory('');
      
      // Redirect to confirmation page or home
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      enqueueSnackbar('Có lỗi xảy ra khi đặt lịch', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = selectedCategory 
    ? services.filter(service => service.category_id === parseInt(selectedCategory))
    : services;

  return (
    <PageTransition>
      <Box sx={{ py: 4, px: { xs: 2, md: 3 }, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Đặt lịch sửa chữa
        </Typography>

        <Grid container spacing={4}>
          {/* Form đặt lịch */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin đặt lịch
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Chọn danh mục */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Chọn danh mục</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        label="Chọn danh mục"
                      >
                        <MenuItem value="">
                          <em>Tất cả danh mục</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Thông tin khách hàng */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Họ và tên *"
                      value={formData.customer_name}
                      onChange={(e) => handleInputChange('customer_name', e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange('customer_email', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Thời gian mong muốn"
                      type="datetime-local"
                      value={formData.scheduled_time}
                      onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Mô tả vấn đề của thiết bị, thời gian phù hợp..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <LoadingButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      loading={submitting}
                      disabled={!selectedService}
                    >
                      Đặt lịch ngay
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Danh sách dịch vụ */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Chọn dịch vụ sửa chữa
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : filteredServices.length === 0 ? (
                <Alert severity="info">
                  {selectedCategory ? 'Không có dịch vụ nào trong danh mục này' : 'Chưa có dịch vụ nào'}
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {filteredServices.map((service) => (
                    <Card 
                      key={service.id}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedService?.id === service.id ? 2 : 1,
                        borderColor: selectedService?.id === service.id ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="h3">
                            {service.name}
                          </Typography>
                          <Chip 
                            label={`${service.price?.toLocaleString('vi-VN')}₫`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {service.category_name} {service.sub_category_name && `- ${service.sub_category_name}`}
                        </Typography>
                        
                        {service.description && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {service.description}
                          </Typography>
                        )}
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {service.warranty && (
                            <Chip label={`Bảo hành: ${service.warranty}`} size="small" variant="outlined" />
                          )}
                          {service.repair_time && (
                            <Chip label={`Thời gian: ${service.repair_time}`} size="small" variant="outlined" />
                          )}
                          {service.promotion && (
                            <Chip label={service.promotion} size="small" color="secondary" />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Thông tin bổ sung */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lưu ý khi đặt lịch
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  • Vui lòng cung cấp thông tin chính xác để chúng tôi có thể liên hệ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Thời gian sửa chữa có thể thay đổi tùy thuộc vào tình trạng thiết bị
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  • Chúng tôi sẽ liên hệ xác nhận trong vòng 2 giờ làm việc
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Có thể hủy hoặc thay đổi lịch hẹn trước 24 giờ
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </PageTransition>
  );
} 