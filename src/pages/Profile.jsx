import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';
import axios from '../config/axios';
import PageTransition from '../components/PageTransition';

const USER_ROLES = {
  admin: { label: 'Admin', color: 'error' },
  user: { label: 'User', color: 'primary' }
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password change
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      enqueueSnackbar('Mật khẩu mới không khớp', { variant: 'error' });
      return;
    }

    if (formData.new_password && !formData.current_password) {
      enqueueSnackbar('Vui lòng nhập mật khẩu hiện tại', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      // Chỉ thêm password nếu user muốn đổi
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await axios.put(`/api/users/${user.id}`, updateData);
      
      // Cập nhật user context
      updateUser(response);
      
      enqueueSnackbar('Cập nhật thông tin thành công', { variant: 'success' });
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      setShowPassword(false);
      setShowNewPassword(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar('Lỗi khi cập nhật thông tin', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageTransition>
      <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Thông tin cá nhân
      </Typography>

      <Grid container spacing={3}>
        {/* Thông tin hiện tại */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Thông tin hiện tại</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {user.username}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {user.email}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Vai trò
                </Typography>
                <Chip 
                  label={USER_ROLES[user.role]?.label}
                  color={USER_ROLES[user.role]?.color}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatDate(user.created_at)}
                </Typography>
              </Box>

              {user.updated_at && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {formatDate(user.updated_at)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Form chỉnh sửa */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EditIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Chỉnh sửa thông tin</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
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
                  <Divider sx={{ my: 2 }}>
                    <Chip 
                      icon={<SecurityIcon />} 
                      label="Đổi mật khẩu" 
                      variant="outlined"
                    />
                  </Divider>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="current_password"
                    label="Mật khẩu hiện tại"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    value={formData.current_password}
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

                <Grid item xs={12} md={6}>
                  <TextField
                    name="new_password"
                    label="Mật khẩu mới"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    value={formData.new_password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="confirm_password"
                    label="Xác nhận mật khẩu mới"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    value={formData.confirm_password}
                    onChange={handleChange}
                    error={formData.new_password && formData.new_password !== formData.confirm_password}
                    helperText={
                      formData.new_password && formData.new_password !== formData.confirm_password
                        ? 'Mật khẩu không khớp'
                        : ''
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setFormData({
                          username: user.username || '',
                          email: user.email || '',
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        });
                        setShowPassword(false);
                        setShowNewPassword(false);
                      }}
                    >
                      Đặt lại
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={loading}
                      startIcon={<SaveIcon />}
                    >
                      Lưu thay đổi
                    </LoadingButton>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </PageTransition>
  );
} 