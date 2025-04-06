const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/notifications
 * @desc Get all notifications for the authenticated user
 * @access Private
 */
router.get('/', authMiddleware, NotificationController.getAllNotifications);

/**
 * @route GET /api/notifications/unread/count
 * @desc Get count of unread notifications for the authenticated user
 * @access Private
 */
router.get('/unread/count', authMiddleware, NotificationController.getUnreadCount);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read for the authenticated user
 * @access Private
 */
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

/**
 * @route DELETE /api/notifications
 * @desc Delete all notifications for the authenticated user
 * @access Private
 */
router.delete('/', authMiddleware, NotificationController.deleteAllNotifications);

module.exports = router;
