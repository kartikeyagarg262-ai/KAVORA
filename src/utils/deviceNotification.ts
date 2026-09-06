/**
 * KAVORA Mobile Device Native Push & Status Bar Notification Utility
 */

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported on this device/browser');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
};

export interface DeviceNotificationPayload {
  body?: string;
  tag?: string;
  data?: any;
}

/**
 * Dispatches a native notification to the user's mobile status bar / drawer.
 */
export const sendDeviceNotification = async (
  title: string,
  payload: DeviceNotificationPayload = {}
): Promise<boolean> => {
  if (!isNotificationSupported()) return false;

  // Only send if user has granted permission
  if (Notification.permission !== 'granted') return false;

  const notifOptions: any = {
    body: payload.body || '',
    icon: '/kavora-logo.svg',
    badge: '/kavora-logo.svg',
    tag: payload.tag || 'kavora_' + Date.now(),
    vibrate: [200, 100, 200],
    renotify: true,
  };

  // 1. Try via Service Worker (Best for Mobile Android / iOS PWA)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('Service worker notification failed, attempting standard API', swErr);
    }
  }

  // 2. Fallback to standard Window Notification
  try {
    new Notification(title, notifOptions);
    return true;
  } catch (err) {
    console.warn('Window Notification failed:', err);
    return false;
  }
};
