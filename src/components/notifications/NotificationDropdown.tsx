"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationList from './NotificationList';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/routes';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const viewAllNotifications = () => {
    setIsOpen(false);
    router.push(ROUTES.NOTIFICATIONS);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-slate-gray/10 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FiBell size={22} className="text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-bgf-burgundy rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-slate-gray/10">
          <NotificationList />
          <div className="p-2 border-t border-slate-gray/10 text-center">
            <button
              onClick={viewAllNotifications}
              className="text-sm text-bgf-burgundy hover:text-bgf-burgundy/80"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
