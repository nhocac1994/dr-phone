import React, { useState } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import NotificationDrawer from './NotificationDrawer';

export default function NotificationButton() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notificationCount } = useNotification();

  const handleClick = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Badge 
            badgeContent={notificationCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: '20px',
                minWidth: '20px',
                borderRadius: '10px'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationDrawer 
        open={drawerOpen} 
        onClose={handleCloseDrawer} 
      />
    </>
  );
} 