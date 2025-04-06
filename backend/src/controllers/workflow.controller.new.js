const { WorkflowModel, WORKFLOW_STAGES } = require('../models/workflow.model');
const { RequestModel, REQUEST_STATUS } = require('../models/request.model');
const { UserModel, USER_ROLES } = require('../models/user.model');
const { NotificationModel, NOTIFICATION_TYPES } = require('../models/notification.model');

/**
 * Workflow controller for handling workflow-related operations
 */
const WorkflowController = {
  /**
   * Head of Programs initial review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitHopInitialReview(req, res) {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.HEAD_OF_PROGRAMS) {
        return res.status(403).json({ message: 'Not authorized to submit Head of Programs review' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this Head of Programs
      if (workflow.head_of_programs_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.SUBMISSION) {
        return res.status(400).json({ message: 'Request is not in the correct stage for initial review' });
      }

      // Submit review
      const updatedWorkflow = await WorkflowModel.submitHopInitialReview(requestId, {
        notes
      });

      return res.status(200).json({
        message: 'Head of Programs initial review submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit HOP initial review error:', error);
      return res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
  },

  /**
   * Assign request to Assistant Project Officer or Project Manager
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async assignToOfficer(req, res) {
    try {
      const { requestId } = req.params;
      const { officerId, officerType } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.HEAD_OF_PROGRAMS) {
        return res.status(403).json({ message: 'Not authorized to assign requests' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this Head of Programs
      if (workflow.head_of_programs_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.HOP_REVIEW) {
        return res.status(400).json({ message: 'Request is not in the correct stage for officer assignment' });
      }

      // Check if officer type is valid
      if (officerType !== 'assistant_project_officer' && officerType !== 'project_manager') {
        return res.status(400).json({ message: 'Invalid officer type' });
      }

      // Check if officer exists and has the correct role
      const officer = await UserModel.getUserById(officerId);
      if (!officer || officer.role !== officerType) {
        return res.status(400).json({ message: 'Invalid officer' });
      }

      // Assign to officer
      const updatedWorkflow = await WorkflowModel.assignToOfficer(requestId, officerId, officerType);

      // Create notification for the officer
      await NotificationModel.createNotification({
        user_id: officerId,
        title: 'New Request Assigned',
        message: `A new request "${request.title}" has been assigned to you for review.`,
        type: NOTIFICATION_TYPES.INFO,
        related_entity_type: 'request',
        related_entity_id: requestId
      });

      // Create notification for the requester
      await NotificationModel.createNotification({
        user_id: request.user_id,
        title: 'Request Under Review',
        message: `Your request "${request.title}" has been assigned to an officer for review.`,
        type: NOTIFICATION_TYPES.INFO,
        related_entity_type: 'request',
        related_entity_id: requestId
      });

      return res.status(200).json({
        message: `Request assigned to ${officerType === 'assistant_project_officer' ? 'Assistant Project Officer' : 'Project Manager'} successfully`,
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Assign to officer error:', error);
      return res.status(500).json({ message: 'Failed to assign request', error: error.message });
    }
  },

  /**
   * Submit officer review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitOfficerReview(req, res) {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.ASSISTANT_PROJECT_OFFICER && userRole !== USER_ROLES.PROJECT_MANAGER) {
        return res.status(403).json({ message: 'Not authorized to submit officer review' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this officer
      const isAssignedToThisOfficer =
        (userRole === USER_ROLES.ASSISTANT_PROJECT_OFFICER && workflow.assistant_project_officer_id === userId) ||
        (userRole === USER_ROLES.PROJECT_MANAGER && workflow.project_manager_id === userId);

      if (!isAssignedToThisOfficer) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.OFFICER_ASSIGNMENT) {
        return res.status(400).json({ message: 'Request is not in the correct stage for officer review' });
      }

      // Submit review
      const updatedWorkflow = await WorkflowModel.submitOfficerReview(requestId, {
        notes
      });

      // Create notification for the Head of Programs
      if (workflow.head_of_programs_id) {
        await NotificationModel.createNotification({
          user_id: workflow.head_of_programs_id,
          title: 'Officer Review Submitted',
          message: `An officer has submitted their review for request "${request.title}".`,
          type: NOTIFICATION_TYPES.INFO,
          related_entity_type: 'request',
          related_entity_id: requestId
        });
      }

      // Create notification for the requester
      await NotificationModel.createNotification({
        user_id: request.user_id,
        title: 'Request Review Update',
        message: `Your request "${request.title}" has been reviewed by an officer and is moving to the next stage.`,
        type: NOTIFICATION_TYPES.INFO,
        related_entity_type: 'request',
        related_entity_id: requestId
      });

      return res.status(200).json({
        message: 'Officer review submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit officer review error:', error);
      return res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
  },

  /**
   * Submit Head of Programs final review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitHopFinalReview(req, res) {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.HEAD_OF_PROGRAMS) {
        return res.status(403).json({ message: 'Not authorized to submit Head of Programs final review' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this Head of Programs
      if (workflow.head_of_programs_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.OFFICER_REVIEW) {
        return res.status(400).json({ message: 'Request is not in the correct stage for final review' });
      }

      // Submit review
      const updatedWorkflow = await WorkflowModel.submitHopFinalReview(requestId, {
        notes
      });

      return res.status(200).json({
        message: 'Head of Programs final review submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit HOP final review error:', error);
      return res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
  },

  /**
   * Assign to director
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async assignToDirector(req, res) {
    try {
      const { requestId } = req.params;
      const { directorId } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.HEAD_OF_PROGRAMS) {
        return res.status(403).json({ message: 'Not authorized to assign to director' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this Head of Programs
      if (workflow.head_of_programs_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.HOP_FINAL_REVIEW) {
        return res.status(400).json({ message: 'Request is not in the correct stage for director assignment' });
      }

      // Check if director exists and has the correct role
      const director = await UserModel.getUserById(directorId);
      if (!director || director.role !== USER_ROLES.DIRECTOR) {
        return res.status(400).json({ message: 'Invalid director' });
      }

      // Assign to director
      const updatedWorkflow = await WorkflowModel.assignToDirector(requestId, directorId);

      return res.status(200).json({
        message: 'Request assigned to director successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Assign to director error:', error);
      return res.status(500).json({ message: 'Failed to assign to director', error: error.message });
    }
  },

  /**
   * Submit director review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitDirectorReview(req, res) {
    try {
      const { requestId } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.DIRECTOR) {
        return res.status(403).json({ message: 'Not authorized to submit director review' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this director
      if (workflow.director_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.DIRECTOR_REVIEW) {
        return res.status(400).json({ message: 'Request is not in the correct stage for director review' });
      }

      // Submit review
      const updatedWorkflow = await WorkflowModel.submitDirectorReview(requestId, {
        notes
      });

      return res.status(200).json({
        message: 'Director review submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit director review error:', error);
      return res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
  },

  /**
   * Submit executive approval
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitExecutiveApproval(req, res) {
    try {
      const { requestId } = req.params;
      const { approved, notes } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.CEO && userRole !== USER_ROLES.PATRON) {
        return res.status(403).json({ message: 'Not authorized to submit executive approval' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Check if request is assigned to this executive
      const isAssignedToThisExecutive =
        (userRole === USER_ROLES.CEO && workflow.ceo_id === userId) ||
        (userRole === USER_ROLES.PATRON && workflow.patron_id === userId);

      if (!isAssignedToThisExecutive) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.EXECUTIVE_APPROVAL) {
        return res.status(400).json({ message: 'Request is not in the correct stage for executive approval' });
      }

      // Submit approval
      const updatedWorkflow = await WorkflowModel.submitExecutiveApproval(requestId, {
        role: userRole,
        approved,
        notes
      });

      return res.status(200).json({
        message: `${userRole === USER_ROLES.CEO ? 'CEO' : 'Patron'} approval submitted successfully`,
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit executive approval error:', error);
      return res.status(500).json({ message: 'Failed to submit approval', error: error.message });
    }
  },

  /**
   * Get all workflows
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with workflows data
   */
  async getAllWorkflows(req, res) {
    try {
      const { stage } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      let filters = {};

      // Apply filters
      if (stage) {
        filters.stage = stage;
      }

      // Filter by role and user ID
      if (userRole !== USER_ROLES.ADMIN) {
        filters.role = userRole;
        filters.user_id = userId;
      }

      const workflows = await WorkflowModel.getAllWorkflows(filters);

      return res.status(200).json({ workflows });
    } catch (error) {
      console.error('Get workflows error:', error);
      return res.status(500).json({ message: 'Failed to get workflows', error: error.message });
    }
  },

  /**
   * Add comment to workflow
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created comment data
   */
  async addComment(req, res) {
    try {
      const { requestId } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Add comment
      const newComment = await WorkflowModel.addComment({
        workflow_id: workflow.id,
        user_id: userId,
        comment
      });

      return res.status(201).json({
        message: 'Comment added successfully',
        comment: newComment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      return res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
  },

  /**
   * Get comments for a workflow
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with comments data
   */
  async getComments(req, res) {
    try {
      const { requestId } = req.params;

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }

      // Get comments
      const comments = await WorkflowModel.getComments(workflow.id);

      return res.status(200).json({ comments });
    } catch (error) {
      console.error('Get comments error:', error);
      return res.status(500).json({ message: 'Failed to get comments', error: error.message });
    }
  }
};

module.exports = WorkflowController;
