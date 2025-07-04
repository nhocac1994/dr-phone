import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';
import ServiceFormComponent from '../../components/ServiceForm';

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/services/${id}`);
      setService(response);
    } catch (error) {
      console.error('Error fetching service:', error);
      enqueueSnackbar('Lỗi khi tải thông tin dịch vụ', { variant: 'error' });
      navigate('/admin/services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (id) {
        await axios.put(`/services/${id}`, formData);
        enqueueSnackbar('Cập nhật dịch vụ thành công', { variant: 'success' });
      } else {
        await axios.post('/services', formData);
        enqueueSnackbar('Thêm dịch vụ thành công', { variant: 'success' });
      }
      navigate('/admin/services');
    } catch (error) {
      console.error('Error saving service:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !service) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/admin/services')}
            sx={{ cursor: 'pointer' }}
          >
            Dịch vụ
          </Link>
          <Typography color="text.primary">
            {id ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            {id ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/services')}
          >
            Quay lại
          </Button>
        </Box>

        <ServiceFormComponent
          service={service}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Paper>
    </Box>
  );
} 