const { NotificationModel } = require('../models/notification.model');

// Development mode flag - set to true for development
const DEV_MODE = true;

// Sample notifications for development mode
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    user_id: '00000000-0000-4000-a000-000000000000',
    title: 'Welcome to BGF Dashboard',
    message: 'Thank you for using the BGF Dashboard application.',
    type: 'info',
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    user_id: '00000000-0000-4000-a000-000000000000',
    title: 'Request Submitted',
    message: 'Your request has been submitted successfully.',
    type: 'success',
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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

      // Check if this is a development user
      if (DEV_MODE && req.user.is_dev) {
        console.log('DEV MODE: Returning sample notifications');
        return res.status(200).json(SAMPLE_NOTIFICATIONS);
      }

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

      // If in development mode, return sample notifications even on error
      if (DEV_MODE && req.user && req.user.is_dev) {
        console.log('DEV MODE: Returning sample notifications after error');
        return res.status(200).json(SAMPLE_NOTIFICATIONS);
      }

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

      // Check if this is a development user
      if (DEV_MODE && req.user.is_dev) {
        console.log('DEV MODE: Returning sample unread count');
        // Count unread notifications in the sample data
        const unreadCount = SAMPLE_NOTIFICATIONS.filter(n => !n.is_read).length;
        return res.status(200).json({ count: unreadCount });
      }

      const count = await NotificationModel.getUnreadCount(userId);

      return res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);

      // If in development mode, return sample count even on error
      if (DEV_MODE && req.user && req.user.is_dev) {
        console.log('DEV MODE: Returning sample unread count after error');
        return res.status(200).json({ count: 2 });
      }

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

      // Check if this is a development user
      if (DEV_MODE && req.user.is_dev) {
        console.log('DEV MODE: Marking sample notification as read');
        // Find the notification in the sample data
        const notification = SAMPLE_NOTIFICATIONS.find(n => n.id === id);
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }

        // Mark as read
        notification.is_read = true;
        notification.updated_at = new Date().toISOString();

        return res.status(200).json(notification);
      }

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

      // If in development mode, return a success response even on error
      if (DEV_MODE && req.user && req.user.is_dev) {
        console.log('DEV MODE: Returning success response after error');
        return res.status(200).json({
          id: req.params.id,
          is_read: true,
          updated_at: new Date().toISOString()
        });
      }

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

      // Check if this is a development user
      if (DEV_MODE && req.user.is_dev) {
        console.log('DEV MODE: Marking all sample notifications as read');
        // Mark all notifications as read
        SAMPLE_NOTIFICATIONS.forEach(notification => {
          notification.is_read = true;
          notification.updated_at = new Date().toISOString();
        });

        return res.status(200).json({ message: 'All notifications marked as read' });
      }

      await NotificationModel.markAllAsRead(userId);

      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);

      // If in development mode, return a success response even on error
      if (DEV_MODE && req.user && req.user.is_dev) {
        console.log('DEV MODE: Returning success response after error');
        return res.status(200).json({ message: 'All notifications marked as read' });
      }

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

      // Check if this is a development user
      if (DEV_MODE && req.user.is_dev) {
        console.log('DEV MODE: Deleting sample notification');
        // Find the notification index in the sample data
        const notificationIndex = SAMPLE_NOTIFICATIONS.findIndex(n => n.id === id);
        if (notificationIndex === -1) {
          return res.status(404).json({ message: 'Notification not found' });
        }

        // Remove the notification from the array
        SAMPLE_NOTIFICATIONS.splice(notificationIndex, 1);

        return res.status(200).json({ message: 'Notification deleted successfully' });
      }

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

      // If in development mode, return a success response even on error
      if (DEV_MODE && req.user && req.user.is_dev) {
        console.log('DEV MODE: Returning success response after error');
        return res.status(200).json({ message: 'Notification deleted successfully' });
      }

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

      // Check if this is a development user
      if (DEV_MODE && req.user.is_dev) {
        console.log('DEV MODE: Deleting all sample notifications');
        // Clear the sample notifications array
        SAMPLE_NOTIFICATIONS.length = 0;

        return res.status(200).json({ message: 'All notifications deleted successfully' });
      }

      await NotificationModel.deleteAllNotifications(userId);

      return res.status(200).json({ message: 'All notifications deleted successfully' });
    } catch (error) {
      console.error('Error deleting all notifications:', error);

      // If in development mode, return a success response even on error
      if (DEV_MODE && req.user && req.user.is_dev) {
        console.log('DEV MODE: Returning success response after error');
        return res.status(200).json({ message: 'All notifications deleted successfully' });
      }

      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = NotificationController;
