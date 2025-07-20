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
  InputLabel,
  Chip,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Alert,
  Badge
} from '@mui/material';
import { 
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';
import { useNotification } from '../../contexts/NotificationContext';
import PageTransition from '../../components/PageTransition';

const ORDER_STATUS = {
  pending: { label: 'Chờ xử lý', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'info' },
  processing: { label: 'Đang xử lý', color: 'primary' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' }
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
  const { fetchNotificationCount } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response || []);
      // Không gọi fetchNotificationCount ở đây để tránh vòng lặp
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
      // Chỉ cập nhật notification count khi thay đổi trạng thái
      if (formData.status !== editingOrder.status) {
        fetchNotificationCount();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      enqueueSnackbar('Lỗi khi cập nhật đơn hàng', { variant: 'error' });
    }
  };

  const handleQuickAction = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      enqueueSnackbar(`Đã ${ORDER_STATUS[newStatus].label.toLowerCase()} đơn hàng`, { variant: 'success' });
      fetchOrders();
      // Chỉ cập nhật notification count khi thay đổi trạng thái
      fetchNotificationCount();
    } catch (error) {
      console.error('Error updating order status:', error);
      enqueueSnackbar('Lỗi khi cập nhật trạng thái', { variant: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPrice = (price) => {
    return price ? `${price.toLocaleString('vi-VN')}₫` : 'Chưa có giá';
  };

  const OrderCard = ({ order }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3">
              #{order.id} - {order.customer_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.service_name}
            </Typography>
          </Box>
          <Chip 
            label={ORDER_STATUS[order.status]?.label}
            color={ORDER_STATUS[order.status]?.color}
            size="small"
          />
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{order.customer_phone}</Typography>
          </Box>
          {order.customer_email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">{order.customer_email}</Typography>
            </Box>
          )}
          {order.scheduled_time && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">{formatDate(order.scheduled_time)}</Typography>
            </Box>
          )}
          {order.notes && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <NotesIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
              <Typography variant="body2">{order.notes}</Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpen(order)}
          >
            Chỉnh sửa
          </Button>
          {order.status === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleQuickAction(order.id, 'confirmed')}
              >
                Xác nhận
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleQuickAction(order.id, 'cancelled')}
              >
                Từ chối
              </Button>
            </>
          )}
          {order.status === 'confirmed' && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => handleQuickAction(order.id, 'processing')}
            >
              Bắt đầu sửa
            </Button>
          )}
          {order.status === 'processing' && (
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleQuickAction(order.id, 'completed')}
            >
              Hoàn thành
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <PageTransition>
      <Box p={3}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Quản lý Đơn hàng
        </Typography>
        <Badge badgeContent={orders.filter(o => o.status === 'pending').length} color="warning">
          <Chip 
            label={`${orders.filter(o => o.status === 'pending').length} đơn chờ xử lý`}
            color="warning"
            variant="outlined"
          />
        </Badge>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : !orders || orders.length === 0 ? (
        <Alert severity="info">Chưa có đơn hàng nào</Alert>
      ) : isMobile ? (
        // Mobile view - Card layout
        <Stack spacing={2}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Stack>
      ) : (
        // Desktop view - Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell>Dịch vụ</TableCell>
                <TableCell>Thời gian đặt</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{order.customer_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.customer_phone}</Typography>
                    {order.customer_email && (
                      <Typography variant="body2" color="text.secondary">
                        {order.customer_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.service_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatPrice(order.service_price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(order.created_at)}</Typography>
                    {order.scheduled_time && (
                      <Typography variant="body2" color="text.secondary">
                        Hẹn: {formatDate(order.scheduled_time)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ORDER_STATUS[order.status]?.label}
                      color={ORDER_STATUS[order.status]?.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.notes ? (
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.notes}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton onClick={() => handleOpen(order)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      {order.status === 'pending' && (
                        <>
                          <IconButton 
                            onClick={() => handleQuickAction(order.id, 'confirmed')} 
                            color="success" 
                            size="small"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleQuickAction(order.id, 'cancelled')} 
                            color="error" 
                            size="small"
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
                    {Object.entries(ORDER_STATUS).map(([value, config]) => (
                      <MenuItem key={value} value={value}>
                        {config.label}
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
                  placeholder="Ghi chú về đơn hàng, tình trạng sửa chữa..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <LoadingButton type="submit" variant="contained" color="primary">
              Cập nhật
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
      </Box>
    </PageTransition>
  );
} 