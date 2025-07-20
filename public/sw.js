// Service Worker cho Push Notifications
const CACHE_NAME = 'drphone-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - xử lý push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Bạn có thông báo mới',
      icon: '/vite.svg', // Icon cho notification
      badge: '/vite.svg', // Badge cho notification
      tag: data.tag || 'drphone-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: data.timestamp || Date.now(),
      image: data.image,
      dir: 'ltr',
      lang: 'vi-VN',
      renotify: data.renotify || true,
      sticky: data.sticky || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Dr.Phone', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data;
  
  // Mở tab mới hoặc focus tab hiện tại
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tìm tab đã mở
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Nếu không tìm thấy tab admin, mở tab mới
        if (self.clients.openWindow) {
          let url = '/admin/orders';
          
          // Nếu có data với orderId, mở trang chi tiết đơn hàng
          if (data && data.orderId) {
            url = `/admin/orders?id=${data.orderId}`;
          }
          
          return self.clients.openWindow(url);
        }
      })
  );
});

// Background sync event (nếu cần)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Thực hiện sync trong background
      console.log('Performing background sync...')
    );
  }
});

// Message event - nhận message từ main thread
self.addEventListener('message', (event) => {
  console.log('Message received in SW:', event);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 