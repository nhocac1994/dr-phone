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
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    position: 0
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/banners');
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      enqueueSnackbar('Lỗi khi tải danh sách banner', { variant: 'error' });
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        image: banner.image || '',
        link: banner.link || '',
        position: banner.position || 0
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        link: '',
        position: 0
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      position: 0
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
      if (editingBanner) {
        await axios.put(`/api/banners/${editingBanner.id}`, formData);
        enqueueSnackbar('Cập nhật banner thành công', { variant: 'success' });
      } else {
        await axios.post('/api/banners', formData);
        enqueueSnackbar('Thêm banner thành công', { variant: 'success' });
      }
      handleClose();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      enqueueSnackbar('Lỗi khi lưu banner', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await axios.delete(`/api/banners/${id}`);
        enqueueSnackbar('Xóa banner thành công', { variant: 'success' });
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        enqueueSnackbar('Lỗi khi xóa banner', { variant: 'error' });
      }
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quản lý Banner</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm Banner
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Liên kết</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Chưa có banner nào
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>{banner.title}</TableCell>
                  <TableCell>{banner.description}</TableCell>
                  <TableCell>
                    {banner.image && (
                      <img src={banner.image} alt={banner.title} style={{ width: 100, height: 50, objectFit: 'cover' }} />
                    )}
                  </TableCell>
                  <TableCell>{banner.link}</TableCell>
                  <TableCell>{banner.position}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(banner)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(banner.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBanner ? 'Sửa Banner' : 'Thêm Banner'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Tiêu đề"
                  fullWidth
                  value={formData.title}
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
                  required
                  value={formData.image}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="link"
                  label="Liên kết"
                  fullWidth
                  value={formData.link}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="position"
                  label="Vị trí"
                  type="number"
                  fullWidth
                  value={formData.position}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingBanner ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 