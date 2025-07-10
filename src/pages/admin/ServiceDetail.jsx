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
  IconButton,
  CardContent,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/services/${id}`);
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
        <Box sx={{ mb: isMobile ? 2 : 3, display: { xs: 'none', md: 'block' } }}>
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

        <Paper sx={{ p: isMobile ? 1.5 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 2 : 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                sx={{ mr: 1, fontSize: isMobile ? '0.75rem' : undefined }}
                onClick={() => navigate('/admin/services')}
              >
                <ArrowBackIcon sx={{ fontSize: isMobile ? '1.2rem' : undefined }}/>
              </IconButton>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600, fontSize: isMobile ? '0.75rem' : undefined }}>
                Chi tiết dịch vụ
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 1, fontSize: isMobile ? '0.75rem' : undefined, py: isMobile ? 0.5 : undefined }}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenConfirm(true)}
                sx={{ fontSize: isMobile ? '0.75rem' : undefined, py: isMobile ? 0.5 : undefined }}
              >
                Xóa
              </Button>
            </Box>
          </Box>

          <Grid container spacing={isMobile ? 2 : 3} direction={isMobile ? 'column-reverse' : 'row'}>
            <Grid item xs={12} md={8}>
              <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
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
                      fontSize: isMobile ? '1rem' : undefined,
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto'
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: service.content }}
                  />
                </Box>
              )}

              <Divider sx={{ my: isMobile ? 2 : 3 }} />

              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                Danh sách linh kiện
              </Typography>
              
              {service.spare_parts && service.spare_parts.length > 0 ? (
                isMobile ? (
                  <Stack spacing={2}>
                    {service.spare_parts.map((part) => (
                      <Card key={part.id} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography fontWeight={600} fontSize="1rem">{part.name}</Typography>
                          {part.description && (
                            <Typography variant="caption" color="text.secondary">{part.description}</Typography>
                          )}
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2">Giá gốc: {formatCurrency(part.original_price)}</Typography>
                          <Typography variant="body2">Giảm giá: {part.discount_percent}%</Typography>
                          <Typography variant="body2">Giá cuối: {formatCurrency(part.final_price)}</Typography>
                          <Typography variant="body2">Bảo hành: {part.warranty || '-'}</Typography>
                          <Typography variant="body2">Thời gian sửa: {part.repair_time || '-'}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
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
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có linh kiện nào
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom>
                Hình ảnh
              </Typography>
              <Stack spacing={2}>
                {service.images && service.images.length > 0 ? (
                  service.images.map((img, index) => (
                    <Card key={index} variant="outlined">
                      <CardMedia
                        component="img"
                        height={isMobile ? 140 : 200}
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
                  <Card variant="outlined" sx={{ height: isMobile ? 140 : 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có hình ảnh
                    </Typography>
                  </Card>
                )}
              </Stack>

              <Box sx={{ mt: isMobile ? 2 : 3 }}>
                <Typography variant={isMobile ? 'subtitle2' : 'subtitle1'} gutterBottom>
                  Thông tin khuyến mãi
                </Typography>
                <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
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