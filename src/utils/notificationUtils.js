// Utility functions cho browser notifications

// Reset trạng thái thông báo (để test)
export const resetNotificationState = () => {
  localStorage.removeItem('notification-dialog-shown');
  localStorage.removeItem('notification-banner-shown');
  console.log('✅ Đã reset trạng thái thông báo');
};

// Kiểm tra trạng thái thông báo
export const getNotificationStatus = () => {
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  const permission = isSupported ? Notification.permission : 'unsupported';
  
  return {
    isSupported,
    permission,
    dialogShown: localStorage.getItem('notification-dialog-shown') === 'true',
    bannerShown: localStorage.getItem('notification-banner-shown') === 'true'
  };
};

// Hiển thị thông báo test
export const showTestNotification = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker không được hỗ trợ');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Dr.Phone - Test', {
      body: 'Đây là thông báo test từ Dr.Phone',
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'test-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Xem chi tiết'
        },
        {
          action: 'close',
          title: 'Đóng'
        }
      ]
    });
    console.log('✅ Thông báo test đã được gửi');
  } catch (error) {
    console.error('❌ Lỗi gửi thông báo test:', error);
  }
};

// Log trạng thái thông báo
export const logNotificationStatus = () => {
  const status = getNotificationStatus();
  console.log('📊 Trạng thái thông báo:', status);
  return status;
}; 