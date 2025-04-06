const express = require('express');
const WorkflowController = require('../controllers/workflow.controller.new');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../models/user.model');

const router = express.Router();

/**
 * @route POST /api/workflow/:requestId/hop-initial-review
 * @desc Submit Head of Programs initial review
 * @access Private (Head of Programs)
 */
router.post(
  '/:requestId/hop-initial-review',
  authMiddleware,
  authorizeRoles([USER_ROLES.HEAD_OF_PROGRAMS]),
  WorkflowController.submitHopInitialReview
);

/**
 * @route POST /api/workflow/:requestId/assign-officer
 * @desc Assign request to Assistant Project Officer or Project Manager
 * @access Private (Head of Programs)
 */
router.post(
  '/:requestId/assign-officer',
  authMiddleware,
  authorizeRoles([USER_ROLES.HEAD_OF_PROGRAMS]),
  WorkflowController.assignToOfficer
);

/**
 * @route POST /api/workflow/:requestId/officer-review
 * @desc Submit officer review
 * @access Private (Assistant Project Officer, Project Manager)
 */
router.post(
  '/:requestId/officer-review',
  authMiddleware,
  authorizeRoles([USER_ROLES.ASSISTANT_PROJECT_OFFICER, USER_ROLES.PROJECT_MANAGER]),
  WorkflowController.submitOfficerReview
);

/**
 * @route POST /api/workflow/:requestId/hop-final-review
 * @desc Submit Head of Programs final review
 * @access Private (Head of Programs)
 */
router.post(
  '/:requestId/hop-final-review',
  authMiddleware,
  authorizeRoles([USER_ROLES.HEAD_OF_PROGRAMS]),
  WorkflowController.submitHopFinalReview
);

/**
 * @route POST /api/workflow/:requestId/assign-director
 * @desc Assign to director
 * @access Private (Head of Programs)
 */
router.post(
  '/:requestId/assign-director',
  authMiddleware,
  authorizeRoles([USER_ROLES.HEAD_OF_PROGRAMS]),
  WorkflowController.assignToDirector
);

/**
 * @route POST /api/workflow/:requestId/director-review
 * @desc Submit director review
 * @access Private (Director)
 */
router.post(
  '/:requestId/director-review',
  authMiddleware,
  authorizeRoles([USER_ROLES.DIRECTOR]),
  WorkflowController.submitDirectorReview
);

/**
 * @route POST /api/workflow/:requestId/executive-approval
 * @desc Submit executive approval
 * @access Private (CEO, Patron)
 */
router.post(
  '/:requestId/executive-approval',
  authMiddleware,
  authorizeRoles([USER_ROLES.CEO, USER_ROLES.PATRON]),
  WorkflowController.submitExecutiveApproval
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
