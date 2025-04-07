import { apiService } from './api';

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Push notification service for handling push notification-related operations
 */
export const pushNotificationService = {
  /**
   * Register the service worker
   * @returns Service worker registration
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  },

  /**
   * Request permission for push notifications
   * @returns Permission status
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  },

  /**
   * Subscribe to push notifications
   * @returns Push subscription
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      // Register service worker
      const registration = await this.registerServiceWorker();
      if (!registration) return null;

      // Request permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') return null;

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await this.getVapidPublicKey()
      });

      console.log('Push subscription:', subscription);

      // Send subscription to server
      await this.saveSubscription(subscription);

      return subscription.toJSON() as unknown as PushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  },

  /**
   * Unsubscribe from push notifications
   * @returns Success status
   */
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      // Get push subscription
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return false;

      // Unsubscribe
      const success = await subscription.unsubscribe();
      if (success) {
        // Remove subscription from server
        await this.deleteSubscription(subscription);
      }

      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  },

  /**
   * Check if push notifications are supported
   * @returns Whether push notifications are supported
   */
  isPushNotificationSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  /**
   * Get current push notification subscription
   * @returns Current push subscription
   */
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return null;

      // Get push subscription
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return null;

      return subscription.toJSON() as unknown as PushSubscription;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  },

  /**
   * Get VAPID public key from server
   * @returns VAPID public key
   */
  async getVapidPublicKey(): Promise<string> {
    try {
      const response = await apiService.get<{ publicKey: string }>('/push/vapid-public-key');
      return response.publicKey;
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      throw error;
    }
  },

  /**
   * Save push subscription to server
   * @param subscription - Push subscription
   */
  async saveSubscription(subscription: PushSubscriptionJSON): Promise<void> {
    try {
      await apiService.post('/push/subscribe', { subscription });
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  },

  /**
   * Delete push subscription from server
   * @param subscription - Push subscription
   */
  async deleteSubscription(subscription: PushSubscriptionJSON): Promise<void> {
    try {
      await apiService.post('/push/unsubscribe', { subscription });
    } catch (error) {
      console.error('Error deleting push subscription:', error);
      throw error;
    }
  },

  /**
   * Send a test push notification
   * @returns Success status
   */
  async sendTestPushNotification(): Promise<boolean> {
    try {
      await apiService.post('/push/test', {});
      return true;
    } catch (error) {
      console.error('Error sending test push notification:', error);
      return false;
    }
  }
};
