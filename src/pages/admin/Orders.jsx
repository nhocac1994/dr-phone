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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';

const ORDER_STATUS = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      enqueueSnackbar('Lỗi khi tải danh sách đơn hàng', { variant: 'error' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (order) => {
    setEditingOrder(order);
    setFormData({
      status: order.status,
      notes: order.notes || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOrder(null);
    setFormData({
      status: '',
      notes: ''
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
      await axios.put(`/api/orders/${editingOrder.id}`, formData);
      enqueueSnackbar('Cập nhật đơn hàng thành công', { variant: 'success' });
      handleClose();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      enqueueSnackbar('Lỗi khi cập nhật đơn hàng', { variant: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Quản lý Đơn hàng
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Điện thoại</TableCell>
              <TableCell>Dịch vụ</TableCell>
              <TableCell>Thời gian đặt</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chưa có đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell>{order.service_name}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{ORDER_STATUS[order.status]}</TableCell>
                  <TableCell>{order.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(order)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật Đơn hàng #{editingOrder?.id}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Trạng thái"
                  >
                    {Object.entries(ORDER_STATUS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Ghi chú"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              Cập nhật
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 