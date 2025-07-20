import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Alert,
  Fab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Lỗi khi tải danh sách danh mục', { variant: 'error' });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, formData);
        enqueueSnackbar('Cập nhật danh mục thành công', { variant: 'success' });
      } else {
        await axios.post('/api/categories', formData);
        enqueueSnackbar('Thêm danh mục thành công', { variant: 'success' });
      }
      handleClose();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      enqueueSnackbar('Lỗi khi lưu danh mục', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/categories/${id}`);
      enqueueSnackbar('Xóa danh mục thành công', { variant: 'success' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      enqueueSnackbar('Lỗi khi xóa danh mục', { variant: 'error' });
    }
  };

  const CategoryCard = ({ category }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              {category.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {category.description}
            </Typography>
            {category.image && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  style={{ 
                    width: '100%', 
                    maxWidth: 200, 
                    height: 120, 
                    objectFit: 'cover',
                    borderRadius: 8
                  }} 
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpen(category)}
          >
            Chỉnh sửa
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(category.id)}
          >
            Xóa
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      pb: { xs: 8, md: 3 } // Thêm padding bottom cho mobile để tránh FAB
    }}>
      {/* Header - chỉ hiển thị trên desktop */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Quản lý Danh mục</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Thêm Danh mục
          </Button>
        </Box>
      )}

      {/* Mobile header */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Quản lý Danh mục
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Alert severity="info">Chưa có danh mục nào</Alert>
      ) : isMobile ? (
        // Mobile view - Card layout
        <Stack spacing={2}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </Stack>
      ) : (
        // Desktop view - Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên danh mục</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {category.image && (
                      <img src={category.image} alt={category.name} style={{ width: 50, height: 50, objectFit: 'cover' }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(category)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Floating Action Button cho mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Thêm danh mục"
          onClick={() => handleOpen()}
          sx={{
            position: 'fixed',
            bottom: 80, // Trên bottom navigation
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Tên danh mục"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Mô tả"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="image"
                  label="URL hình ảnh"
                  fullWidth
                  value={formData.image}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingCategory ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 