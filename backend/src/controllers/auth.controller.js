const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase');
const { UserModel } = require('../models/user.model');

/**
 * Authentication controller for handling user authentication
 */
const AuthController = {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with user data and token
   */
  async register(req, res) {
    try {
      const { email, password, full_name, role, phone_number, address } = req.body;

      // Validate required fields
      if (!email || !password || !full_name) {
        return res.status(400).json({ message: 'Email, password, and full name are required' });
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

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user data and token
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with user data and token
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Get user from database
      const user = await UserModel.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user data and token
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with user data
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      // Get user from database
      const user = await UserModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone_number: user.phone_number,
          address: user.address,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  },

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with updated user data
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { full_name, phone_number, address } = req.body;

      // Update user
      const updatedUser = await UserModel.updateUser(userId, {
        full_name,
        phone_number,
        address
      });

      // Return updated user data
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          phone_number: updatedUser.phone_number,
          address: updatedUser.address
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  },

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Response with success message
   */
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const email = req.user.email;

      // Validate required fields
      if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      // Update password with Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: new_password
      });

      if (error) {
        return res.status(400).json({ message: 'Failed to change password', error: error.message });
      }

      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  }
};

module.exports = AuthController;
