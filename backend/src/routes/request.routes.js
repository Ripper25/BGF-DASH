const express = require('express');
const RequestController = require('../controllers/request.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/requests
 * @desc Create a new request
 * @access Private
 */
router.post('/', authMiddleware, RequestController.createRequest);

/**
 * @route POST /api/requests/:requestId/documents
 * @desc Upload documents for a request
 * @access Private
 */
router.post('/:requestId/documents', authMiddleware, RequestController.uploadDocuments);

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
 * @access Private
 */
router.put('/:requestId', authMiddleware, RequestController.updateRequest);

/**
 * @route DELETE /api/requests/:requestId
 * @desc Delete request
 * @access Private
 */
router.delete('/:requestId', authMiddleware, RequestController.deleteRequest);

module.exports = router;
