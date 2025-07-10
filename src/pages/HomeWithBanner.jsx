import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import BannerDisplay from '../components/BannerDisplay';
import PageTransition from '../components/PageTransition';

const services = [
  {
    id: 1,
    title: 'Sửa chữa iPhone',
    description: 'Dịch vụ sửa chữa iPhone chuyên nghiệp, uy tín',
    image: '/images/iphone-repair.jpg',
  },
  {
    id: 2,
    title: 'Sửa chữa Samsung',
    description: 'Sửa chữa điện thoại Samsung với đội ngũ kỹ thuật viên giàu kinh nghiệm',
    image: '/images/samsung-repair.jpg',
  },
  {
    id: 3,
    title: 'Thay màn hình',
    description: 'Thay màn hình smartphone chính hãng, bảo hành dài hạn',
    image: '/images/screen-repair.jpg',
  },
];

export default function HomeWithBanner() {
  return (
    <PageTransition>
      <Box>
        {/* Header Banner */}
        <BannerDisplay type="home_header" sx={{ mb: 2 }} />

        {/* Hero Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 8,
            mb: 6,
          }}
        >
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Dr.Phone
            </Typography>
            <Typography variant="h5" align="center" paragraph>
              Dịch vụ sửa chữa điện thoại chuyên nghiệp, uy tín tại Hà Nội
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/services"
                sx={{ mr: 2 }}
              >
                Xem dịch vụ
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                to="/contact"
              >
                Liên hệ
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Main Banner */}
        <Container maxWidth="lg" sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <BannerDisplay type="home_main" />
        </Container>

        {/* Services Section */}
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Dịch vụ của chúng tôi
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Chúng tôi cung cấp các dịch vụ sửa chữa điện thoại chất lượng cao
          </Typography>
          <Grid container spacing={4}>
            {services.map((service) => (
              <Grid item key={service.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      transition: 'all 0.3s ease-in-out',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      height: 200,
                    }}
                    image={service.image}
                    alt={service.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {service.title}
                    </Typography>
                    <Typography>{service.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Why Choose Us Section */}
        <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
          <Container maxWidth="lg">
            <Typography
              component="h2"
              variant="h3"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Tại sao chọn chúng tôi?
            </Typography>
            <Grid container spacing={4} sx={{ mt: 3 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Chuyên nghiệp
                </Typography>
                <Typography>
                  Đội ngũ kỹ thuật viên giàu kinh nghiệm, được đào tạo chuyên sâu
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Uy tín
                </Typography>
                <Typography>
                  Cam kết sử dụng linh kiện chính hãng, bảo hành dài hạn
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Nhanh chóng
                </Typography>
                <Typography>
                  Thời gian sửa chữa nhanh, lấy máy trong ngày
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </PageTransition>
  );
} 