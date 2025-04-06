const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcrypt');

/**
 * User roles in the system
 */
const USER_ROLES = {
  ADMIN: 'admin',
  ASSISTANT_PROJECT_OFFICER: 'assistant_project_officer',
  PROJECT_MANAGER: 'project_manager',
  HEAD_OF_PROGRAMS: 'head_of_programs',
  DIRECTOR: 'director',
  CEO: 'ceo',
  PATRON: 'patron',
  USER: 'user'
};

/**
 * User model for handling user-related database operations
 */
const UserModel = {
  /**
   * Create a new user
   * @param {Object} userData - User data including email, password, name, etc.
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user in Supabase auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    // Create user profile in the users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        auth_id: authUser.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || USER_ROLES.USER,
        phone_number: userData.phone_number,
        address: userData.address,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data
   */
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all users with optional role filter
   * @param {string} role - Optional role filter
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers(role = null) {
    let query = supabase.from('users').select('*');

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Update user data
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, userData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    // Get the auth_id first
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Delete from users table
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw new Error(`Database error: ${deleteError.message}`);
    }

    // Delete from auth
    if (user.auth_id) {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.auth_id);
      if (authDeleteError) {
        throw new Error(`Auth error: ${authDeleteError.message}`);
      }
    }

    return true;
  }
};

module.exports = {
  UserModel,
  USER_ROLES
};
