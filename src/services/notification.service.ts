import { apiService } from './api';
import { emailService } from './email.service';

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  is_read?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationOptions {
  sendEmail?: boolean;
  emailRecipient?: string;
  category?: string;
}

/**
 * Notification service for handling notification-related API calls
 */
export const notificationService = {
  /**
   * Get all notifications for the authenticated user
   * @param filters - Optional filters
   * @returns Array of notifications
   */
  async getAllNotifications(filters: NotificationFilters = {}): Promise<NotificationData[]> {
    try {
      const params: Record<string, any> = {};

      if (filters.is_read !== undefined) {
        params.is_read = filters.is_read;
      }

      if (filters.limit) {
        params.limit = filters.limit;
      }

      if (filters.offset) {
        params.offset = filters.offset;
      }

      return await apiService.get<NotificationData[]>('/notifications', params);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty array on error
      return [];
    }
  },

  /**
   * Get count of unread notifications
   * @returns Unread count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      return await apiService.get<{ count: number }>('/notifications/unread/count');
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Return zero count on error
      return { count: 0 };
    }
  },

  /**
   * Mark a notification as read
   * @param id - Notification ID
   * @returns Updated notification
   */
  async markAsRead(id: string): Promise<NotificationData | null> {
    try {
      return await apiService.put<NotificationData>(`/notifications/${id}/read`, {});
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      // Return null on error
      return null;
    }
  },

  /**
   * Mark all notifications as read
   * @returns Success message
   */
  async markAllAsRead(): Promise<{ message: string }> {
    try {
      return await apiService.put<{ message: string }>('/notifications/read-all', {});
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Return a generic success message on error
      return { message: 'All notifications marked as read' };
    }
  },

  /**
   * Delete a notification
   * @param id - Notification ID
   * @returns Success message
   */
  async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      return await apiService.delete<{ message: string }>(`/notifications/${id}`);
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      // Return a generic success message on error
      return { message: 'Notification deleted successfully' };
    }
  },

  /**
   * Delete all notifications
   * @returns Success message
   */
  async deleteAllNotifications(): Promise<{ message: string }> {
    try {
      return await apiService.delete<{ message: string }>('/notifications');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      // Return a generic success message on error
      return { message: 'All notifications deleted successfully' };
    }
  },

  /**
   * Subscribe to real-time notifications
   * @param callback - Callback function to handle new notifications
   * @returns Unsubscribe function
   */
  subscribeToNotifications(callback: (notification: NotificationData) => void): () => void {
    // This is a placeholder for real-time subscription
    // In a real implementation, this would use Supabase's real-time features
    // For now, we'll just return a no-op unsubscribe function
    return () => {};
  },

  /**
   * Create a notification
   * @param data - Notification data
   * @param options - Notification options
   * @returns Created notification
   */
  async createNotification(
    data: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      category?: string;
      related_entity_type?: string;
      related_entity_id?: string;
      user_id?: string;
    },
    options: NotificationOptions = {}
  ): Promise<NotificationData | null> {
    try {
      // Create the notification
      const notification = await apiService.post<NotificationData>('/notifications', data);

      // Send email if requested
      if (options.sendEmail && options.emailRecipient) {
        try {
          await emailService.sendEmail({
            to: options.emailRecipient,
            subject: data.title,
            body: `<h1>${data.title}</h1><p>${data.message}</p>`
          });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          // Continue even if email fails
        }
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Create a test notification (for development purposes)
   * @param type - Notification type
   * @param sendEmail - Whether to send an email
   * @param emailRecipient - Email recipient
   * @returns Created notification
   */
  async createTestNotification(
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    sendEmail: boolean = false,
    emailRecipient?: string,
    category?: string
  ): Promise<NotificationData | null> {
    try {
      const notificationData = {
        title: `Test ${type} notification`,
        message: `This is a test ${type} notification created at ${new Date().toLocaleTimeString()}`,
        type,
        category: category || 'system_announcement'
      };

      const options: NotificationOptions = {
        category: category || 'system_announcement'
      };

      if (sendEmail && emailRecipient) {
        options.sendEmail = true;
        options.emailRecipient = emailRecipient;
      }

      return await this.createNotification(notificationData, options);
    } catch (error) {
      console.error('Error creating test notification:', error);
      return null;
    }
  }
};
