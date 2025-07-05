import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Build as ServiceIcon,
  Category as CategoryIcon,
  ShoppingCart as OrderIcon,
  People as UserIcon,
} from '@mui/icons-material';
import PageTransition from '../../components/PageTransition';

const statCards = [
  {
    title: 'Tổng số dịch vụ',
    value: '24',
    icon: <ServiceIcon sx={{ fontSize: 40 }} />,
    color: '#1976d2',
  },
  {
    title: 'Danh mục',
    value: '8',
    icon: <CategoryIcon sx={{ fontSize: 40 }} />,
    color: '#2e7d32',
  },
  {
    title: 'Đơn hàng mới',
    value: '12',
    icon: <OrderIcon sx={{ fontSize: 40 }} />,
    color: '#ed6c02',
  },
  {
    title: 'Khách hàng',
    value: '150',
    icon: <UserIcon sx={{ fontSize: 40 }} />,
    color: '#9c27b0',
  },
];

const Dashboard = () => {
  return (
    <PageTransition>
      <Box>
        <Typography variant="h5" gutterBottom>
          Tổng quan
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography variant="h6" color="primary">
                Dịch vụ
              </Typography>
              <Typography variant="h4" sx={{ mt: 'auto' }}>
                0
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography variant="h6" color="secondary">
                Đơn hàng
              </Typography>
              <Typography variant="h4" sx={{ mt: 'auto' }}>
                0
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography variant="h6" style={{ color: 'green' }}>
                Danh mục
              </Typography>
              <Typography variant="h4" sx={{ mt: 'auto' }}>
                0
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography variant="h6" style={{ color: 'orange' }}>
                Banner
              </Typography>
              <Typography variant="h4" sx={{ mt: 'auto' }}>
                0
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Đơn hàng gần đây" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Chưa có đơn hàng nào.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Dịch vụ phổ biến" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Chưa có dữ liệu thống kê.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTransition>
  );
};

export default Dashboard; 