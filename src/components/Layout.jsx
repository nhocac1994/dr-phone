import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Dịch vụ', path: '/services' },
    { name: 'Đặt lịch', path: '/booking' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Dr.Phone
            </Typography>

            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ color: 'text.primary' }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {menuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      component={Link}
                      to={item.path}
                      onClick={handleMenuClose}
                      sx={{
                        color: isActive(item.path) ? 'primary.main' : 'text.primary',
                        fontWeight: isActive(item.path) ? 600 : 400,
                      }}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/booking"
                  startIcon={<PhoneIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  Đặt lịch ngay
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>

      <Footer />
    </Box>
  );
} 