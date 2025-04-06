const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  canAccessDashboard,
  canAccessAnalytics,
  canAccessAdminPanel,
  canAccessApprovals,
  canAccessStaffManagement,
  canAccessReports,
  canAccessSettings,
  canAccessFinalApprovals
} = require('../middleware/access-control.middleware');

const router = express.Router();

/**
 * @route GET /api/dashboard
 * @desc Get dashboard data
 * @access Private (All authenticated users)
 */
router.get('/', authMiddleware, canAccessDashboard, (req, res) => {
  // This would be replaced with actual dashboard data
  res.status(200).json({
    message: 'Dashboard data',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    sections: {
      analytics: canUserAccess(req.user.role, 'analytics'),
      adminPanel: canUserAccess(req.user.role, 'adminPanel'),
      approvals: canUserAccess(req.user.role, 'approvals'),
      staffManagement: canUserAccess(req.user.role, 'staffManagement'),
      reports: canUserAccess(req.user.role, 'reports'),
      settings: canUserAccess(req.user.role, 'settings'),
      finalApprovals: canUserAccess(req.user.role, 'finalApprovals')
    }
  });
});

/**
 * @route GET /api/dashboard/analytics
 * @desc Get analytics data
 * @access Private (Admin, Director, CEO, Patron, Head of Programs)
 */
router.get('/analytics', authMiddleware, canAccessAnalytics, (req, res) => {
  res.status(200).json({
    message: 'Analytics data'
  });
});

/**
 * @route GET /api/dashboard/admin
 * @desc Get admin panel data
 * @access Private (Admin, Director)
 */
router.get('/admin', authMiddleware, canAccessAdminPanel, (req, res) => {
  res.status(200).json({
    message: 'Admin panel data'
  });
});

/**
 * @route GET /api/dashboard/approvals
 * @desc Get approvals data
 * @access Private (Admin, Director, CEO, Patron, Head of Programs)
 */
router.get('/approvals', authMiddleware, canAccessApprovals, (req, res) => {
  res.status(200).json({
    message: 'Approvals data'
  });
});

/**
 * @route GET /api/dashboard/staff
 * @desc Get staff management data
 * @access Private (Admin, Director)
 */
router.get('/staff', authMiddleware, canAccessStaffManagement, (req, res) => {
  res.status(200).json({
    message: 'Staff management data'
  });
});

/**
 * @route GET /api/dashboard/reports
 * @desc Get reports data
 * @access Private (Admin, Director, CEO, Patron, Head of Programs)
 */
router.get('/reports', authMiddleware, canAccessReports, (req, res) => {
  res.status(200).json({
    message: 'Reports data'
  });
});

/**
 * @route GET /api/dashboard/settings
 * @desc Get settings data
 * @access Private (Admin, Director, CEO, Patron)
 */
router.get('/settings', authMiddleware, canAccessSettings, (req, res) => {
  res.status(200).json({
    message: 'Settings data'
  });
});

/**
 * @route GET /api/dashboard/final-approvals
 * @desc Get final approvals data
 * @access Private (CEO, Patron)
 */
router.get('/final-approvals', authMiddleware, canAccessFinalApprovals, (req, res) => {
  res.status(200).json({
    message: 'Final approvals data'
  });
});

/**
 * Helper function to check if a user role has access to a specific section
 * @param {string} role - User role
 * @param {string} section - Dashboard section
 * @returns {boolean} Whether the user has access
 */
function canUserAccess(role, section) {
  const { USER_ROLES } = require('../models/user.model');
  
  const accessMap = {
    analytics: [
      USER_ROLES.ADMIN,
      USER_ROLES.DIRECTOR,
      USER_ROLES.CEO,
      USER_ROLES.PATRON,
      USER_ROLES.HEAD_OF_PROGRAMS
    ],
    adminPanel: [
      USER_ROLES.ADMIN,
      USER_ROLES.DIRECTOR
    ],
    approvals: [
      USER_ROLES.ADMIN,
      USER_ROLES.DIRECTOR,
      USER_ROLES.CEO,
      USER_ROLES.PATRON,
      USER_ROLES.HEAD_OF_PROGRAMS
    ],
    staffManagement: [
      USER_ROLES.ADMIN,
      USER_ROLES.DIRECTOR
    ],
    reports: [
      USER_ROLES.ADMIN,
      USER_ROLES.DIRECTOR,
      USER_ROLES.CEO,
      USER_ROLES.PATRON,
      USER_ROLES.HEAD_OF_PROGRAMS
    ],
    settings: [
      USER_ROLES.ADMIN,
      USER_ROLES.DIRECTOR,
      USER_ROLES.CEO,
      USER_ROLES.PATRON
    ],
    finalApprovals: [
      USER_ROLES.CEO,
      USER_ROLES.PATRON
    ]
  };

  return accessMap[section] ? accessMap[section].includes(role) : false;
}

module.exports = router;
