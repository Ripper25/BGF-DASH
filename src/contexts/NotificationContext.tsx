"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService, NotificationData } from '@/services/notification.service';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

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
        notificationService.getAllNotifications()
          .then(notificationsData => {
            setNotifications(notificationsData);
            return notificationService.getUnreadCount();
          })
          .then(({ count }) => {
            setUnreadCount(count);
          })
          .catch(apiError => {
            console.error('API error fetching notifications:', apiError);
            // Already set empty notifications above, so no need to do it again
          });
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

  const markAsRead = async (id: string) => {
    try {
      const result = await notificationService.markAsRead(id);

      // Even if the API call fails, update the UI optimistically
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );

      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));

      return result;
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Don't show error to user, just log it
      return null;
    }
  };

  const markAllAsRead = async () => {
    try {
      // Even if the API call fails, update the UI optimistically
      // Update local state first
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      // Then make the API call
      await notificationService.markAllAsRead();
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      // Don't show error to user, just log it
    }
  };

  const deleteNotification = async (id: string) => {
    try {
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
      await notificationService.deleteNotification(id);
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      // Don't show error to user, just log it
    }
  };

  const deleteAllNotifications = async () => {
    try {
      // Even if the API call fails, update the UI optimistically
      // Update local state first
      setNotifications([]);
      setUnreadCount(0);

      // Then make the API call
      await notificationService.deleteAllNotifications();
    } catch (err: any) {
      console.error('Error deleting all notifications:', err);
      // Don't show error to user, just log it
    }
  };

  // Set up real-time subscription to notifications
  useEffect(() => {
    // Only set up subscription if a user is authenticated
    if (!isUserAuthenticated() && !isStaffAuthenticated()) return;

    // Set up Supabase real-time subscription
    const userId = user?.id || staffUser?.id;
    if (!userId) return;

    let channel;
    try {
      channel = supabase
        .channel(`public:notifications:user_id=eq.${userId}`)
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Add new notification to state
            const newNotification = payload.new as NotificationData;
            setNotifications(prev => [newNotification, ...prev]);

            // Update unread count
            if (!newNotification.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Update notification in state
            const updatedNotification = payload.new as NotificationData;
            setNotifications(prev =>
              prev.map(notification =>
                notification.id === updatedNotification.id ? updatedNotification : notification
              )
            );

            // Update unread count if read status changed
            if (payload.old && !payload.old.is_read && updatedNotification.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Remove notification from state
            const deletedNotification = payload.old as NotificationData;
            setNotifications(prev =>
              prev.filter(notification => notification.id !== deletedNotification.id)
            );

            // Update unread count if deleted notification was unread
            if (!deletedNotification.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to notifications');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to notifications');
          }
        });
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
      // Continue without real-time updates if there's an error
    }

    // Fetch initial notifications
    fetchNotifications();

    // Clean up subscription on unmount
    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.error('Error removing channel:', err);
        }
      }
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
