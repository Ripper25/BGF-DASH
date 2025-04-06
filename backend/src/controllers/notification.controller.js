const { NotificationModel } = require('../models/notification.model');

/**
 * Notification controller for handling notification-related operations
 */
const NotificationController = {
  /**
   * Get all notifications for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with notifications data
   */
  async getAllNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit, offset, is_read } = req.query;

      const options = {
        limit: limit ? parseInt(limit) : 10,
        offset: offset ? parseInt(offset) : 0
      };

      if (is_read !== undefined) {
        options.is_read = is_read === 'true';
      }

      const notifications = await NotificationModel.getUserNotifications(userId, options);

      return res.status(200).json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Get count of unread notifications for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with unread count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await NotificationModel.getUnreadCount(userId);

      return res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Mark a notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated notification data
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify the notification belongs to the user
      const notification = await NotificationModel.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this notification' });
      }

      const updatedNotification = await NotificationModel.markAsRead(id);
      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Mark all notifications as read for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      await NotificationModel.markAllAsRead(userId);

      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Delete a notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify the notification belongs to the user
      const notification = await NotificationModel.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this notification' });
      }

      await NotificationModel.deleteNotification(id);
      return res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * Delete all notifications for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;
      await NotificationModel.deleteAllNotifications(userId);

      return res.status(200).json({ message: 'All notifications deleted successfully' });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = NotificationController;
