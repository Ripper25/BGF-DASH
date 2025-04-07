import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'all';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserCreateParams {
  email: string;
  password?: string;
  full_name: string;
  role: string;
  phone_number?: string;
  address?: string;
}

export interface UserUpdateParams {
  full_name?: string;
  role?: string;
  phone_number?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

/**
 * User management service for handling user-related operations
 */
export const userManagementService = {
  /**
   * Get all users with pagination and filtering
   * @param params - User list parameters
   * @returns User list response
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    try {
      // Get all users from Supabase
      // Note: Supabase doesn't support pagination, filtering, etc. out of the box
      // So we'll implement a basic version here

      // Get all users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*');

      if (userError) throw new Error(userError.message);

      // Convert to UserProfile objects
      let users = userData.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        address: user.address,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
        status: user.status || 'active'
      })) as UserProfile[];

      // Apply filters
      if (params.search) {
        const search = params.search.toLowerCase();
        users = users.filter(user =>
          user.full_name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search)
        );
      }

      if (params.role) {
        users = users.filter(user => user.role === params.role);
      }

      if (params.status && params.status !== 'all') {
        users = users.filter(user => user.status === params.status);
      }

      // Apply sorting
      if (params.sort_by) {
        const sortBy = params.sort_by as keyof UserProfile;
        const sortOrder = params.sort_order === 'desc' ? -1 : 1;

        users.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
          if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
          return 0;
        });
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        total: users.length,
        page,
        limit,
        total_pages: Math.ceil(users.length / limit)
      };
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  /**
   * Get a user by ID
   * @param userId - User ID
   * @returns User profile
   */
  async getUserById(userId: string): Promise<UserProfile> {
    try {
      // Get user from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw new Error(userError.message);

      return {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        phone_number: userData.phone_number,
        address: userData.address,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        status: userData.status || 'active'
      };
    } catch (error: any) {
      console.error(`Error fetching user ${userId}:`, error);
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  /**
   * Create a new user
   * @param params - User create parameters
   * @returns Created user profile
   */
  async createUser(params: UserCreateParams): Promise<UserProfile> {
    try {
      // Create user with Supabase
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: params.email,
        password: params.password || Math.random().toString(36).slice(2, 10),
        email_confirm: true,
        user_metadata: {
          full_name: params.full_name,
          role: params.role
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create user');

      // Then, create the user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: params.email,
          full_name: params.full_name,
          role: params.role,
          phone_number: params.phone_number,
          address: params.address,
          status: 'active'
        }])
        .select()
        .single();

      if (userError) throw new Error(userError.message);

      return {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        phone_number: userData.phone_number,
        address: userData.address,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        status: userData.status || 'active'
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  /**
   * Update a user
   * @param userId - User ID
   * @param params - User update parameters
   * @returns Updated user profile
   */
  async updateUser(userId: string, params: UserUpdateParams): Promise<UserProfile> {
    try {
      // Update user with Supabase
      // Update the user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({
          full_name: params.full_name,
          role: params.role,
          phone_number: params.phone_number,
          address: params.address,
          status: params.status
        })
        .eq('id', userId)
        .select()
        .single();

      if (userError) throw new Error(userError.message);

      // Update the auth user metadata
      if (params.full_name || params.role) {
        const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              full_name: params.full_name,
              role: params.role
            }
          }
        );

        if (authError) throw new Error(authError.message);
      }

      return {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        phone_number: userData.phone_number,
        address: userData.address,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        status: userData.status || 'active'
      };
    } catch (error: any) {
      console.error(`Error updating user ${userId}:`, error);
      throw new Error(error.message || 'Failed to update user');
    }
  },

  /**
   * Delete a user
   * @param userId - User ID
   * @returns Success status
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete user with Supabase
      // Delete the user profile
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) throw new Error(userError.message);

      // Delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw new Error(authError.message);

      return true;
    } catch (error: any) {
      console.error(`Error deleting user ${userId}:`, error);
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  /**
   * Reset a user's password
   * @param userId - User ID
   * @param newPassword - New password
   * @returns Success status
   */
  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      // Reset password with Supabase
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (authError) throw new Error(authError.message);

      return true;
    } catch (error: any) {
      console.error(`Error resetting password for user ${userId}:`, error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }
};
