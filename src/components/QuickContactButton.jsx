import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, IconButton, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import axios from '../config/axios';

export default function QuickContactButton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState({
    phone: '18009999',
    zalo: '#',
    messenger: '#'
  });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings`);
        if (response.data) {
          setSettings(prev => ({
            ...prev,
            phone: response.data.phone || prev.phone,
            zalo: response.data.zalo || prev.zalo,
            messenger: response.data.messenger || prev.messenger
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin cài đặt:', error);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleExpand = () => {
    if (isMobile) {
      setExpanded(!expanded);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          right: { xs: 8, sm: 24 },
          bottom: { xs: 12, sm: 32 },
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
        }}
      >
        <CircularProgress size={isMobile ? 24 : 30} sx={{ color: '#ff9800' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 8, sm: 24 },
        bottom: { xs: 12, sm: 32 },
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      {/* Các nút mạng xã hội và gọi điện chỉ hiển thị khi đã mở rộng trên mobile */}
      {(!isMobile || expanded) && (
        <Stack spacing={1} alignItems="flex-end">
          {/* Nút gọi điện chỉ hiển thị trên mobile khi đã mở rộng */}
          {isMobile && expanded && (
            <IconButton
              href={`tel:${settings.phone}`}
              sx={{
                bgcolor: '#ff5722',
                width: 44,
                height: 44,
                mb: 0.5,
                boxShadow: 2,
                '&:hover': { bgcolor: '#e64a19' },
              }}
            >
              <CallIcon sx={{ color: '#fff', fontSize: 22 }} />
            </IconButton>
          )}
          <IconButton
            href={settings.zalo}
            target="_blank"
            sx={{
              bgcolor: '#fff',
              border: '2px solid #e0e0e0',
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              mb: 0.5,
              boxShadow: 2,
              '&:hover': { bgcolor: '#e3f2fd' },
            }}
          >
            <img src="/icon/zalo.webp" alt="Zalo" width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} />
          </IconButton>
          <IconButton
            href={settings.messenger}
            target="_blank"
            sx={{
              bgcolor: '#fff',
              border: '2px solid #e0e0e0',
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              boxShadow: 2,
              '&:hover': { bgcolor: '#f3e5f5' },
            }}
          >
            <img src="/icon/Messenger.svg.webp" alt="Messenger" width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} />
          </IconButton>
        </Stack>
      )}
      
      {/* Nút chính - mở rộng trên mobile, hiển thị đầy đủ trên desktop */}
      {isMobile ? (
        <IconButton
          onClick={handleToggleExpand}
          sx={{
            mt: 0.5,
            bgcolor: expanded ? '#4caf50' : '#ff9800',
            color: '#fff',
            width: 44,
            height: 44,
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: expanded ? '#43a047' : '#f57c00',
            },
          }}
        >
          {expanded ? <CloseIcon sx={{ fontSize: 24 }} /> : <CallIcon sx={{ fontSize: 22 }} />}
        </IconButton>
      ) : (
        <Button
          href={`tel:${settings.phone}`}
          sx={{
            mt: 1,
            bgcolor: '#ff9800',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            boxShadow: 3,
            fontSize: 16,
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              bgcolor: '#f57c00',
            },
          }}
        >
          <CallIcon sx={{ fontSize: 22 }} />
          <Box>
            <Typography fontWeight={500} fontSize={13} lineHeight={1}>
              Gọi miễn phí
            </Typography>
            <Typography fontWeight={700} fontSize={18} lineHeight={1}>
              {settings.phone}
            </Typography>
          </Box>
        </Button>
      )}
    </Box>
  );
} 