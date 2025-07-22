import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  YouTube as YouTubeIcon,
} from '@mui/icons-material';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Dịch vụ', href: '/services' },
    { name: 'Đặt lịch', href: '/booking' },
    { name: 'Liên hệ', href: '/contact' },
  ];

  const services = [
    { name: 'Sửa iPhone', href: '/services?category=1' },
    { name: 'Sửa Samsung', href: '/services?category=2' },
    { name: 'Thay màn hình', href: '/services?category=3' },
    { name: 'Thay pin', href: '/services?category=4' },
  ];

  const contactInfo = [
    { icon: <PhoneIcon />, text: '0123 456 789', href: 'tel:0123456789' },
    { icon: <EmailIcon />, text: 'info@drphone.com', href: 'mailto:info@drphone.com' },
    { icon: <LocationIcon />, text: '123 Đường ABC, Quận XYZ, Hà Nội', href: '#' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, name: 'Facebook', href: 'https://facebook.com/drphone' },
    { icon: <InstagramIcon />, name: 'Instagram', href: 'https://instagram.com/drphone' },
    { icon: <WhatsAppIcon />, name: 'WhatsApp', href: 'https://wa.me/0123456789' },
    { icon: <YouTubeIcon />, name: 'YouTube', href: 'https://youtube.com/drphone' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Dr.Phone
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
              Dịch vụ sửa chữa điện thoại chuyên nghiệp, uy tín tại Hà Nội. 
              Chúng tôi cam kết mang đến trải nghiệm sửa chữa tốt nhất với 
              đội ngũ kỹ thuật viên giàu kinh nghiệm.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip 
                label="Chứng nhận ISO" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label="Bảo hành chính hãng" 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            </Box>

            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Liên kết nhanh
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {quickLinks.map((link, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Link
                    href={link.href}
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1,
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Dịch vụ
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {services.map((service, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Link
                    href={service.href}
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1,
                        color: 'primary.main',
                      },
                    }}
                  >
                    {service.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Thông tin liên hệ
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {contactInfo.map((contact, index) => (
                <Box component="li" key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main', mr: 2, display: 'flex', alignItems: 'center' }}>
                    {contact.icon}
                  </Box>
                  <Link
                    href={contact.href}
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      opacity: 0.8,
                      '&:hover': {
                        opacity: 1,
                        color: 'primary.main',
                      },
                    }}
                  >
                    {contact.text}
                  </Link>
                </Box>
              ))}
            </Box>

            {/* Business Hours */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Giờ làm việc
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Thứ 2 - Thứ 7: 8:00 - 20:00<br />
                Chủ nhật: 9:00 - 18:00
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Footer */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {currentYear} Dr.Phone. Tất cả quyền được bảo lưu.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="/privacy"
              color="inherit"
              sx={{
                textDecoration: 'none',
                opacity: 0.7,
                fontSize: '0.875rem',
                '&:hover': { opacity: 1 },
              }}
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="/terms"
              color="inherit"
              sx={{
                textDecoration: 'none',
                opacity: 0.7,
                fontSize: '0.875rem',
                '&:hover': { opacity: 1 },
              }}
            >
              Điều khoản sử dụng
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 