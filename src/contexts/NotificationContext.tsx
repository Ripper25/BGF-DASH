"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
// import { notificationService, NotificationData } from '@/services/notification.service';
import { simulatedNotificationService } from '@/services/simulated-notification.service';
import { NotificationData } from '@/types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, staffUser, isUserAuthenticated, isStaffAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch notifications if a user is authenticated
      if (isUserAuthenticated() || isStaffAuthenticated()) {
        // Immediately set empty notifications to prevent loading state
        setNotifications([]);
        setUnreadCount(0);

        // Try to fetch in the background, but don't wait for it
        // This prevents the UI from getting stuck if the backend is down
        const userId = user?.id || staffUser?.id;
        if (userId) {
          simulatedNotificationService.getNotifications(userId)
            .then((notificationsData: NotificationData[]) => {
              setNotifications(notificationsData);
              // Calculate unread count
              const unreadCount = notificationsData.filter(n => !n.is_read).length;
              setUnreadCount(unreadCount);
            })
            .catch((apiError: Error) => {
              console.error('API error fetching notifications:', apiError);
              // Already set empty notifications above, so no need to do it again
            });
        }
      } else {
        // If no user is authenticated, set empty notifications
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string): Promise<void> => {
    try {
      const userId = user?.id || staffUser?.id;
      if (!userId) return;

      await simulatedNotificationService.markAsRead(id);

      // Even if the API call fails, update the UI optimistically
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );

      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Don't show error to user, just log it
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const userId = user?.id || staffUser?.id;
      if (!userId) return;

      // Even if the API call fails, update the UI optimistically
      // Update local state first
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      // Then make the API call
      await simulatedNotificationService.markAllAsRead(userId);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      // Don't show error to user, just log it
    }
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      const userId = user?.id || staffUser?.id;
      if (!userId) return;

      // Find the notification before removing it from state
      const deletedNotification = notifications.find(n => n.id === id);

      // Even if the API call fails, update the UI optimistically
      // Update local state first
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== id)
      );

      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }

      // Then make the API call
      await simulatedNotificationService.deleteNotification(id);
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      // Don't show error to user, just log it
    }
  };

  const deleteAllNotifications = async (): Promise<void> => {
    try {
      const userId = user?.id || staffUser?.id;
      if (!userId) return;

      // Even if the API call fails, update the UI optimistically
      // Update local state first
      setNotifications([]);
      setUnreadCount(0);

      // Then make the API call
      await simulatedNotificationService.deleteAllNotifications(userId);
    } catch (err: any) {
      console.error('Error deleting all notifications:', err);
      // Don't show error to user, just log it
    }
  };

  // Disabled real-time subscription to notifications - using simulated data instead
  useEffect(() => {
    // Only fetch notifications if a user is authenticated
    if (!isUserAuthenticated() && !isStaffAuthenticated()) return;

    // Get user ID
    const userId = user?.id || staffUser?.id;
    if (!userId) {
      console.log('No user ID available, skipping notification fetch');
      return;
    }

    console.log('Using simulated notifications for user:', userId);

    // Fetch initial notifications
    fetchNotifications();

    // Set up a polling interval to simulate real-time updates
    const interval = setInterval(() => {
      // Randomly decide whether to add a new notification (10% chance)
      const shouldAddNotification = Math.random() < 0.1;

      if (shouldAddNotification) {
        console.log('Simulating a new notification');
        fetchNotifications();
      }
    }, 30000); // Check every 30 seconds

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, [user?.id, staffUser?.id, isUserAuthenticated, isStaffAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
