const { RequestModel, REQUEST_STATUS } = require('../models/request.model');
const { WorkflowModel } = require('../models/workflow.model');
const { NotificationModel, NOTIFICATION_TYPES } = require('../models/notification.model');
const { supabase } = require('../config/supabase');
const multer = require('multer');
const path = require('path');

/**
 * Configure multer for file uploads
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and DOC/DOCX files are allowed.'));
    }
  }
}).array('documents', 5); // Allow up to 5 files

/**
 * Request controller for handling request-related operations
 */
const RequestController = {
  /**
   * Create a new request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created request data
   */
  async createRequest(req, res) {
    try {
      const { request_type, title, description } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!request_type || !title || !description) {
        return res.status(400).json({ message: 'Request type, title, and description are required' });
      }

      // Create request
      const request = await RequestModel.createRequest({
        user_id: userId,
        request_type,
        title,
        description
      });

      // Initialize workflow
      const workflow = await WorkflowModel.initializeWorkflow(request.id);

      // Create notification for the user
      await NotificationModel.createNotification({
        user_id: userId,
        title: 'Request Submitted',
        message: `Your request "${title}" has been submitted successfully.`,
        type: NOTIFICATION_TYPES.SUCCESS,
        related_entity_type: 'request',
        related_entity_id: request.id
      });

      return res.status(201).json({
        message: 'Request created successfully',
        request: {
          ...request,
          workflow
        }
      });
    } catch (error) {
      console.error('Create request error:', error);
      return res.status(500).json({ message: 'Failed to create request', error: error.message });
    }
  },

  /**
   * Upload documents for a request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with uploaded documents data
   */
  uploadDocuments(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        const { requestId } = req.params;
        const userId = req.user.id;
        const files = req.files;

        if (!files || files.length === 0) {
          return res.status(400).json({ message: 'No files uploaded' });
        }

        // Check if request exists
        const request = await RequestModel.getRequestById(requestId);
        if (!request) {
          return res.status(404).json({ message: 'Request not found' });
        }

        // Check if user owns the request or has appropriate role
        if (request.user_id !== userId && !['admin', 'field_officer', 'programme_manager'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Not authorized to upload documents for this request' });
        }

        const uploadedDocs = [];

        // Upload each file to Supabase Storage
        for (const file of files) {
          const fileExt = path.extname(file.originalname);
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExt}`;
          const filePath = `requests/${requestId}/${fileName}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bgf-documents')
            .upload(filePath, file.buffer, {
              contentType: file.mimetype
            });

          if (uploadError) {
            throw new Error(`File upload error: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('bgf-documents')
            .getPublicUrl(filePath);

          // Add document to database
          const document = await RequestModel.addDocument({
            request_id: requestId,
            file_name: file.originalname,
            file_path: filePath,
            file_type: file.mimetype,
            uploaded_by: userId
          });

          uploadedDocs.push({
            ...document,
            url: urlData.publicUrl
          });
        }

        return res.status(200).json({
          message: 'Documents uploaded successfully',
          documents: uploadedDocs
        });
      } catch (error) {
        console.error('Upload documents error:', error);
        return res.status(500).json({ message: 'Failed to upload documents', error: error.message });
      }
    });
  },

  /**
   * Get all requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with requests data
   */
  async getAllRequests(req, res) {
    try {
      const { status, type } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      let filters = {};

      // Apply filters
      if (status) {
        filters.status = status;
      }

      if (type) {
        filters.type = type;
      }

      // Regular users can only see their own requests
      if (userRole === 'user') {
        filters.user_id = userId;
      }

      const requests = await RequestModel.getAllRequests(filters);

      return res.status(200).json({ requests });
    } catch (error) {
      console.error('Get requests error:', error);
      return res.status(500).json({ message: 'Failed to get requests', error: error.message });
    }
  },

  /**
   * Get request by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with request data
   */
  async getRequestById(req, res) {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const request = await RequestModel.getRequestById(requestId);

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check if user has access to this request
      if (request.user_id !== userId && userRole === 'user') {
        return res.status(403).json({ message: 'Not authorized to access this request' });
      }

      // Get documents
      const documents = await RequestModel.getDocuments(requestId);

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(requestId);

      // Get workflow comments if available
      let comments = [];
      if (workflow) {
        comments = await WorkflowModel.getComments(workflow.id);
      }

      return res.status(200).json({
        request: {
          ...request,
          documents,
          workflow,
          comments
        }
      });
    } catch (error) {
      console.error('Get request error:', error);
      return res.status(500).json({ message: 'Failed to get request', error: error.message });
    }
  },

  /**
   * Get request by ticket number
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with request data
   */
  async getRequestByTicketNumber(req, res) {
    try {
      const { ticketNumber } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const request = await RequestModel.getRequestByTicketNumber(ticketNumber);

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check if user has access to this request
      if (request.user_id !== userId && userRole === 'user') {
        return res.status(403).json({ message: 'Not authorized to access this request' });
      }

      // Get documents
      const documents = await RequestModel.getDocuments(request.id);

      // Get workflow
      const workflow = await WorkflowModel.getWorkflowByRequestId(request.id);

      // Get workflow comments if available
      let comments = [];
      if (workflow) {
        comments = await WorkflowModel.getComments(workflow.id);
      }

      return res.status(200).json({
        request: {
          ...request,
          documents,
          workflow,
          comments
        }
      });
    } catch (error) {
      console.error('Get request by ticket error:', error);
      return res.status(500).json({ message: 'Failed to get request', error: error.message });
    }
  },

  /**
   * Update request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated request data
   */
  async updateRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { title, description, status } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get request
      const request = await RequestModel.getRequestById(requestId);

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check if user has permission to update
      if (request.user_id !== userId && userRole === 'user') {
        return res.status(403).json({ message: 'Not authorized to update this request' });
      }

      // Check if request can be updated (only in submitted status)
      if (request.status !== REQUEST_STATUS.SUBMITTED && userRole === 'user') {
        return res.status(400).json({ message: 'Request cannot be updated after it has been processed' });
      }

      // Update request
      const updateData = {
        title,
        description
      };

      // If status is provided and user is not a regular user, update status
      if (status && userRole !== 'user') {
        updateData.status = status;
      }

      const updatedRequest = await RequestModel.updateRequest(requestId, updateData);

      // Create notification if status has changed
      if (status && status !== request.status) {
        // Get user to notify
        const userToNotify = request.user_id;

        // Create notification based on status
        let notificationType = NOTIFICATION_TYPES.INFO;
        let notificationTitle = 'Request Status Updated';
        let notificationMessage = `Your request "${request.title}" has been updated to ${status}.`;

        if (status === REQUEST_STATUS.APPROVED) {
          notificationType = NOTIFICATION_TYPES.SUCCESS;
          notificationTitle = 'Request Approved';
          notificationMessage = `Your request "${request.title}" has been approved.`;
        } else if (status === REQUEST_STATUS.REJECTED) {
          notificationType = NOTIFICATION_TYPES.ERROR;
          notificationTitle = 'Request Rejected';
          notificationMessage = `Your request "${request.title}" has been rejected.`;
        } else if (status === REQUEST_STATUS.UNDER_REVIEW) {
          notificationType = NOTIFICATION_TYPES.INFO;
          notificationTitle = 'Request Under Review';
          notificationMessage = `Your request "${request.title}" is now under review.`;
        }

        // Create notification
        await NotificationModel.createNotification({
          user_id: userToNotify,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          related_entity_type: 'request',
          related_entity_id: requestId
        });
      }

      return res.status(200).json({
        message: 'Request updated successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Update request error:', error);
      return res.status(500).json({ message: 'Failed to update request', error: error.message });
    }
  },

  /**
   * Delete request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async deleteRequest(req, res) {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get request
      const request = await RequestModel.getRequestById(requestId);

      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      // Check if user has permission to delete
      if (request.user_id !== userId && !['admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Not authorized to delete this request' });
      }

      // Check if request can be deleted (only in submitted status)
      if (request.status !== REQUEST_STATUS.SUBMITTED && userRole !== 'admin') {
        return res.status(400).json({ message: 'Request cannot be deleted after it has been processed' });
      }

      // Delete request
      await RequestModel.deleteRequest(requestId);

      return res.status(200).json({
        message: 'Request deleted successfully'
      });
    } catch (error) {
      console.error('Delete request error:', error);
      return res.status(500).json({ message: 'Failed to delete request', error: error.message });
    }
  }
};

module.exports = RequestController;
