import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  Divider,
  Stack,
  Chip,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../config/axios';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openSubCategoryDialog, setOpenSubCategoryDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/categories');
      console.log('Categories loaded:', response);
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Lỗi khi tải dữ liệu');
      enqueueSnackbar('Lỗi khi tải dữ liệu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý form danh mục con
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Xử lý form danh mục
  const handleCategoryChange = (e) => {
    console.log('Category form change:', e.target.name, e.target.value);
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value
    });
  };

  // Xử lý thêm/sửa danh mục con
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedCategory?.id) {
        await axios.put(
          `/api/categories/${selectedCategory.category_id}/sub-categories/${selectedCategory.id}`,
          formData
        );
        enqueueSnackbar('Cập nhật danh mục con thành công', { variant: 'success' });
      } else {
        await axios.post(
          `/api/categories/${selectedCategory.category_id}/sub-categories`,
          formData
        );
        enqueueSnackbar('Thêm danh mục con thành công', { variant: 'success' });
      }

      setOpenSubCategoryDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thêm/sửa danh mục
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting category:', categoryFormData);
    setLoading(true);

    try {
      const response = await axios.post('/api/categories', categoryFormData);
      console.log('Category created:', response);
      enqueueSnackbar('Thêm danh mục thành công', { variant: 'success' });
      setOpenCategoryDialog(false);
      setCategoryFormData({ name: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa danh mục con
  const handleDelete = async (categoryId, subCategoryId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
      setLoading(true);
      await axios.delete(`/api/categories/${categoryId}/sub-categories/${subCategoryId}`);
      enqueueSnackbar('Xóa danh mục con thành công', { variant: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCategoryDialog = () => {
    console.log('Opening category dialog');
    setCategoryFormData({ name: '', description: '' });
    setOpenCategoryDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!categories || !categories.length) {
    return (
      <Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCategoryDialog}
          sx={{ mb: 2 }}
        >
          Thêm danh mục
        </Button>
        <Alert severity="info">
          Chưa có danh mục nào
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Quản lý danh mục
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCategoryDialog}
        >
          Thêm danh mục
        </Button>
      </Box>

      <Stack spacing={2}>
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon sx={{ mr: 1 }} />
                  {category.name}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedCategory({ category_id: category.id });
                    setFormData({ name: '', description: '' });
                    setOpenSubCategoryDialog(true);
                  }}
                >
                  Thêm danh mục con
                </Button>
              </Box>

              {category.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {category.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <List dense>
                {Array.isArray(category.sub_categories) && category.sub_categories.map((subCategory) => (
                  <ListItem key={subCategory.id}>
                    <ListItemText
                      primary={subCategory.name}
                      secondary={subCategory.description}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Sửa">
                        <IconButton
                          edge="end"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setSelectedCategory({
                              ...subCategory,
                              category_id: category.id
                            });
                            setFormData({
                              name: subCategory.name,
                              description: subCategory.description || ''
                            });
                            setOpenSubCategoryDialog(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDelete(category.id, subCategory.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {!category.sub_categories?.length && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Chưa có danh mục con nào
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Dialog thêm/sửa danh mục con */}
      <Dialog 
        open={openSubCategoryDialog} 
        onClose={() => setOpenSubCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedCategory?.id ? 'Sửa danh mục con' : 'Thêm danh mục con'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Tên danh mục con"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSubCategoryDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {selectedCategory?.id ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog thêm danh mục */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCategorySubmit}>
          <DialogTitle>
            Thêm danh mục mới
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Tên danh mục"
              name="name"
              value={categoryFormData.name}
              onChange={handleCategoryChange}
              required
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={categoryFormData.description}
              onChange={handleCategoryChange}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Thêm mới
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 