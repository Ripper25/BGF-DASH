import { apiService } from './api';

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  scheduled_for: string;
  recipient_id?: string;
  recipient_type?: 'user' | 'role' | 'all';
  created_at: string;
  updated_at: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  send_email: boolean;
  send_push: boolean;
}

export interface ScheduledNotificationInput {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  scheduled_for: string;
  recipient_id?: string;
  recipient_type?: 'user' | 'role' | 'all';
  send_email?: boolean;
  send_push?: boolean;
}

/**
 * Scheduled notification service for handling scheduled notification-related operations
 */
export const scheduledNotificationService = {
  /**
   * Get all scheduled notifications
   * @returns Array of scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      return await apiService.get<ScheduledNotification[]>('/notifications/scheduled');
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      return [];
    }
  },

  /**
   * Get a scheduled notification by ID
   * @param id - Scheduled notification ID
   * @returns Scheduled notification
   */
  async getScheduledNotificationById(id: string): Promise<ScheduledNotification | null> {
    try {
      return await apiService.get<ScheduledNotification>(`/notifications/scheduled/${id}`);
    } catch (error) {
      console.error(`Error fetching scheduled notification ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a scheduled notification
   * @param data - Scheduled notification data
   * @returns Created scheduled notification
   */
  async createScheduledNotification(
    data: ScheduledNotificationInput
  ): Promise<ScheduledNotification | null> {
    try {
      return await apiService.post<ScheduledNotification>('/notifications/scheduled', data);
    } catch (error) {
      console.error('Error creating scheduled notification:', error);
      return null;
    }
  },

  /**
   * Update a scheduled notification
   * @param id - Scheduled notification ID
   * @param data - Updated scheduled notification data
   * @returns Updated scheduled notification
   */
  async updateScheduledNotification(
    id: string,
    data: Partial<ScheduledNotificationInput>
  ): Promise<ScheduledNotification | null> {
    try {
      return await apiService.put<ScheduledNotification>(`/notifications/scheduled/${id}`, data);
    } catch (error) {
      console.error(`Error updating scheduled notification ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete a scheduled notification
   * @param id - Scheduled notification ID
   * @returns Success status
   */
  async deleteScheduledNotification(id: string): Promise<boolean> {
    try {
      await apiService.delete(`/notifications/scheduled/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting scheduled notification ${id}:`, error);
      return false;
    }
  },

  /**
   * Cancel a scheduled notification
   * @param id - Scheduled notification ID
   * @returns Updated scheduled notification
   */
  async cancelScheduledNotification(id: string): Promise<ScheduledNotification | null> {
    try {
      return await apiService.post<ScheduledNotification>(`/notifications/scheduled/${id}/cancel`, {});
    } catch (error) {
      console.error(`Error cancelling scheduled notification ${id}:`, error);
      return null;
    }
  },

  /**
   * Send a scheduled notification immediately
   * @param id - Scheduled notification ID
   * @returns Updated scheduled notification
   */
  async sendScheduledNotificationNow(id: string): Promise<ScheduledNotification | null> {
    try {
      return await apiService.post<ScheduledNotification>(`/notifications/scheduled/${id}/send-now`, {});
    } catch (error) {
      console.error(`Error sending scheduled notification ${id}:`, error);
      return null;
    }
  }
};
