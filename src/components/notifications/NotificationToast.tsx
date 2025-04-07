"use client";

import React, { useState, useEffect } from 'react';
import { FiX, FiBell, FiInfo, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { NotificationData } from '@/services/notification.service';

interface NotificationToastProps {
  notification: NotificationData;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function NotificationToast({
  notification,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <FiAlertTriangle className="text-terracotta" size={20} />;
      case 'info':
      default:
        return <FiInfo className="text-blue-500" size={20} />;
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-terracotta/10 border-terracotta/20';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm w-full shadow-lg rounded-lg border ${getBackgroundColor()} transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1">
            {notification.title && (
              <h3 className="font-medium text-gray-900 mb-1">{notification.title}</h3>
            )}
            <p className="text-sm text-gray-700">{notification.message}</p>
            {notification.created_at && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.created_at).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
