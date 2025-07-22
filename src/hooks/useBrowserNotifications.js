import { useState, useEffect, useCallback } from 'react';

const useBrowserNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };
    
    checkSupport();
  }, []);

  // Đăng ký service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }, []);

  // Yêu cầu quyền thông báo
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Browser không hỗ trợ Push Notifications');
    }

    try {
      setIsLoading(true);
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Đăng ký service worker và subscription
        await registerServiceWorker();
        await subscribeToPush();
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registerServiceWorker]);

  // Đăng ký push subscription
  const subscribeToPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Kiểm tra subscription hiện tại
      let existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // Tạo subscription mới
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn('VITE_VAPID_PUBLIC_KEY not found, skipping push subscription');
        return null;
      }
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      setSubscription(newSubscription);
      
      // Gửi subscription lên server
      await sendSubscriptionToServer(newSubscription);
      
      return newSubscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  }, []);

  // Hủy đăng ký push subscription
  const unsubscribeFromPush = useCallback(async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        
        // Xóa subscription khỏi server
        await removeSubscriptionFromServer(subscription);
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      throw error;
    }
  }, [subscription]);

  // Gửi subscription lên server
  const sendSubscriptionToServer = async (subscription) => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
      
      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  };

  // Xóa subscription khỏi server
  const removeSubscriptionFromServer = async (subscription) => {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
      
      console.log('Subscription removed from server successfully');
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      throw error;
    }
  };

  // Gửi thông báo test
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      throw new Error('Chưa có quyền gửi thông báo');
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
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }, [permission]);

  // Khởi tạo notifications
  const initializeNotifications = useCallback(async () => {
    if (!isSupported) {
      console.log('Browser không hỗ trợ Push Notifications');
      return;
    }

    try {
      setIsLoading(true);
      
      // Đăng ký service worker
      await registerServiceWorker();
      
      // Nếu đã có quyền, đăng ký subscription
      if (permission === 'granted') {
        await subscribeToPush();
        console.log('✅ Browser notifications đã được khởi tạo thành công!');
      } else if (permission === 'default') {
        console.log('ℹ️ Chưa có quyền thông báo - sẽ hiển thị dialog yêu cầu');
      } else {
        console.log('❌ Quyền thông báo bị từ chối');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, registerServiceWorker, subscribeToPush]);

  // Convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    initializeNotifications
  };
};

export default useBrowserNotifications; 