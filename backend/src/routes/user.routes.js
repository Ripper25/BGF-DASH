const express = require('express');
const UserController = require('../controllers/user.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../models/user.model');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Admin, Programme Manager)
 */
router.get(
  '/',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.PROGRAMME_MANAGER]),
  UserController.getAllUsers
);

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID
 * @access Private
 */
router.get('/:userId', authMiddleware, UserController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private (Admin)
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN]),
  UserController.createUser
);

/**
 * @route PUT /api/users/:userId
 * @desc Update user
 * @access Private
 */
router.put('/:userId', authMiddleware, UserController.updateUser);

/**
 * @route DELETE /api/users/:userId
 * @desc Delete user
 * @access Private (Admin)
 */
router.delete(
  '/:userId',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN]),
  UserController.deleteUser
);

/**
 * @route GET /api/users/roles/field-officers
 * @desc Get all field officers
 * @access Private (Admin, Programme Manager)
 */
router.get(
  '/roles/field-officers',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.PROGRAMME_MANAGER]),
  UserController.getFieldOfficers
);

/**
 * @route GET /api/users/roles/programme-managers
 * @desc Get all programme managers
 * @access Private (Admin)
 */
router.get(
  '/roles/programme-managers',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN]),
  UserController.getProgrammeManagers
);

module.exports = router;
