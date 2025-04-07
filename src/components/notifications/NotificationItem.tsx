"use client";

import React from 'react';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle, FiX, FiCheck, FiTag } from 'react-icons/fi';
import { NotificationData } from '@/services/notification.service';
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_CATEGORY_COLORS } from '@/constants/notification-categories';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <FiInfo className="text-blue-500" />;
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      case 'error':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // Convert to seconds, minutes, hours, days
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffMins > 0) {
        return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className={`p-4 border-b border-slate-gray/10 ${notification.is_read ? 'bg-white' : 'bg-slate-gray/5'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`text-sm font-medium ${notification.is_read ? 'text-text-secondary' : 'text-text-primary'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              {!notification.is_read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-bgf-burgundy hover:text-bgf-burgundy/80 p-1"
                  title="Mark as read"
                >
                  <FiCheck size={16} />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="text-terracotta hover:text-terracotta/80 p-1"
                title="Delete notification"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {notification.message}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {getTimeAgo(notification.created_at)}
            </p>
            {notification.category && (
              <div className={`flex items-center px-2 py-1 rounded-full text-xs ${NOTIFICATION_CATEGORY_COLORS[notification.category] || 'bg-slate-gray/10 text-text-secondary'}`}>
                <FiTag className="mr-1" size={10} />
                {NOTIFICATION_CATEGORY_LABELS[notification.category] || notification.category}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
