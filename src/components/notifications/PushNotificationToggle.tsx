"use client";

import React, { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiInfo } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { pushNotificationService } from '@/services/push-notification.service';

export default function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = pushNotificationService.isPushNotificationSupported();
    setSupported(isSupported);

    if (isSupported) {
      // Check current permission
      setPermission(Notification.permission);

      // Check if already subscribed
      checkSubscription();
    }
  }, []);

  // Check if already subscribed
  const checkSubscription = async () => {
    try {
      const subscription = await pushNotificationService.getCurrentSubscription();
      setSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Handle subscribe/unsubscribe
  const handleToggleSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      if (subscribed) {
        // Unsubscribe
        const success = await pushNotificationService.unsubscribeFromPushNotifications();
        if (success) {
          setSubscribed(false);
        } else {
          setError('Failed to unsubscribe from push notifications');
        }
      } else {
        // Subscribe
        const subscription = await pushNotificationService.subscribeToPushNotifications();
        if (subscription) {
          setSubscribed(true);
          setPermission('granted');
        } else {
          setError('Failed to subscribe to push notifications');
        }
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      setError('An error occurred while managing push notifications');
    } finally {
      setLoading(false);
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      setLoading(true);
      setError(null);

      const success = await pushNotificationService.sendTestPushNotification();
      if (!success) {
        setError('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('An error occurred while sending test notification');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md flex items-start">
        <FiInfo className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-700">Push notifications are not supported</p>
          <p className="text-yellow-600 text-sm mt-1">
            Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-gray/5 rounded-md">
        <div>
          <h3 className="font-medium">Push Notifications</h3>
          <p className="text-sm text-text-muted">
            Receive notifications even when you're not using the app
          </p>
        </div>
        <div className="flex items-center">
          <span className="mr-3 text-sm">
            {subscribed ? 'Enabled' : 'Disabled'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={subscribed}
              onChange={handleToggleSubscription}
              disabled={loading || permission === 'denied'}
            />
            <div className="w-11 h-6 bg-slate-gray/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-gray/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bgf-burgundy"></div>
          </label>
        </div>
      </div>

      {permission === 'denied' && (
        <div className="bg-terracotta/10 p-4 rounded-md flex items-start">
          <FiBellOff className="text-terracotta mt-1 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-terracotta">Notifications are blocked</p>
            <p className="text-terracotta/80 text-sm mt-1">
              You have blocked notifications for this site. Please update your browser settings to enable notifications.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-terracotta/10 p-4 rounded-md">
          <p className="text-terracotta">{error}</p>
        </div>
      )}

      {subscribed && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={handleTestNotification}
            disabled={loading}
            className="flex items-center"
          >
            <FiBell className="mr-2" />
            Send Test Notification
          </Button>
        </div>
      )}
    </div>
  );
}
