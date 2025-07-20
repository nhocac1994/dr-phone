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
  Switch,
  FormControlLabel,
  Fab
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';
import PageTransition from '../../components/PageTransition';

const USER_ROLES = {
  admin: { label: 'Admin', color: 'error' },
  user: { label: 'User', color: 'primary' }
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true
  });
  const { enqueueSnackbar } = useSnackbar();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!isAdmin) {
      enqueueSnackbar('Bạn không có quyền truy cập trang này', { variant: 'error' });
      navigate('/admin/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate, enqueueSnackbar]);

  // Nếu không phải admin, không render gì
  if (!isAdmin) {
    return null;
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      enqueueSnackbar('Lỗi khi tải danh sách người dùng', { variant: 'error' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        is_active: user.is_active !== false
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true
      });
    }
    setShowPassword(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      is_active: true
    });
    setShowPassword(false);
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
      if (editingUser) {
        // Cập nhật user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(`/api/users/${editingUser.id}`, updateData);
        enqueueSnackbar('Cập nhật người dùng thành công', { variant: 'success' });
      } else {
        // Tạo user mới
        await axios.post('/api/users', formData);
        enqueueSnackbar('Tạo người dùng thành công', { variant: 'success' });
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      enqueueSnackbar('Lỗi khi lưu người dùng', { variant: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/users/${userId}`);
      enqueueSnackbar('Xóa người dùng thành công', { variant: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      enqueueSnackbar('Lỗi khi xóa người dùng', { variant: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const UserCard = ({ user }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3">
              {user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Chip 
            label={USER_ROLES[user.role]?.label}
            color={USER_ROLES[user.role]?.color}
            size="small"
          />
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Trạng thái:</strong> {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
          </Typography>
          <Typography variant="body2">
            <strong>Ngày tạo:</strong> {formatDate(user.created_at)}
          </Typography>
          {user.updated_at && (
            <Typography variant="body2">
              <strong>Cập nhật:</strong> {formatDate(user.updated_at)}
            </Typography>
          )}
        </Stack>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpen(user)}
          >
            Chỉnh sửa
          </Button>
          {user.role !== 'admin' && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDelete(user.id)}
            >
              Xóa
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <PageTransition>
      <Box sx={{ 
        p: { xs: 2, md: 3 },
        pb: { xs: 8, md: 3 } // Thêm padding bottom cho mobile để tránh FAB
      }}>
      {/* Header - chỉ hiển thị trên desktop */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Quản lý Người dùng
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Thêm người dùng
          </Button>
        </Box>
      )}

      {/* Mobile header */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Quản lý Người dùng
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info">Chưa có người dùng nào</Alert>
      ) : isMobile ? (
        // Mobile view - Card layout
        <Stack spacing={2}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </Stack>
      ) : (
        // Desktop view - Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{user.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={USER_ROLES[user.role]?.label}
                      color={USER_ROLES[user.role]?.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(user.created_at)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton onClick={() => handleOpen(user)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      {user.role !== 'admin' && (
                        <IconButton 
                          onClick={() => handleDelete(user.id)} 
                          color="error" 
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
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
          aria-label="Thêm người dùng"
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
        <DialogTitle>
          {editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="username"
                  label="Username"
                  fullWidth
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label={editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required={!editingUser}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Vai trò"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Hoạt động"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <LoadingButton type="submit" variant="contained" color="primary">
              {editingUser ? 'Cập nhật' : 'Tạo'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
      </Box>
    </PageTransition>
  );
} 