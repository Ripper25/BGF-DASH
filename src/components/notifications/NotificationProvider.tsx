"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationToast from './NotificationToast';
import { NotificationData } from '@/services/notification.service';

export default function NotificationProvider() {
  const { notifications, markAsRead } = useNotifications();
  const [activeNotifications, setActiveNotifications] = useState<NotificationData[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Check for new notifications
  useEffect(() => {
    if (notifications.length === 0) return;

    // Get the most recent notification
    const latestNotification = notifications[0];

    // If it's a new notification and it's unread, show it
    if (
      latestNotification.id !== lastNotificationId &&
      !latestNotification.is_read &&
      // Only show notifications that are less than 1 minute old
      new Date(latestNotification.created_at).getTime() > Date.now() - 60000
    ) {
      // Add to active notifications
      setActiveNotifications(prev => [latestNotification, ...prev].slice(0, 3)); // Limit to 3 active notifications
      setLastNotificationId(latestNotification.id);
    }
  }, [notifications, lastNotificationId]);

  // Handle closing a notification
  const handleCloseNotification = (notificationId: string) => {
    // Mark as read in the backend
    markAsRead(notificationId);
    
    // Remove from active notifications
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <>
      {activeNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ bottom: `${(index * 6) + 1}rem` }} // Stack notifications
          className="fixed right-4 z-50"
        >
          <NotificationToast
            notification={notification}
            onClose={() => handleCloseNotification(notification.id)}
            autoClose={true}
            autoCloseDelay={5000 + (index * 1000)} // Stagger auto-close times
          />
        </div>
      ))}
    </>
  );
}
