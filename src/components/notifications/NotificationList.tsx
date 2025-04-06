"use client";

import React from 'react';
import { FiBell, FiTrash2, FiCheck } from 'react-icons/fi';
import NotificationItem from './NotificationItem';
import { useNotifications } from '@/contexts/NotificationContext';
import Button from '@/components/ui/Button';

const NotificationList: React.FC = () => {
  const { 
    notifications, 
    loading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications 
  } = useNotifications();

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 border-2 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-text-muted">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-terracotta">{error}</p>
        <p className="mt-2 text-text-muted">Please try again later.</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <FiBell className="mx-auto h-12 w-12 text-slate-gray/30" />
        <p className="mt-4 text-text-muted">No notifications yet</p>
        <p className="text-sm text-text-muted">You'll be notified when there are updates to your requests</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-slate-gray/10">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => markAllAsRead()}
            className="text-bgf-burgundy hover:text-bgf-burgundy/80 p-1 text-sm flex items-center"
            title="Mark all as read"
          >
            <FiCheck size={14} className="mr-1" />
            <span>Mark all read</span>
          </button>
          <button
            onClick={() => deleteAllNotifications()}
            className="text-terracotta hover:text-terracotta/80 p-1 text-sm flex items-center"
            title="Delete all notifications"
          >
            <FiTrash2 size={14} className="mr-1" />
            <span>Clear all</span>
          </button>
        </div>
      </div>
      <div>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
