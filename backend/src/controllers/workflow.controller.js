const { WorkflowModel, WORKFLOW_STAGES } = require('../models/workflow.model');
const { RequestModel, REQUEST_STATUS } = require('../models/request.model');
const { UserModel, USER_ROLES } = require('../models/user.model');

/**
 * Workflow controller for handling workflow-related operations
 */
const WorkflowController = {
  /**
   * Assign request to field officer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async assignToFieldOfficer(req, res) {
    try {
      const { requestId } = req.params;
      const { fieldOfficerId } = req.body;
      const userRole = req.user.role;

      // Check if user has permission
      if (!['admin', 'programme_manager'].includes(userRole)) {
        return res.status(403).json({ message: 'Not authorized to assign requests' });
      }

      // Check if request exists
      const request = await RequestModel.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check if request is in the correct status
      if (request.status !== REQUEST_STATUS.SUBMITTED) {
        return res.status(400).json({ message: 'Request is not in the correct status for assignment' });
      }

      // Check if field officer exists and has the correct role
      const fieldOfficer = await UserModel.getUserById(fieldOfficerId);
      if (!fieldOfficer || fieldOfficer.role !== USER_ROLES.FIELD_OFFICER) {
        return res.status(400).json({ message: 'Invalid field officer' });
      }

      // Assign to field officer
      const workflow = await WorkflowModel.assignToFieldOfficer(requestId, fieldOfficerId);

      return res.status(200).json({
        message: 'Request assigned to field officer successfully',
        workflow
      });
    } catch (error) {
      console.error('Assign to field officer error:', error);
      return res.status(500).json({ message: 'Failed to assign request', error: error.message });
    }
  },

  /**
   * Submit field officer verification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitVerification(req, res) {
    try {
      const { requestId } = req.params;
      const { notes, status } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.FIELD_OFFICER) {
        return res.status(403).json({ message: 'Not authorized to submit verification' });
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

      // Check if request is assigned to this field officer
      if (workflow.field_officer_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.ASSIGNMENT) {
        return res.status(400).json({ message: 'Request is not in the correct stage for verification' });
      }

      // Submit verification
      const updatedWorkflow = await WorkflowModel.submitVerification(requestId, {
        notes,
        status
      });

      return res.status(200).json({
        message: 'Verification submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit verification error:', error);
      return res.status(500).json({ message: 'Failed to submit verification', error: error.message });
    }
  },

  /**
   * Assign to programme manager
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async assignToProgrammeManager(req, res) {
    try {
      const { requestId } = req.params;
      const { programmeManagerId } = req.body;
      const userRole = req.user.role;

      // Check if user has permission
      if (!['admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Not authorized to assign to programme manager' });
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

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.VERIFICATION) {
        return res.status(400).json({ message: 'Request is not in the correct stage for programme manager assignment' });
      }

      // Check if programme manager exists and has the correct role
      const programmeManager = await UserModel.getUserById(programmeManagerId);
      if (!programmeManager || programmeManager.role !== USER_ROLES.PROGRAMME_MANAGER) {
        return res.status(400).json({ message: 'Invalid programme manager' });
      }

      // Assign to programme manager
      const updatedWorkflow = await WorkflowModel.assignToProgrammeManager(requestId, programmeManagerId);

      return res.status(200).json({
        message: 'Request assigned to programme manager successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Assign to programme manager error:', error);
      return res.status(500).json({ message: 'Failed to assign to programme manager', error: error.message });
    }
  },

  /**
   * Submit programme manager review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitReview(req, res) {
    try {
      const { requestId } = req.params;
      const { notes, status } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.PROGRAMME_MANAGER) {
        return res.status(403).json({ message: 'Not authorized to submit review' });
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

      // Check if request is assigned to this programme manager
      if (workflow.programme_manager_id !== userId) {
        return res.status(403).json({ message: 'Request is not assigned to you' });
      }

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.REVIEW) {
        return res.status(400).json({ message: 'Request is not in the correct stage for review' });
      }

      // Submit review
      const updatedWorkflow = await WorkflowModel.submitReview(requestId, {
        notes,
        status
      });

      return res.status(200).json({
        message: 'Review submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit review error:', error);
      return res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
  },

  /**
   * Submit management decision
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated workflow data
   */
  async submitManagementDecision(req, res) {
    try {
      const { requestId } = req.params;
      const { decision, notes } = req.body;
      const userRole = req.user.role;

      // Check if user has permission
      if (userRole !== USER_ROLES.MANAGEMENT) {
        return res.status(403).json({ message: 'Not authorized to submit management decision' });
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

      // Check if request is in the correct stage
      if (workflow.current_stage !== WORKFLOW_STAGES.MANAGEMENT) {
        return res.status(400).json({ message: 'Request is not in the correct stage for management decision' });
      }

      // Submit management decision
      const updatedWorkflow = await WorkflowModel.submitManagementDecision(requestId, {
        decision,
        notes
      });

      return res.status(200).json({
        message: 'Management decision submitted successfully',
        workflow: updatedWorkflow
      });
    } catch (error) {
      console.error('Submit management decision error:', error);
      return res.status(500).json({ message: 'Failed to submit management decision', error: error.message });
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

      // Field officers can only see workflows assigned to them
      if (userRole === USER_ROLES.FIELD_OFFICER) {
        filters.field_officer_id = userId;
      }

      // Programme managers can only see workflows assigned to them
      if (userRole === USER_ROLES.PROGRAMME_MANAGER) {
        filters.programme_manager_id = userId;
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
