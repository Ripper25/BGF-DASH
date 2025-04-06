const { USER_ROLES } = require('../models/user.model');

/**
 * Access control middleware for different dashboard sections
 */

/**
 * Check if user has access to dashboard
 * All roles have access to the dashboard
 */
const canAccessDashboard = (req, res, next) => {
  // All authenticated users can access the dashboard
  next();
};

/**
 * Check if user has access to analytics
 * Admin, Director, CEO, Patron, Head of Programs have access to analytics
 */
const canAccessAnalytics = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.HEAD_OF_PROGRAMS
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access analytics' });
  }

  next();
};

/**
 * Check if user has access to admin panel
 * Admin and Director have access to admin panel
 */
const canAccessAdminPanel = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.DIRECTOR
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access admin panel' });
  }

  next();
};

/**
 * Check if user has access to approvals
 * Admin, Director, CEO, Patron, Head of Programs have access to approvals
 */
const canAccessApprovals = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.HEAD_OF_PROGRAMS
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access approvals' });
  }

  next();
};

/**
 * Check if user has access to staff management
 * Admin and Director have access to staff management
 */
const canAccessStaffManagement = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.DIRECTOR
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access staff management' });
  }

  next();
};

/**
 * Check if user has access to reports
 * Admin, Director, CEO, Patron, Head of Programs have access to reports
 */
const canAccessReports = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.HEAD_OF_PROGRAMS
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access reports' });
  }

  next();
};

/**
 * Check if user has access to settings
 * Admin, Director, CEO, Patron have access to settings
 */
const canAccessSettings = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access settings' });
  }

  next();
};

/**
 * Check if user has access to final approvals
 * CEO and Patron have access to final approvals
 */
const canAccessFinalApprovals = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.CEO,
    USER_ROLES.PATRON
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to access final approvals' });
  }

  next();
};

module.exports = {
  canAccessDashboard,
  canAccessAnalytics,
  canAccessAdminPanel,
  canAccessApprovals,
  canAccessStaffManagement,
  canAccessReports,
  canAccessSettings,
  canAccessFinalApprovals
};
