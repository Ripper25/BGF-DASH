const jwt = require('jsonwebtoken');
const { USER_ROLES } = require('../models/user.model');

// Staff access codes - in a real app, these would be stored in a database
const STAFF_CODES = {
  'APO001': { name: 'Field Officer', role: USER_ROLES.ASSISTANT_PROJECT_OFFICER },
  'PM001': { name: 'Project Manager', role: USER_ROLES.PROJECT_MANAGER },
  'HOP001': { name: 'Program Manager', role: USER_ROLES.HEAD_OF_PROGRAMS },
  'DIR001': { name: 'Director', role: USER_ROLES.DIRECTOR },
  'CEO001': { name: 'Chief Executive', role: USER_ROLES.CEO },
  'PAT001': { name: 'Patron', role: USER_ROLES.PATRON },
  'ADM001': { name: 'Administrator', role: USER_ROLES.ADMIN },
};

/**
 * Staff authentication controller
 */
const StaffAuthController = {
  /**
   * Staff login with access code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with staff data and token
   */
  async staffLogin(req, res) {
    try {
      const { fullName, accessCode } = req.body;

      // Validate required fields
      if (!fullName || !accessCode) {
        return res.status(400).json({ message: 'Full name and access code are required' });
      }

      // Validate access code
      if (!STAFF_CODES[accessCode]) {
        return res.status(401).json({ message: 'Invalid access code' });
      }

      // Get staff details from access code
      const staffDetails = STAFF_CODES[accessCode];

      // Create staff user object
      const staffUser = {
        id: `staff_${accessCode}`, // Generate a unique ID for the staff user
        name: fullName,
        role: staffDetails.role,
        staff_number: accessCode,
        authenticated: true,
        timestamp: new Date().toISOString()
      };

      // Generate JWT token
      const token = jwt.sign(
        {
          id: staffUser.id,
          name: staffUser.name,
          role: staffUser.role,
          staff_number: staffUser.staff_number,
          is_staff: true // Flag to identify staff users
        },
        process.env.JWT_SECRET,
        { expiresIn: '4h' } // 4-hour expiration
      );

      // Return staff data and token
      return res.status(200).json({
        message: 'Staff login successful',
        staff: staffUser,
        token
      });
    } catch (error) {
      console.error('Staff login error:', error);
      return res.status(500).json({ message: 'Staff login failed', error: error.message });
    }
  },

  /**
   * Verify staff token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with staff data
   */
  async verifyStaffToken(req, res) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's a staff token
      if (!decoded.is_staff) {
        return res.status(401).json({ message: 'Not a valid staff token' });
      }

      // Return staff data
      return res.status(200).json({
        message: 'Staff token verified',
        staff: {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
          staff_number: decoded.staff_number,
          is_staff: decoded.is_staff
        }
      });
    } catch (error) {
      console.error('Staff token verification error:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }

      return res.status(500).json({ message: 'Token verification failed', error: error.message });
    }
  }
};

module.exports = StaffAuthController;
