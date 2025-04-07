const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase');
const { UserModel } = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response.util');
const { DEV_MODE, STAFF_CODES } = require('../config/development');

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
        return errorResponse(res, 'Email, password, and full name are required', 400);
      }

      // Check if user already exists
      const existingUser = await UserModel.getUserByEmail(email);
      if (existingUser) {
        return errorResponse(res, 'User with this email already exists', 400);
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role: role || 'user'
          }
        }
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return errorResponse(res, 'Registration failed', 500, authError.message);
      }

      // Create user profile in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role: role || 'user',
          phone_number,
          address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return errorResponse(res, 'Profile creation failed', 500, profileError.message);
      }

      // Return user data and token
      return successResponse(res, {
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          isStaff: false
        },
        token: authData.session?.access_token
      }, 'User registered successfully', 201);
    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse(res, 'Registration failed', 500, error.message);
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
      const { email, password, staffNumber } = req.body;

      // Determine if this is a staff login attempt
      const isStaffLogin = !!staffNumber;

      if (isStaffLogin) {
        // Staff authentication logic
        console.log('Staff login attempt:', email, staffNumber);

        // Validate required fields
        if (!email || !staffNumber) {
          return errorResponse(res, 'Email and staff number are required', 400);
        }

        // In development mode, we can use predefined staff codes
        if (DEV_MODE && STAFF_CODES[staffNumber]) {
          console.log('DEV MODE: Using predefined staff code:', staffNumber);

          // Generate a staff ID based on the staff number
          const staffId = `staff_${staffNumber}`;
          const staffName = email.split('@')[0] || 'Staff User';
          const staffRole = STAFF_CODES[staffNumber].role;

          // Generate JWT token for staff
          const token = jwt.sign(
            {
              id: staffId,
              email,
              name: staffName,
              role: staffRole,
              staff_number: staffNumber,
              isStaff: true
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
          );

          // Return staff data and token
          return successResponse(res, {
            user: {
              id: staffId,
              email,
              full_name: staffName,
              role: staffRole,
              staffNumber,
              isStaff: true
            },
            token
          }, 'Staff login successful');
        }

        // For production, we would check against the staff_profiles table
        // Get staff from database
        const { data: staff, error: staffError } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('email', email)
          .eq('staff_number', staffNumber)
          .single();

        if (staffError || !staff) {
          console.error('Staff not found:', staffError);
          return errorResponse(res, 'Invalid staff credentials', 401);
        }

        // Generate JWT token for staff
        const token = jwt.sign(
          {
            id: staff.id,
            email: staff.email,
            name: staff.name,
            role: staff.role,
            staff_number: staff.staff_number,
            isStaff: true
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return staff data and token
        return successResponse(res, {
          user: {
            id: staff.id,
            email: staff.email,
            full_name: staff.name,
            role: staff.role,
            staffNumber: staff.staff_number,
            isStaff: true,
            avatar_url: staff.avatar_url
          },
          token
        }, 'Staff login successful');
      } else {
        // Regular user authentication logic
        console.log('Regular user login attempt:', email);

        // Validate required fields
        if (!email || !password) {
          return errorResponse(res, 'Email and password are required', 400);
        }

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          return errorResponse(res, 'Invalid credentials', 401);
        }

        // Get user profile from profiles table
        console.log('Login: Looking for profile with ID:', authData.user.id);
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.log('Login: Profile error details:', profileError);
        } else {
          console.log('Login: Profile found:', profile ? 'Yes' : 'No');
        }

        if (profileError || !profile) {
          console.log('User profile not found, creating one...');

          // Create a profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              full_name: authData.user.user_metadata?.full_name || 'User',
              role: authData.user.user_metadata?.role || 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            return errorResponse(res, 'Failed to create user profile', 500);
          }

          console.log('Created new profile:', newProfile);
          profile = newProfile;
        }

        // Return user data and Supabase token
        return successResponse(res, {
          user: {
            id: profile.id,
            email: profile.email || authData.user.email, // Use Supabase email if profile email is not available
            full_name: profile.full_name,
            role: profile.role,
            isStaff: false,
            avatar_url: profile.avatar_url
          },
          token: authData.session.access_token
        }, 'Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 'Login failed', 500, error.message);
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
      const isStaff = req.user.isStaff;

      if (isStaff) {
        // For staff users, we already have the profile in req.user
        return successResponse(res, {
          user: req.user
        }, 'Staff profile retrieved successfully');
      }

      // For regular users, get profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found:', profileError);
        return errorResponse(res, 'User profile not found', 404);
      }

      // Return user data
      return successResponse(res, {
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          phone_number: profile.phone_number,
          address: profile.address,
          avatar_url: profile.avatar_url,
          isStaff: false,
          created_at: profile.created_at
        }
      }, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 'Failed to get profile', 500, error.message);
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
      const isStaff = req.user.isStaff;
      const { full_name, phone_number, address, avatar_url } = req.body;

      if (isStaff) {
        // For staff users, update the staff_profiles table
        const { data: staff, error: staffError } = await supabase
          .from('staff_profiles')
          .update({
            name: full_name,
            avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (staffError) {
          console.error('Staff profile update error:', staffError);
          return errorResponse(res, 'Failed to update staff profile', 500, staffError.message);
        }

        // Return updated staff data
        return successResponse(res, {
          user: {
            id: staff.id,
            email: staff.email,
            full_name: staff.name,
            role: staff.role,
            staffNumber: staff.staff_number,
            avatar_url: staff.avatar_url,
            isStaff: true,
            updated_at: staff.updated_at
          }
        }, 'Staff profile updated successfully');
      }

      // For regular users, update the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name,
          phone_number,
          address,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        return errorResponse(res, 'Failed to update profile', 500, profileError.message);
      }

      // Return updated user data
      return successResponse(res, {
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          phone_number: profile.phone_number,
          address: profile.address,
          avatar_url: profile.avatar_url,
          isStaff: false,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }
      }, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, 'Failed to update profile', 500, error.message);
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
      const isStaff = req.user.isStaff;

      // Validate required fields
      if (!current_password || !new_password) {
        return errorResponse(res, 'Current password and new password are required', 400);
      }

      if (isStaff) {
        // For staff users, we would need to implement a custom password change flow
        // This would involve verifying the current password and updating the hashed password
        // For now, we'll return an error
        return errorResponse(res, 'Password change for staff users is not implemented yet', 501);
      }

      // For regular users, update password with Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: new_password
      });

      if (error) {
        return errorResponse(res, 'Failed to change password', 400, error.message);
      }

      return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return errorResponse(res, 'Failed to change password', 500, error.message);
    }
  }
};

module.exports = AuthController;
