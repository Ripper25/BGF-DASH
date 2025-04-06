const express = require('express');
const StaffAuthController = require('../controllers/staff-auth.controller');

const router = express.Router();

/**
 * @route POST /api/staff-auth/login
 * @desc Staff login with access code
 * @access Public
 */
router.post('/login', StaffAuthController.staffLogin);

/**
 * @route GET /api/staff-auth/verify
 * @desc Verify staff token
 * @access Public
 */
router.get('/verify', StaffAuthController.verifyStaffToken);

module.exports = router;
