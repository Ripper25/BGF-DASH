const express = require('express');
const RequestController = require('../controllers/request.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../models/user.model');

const router = express.Router();

/**
 * @route POST /api/requests
 * @desc Create a new request
 * @access Private (Regular Users only)
 */
router.post('/', authMiddleware, authorizeRoles([USER_ROLES.USER]), RequestController.createRequest);

/**
 * @route POST /api/requests/:requestId/documents
 * @desc Upload documents for a request
 * @access Private (Regular Users only)
 */
router.post('/:requestId/documents', authMiddleware, authorizeRoles([USER_ROLES.USER]), RequestController.uploadDocuments);

/**
 * @route GET /api/requests
 * @desc Get all requests
 * @access Private
 */
router.get('/', authMiddleware, RequestController.getAllRequests);

/**
 * @route GET /api/requests/:requestId
 * @desc Get request by ID
 * @access Private
 */
router.get('/:requestId', authMiddleware, RequestController.getRequestById);

/**
 * @route GET /api/requests/ticket/:ticketNumber
 * @desc Get request by ticket number
 * @access Private
 */
router.get('/ticket/:ticketNumber', authMiddleware, RequestController.getRequestByTicketNumber);

/**
 * @route PUT /api/requests/:requestId
 * @desc Update request
 * @access Private (Regular Users only)
 */
router.put('/:requestId', authMiddleware, authorizeRoles([USER_ROLES.USER]), RequestController.updateRequest);

/**
 * @route DELETE /api/requests/:requestId
 * @desc Delete request
 * @access Private (Regular Users only)
 */
router.delete('/:requestId', authMiddleware, authorizeRoles([USER_ROLES.USER]), RequestController.deleteRequest);

module.exports = router;
