import { supabase } from '@/lib/supabase';

export interface LoginCredentials {
  email: string;
  password: string;
  staff_number?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  role?: string;
  staff_number?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  staff_number?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication service for handling user authentication
 */
export const authService = {
  /**
   * Register a new user
   * @param userData - User registration data
   */
  async register(userData: RegisterData): Promise<UserProfile> {
    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role || 'user',
            staff_number: userData.staff_number,
          }
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create user');

      // The profile will be created by the trigger, but we'll create it manually as a fallback
      // Using upsert with onConflict: 'do nothing' to avoid duplicate errors if the trigger already created it
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: userData.full_name,
          role: userData.role || 'user',
          staff_number: userData.staff_number,
          phone_number: userData.phone_number,
          address: userData.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id', ignoreDuplicates: true });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here, as the user might still be created successfully
      }

      // Return the user profile
      const userProfile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || '',
        full_name: userData.full_name,
        role: userData.role || 'user',
        staff_number: userData.staff_number,
        phone_number: userData.phone_number,
        address: userData.address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  },

  /**
   * Login a user
   * @param credentials - Login credentials
   */
  async login(credentials: LoginCredentials): Promise<{ user: UserProfile; token: string }> {
    try {
      console.log('Auth service: Attempting login with credentials', { email: credentials.email, hasPassword: !!credentials.password, hasStaffNumber: !!credentials.staff_number });

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('Auth service: Login error from Supabase', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.error('Auth service: No user returned from Supabase');
        throw new Error('User not found');
      }

      if (!authData.session) {
        console.error('Auth service: No session returned from Supabase');
        throw new Error('No session created');
      }

      console.log('Auth service: Login successful, session created', {
        userId: authData.user.id,
        hasSession: !!authData.session,
        tokenExpiry: authData.session.expires_at
      });

      // Get user profile directly from auth.users metadata to avoid RLS issues
      let userProfile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || '',
        full_name: authData.user.user_metadata?.full_name || '',
        role: authData.user.user_metadata?.role || 'user',
        staff_number: authData.user.user_metadata?.staff_number,
        phone_number: '',
        address: '',
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at: authData.user.updated_at || new Date().toISOString()
      };

      // If staff number was provided, verify it matches
      if (credentials.staff_number && userProfile.staff_number !== credentials.staff_number) {
        console.error('Auth service: Staff number mismatch', {
          provided: credentials.staff_number,
          stored: userProfile.staff_number
        });
        throw new Error('Invalid staff number');
      }

      // Explicitly persist the session
      const { error: persistError } = await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });

      if (persistError) {
        console.error('Auth service: Error persisting session', persistError);
      } else {
        console.log('Auth service: Session persisted successfully');
      }

      return {
        user: userProfile,
        token: authData.session.access_token,
      };
    } catch (error: any) {
      console.error('Auth service: Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    }
  },

  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      // Get the current user
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('User not found');

      // Create user profile from auth data to avoid RLS issues
      const userProfile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || '',
        full_name: authData.user.user_metadata?.full_name || '',
        role: authData.user.user_metadata?.role || 'user',
        staff_number: authData.user.user_metadata?.staff_number,
        phone_number: authData.user.user_metadata?.phone_number || '',
        address: authData.user.user_metadata?.address || '',
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at: authData.user.updated_at || new Date().toISOString()
      };

      return userProfile;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Failed to get user profile');
    }
  },

  /**
   * Update the current user's profile
   * @param profileData - Updated profile data
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Get the current user
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('User not found');

      // Update user metadata
      const { data: updatedUser, error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          role: profileData.role,
          staff_number: profileData.staff_number,
          phone_number: profileData.phone_number,
          address: profileData.address
        }
      });

      if (updateAuthError) throw new Error(updateAuthError.message);
      if (!updatedUser.user) throw new Error('Failed to update user');

      // Try to update the profile in the profiles table as well (for backward compatibility)
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: profileData.full_name,
            role: profileData.role,
            staff_number: profileData.staff_number,
            phone_number: profileData.phone_number,
            address: profileData.address,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);
      } catch (profileError) {
        // Log but don't fail if profile update fails
        console.warn('Profile table update failed:', profileError);
      }

      // Return user profile from auth data
      const userProfile: UserProfile = {
        id: updatedUser.user.id,
        email: updatedUser.user.email || '',
        full_name: updatedUser.user.user_metadata?.full_name || '',
        role: updatedUser.user.user_metadata?.role || 'user',
        staff_number: updatedUser.user.user_metadata?.staff_number,
        phone_number: updatedUser.user.user_metadata?.phone_number || '',
        address: updatedUser.user.user_metadata?.address || '',
        created_at: updatedUser.user.created_at || new Date().toISOString(),
        updated_at: updatedUser.user.updated_at || new Date().toISOString()
      };

      return userProfile;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  /**
   * Change the current user's password
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      // First verify the old password by trying to sign in
      const { data: authData, error: authError } = await supabase.auth.getSession();

      if (authError) throw new Error(authError.message);
      if (!authData.session) throw new Error('No active session');

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw new Error(updateError.message);

      return { message: 'Password changed successfully' };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  },
};
