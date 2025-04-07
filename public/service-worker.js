// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received', event);

  if (!event.data) {
    console.log('No payload');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);

    const title = data.title || 'BGF Dashboard';
    const options = {
      body: data.message || 'You have a new notification',
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: data.url || '/',
        ...data
      },
      actions: data.actions || [],
      tag: data.tag || 'default',
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data;
  const url = data?.url || '/';

  // Open the target URL
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open with the target URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed', event);
  
  // Re-subscribe with the new subscription
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        console.log('New subscription:', subscription);
        
        // Send the new subscription to the server
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription
          }),
        });
      })
  );
});
