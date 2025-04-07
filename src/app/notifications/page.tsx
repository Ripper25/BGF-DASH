"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/routes';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiBell, FiCheck, FiTrash2, FiFilter, FiSettings, FiCalendar, FiTag } from 'react-icons/fi';
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_CATEGORY_COLORS } from '@/constants/notification-categories';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get unique categories from notifications
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    notifications.forEach(notification => {
      if (notification.category) {
        uniqueCategories.add(notification.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [notifications]);

  // Filter notifications by read status and category
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Filter by read status
      if (filter === 'unread' && notification.is_read) {
        return false;
      }

      // Filter by category
      if (categoryFilter !== 'all' && notification.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [notifications, filter, categoryFilter]);

  return (
    <DashboardLayout title="Notifications">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FiBell className="text-bgf-burgundy mr-2" size={20} />
            <h1 className="text-xl font-playfair font-semibold">Notifications</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(ROUTES.SCHEDULED_NOTIFICATIONS)}
              className="mr-2"
            >
              <FiCalendar className="mr-2" />
              Scheduled
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(ROUTES.NOTIFICATION_PREFERENCES)}
            >
              <FiSettings className="mr-2" />
              Preferences
            </Button>

            <div className="flex space-x-2">
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                >
                  <FiFilter className="mr-2" />
                  {filter === 'all' ? 'All' : 'Unread'}
                </Button>
              </div>

              {categories.length > 0 && (
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {NOTIFICATION_CATEGORY_LABELS[category] || category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                disabled={notifications.every(n => n.is_read)}
              >
                <FiCheck className="mr-2" />
                Mark all as read
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={deleteAllNotifications}
                disabled={notifications.length === 0}
                className="text-terracotta border-terracotta hover:bg-terracotta/10"
              >
                <FiTrash2 className="mr-2" />
                Clear all
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-text-muted">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-terracotta">{error}</p>
            <p className="mt-2 text-text-muted">Please try again later.</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="mx-auto h-16 w-16 text-slate-gray/30" />
            <p className="mt-4 text-text-muted">
              {filter === 'all'
                ? 'No notifications yet'
                : 'No unread notifications'}
            </p>
            <p className="text-sm text-text-muted mt-2">
              {filter === 'all'
                ? 'You\'ll be notified when there are updates to your requests'
                : 'All notifications have been read'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-gray/10">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
