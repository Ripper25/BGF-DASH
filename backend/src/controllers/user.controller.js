const { UserModel, USER_ROLES } = require('../models/user.model');

/**
 * User controller for handling user-related operations
 */
const UserController = {
  /**
   * Get all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with users data
   */
  async getAllUsers(req, res) {
    try {
      const { role } = req.query;
      const userRole = req.user.role;

      // Check if user has permission
      if (!['admin', 'programme_manager'].includes(userRole)) {
        return res.status(403).json({ message: 'Not authorized to access user list' });
      }

      const users = await UserModel.getAllUsers(role);

      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        created_at: user.created_at
      }));

      return res.status(200).json({ users: sanitizedUsers });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
  },

  /**
   * Get user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with user data
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const currentUserRole = req.user.role;
      const currentUserId = req.user.id;

      // Check if user has permission
      if (!['admin', 'programme_manager'].includes(currentUserRole) && currentUserId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this user' });
      }

      const user = await UserModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove sensitive information
      const sanitizedUser = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        address: user.address,
        created_at: user.created_at
      };

      return res.status(200).json({ user: sanitizedUser });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Failed to get user', error: error.message });
    }
  },

  /**
   * Create a new user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with created user data
   */
  async createUser(req, res) {
    try {
      const { email, password, full_name, role, phone_number, address } = req.body;
      const currentUserRole = req.user.role;

      // Check if user has permission
      if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to create users' });
      }

      // Validate required fields
      if (!email || !password || !full_name || !role) {
        return res.status(400).json({ message: 'Email, password, full name, and role are required' });
      }

      // Check if role is valid
      if (!Object.values(USER_ROLES).includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      // Check if user already exists
      const existingUser = await UserModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Create user
      const userData = {
        email,
        password,
        full_name,
        role,
        phone_number,
        address
      };

      const user = await UserModel.createUser(userData);

      // Remove sensitive information
      const sanitizedUser = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        address: user.address,
        created_at: user.created_at
      };

      return res.status(201).json({
        message: 'User created successfully',
        user: sanitizedUser
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  },

  /**
   * Update user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated user data
   */
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { full_name, role, phone_number, address } = req.body;
      const currentUserRole = req.user.role;
      const currentUserId = req.user.id;

      // Check if user has permission
      const isAdmin = currentUserRole === 'admin';
      const isSelfUpdate = currentUserId === userId;

      if (!isAdmin && !isSelfUpdate) {
        return res.status(403).json({ message: 'Not authorized to update this user' });
      }

      // Regular users can only update their own profile and cannot change their role
      if (isSelfUpdate && !isAdmin && role) {
        return res.status(403).json({ message: 'Not authorized to change role' });
      }

      // Get user
      const user = await UserModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user
      const updateData = {
        full_name,
        phone_number,
        address
      };

      // Only admin can update role
      if (isAdmin && role) {
        updateData.role = role;
      }

      const updatedUser = await UserModel.updateUser(userId, updateData);

      // Remove sensitive information
      const sanitizedUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        updated_at: updatedUser.updated_at
      };

      return res.status(200).json({
        message: 'User updated successfully',
        user: sanitizedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  },

  /**
   * Delete user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const currentUserRole = req.user.role;

      // Check if user has permission
      if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete users' });
      }

      // Get user
      const user = await UserModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete user
      await UserModel.deleteUser(userId);

      return res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  },

  /**
   * Get field officers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with field officers data
   */
  async getFieldOfficers(req, res) {
    try {
      const currentUserRole = req.user.role;

      // Check if user has permission
      if (!['admin', 'programme_manager'].includes(currentUserRole)) {
        return res.status(403).json({ message: 'Not authorized to access field officers list' });
      }

      const fieldOfficers = await UserModel.getAllUsers(USER_ROLES.FIELD_OFFICER);

      // Remove sensitive information
      const sanitizedOfficers = fieldOfficers.map(officer => ({
        id: officer.id,
        email: officer.email,
        full_name: officer.full_name,
        phone_number: officer.phone_number
      }));

      return res.status(200).json({ fieldOfficers: sanitizedOfficers });
    } catch (error) {
      console.error('Get field officers error:', error);
      return res.status(500).json({ message: 'Failed to get field officers', error: error.message });
    }
  },

  /**
   * Get programme managers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with programme managers data
   */
  async getProgrammeManagers(req, res) {
    try {
      const currentUserRole = req.user.role;

      // Check if user has permission
      if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to access programme managers list' });
      }

      const programmeManagers = await UserModel.getAllUsers(USER_ROLES.PROGRAMME_MANAGER);

      // Remove sensitive information
      const sanitizedManagers = programmeManagers.map(manager => ({
        id: manager.id,
        email: manager.email,
        full_name: manager.full_name,
        phone_number: manager.phone_number
      }));

      return res.status(200).json({ programmeManagers: sanitizedManagers });
    } catch (error) {
      console.error('Get programme managers error:', error);
      return res.status(500).json({ message: 'Failed to get programme managers', error: error.message });
    }
  }
};

module.exports = UserController;
