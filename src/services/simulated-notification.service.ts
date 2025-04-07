import { NotificationData } from '@/types/notification';

// Simulated notification data
const simulatedNotifications: NotificationData[] = [
  {
    id: 'simulated-notification-1',
    user_id: 'simulated-user-id',
    title: 'Welcome to BGF Dashboard',
    message: 'Thank you for using the BGF Dashboard. This is a simulated notification.',
    type: 'info',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'simulated-notification-2',
    user_id: 'simulated-user-id',
    title: 'Request Status Update',
    message: 'Your funding request has been reviewed and is pending approval.',
    type: 'update',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'simulated-notification-3',
    user_id: 'simulated-user-id',
    title: 'Document Upload Reminder',
    message: 'Please upload the required documents for your partnership request.',
    type: 'reminder',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago (when it was read)
  }
];

// Simulated staff notification data
const simulatedStaffNotifications: NotificationData[] = [
  {
    id: 'simulated-staff-notification-1',
    user_id: 'simulated-staff-id',
    title: 'New Request Assigned',
    message: 'A new funding request has been assigned to you for review.',
    type: 'assignment',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'simulated-staff-notification-2',
    user_id: 'simulated-staff-id',
    title: 'Weekly Report Due',
    message: 'Your weekly project status report is due tomorrow.',
    type: 'reminder',
    is_read: false,
    created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 14400000).toISOString()
  }
];

/**
 * Simulated notification service
 */
export const simulatedNotificationService = {
  /**
   * Get all notifications for a user
   * @param userId User ID
   * @returns Array of notifications
   */
  async getNotifications(userId: string): Promise<NotificationData[]> {
    console.log('Simulated getNotifications for user:', userId);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return appropriate notifications based on user ID
    if (userId === 'simulated-staff-id') {
      return [...simulatedStaffNotifications];
    } else {
      return [...simulatedNotifications];
    }
  },
  
  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @returns Updated notification
   */
  async markAsRead(notificationId: string): Promise<NotificationData> {
    console.log('Simulated markAsRead for notification:', notificationId);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the notification in both arrays
    let notification = simulatedNotifications.find(n => n.id === notificationId);
    if (!notification) {
      notification = simulatedStaffNotifications.find(n => n.id === notificationId);
    }
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    // Mark as read
    notification.is_read = true;
    notification.updated_at = new Date().toISOString();
    
    return notification;
  },
  
  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Success message
   */
  async markAllAsRead(userId: string): Promise<{ message: string }> {
    console.log('Simulated markAllAsRead for user:', userId);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mark all notifications as read based on user ID
    if (userId === 'simulated-staff-id') {
      simulatedStaffNotifications.forEach(notification => {
        notification.is_read = true;
        notification.updated_at = new Date().toISOString();
      });
    } else {
      simulatedNotifications.forEach(notification => {
        notification.is_read = true;
        notification.updated_at = new Date().toISOString();
      });
    }
    
    return { message: 'All notifications marked as read' };
  },
  
  /**
   * Delete a notification
   * @param notificationId Notification ID
   * @returns Success message
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    console.log('Simulated deleteNotification for notification:', notificationId);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove from regular notifications
    const regularIndex = simulatedNotifications.findIndex(n => n.id === notificationId);
    if (regularIndex !== -1) {
      simulatedNotifications.splice(regularIndex, 1);
      return { message: 'Notification deleted successfully' };
    }
    
    // Remove from staff notifications
    const staffIndex = simulatedStaffNotifications.findIndex(n => n.id === notificationId);
    if (staffIndex !== -1) {
      simulatedStaffNotifications.splice(staffIndex, 1);
      return { message: 'Notification deleted successfully' };
    }
    
    throw new Error('Notification not found');
  },
  
  /**
   * Delete all notifications for a user
   * @param userId User ID
   * @returns Success message
   */
  async deleteAllNotifications(userId: string): Promise<{ message: string }> {
    console.log('Simulated deleteAllNotifications for user:', userId);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear notifications based on user ID
    if (userId === 'simulated-staff-id') {
      simulatedStaffNotifications.length = 0;
    } else {
      simulatedNotifications.length = 0;
    }
    
    return { message: 'All notifications deleted successfully' };
  }
};
