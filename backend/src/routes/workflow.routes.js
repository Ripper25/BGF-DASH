const express = require('express');
const WorkflowController = require('../controllers/workflow.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../models/user.model');

const router = express.Router();

/**
 * @route POST /api/workflow/:requestId/assign
 * @desc Assign request to field officer
 * @access Private (Admin, Programme Manager)
 */
router.post(
  '/:requestId/assign',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.PROGRAMME_MANAGER]),
  WorkflowController.assignToFieldOfficer
);

/**
 * @route POST /api/workflow/:requestId/verify
 * @desc Submit field officer verification
 * @access Private (Field Officer)
 */
router.post(
  '/:requestId/verify',
  authMiddleware,
  authorizeRoles([USER_ROLES.FIELD_OFFICER]),
  WorkflowController.submitVerification
);

/**
 * @route POST /api/workflow/:requestId/assign-review
 * @desc Assign to programme manager for review
 * @access Private (Admin)
 */
router.post(
  '/:requestId/assign-review',
  authMiddleware,
  authorizeRoles([USER_ROLES.ADMIN]),
  WorkflowController.assignToProgrammeManager
);

/**
 * @route POST /api/workflow/:requestId/review
 * @desc Submit programme manager review
 * @access Private (Programme Manager)
 */
router.post(
  '/:requestId/review',
  authMiddleware,
  authorizeRoles([USER_ROLES.PROGRAMME_MANAGER]),
  WorkflowController.submitReview
);

/**
 * @route POST /api/workflow/:requestId/decision
 * @desc Submit management decision
 * @access Private (Management)
 */
router.post(
  '/:requestId/decision',
  authMiddleware,
  authorizeRoles([USER_ROLES.MANAGEMENT]),
  WorkflowController.submitManagementDecision
);

/**
 * @route GET /api/workflow
 * @desc Get all workflows
 * @access Private
 */
router.get('/', authMiddleware, WorkflowController.getAllWorkflows);

/**
 * @route POST /api/workflow/:requestId/comments
 * @desc Add comment to workflow
 * @access Private
 */
router.post('/:requestId/comments', authMiddleware, WorkflowController.addComment);

/**
 * @route GET /api/workflow/:requestId/comments
 * @desc Get comments for a workflow
 * @access Private
 */
router.get('/:requestId/comments', authMiddleware, WorkflowController.getComments);

module.exports = router;
