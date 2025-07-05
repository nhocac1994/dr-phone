import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardMedia,
  Stack,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';
import { formatCurrency } from '../../utils/format';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageTransition from '../../components/PageTransition';

export default function ServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [openConfirm, setOpenConfirm] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/services/${id}`);
      enqueueSnackbar('Xóa dịch vụ thành công', { variant: 'success' });
      navigate('/admin/services');
    } catch (error) {
      console.error('Error deleting service:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/services/edit/${id}`);
  };

  if (loading || !service) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageTransition>
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
              {service.name}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                onClick={() => navigate('/admin/services')}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">
                Chi tiết dịch vụ
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenConfirm(true)}
              >
                Xóa
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {service.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={service.category_name} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                />
                {service.sub_category_name && (
                  <Chip 
                    label={service.sub_category_name} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                )}
              </Box>
              
              {service.promotion && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Khuyến mãi:
                  </Typography>
                  <Typography variant="body2">
                    {service.promotion}
                  </Typography>
                </Box>
              )}

              {service.content && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nội dung chi tiết:
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto'
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: service.content }}
                  />
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Danh sách linh kiện
              </Typography>
              
              {service.spare_parts && service.spare_parts.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên linh kiện</TableCell>
                        <TableCell align="right">Giá gốc</TableCell>
                        <TableCell align="right">Giảm giá</TableCell>
                        <TableCell align="right">Giá cuối</TableCell>
                        <TableCell>Bảo hành</TableCell>
                        <TableCell>Thời gian sửa</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {service.spare_parts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell component="th" scope="row">
                            {part.name}
                            {part.description && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {part.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(part.original_price)}</TableCell>
                          <TableCell align="right">{part.discount_percent}%</TableCell>
                          <TableCell align="right">{formatCurrency(part.final_price)}</TableCell>
                          <TableCell>{part.warranty || '-'}</TableCell>
                          <TableCell>{part.repair_time || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có linh kiện nào
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Hình ảnh
              </Typography>
              <Stack spacing={2}>
                {service.images && service.images.length > 0 ? (
                  service.images.map((img, index) => (
                    <Card key={index} variant="outlined">
                      <CardMedia
                        component="img"
                        height="200"
                        image={img.startsWith('http') ? img : `${API_URL}/img/${img}`}
                        alt={`${service.name} - Ảnh ${index + 1}`}
                        sx={{ objectFit: 'contain' }}
                        onError={(e) => {
                          console.error('Error loading image:', img);
                          e.target.src = 'https://via.placeholder.com/400x200?text=Lỗi+hình+ảnh';
                        }}
                      />
                    </Card>
                  ))
                ) : (
                  <Card variant="outlined" sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có hình ảnh
                    </Typography>
                  </Card>
                )}
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Thông tin khuyến mãi
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {service.vip_discount > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Giảm giá VIP:</strong> {service.vip_discount}%
                      </Typography>
                    </Box>
                  )}
                  {service.student_discount > 0 && (
                    <Box>
                      <Typography variant="body2">
                        <strong>Giảm giá sinh viên:</strong> {service.student_discount}%
                      </Typography>
                    </Box>
                  )}
                  {!service.vip_discount && !service.student_discount && (
                    <Typography variant="body2" color="text.secondary">
                      Không có khuyến mãi
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <ConfirmDialog
          open={openConfirm}
          title="Xóa dịch vụ"
          content={`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}" không?`}
          onConfirm={handleDelete}
          onCancel={() => setOpenConfirm(false)}
        />
      </Box>
    </PageTransition>
  );
} 