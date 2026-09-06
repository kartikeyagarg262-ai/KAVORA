// KAVORA Service Worker for Mobile Notifications and PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Notification Click (taps from phone status bar / notification slidebar)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focus existing open window or open new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle Push event if web push server is connected
self.addEventListener('push', (event) => {
  let data = { title: 'KAVORA Alert 🔔', body: 'You have a new budget update.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/kavora-logo.svg',
    badge: '/kavora-logo.svg',
    vibrate: [150, 80, 150],
    data: data,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
