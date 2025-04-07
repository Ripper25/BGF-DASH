const express = require('express');
const router = express.Router();
const UserAvatarController = require('../controllers/user-avatar.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route POST /api/users/avatar
 * @desc Upload a user avatar
 * @access Private
 */
router.post('/', authMiddleware, UserAvatarController.uploadAvatar);

/**
 * @route POST /api/users/avatar/url
 * @desc Update a user's avatar URL
 * @access Private
 */
router.post('/url', authMiddleware, UserAvatarController.updateAvatarUrl);

/**
 * @route GET /api/users/avatar
 * @desc Get the current user's avatar
 * @access Private
 */
router.get('/', authMiddleware, UserAvatarController.getAvatar);

/**
 * @route DELETE /api/users/avatar/:fileName
 * @desc Delete the current user's avatar
 * @access Private
 */
router.delete('/:fileName', authMiddleware, UserAvatarController.deleteAvatar);

module.exports = router;
