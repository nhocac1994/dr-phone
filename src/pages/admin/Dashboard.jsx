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

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'white',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography color="textSecondary" variant="h6" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h4">{card.value}</Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: `${card.color}15`,
                    p: 1,
                    borderRadius: 2,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
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
  );
} 